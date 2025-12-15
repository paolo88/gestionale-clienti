"use server"

import { createClient } from "@/lib/server-supabase"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

interface CSVRow {
    period: string; // YYYY-MM or YYYY-MM-01
    client_name: string;
    company_name: string;
    amount: string | number;
}

interface ImportResult {
    success: boolean;
    batchId?: string;
    stats?: {
        total: number;
        success: number;
        errors: number;
    };
    errorReport?: any[];
}

export async function processCsvImport(rows: CSVRow[], filename: string): Promise<ImportResult> {
    const supabase = await createClient()
    const batchId = uuidv4()
    const errorReport: any[] = []
    let successCount = 0
    let errorCount = 0

    // 1. Create Import Batch record
    const { error: batchError } = await supabase.from("import_batches").insert({
        id: batchId,
        filename,
        total_rows: rows.length,
        success_rows: 0,
        error_rows: 0,
        imported_at: new Date().toISOString()
    })

    if (batchError) {
        console.error("Batch creation failed", batchError)
        return { success: false } // Fatal error
    }

    // 2. Pre-fetch existing clients and companies to minimize queries (optional optimization, but good for MVP to do one-by-one or minimal cache)
    // For simplicity and robustness in MVP: 
    // - Try to find Client by name (normalized). If not found, create.
    // - Try to find Company by name (normalized). If not found, create.
    // - Upsert Revenue.

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        try {
            // Validation
            if (!row.client_name || !row.company_name || !row.period || row.amount === undefined || row.amount === "") {
                throw new Error("Missing required fields")
            }

            const amount = typeof row.amount === 'string'
                ? parseFloat(row.amount.replace(',', '.').replace(/[^0-9.-]+/g, ""))
                : row.amount;

            if (isNaN(amount) || amount < 0) {
                throw new Error("Invalid amount")
            }

            // Normalize Date: YYYY-MM -> YYYY-MM-01
            let periodDateStr = row.period.trim();
            if (periodDateStr.length === 7) { // YYYY-MM
                periodDateStr += "-01"
            }
            const dateObj = new Date(periodDateStr)
            if (isNaN(dateObj.getTime())) {
                throw new Error("Invalid date format")
            }
            const formattedPeriod = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-01`

            // --- CLIENT ---
            let clientId: string | null = null;
            const normalizedClientName = row.client_name.trim();

            // Check existence (case insensitive)
            const { data: existingClient } = await supabase
                .from("clients")
                .select("id")
                .ilike("name", normalizedClientName)
                .maybeSingle()

            if (existingClient) {
                clientId = existingClient.id
            } else {
                // Create
                const { data: newClient, error: createStartError } = await supabase
                    .from("clients")
                    .insert({ name: normalizedClientName, is_active: true })
                    .select("id")
                    .single()

                if (createStartError) throw new Error(`Could not create client: ${createStartError.message}`)
                clientId = newClient.id
            }

            // --- COMPANY ---
            let companyId: string | null = null;
            const normalizedCompanyName = row.company_name.trim();

            const { data: existingCompany } = await supabase
                .from("companies")
                .select("id")
                .ilike("name", normalizedCompanyName)
                .maybeSingle()

            if (existingCompany) {
                companyId = existingCompany.id
            } else {
                const { data: newCompany, error: createCoError } = await supabase
                    .from("companies")
                    .insert({ name: normalizedCompanyName, is_active: true })
                    .select("id")
                    .single()

                if (createCoError) throw new Error(`Could not create company: ${createCoError.message}`)
                companyId = newCompany.id
            }

            // --- REVENUE UPSERT ---
            const { error: upsertError } = await supabase.from("revenues").upsert({
                client_id: clientId,
                company_id: companyId,
                period: formattedPeriod,
                amount: amount,
                source: 'import',
                import_batch_id: batchId
            }, {
                onConflict: 'client_id, company_id, period'
            })

            if (upsertError) throw new Error(`Revenue upsert failed: ${upsertError.message}`)

            successCount++

        } catch (err: any) {
            errorCount++
            errorReport.push({
                row: i + 2, // 1-based + header
                data: row,
                error: err.message
            })
        }
    }

    // 3. Update Batch Stats
    await supabase.from("import_batches").update({
        success_rows: successCount,
        error_rows: errorCount,
        error_report: errorCount > 0 ? errorReport : null // Store as JSON
    }).eq("id", batchId)

    revalidatePath("/revenues")
    revalidatePath("/imports")

    return {
        success: true,
        batchId,
        stats: {
            total: rows.length,
            success: successCount,
            errors: errorCount
        },
        errorReport: errorCount > 0 ? errorReport : undefined
    }
}

export async function getImportBatches() {
    const supabase = await createClient()
    const { data, error } = await supabase.from("import_batches").select("*").order("imported_at", { ascending: false })
    if (error) throw new Error(error.message)
    return data
}

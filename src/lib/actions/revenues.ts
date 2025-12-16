"use server"

import { createClient } from "@/lib/server-supabase"
import { revenueSchema, RevenueFormValues } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function getRevenues(filters?: { client_id?: string; company_id?: string; channel?: string }) {
    const supabase = await createClient()

    let query = supabase
        .from("revenues")
        .select(`
            *,
            clients (name, channel),
            companies (name)
        `)
        .order("period", { ascending: false })

    if (filters?.client_id && filters.client_id !== 'all') {
        query = query.eq("client_id", filters.client_id)
    }

    if (filters?.company_id && filters.company_id !== 'all') {
        query = query.eq("company_id", filters.company_id)
    }

    const { data: rawData, error } = await query

    if (error) {
        console.error(error)
        return null
    }

    // Filter by Channel if requested (Client's channel)
    let data = rawData;
    if (filters?.channel && filters.channel !== 'all') {
        data = rawData.filter((r: any) => {
            const clientChannel = Array.isArray(r.clients) ? r.clients[0]?.channel : r.clients?.channel;
            return clientChannel === filters.channel;
        })
    }

    return data
}

export async function createRevenueAction(data: RevenueFormValues) {
    const parsed = revenueSchema.safeParse(data)
    if (!parsed.success) {
        return { error: "Dati non validi" }
    }

    // Normalize period to YYYY-MM-01
    const date = new Date(parsed.data.period)
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`

    const supabase = await createClient()

    // Upsert logic: if client+company+period matches, update amount
    // Constraint name might be needed if upsert fails, but unique index handles it.
    const { error } = await supabase.from("revenues").upsert({
        client_id: parsed.data.client_id,
        company_id: parsed.data.company_id,
        period: period,
        amount: parsed.data.amount,
        notes: parsed.data.notes,
        source: 'manual'
    }, {
        onConflict: 'client_id, company_id, period'
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/revenues")
    return { success: true }
}

export async function deleteRevenue(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from("revenues").delete().eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/revenues")
    return { success: true }
}

export async function updateRevenue(id: string, data: RevenueFormValues) {
    const parsed = revenueSchema.safeParse(data)
    if (!parsed.success) return { error: "Dati non validi" }

    // Normalize period
    const date = new Date(parsed.data.period)
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`

    const supabase = await createClient()
    const { error } = await supabase.from("revenues").update({
        ...parsed.data,
        period: period
    }).eq("id", id)

    if (error) return { error: error.message }

    revalidatePath("/revenues")
    return { success: true }
}

"use server"

import { createClient } from "@/lib/server-supabase"
import { companySchema, CompanyFormValues } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function getCompanies(query?: string) {
    const supabase = await createClient()
    let builder = supabase.from("companies").select("*").order("name")

    if (query) {
        builder = builder.ilike("name", `%${query}%`)
    }

    const { data, error } = await builder
    if (error) {
        throw new Error(error.message)
    }
    return data
}

export async function getCompany(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.from("companies").select("*").eq("id", id).single()
    if (error) throw new Error(error.message)
    return data
}

export async function createCompanyAction(data: CompanyFormValues) {
    const parsed = companySchema.safeParse(data)
    if (!parsed.success) {
        return { error: "Dati non validi" }
    }

    const supabase = await createClient()
    const { error } = await supabase.from("companies").insert(parsed.data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/companies")
    return { success: true }
}

export async function updateCompanyAction(id: string, data: CompanyFormValues) {
    const parsed = companySchema.safeParse(data)
    if (!parsed.success) {
        return { error: "Dati non validi" }
    }

    const supabase = await createClient()
    const { error } = await supabase.from("companies").update(parsed.data).eq("id", id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/companies")
    revalidatePath(`/companies/${id}`)
    return { success: true }
}

export async function toggleCompanyStatus(id: string, isActive: boolean) {
    const supabase = await createClient()
    const { error } = await supabase.from("companies").update({ is_active: isActive }).eq("id", id)

    if (error) return { error: error.message }

    revalidatePath("/companies")
    revalidatePath(`/companies/${id}`)
    return { success: true }
}

export async function deleteCompany(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from("companies").delete().eq("id", id)

    if (error) {
        if (error.code === '23503') {
            return { error: "Impossibile eliminare: l'azienda ha dei fatturati associati." }
        }
        return { error: error.message }
    }

    revalidatePath("/companies")
    return { success: true }
}

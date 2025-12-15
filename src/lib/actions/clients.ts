"use server"

import { createClient } from "@/lib/server-supabase"
import { clientSchema, ClientFormValues } from "@/lib/validations"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getClients(query?: string) {
    const supabase = await createClient()
    let builder = supabase.from("clients").select("*").order("name")

    if (query) {
        builder = builder.ilike("name", `%${query}%`)
    }

    const { data, error } = await builder
    if (error) {
        throw new Error(error.message)
    }
    return data
}

export async function getClient(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.from("clients").select("*").eq("id", id).single()
    if (error) throw new Error(error.message)
    return data
}

export async function createClientAction(data: ClientFormValues) {
    const parsed = clientSchema.safeParse(data)
    if (!parsed.success) {
        return { error: "Dati non validi" }
    }

    const supabase = await createClient()
    const { error } = await supabase.from("clients").insert(parsed.data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/clients")
    return { success: true }
}

export async function updateClientAction(id: string, data: ClientFormValues) {
    const parsed = clientSchema.safeParse(data)
    if (!parsed.success) {
        return { error: "Dati non validi" }
    }

    const supabase = await createClient()
    const { error } = await supabase.from("clients").update(parsed.data).eq("id", id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/clients")
    revalidatePath(`/clients/${id}`)
    return { success: true }
}

export async function toggleClientStatus(id: string, isActive: boolean) {
    const supabase = await createClient()
    const { error } = await supabase.from("clients").update({ is_active: isActive }).eq("id", id)

    if (error) return { error: error.message }

    revalidatePath("/clients")
    revalidatePath(`/clients/${id}`)
    return { success: true }
}

export async function deleteClient(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from("clients").delete().eq("id", id)

    if (error) {
        if (error.code === '23503') { // Foreign key violation
            return { error: "Impossibile eliminare: il cliente ha dei fatturati associati." }
        }
        return { error: error.message }
    }

    revalidatePath("/clients")
    return { success: true }
}

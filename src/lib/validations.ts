import { z } from "zod"

export const clientSchema = z.object({
    name: z.string().min(1, "Il nome è obbligatorio"),
    vat_number: z.string().nullish(),
    channel: z.string().nullish(),
    province: z.string().max(2, "Provincia max 2 caratteri").nullish().or(z.literal("")),
    notes: z.string().nullish(),
    is_active: z.boolean().default(true).optional(),
})

export type ClientFormValues = z.infer<typeof clientSchema>

export const companySchema = z.object({
    name: z.string().min(1, "Il nome è obbligatorio"),
    category: z.string().nullish(),
    notes: z.string().nullish(),
    is_active: z.boolean().default(true),
})

export type CompanyFormValues = z.infer<typeof companySchema>

export const revenueSchema = z.object({
    client_id: z.string().uuid("Seleziona un cliente"),
    company_id: z.string().uuid("Seleziona un'azienda"),
    period: z.date(), // We'll normalize to 1st of month
    amount: z.coerce.number().min(0, "Importo deve essere positivo"),
    notes: z.string().optional(),
})

export type RevenueFormValues = z.infer<typeof revenueSchema>

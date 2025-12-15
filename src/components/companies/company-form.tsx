"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { companySchema, CompanyFormValues } from "@/lib/validations"
import { createCompanyAction, updateCompanyAction } from "@/lib/actions/companies"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface CompanyFormProps {
    initialData?: CompanyFormValues & { id: string };
    onSuccess?: () => void;
}

export function CompanyForm({ initialData, onSuccess }: CompanyFormProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema),
        defaultValues: initialData || {
            name: "",
            category: "",
            notes: "",
            is_active: true,
        },
    })

    async function onSubmit(data: CompanyFormValues) {
        setLoading(true)
        try {
            let result;
            if (initialData) {
                result = await updateCompanyAction(initialData.id, data)
            } else {
                result = await createCompanyAction(data)
            }

            if (result.error) {
                console.error(result.error)
            } else {
                form.reset()
                router.refresh()
                if (onSuccess) onSuccess()
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome Azienda</FormLabel>
                            <FormControl>
                                <Input placeholder="Es. Azienda Agricola Bio" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Categoria (Mandato)</FormLabel>
                            <FormControl>
                                <Input placeholder="Es. Prodotti Freschi" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Note</FormLabel>
                            <FormControl>
                                <Textarea placeholder="" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Salvataggio..." : (initialData ? "Aggiorna" : "Crea Azienda")}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

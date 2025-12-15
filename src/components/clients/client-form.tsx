"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea" // Need to install textarea or use Input
import { clientSchema, ClientFormValues } from "@/lib/validations"
import { createClientAction, updateClientAction } from "@/lib/actions/clients"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface ClientFormProps {
    initialData?: ClientFormValues & { id: string };
    onSuccess?: () => void;
}

export function ClientForm({ initialData, onSuccess }: ClientFormProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientSchema),
        defaultValues: initialData || {
            name: "",
            vat_number: "",
            channel: "",
            province: "",
            notes: "",
            is_active: true,
        },
    })

    async function onSubmit(data: ClientFormValues) {
        setLoading(true)
        try {
            let result;
            if (initialData) {
                result = await updateClientAction(initialData.id, data)
            } else {
                result = await createClientAction(data)
            }

            if (result.error) {
                // Handle error (toast)
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
                            <FormLabel>Nome Cliente</FormLabel>
                            <FormControl>
                                <Input placeholder="Es. Mario Rossi Srl" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="vat_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Partita IVA</FormLabel>
                                <FormControl>
                                    <Input placeholder="" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Provincia</FormLabel>
                                <FormControl>
                                    <Input placeholder="MI" maxLength={2} {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="channel"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Canale</FormLabel>
                            <FormControl>
                                <Input placeholder="Es. Horeca" {...field} value={field.value || ""} />
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
                                {/* Fallback to Input if Textarea not installed, but better to use Input for MVP or install Textarea */}
                                <Input placeholder="" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Salvataggio..." : (initialData ? "Aggiorna" : "Crea Cliente")}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

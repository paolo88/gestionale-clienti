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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { revenueSchema, RevenueFormValues } from "@/lib/validations"
import { createRevenueAction, updateRevenue } from "@/lib/actions/revenues"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface RevenueFormProps {
    clients: { id: string, name: string }[];
    companies: { id: string, name: string }[];
    onSuccess?: () => void;
}

export function RevenueForm({ clients, companies, onSuccess, initialData }: RevenueFormProps & { initialData?: any }) {
    const [loading, setLoading] = useState(false)
    const [inputType, setInputType] = useState<'date' | 'year'>('date')
    const router = useRouter()

    const form = useForm<RevenueFormValues>({
        resolver: zodResolver(revenueSchema) as any,
        defaultValues: {
            client_id: initialData?.client_id || "",
            company_id: initialData?.company_id || "",
            amount: initialData?.amount ? Number(initialData.amount) : 0,
            notes: initialData?.notes || "",
            period: initialData?.period ? new Date(initialData.period) : new Date(),
        },
    })

    async function onSubmit(data: RevenueFormValues) {
        setLoading(true)
        try {
            let result;
            if (initialData?.id) {
                result = await updateRevenue(initialData.id, data)
            } else {
                result = await createRevenueAction(data)
            }

            if (result.error) {
                console.error(result.error)
                alert("Errore: " + result.error)
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

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i); // 5 years back, 5 forward

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex space-x-4 mb-4">
                    <Button
                        type="button"
                        variant={inputType === 'date' ? 'default' : 'outline'}
                        onClick={() => setInputType('date')}
                        className="w-1/2"
                    >
                        Mensile (Data)
                    </Button>
                    <Button
                        type="button"
                        variant={inputType === 'year' ? 'default' : 'outline'}
                        onClick={() => setInputType('year')}
                        className="w-1/2"
                    >
                        Annuale (Anno)
                    </Button>
                </div>

                <FormField
                    control={form.control}
                    name="client_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cliente</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleziona cliente" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {clients.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="company_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Azienda</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleziona azienda" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {companies.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="period"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{inputType === 'date' ? 'Data (Periodo)' : 'Anno di riferimento'}</FormLabel>
                            <FormControl>
                                {inputType === 'date' ? (
                                    <Input
                                        type="date"
                                        {...field}
                                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                        onChange={(e) => field.onChange(new Date(e.target.value))}
                                    />
                                ) : (
                                    <Select
                                        onValueChange={(val) => {
                                            // Set to Jan 1st of selected year at 12:00 to avoid timezone shifts
                                            const date = new Date(parseInt(val), 0, 1, 12, 0, 0);
                                            field.onChange(date)
                                        }}
                                        defaultValue={field.value ? new Date(field.value).getFullYear().toString() : currentYear.toString()}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleziona anno" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {years.map(y => (
                                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Importo (€)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" {...field} />
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
                                <Input {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Salvataggio..." : (initialData ? "Modifica Fatturato" : "Salva Fatturato")}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

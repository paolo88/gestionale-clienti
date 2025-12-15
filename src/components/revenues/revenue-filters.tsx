"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"

interface RevenueFiltersProps {
    clients: { id: string; name: string }[];
    companies: { id: string; name: string }[];
}

export function RevenueFilters({ clients, companies }: RevenueFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentClient = searchParams.get("client_id") || "all"
    const currentCompany = searchParams.get("company_id") || "all"

    function updateFilter(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "all") {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`/revenues?${params.toString()}`)
    }

    function clearFilters() {
        router.push("/revenues")
    }

    const hasFilters = currentClient !== "all" || currentCompany !== "all"

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <div className="flex flex-col space-y-2 w-full sm:w-[200px]">
                <span className="text-xs font-medium text-neutral-500">Cliente</span>
                <Select
                    value={currentClient}
                    onValueChange={(val) => updateFilter("client_id", val)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Tutti i clienti" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tutti i clienti</SelectItem>
                        {clients.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col space-y-2 w-full sm:w-[200px]">
                <span className="text-xs font-medium text-neutral-500">Azienda</span>
                <Select
                    value={currentCompany}
                    onValueChange={(val) => updateFilter("company_id", val)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Tutte le aziende" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tutte le aziende</SelectItem>
                        {companies.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {hasFilters && (
                <div className="pt-6">
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <X className="mr-2 h-4 w-4" /> Reset Filtri
                    </Button>
                </div>
            )}
        </div>
    )
}

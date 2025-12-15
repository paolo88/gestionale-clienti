"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"

interface ClientDetailFiltersProps {
    companies: { id: string; name: string }[];
}

export function ClientDetailFilters({ companies }: ClientDetailFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentCompany = searchParams.get("company_id") || "all"

    function updateFilter(value: string) {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "all") {
            params.set("company_id", value)
        } else {
            params.delete("company_id")
        }
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="w-[300px]">
            <Select
                value={currentCompany}
                onValueChange={updateFilter}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Filtra per Azienda" />
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
    )
}

"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"

interface CompanyDetailFiltersProps {
    clients: { id: string; name: string }[];
}

export function CompanyDetailFilters({ clients }: CompanyDetailFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentClient = searchParams.get("client_id") || "all"

    function updateFilter(value: string) {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "all") {
            params.set("client_id", value)
        } else {
            params.delete("client_id")
        }
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="w-[300px]">
            <Select
                value={currentClient}
                onValueChange={updateFilter}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Filtra per Cliente" />
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
    )
}

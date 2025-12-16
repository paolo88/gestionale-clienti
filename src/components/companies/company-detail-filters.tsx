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
    const currentChannel = searchParams.get("channel") || "all"

    function updateClientFilter(value: string) {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "all") {
            params.set("client_id", value)
        } else {
            params.delete("client_id")
        }
        router.push(`?${params.toString()}`)
    }

    function updateChannelFilter(value: string) {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "all") {
            params.set("channel", value)
        } else {
            params.delete("channel")
        }
        router.push(`?${params.toString()}`)
    }

    const channels = ["GDO", "Horeca", "Ingrosso", "Dettaglio", "Farmacia", "Alimentare", "Industria"];

    return (
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="w-[200px]">
                <Select
                    value={currentChannel}
                    onValueChange={updateChannelFilter}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Filtra per Canale" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tutti i canali</SelectItem>
                        {channels.map((c) => (
                            <SelectItem key={c} value={c}>
                                {c}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="w-[200px]">
                <Select
                    value={currentClient}
                    onValueChange={updateClientFilter}
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
        </div>
    )
}

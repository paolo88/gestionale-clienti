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
    const currentChannel = searchParams.get("channel") || "all" // "Channel" for company means Category usually, but request says Channel

    function updateCompanyFilter(value: string) {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "all") {
            params.set("company_id", value)
        } else {
            params.delete("company_id")
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

    // Hardcoded list of categories/channels for now or passed via props?
    // Usually these should come from DB. For now I'll use common ones or assume static list.
    // "Alimentare", "Horeca", "GDO", etc. or "Diretto", "Agente"?
    // Client has "channel" field (GDO, Horeca...). Companies have "category".
    // User asked "Filtro per canale" on Client page. 
    // If filtering Companies, it might be Category. I'll stick to a generic input or list.
    // I'll add a few common italian channels/categories as placeholders or check existing data.
    const channels = ["GDO", "Horeca", "Ingrosso", "Dettaglio", "Farmacia", "Alimentare", "Industria"];

    return (
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="w-[200px]">
                <Select
                    value={currentChannel}
                    onValueChange={updateChannelFilter}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Filtra per Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tutte le categorie</SelectItem>
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
                    value={currentCompany}
                    onValueChange={updateCompanyFilter}
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
        </div>
    )
}

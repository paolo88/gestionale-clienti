"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import { useState, useEffect } from "react"

export function ClientFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentQuery = searchParams.get("query") || ""
    const currentChannel = searchParams.get("channel") || "all"

    const channels = ["GDO", "Horeca", "Ingrosso", "Dettaglio", "Farmacia", "Alimentare", "Industria"]

    const [term, setTerm] = useState(currentQuery)

    useEffect(() => {
        const timer = setTimeout(() => {
            if (term !== currentQuery) {
                const params = new URLSearchParams(searchParams.toString())
                if (term) {
                    params.set("query", term)
                } else {
                    params.delete("query")
                }
                router.replace(`/clients?${params.toString()}`)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [term, router, searchParams, currentQuery])

    const handleSearch = (value: string) => {
        setTerm(value)
    }

    function updateFilter(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "all") {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`/clients?${params.toString()}`)
    }

    function clearFilters() {
        router.push("/clients")
    }

    const hasFilters = currentQuery !== "" || currentChannel !== "all"

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-neutral-50 p-4 rounded-lg border border-neutral-200 mb-6">
            <div className="flex flex-col space-y-2 w-full sm:w-[300px]">
                <span className="text-xs font-medium text-neutral-500">Cerca Cliente</span>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400" />
                    <Input
                        placeholder="Nome, P.IVA, Città..."
                        className="pl-8"
                        defaultValue={currentQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-col space-y-2 w-full sm:w-[200px]">
                <span className="text-xs font-medium text-neutral-500">Canale</span>
                <Select
                    value={currentChannel}
                    onValueChange={(val) => updateFilter("channel", val)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Tutti i canali" />
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

            {hasFilters && (
                <div className="pt-6">
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <X className="mr-2 h-4 w-4" /> Reset
                    </Button>
                </div>
            )}
        </div>
    )
}

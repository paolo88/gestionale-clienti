"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Calendar } from "lucide-react"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function YearSelect() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentYear = new Date().getFullYear()

    // Get year from URL or default to current
    // Note: If user didn't select, we might want to show what is actually effectively used.
    // But usually defaulting to current year in UI is fine.
    const selectedYear = searchParams.get("year") || currentYear.toString()

    // Generate last 5 years
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

    const handleYearChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === currentYear.toString()) {
            params.delete("year")
        } else {
            params.set("year", value)
        }
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedYear} onValueChange={handleYearChange}>
                <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Anno" />
                </SelectTrigger>
                <SelectContent>
                    {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                            {year}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

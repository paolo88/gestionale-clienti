"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface TrendChartProps {
    data: { name: string; current: number; previous: number }[];
    annualData?: { name: string; total: number }[];
}

export function TrendChart({ data, annualData }: TrendChartProps) {
    const [view, setView] = useState<'monthly' | 'annual'>('monthly')

    // If no annualData provided, force monthly view (or hide toggle)
    const showToggle = !!annualData;

    return (
        <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Andamento Fatturato</CardTitle>
                    <CardDescription>
                        {view === 'monthly' ? "Confronto anno corrente vs anno precedente" : "Totale per anno (ultimi 5 anni)"}
                    </CardDescription>
                </div>
                <div className="flex space-x-2">
                    {showToggle && (
                        <div className="flex bg-neutral-100 p-1 rounded-md">
                            <Button
                                variant={view === 'monthly' ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setView('monthly')}
                                className="h-8"
                            >
                                Mensile
                            </Button>
                            <Button
                                variant={view === 'annual' ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setView('annual')}
                                className="h-8"
                            >
                                Annuale
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    {view === 'monthly' ? (
                        <BarChart data={data}>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `€${value}`}
                            />
                            <Tooltip
                                formatter={(value: number) => [`€${value.toFixed(2)}`, "Fatturato"]}
                                labelStyle={{ color: "black" }}
                            />
                            <Legend />
                            <Bar dataKey="current" name="Anno Corrente" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="previous" name="Anno Precedente" fill="#d1d5db" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    ) : (
                        <BarChart data={annualData}>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `€${value}`}
                            />
                            <Tooltip
                                formatter={(value: number) => [`€${value.toFixed(2)}`, "Totale"]}
                                cursor={{ fill: 'transparent' }}
                                labelStyle={{ color: "black" }}
                            />
                            <Legend />
                            <Bar dataKey="total" name="Fatturato Annuale" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

import { createClient } from "@/lib/server-supabase"

export interface CompanyAnalytics {
    company: {
        id: string;
        name: string;
        category: string | null;
        notes: string | null;
        is_active: boolean;
    };
    lifetimeValue: number;
    currentYTD: number;
    previousYTD: number;
    deltaPercentage: number;
    monthlyTrend: { name: string; amount: number }[];
    annualTrend: { name: string; total: number }[];
    clientMix: { name: string; amount: number; percentage: number; value: number }[];
}

export async function getCompanyAnalytics(companyId: string, filterClientId?: string, filterChannel?: string): Promise<CompanyAnalytics | null> {
    const supabase = await createClient()
    const now = new Date()
    const currentYear = now.getFullYear()

    // 1. Fetch BASIC INFO
    const { data: company } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single()

    if (!company) return null

    // 2. Fetch REVENUES
    let query = supabase
        .from("revenues")
        .select(`
            amount,
            period,
            clients (id, name, channel)
        `)
        .eq("company_id", companyId)
        .order("period", { ascending: true })

    if (filterClientId && filterClientId !== 'all') {
        query = query.eq("client_id", filterClientId)
    }

    const { data: rawRevenues, error: revError } = await query

    if (revError) throw new Error(revError.message)

    // Filter by Channel in memory since Supabase join filtering syntax is verbose for this or simple enough
    let revenues = rawRevenues;
    if (filterChannel && filterChannel !== 'all') {
        revenues = revenues?.filter((r: any) => {
            const clientChannel = Array.isArray(r.clients) ? r.clients[0]?.channel : r.clients?.channel;
            return clientChannel === filterChannel;
        })
    }

    let lifetimeValue = 0
    let currentYTD = 0
    let previousYTD = 0
    const clientMap: Record<string, number> = {}

    const previousYear = currentYear - 1

    // Annual Trend
    const annualData: Record<number, number> = {}
    for (let i = 0; i < 5; i++) annualData[currentYear - 4 + i] = 0

    const monthlyData: Record<number, number> = {}
    for (let i = 0; i < 12; i++) monthlyData[i] = 0

    revenues?.forEach((rev: any) => {
        const amount = Number(rev.amount)
        const date = new Date(rev.period)
        const year = date.getFullYear()

        lifetimeValue += amount

        if (annualData[year] !== undefined) {
            annualData[year] += amount
        }

        if (year === currentYear) {
            currentYTD += amount
            monthlyData[date.getMonth()] += amount
        } else if (year === previousYear) {
            if (date.getMonth() <= now.getMonth()) {
                previousYTD += amount
            }
        }

        const clientName = Array.isArray(rev.clients)
            ? rev.clients[0]?.name
            : (rev.clients as any)?.name || "Unknown"
        clientMap[clientName] = (clientMap[clientName] || 0) + amount
    })

    const monthlyTrend = Object.keys(monthlyData).map(key => ({
        name: new Date(2024, parseInt(key), 1).toLocaleString('it-IT', { month: 'short' }),
        amount: monthlyData[parseInt(key)]
    }))

    const annualTrend = Object.keys(annualData).map(key => ({
        name: key,
        total: annualData[parseInt(key)]
    }))

    const clientMix = Object.entries(clientMap)
        .map(([name, amount]) => ({
            name,
            amount,
            percentage: lifetimeValue > 0 ? (amount / lifetimeValue) * 100 : 0,
            value: amount
        }))
        .sort((a, b) => b.amount - a.amount)

    const deltaPercentage = previousYTD === 0
        ? (currentYTD > 0 ? 100 : 0)
        : ((currentYTD - previousYTD) / previousYTD) * 100

    return {
        company,
        lifetimeValue,
        currentYTD,
        previousYTD,
        deltaPercentage,
        monthlyTrend,
        annualTrend,
        clientMix
    }
}

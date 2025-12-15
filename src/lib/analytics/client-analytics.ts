import { createClient } from "@/lib/server-supabase"

export interface ClientAnalytics {
    client: {
        id: string;
        name: string;
        created_at: string;
        updated_at: string;
        province: string | null;
        channel: string | null;
        vat_number: string | null;
        notes: string | null;
    };
    lifetimeValue: number;
    currentYTD: number;
    previousYTD: number;
    monthlyTrend: { name: string; amount: number }[];
    companyMix: { name: string; amount: number; percentage: number }[];
}

export async function getClientAnalytics(clientId: string, filterCompanyId?: string): Promise<ClientAnalytics | null> {
    const supabase = await createClient()
    const now = new Date()
    const currentYear = now.getFullYear()

    // 1. Fetch BASIC INFO
    const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single()

    if (clientError || !client) return null

    // 2. Fetch REVENUES
    let query = supabase
        .from("revenues")
        .select(`
            amount,
            period,
            companies (id, name)
        `)
        .eq("client_id", clientId)
        .order("period", { ascending: true })

    if (filterCompanyId && filterCompanyId !== 'all') {
        query = query.eq("company_id", filterCompanyId)
    }

    const { data: revenues, error: revError } = await query

    if (revError) throw new Error(revError.message)

    let lifetimeValue = 0
    let currentYTD = 0
    let previousYTD = 0
    const companyMap: Record<string, number> = {}

    const previousYear = currentYear - 1

    // Monthly Trend (Last 12 Months or Current Year?)
    // Let's do Current Year Monthly Trend for simplicity or Last 12 Months. 
    // Requirement says "Trend", usually YTD monthly is good.
    const monthlyData: Record<number, number> = {}
    for (let i = 0; i < 12; i++) monthlyData[i] = 0

    revenues?.forEach((rev: any) => {
        const amount = Number(rev.amount)
        const date = new Date(rev.period)
        const year = date.getFullYear()

        lifetimeValue += amount

        if (year === currentYear) {
            currentYTD += amount
            monthlyData[date.getMonth()] += amount
        } else if (year === previousYear) {
            // Strict YTD comparison logic if needed, or just full previous year amount
            if (date.getMonth() <= now.getMonth()) {
                previousYTD += amount
            }
        }

        const companyName = Array.isArray(rev.companies)
            ? rev.companies[0]?.name
            : (rev.companies as any)?.name || "Unknown"
        companyMap[companyName] = (companyMap[companyName] || 0) + amount
    })

    const monthlyTrend = Object.keys(monthlyData).map(key => ({
        name: new Date(2024, parseInt(key), 1).toLocaleString('it-IT', { month: 'short' }),
        amount: monthlyData[parseInt(key)]
    }))

    const companyMix = Object.entries(companyMap)
        .map(([name, amount]) => ({
            name,
            amount,
            percentage: lifetimeValue > 0 ? (amount / lifetimeValue) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount)

    return {
        client,
        lifetimeValue,
        currentYTD,
        previousYTD,
        monthlyTrend,
        companyMix
    }
}

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
    monthlyTrend: { name: string; amount: number }[];
    clientMix: { name: string; amount: number; percentage: number }[];
}

export async function getCompanyAnalytics(companyId: string, filterClientId?: string): Promise<CompanyAnalytics | null> {
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
            clients (id, name)
        `)
        .eq("company_id", companyId)
        .order("period", { ascending: true })

    if (filterClientId && filterClientId !== 'all') {
        query = query.eq("client_id", filterClientId)
    }

    const { data: revenues, error: revError } = await query

    if (revError) throw new Error(revError.message)

    let lifetimeValue = 0
    let currentYTD = 0
    let previousYTD = 0
    const clientMap: Record<string, number> = {}

    const previousYear = currentYear - 1

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

    const clientMix = Object.entries(clientMap)
        .map(([name, amount]) => ({
            name,
            amount,
            percentage: lifetimeValue > 0 ? (amount / lifetimeValue) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount)

    return {
        company,
        lifetimeValue,
        currentYTD,
        previousYTD,
        monthlyTrend,
        clientMix
    }
}

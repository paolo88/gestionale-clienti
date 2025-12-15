import { createClient } from "@/lib/server-supabase"

export interface KPIResult {
    currentYTD: number;
    previousYTD: number;
    delta: number;
    deltaPercentage: number;
    monthlyTrend: { name: string; current: number; previous: number }[];
    annualTrend: { name: string; total: number }[];
    topClients: { name: string; amount: number }[];
    topCompanies: { name: string; amount: number }[];
}

export async function getDashboardKPIs(): Promise<KPIResult> {
    const supabase = await createClient()
    const now = new Date()
    const currentYear = now.getFullYear()
    const previousYear = currentYear - 1

    // Fetch all revenues for current and previous year
    // Optimized: In a real large app, you'd want to aggregate in SQL. For MVP (thousands of rows max), JS aggregation is fine.
    const { data: revenues, error } = await supabase
        .from("revenues")
        .select(`
            amount,
            period,
            clients (name),
            companies (name)
        `)
        .select(`
            amount,
            period,
            clients (name),
            companies (name)
        `)
        // Fetching all time for annual trend, or limit to 5-10 years if needed. 
        // For now, let's fetch last 5 years to be safe/performant, or just remove filter for "All Time"
        // User wants "Annual Data", usually implies history.
        .gte("period", `${currentYear - 4}-01-01`)
        .lte("period", `${currentYear}-12-31`)

    if (error) throw new Error(error.message)

    let currentYTD = 0
    let previousYTD = 0
    const monthlyData: Record<string, { current: number; previous: number }> = {}
    const clientMap: Record<string, number> = {}
    const companyMap: Record<string, number> = {}

    // Initialize months
    for (let i = 0; i < 12; i++) {
        const monthName = new Date(2024, i, 1).toLocaleString('default', { month: 'short' })
        monthlyData[i] = { current: 0, previous: 0 }
    }

    revenues?.forEach((rev: any) => {
        const date = new Date(rev.period)
        const year = date.getFullYear()
        const month = date.getMonth()
        const amount = Number(rev.amount)

        if (year === currentYear) {
            currentYTD += amount
            monthlyData[month].current += amount

            // Top Lists based on Current Year
            const clientName = Array.isArray(rev.clients)
                ? rev.clients[0]?.name
                : (rev.clients as any)?.name || "Unknown"
            clientMap[clientName] = (clientMap[clientName] || 0) + amount

            const companyName = Array.isArray(rev.companies)
                ? rev.companies[0]?.name
                : (rev.companies as any)?.name || "Unknown"
            companyMap[companyName] = (companyMap[companyName] || 0) + amount

        } else if (year === previousYear) {
            // For YTD comparison, strict YTD means up to current month/day.
            // Broad YTD means total previous year? Usually YTD is point-in-time.
            // Let's do YTD (Jan to Now) vs Previous YTD (Jan to Same Month Last Year)
            if (month <= now.getMonth()) {
                previousYTD += amount
            }
            monthlyData[month].previous += amount
        }
    })

    // Calculate Annual Trend (Last 5 Years)
    const annualMap: Record<string, number> = {}
    revenues?.forEach((rev: any) => {
        const year = new Date(rev.period).getFullYear().toString()
        annualMap[year] = (annualMap[year] || 0) + Number(rev.amount)
    })

    const annualTrend = Object.keys(annualMap).sort().map(year => ({
        name: year,
        total: annualMap[year]
    }))

    const delta = currentYTD - previousYTD
    const deltaPercentage = previousYTD === 0 ? (currentYTD > 0 ? 100 : 0) : (delta / previousYTD) * 100

    const monthlyTrend = Object.keys(monthlyData).map(key => ({
        name: new Date(2024, parseInt(key), 1).toLocaleString('it-IT', { month: 'short' }),
        current: monthlyData[key].current,
        previous: monthlyData[key].previous
    }))

    const topClients = Object.entries(clientMap)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)

    const topCompanies = Object.entries(companyMap)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)

    return {
        currentYTD,
        previousYTD,
        delta,
        deltaPercentage,
        monthlyTrend,
        annualTrend,
        topClients,
        topCompanies
    }
}

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

export async function getDashboardKPIs(year?: number): Promise<KPIResult> {
    const supabase = await createClient()
    const now = new Date()
    const realCurrentYear = now.getFullYear()
    const selectedYear = year || realCurrentYear
    const previousYear = selectedYear - 1

    // If selected year is in the past, we consider "YTD" as the full year.
    // If selected year is current, we limit to current month.
    const isPastYear = selectedYear < realCurrentYear
    const maxMonth = isPastYear ? 11 : now.getMonth()

    // Fetch all revenues for selected and previous year
    const { data: revenues, error } = await supabase
        .from("revenues")
        .select(`
            amount,
            period,
            clients (name),
            companies (name)
        `)
        // Optimize: Fetching specifically for relevant years to reduce payload?
        // Or keep broad fetch if dataset is small.
        // Let's filter by range to be safe.
        // We need Selected Year and Previous Year for comparison.
        // Plus Annual Trend needs history (e.g. 5 years).
        // Let's broaden the query to cover Annual Trend range + Previous Year.
        // Range: [SelectedYear - 4, SelectedYear]
        .gte("period", `${selectedYear - 4}-01-01`)
        .lte("period", `${selectedYear}-12-31`)

    if (error) throw new Error(error.message)

    let currentYTD = 0
    let previousYTD = 0
    const monthlyData: Record<string, { current: number; previous: number }> = {}
    const clientMap: Record<string, number> = {}
    const companyMap: Record<string, number> = {}

    // Initialize months
    for (let i = 0; i < 12; i++) {
        monthlyData[i] = { current: 0, previous: 0 }
    }

    revenues?.forEach((rev: any) => {
        const date = new Date(rev.period)
        const rowYear = date.getFullYear()
        const rowMonth = date.getMonth()
        const amount = Number(rev.amount)

        if (rowYear === selectedYear) {
            currentYTD += amount
            monthlyData[rowMonth].current += amount

            // Top Lists based on Selected Year
            const clientName = Array.isArray(rev.clients)
                ? rev.clients[0]?.name
                : (rev.clients as any)?.name || "Unknown"
            clientMap[clientName] = (clientMap[clientName] || 0) + amount

            const companyName = Array.isArray(rev.companies)
                ? rev.companies[0]?.name
                : (rev.companies as any)?.name || "Unknown"
            companyMap[companyName] = (companyMap[companyName] || 0) + amount

        } else if (rowYear === previousYear) {
            // Comparisons
            // If we are looking at a past year (e.g. 2025), we want to compare Full 2025 vs Full 2024.
            // If we are looking at Current Year (2026), we compare Jan 2026 vs Jan 2025.
            if (rowMonth <= maxMonth) {
                previousYTD += amount
            }
            monthlyData[rowMonth].previous += amount
        }
    })

    // Calculate Annual Trend (Last 5 Years relative to Selected Year)
    const annualMap: Record<string, number> = {}
    revenues?.forEach((rev: any) => {
        const y = new Date(rev.period).getFullYear()
        // Only include up to selected year
        if (y <= selectedYear && y >= selectedYear - 4) {
            const yStr = y.toString()
            annualMap[yStr] = (annualMap[yStr] || 0) + Number(rev.amount)
        }
    })

    const annualTrend = Object.keys(annualMap).sort().map(y => ({
        name: y,
        total: annualMap[y]
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

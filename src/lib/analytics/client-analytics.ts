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
    previousYearTotal: number;
    deltaPercentage: number;
    monthlyTrend: { name: string; amount: number }[];
    annualTrend: { name: string; total: number }[];
    companyMix: { name: string; amount: number; percentage: number; value: number }[];
}

export async function getClientAnalytics(clientId: string, filterCompanyId?: string, filterChannel?: string, year?: number): Promise<ClientAnalytics | null> {
    const supabase = await createClient()
    const now = new Date()
    const realCurrentYear = now.getFullYear()
    const selectedYear = year || realCurrentYear
    const previousYear = selectedYear - 1

    // Logic for YTD comparison:
    // If selected year is past, we take full year.
    // If selected year is current, we limit to current month.
    const isPastYear = selectedYear < realCurrentYear
    const maxMonth = isPastYear ? 11 : now.getMonth()

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
            companies (id, name, category)
        `)
        .eq("client_id", clientId)
        .order("period", { ascending: true })

    if (filterCompanyId && filterCompanyId !== 'all') {
        query = query.eq("company_id", filterCompanyId)
    }

    const { data: rawRevenues, error: revError } = await query

    if (revError) throw new Error(revError.message)

    // Filter by Channel if needed
    let revenues = rawRevenues;

    // PREVIOUS STEP I added `filterChannel` to `getCompanyAnalytics` and it filters by `client.channel`.
    // NOW I am editing `getClientAnalytics`.
    // If I add `filterChannel`, what does it filter?
    // If the input is "Canale", and companies don't have "Canale", maybe I should filter by "Category".
    // I'll implement `filterCategory` logic but name the parameter generic or specific.

    // Let's pause and read `companies` table definition if possible or `validations`.
    // `companySchema` has `category`. `clientSchema` has `channel`.
    // So Client Page -> Filter by Company Category. 
    // Company Page -> Filter by Client Channel.

    // I will implement `filterCategory` in `getClientAnalytics`.

    if (filterChannel && filterChannel !== 'all') { // Reusing the name passed from UI param 'channel'
        revenues = revenues?.filter((r: any) => {
            const companyCategory = Array.isArray(r.companies) ? r.companies[0]?.category : r.companies?.category;
            return companyCategory === filterChannel;
        })
    }

    let lifetimeValue = 0
    let currentYTD = 0
    let previousYTD = 0
    let previousYearTotal = 0
    const companyMap: Record<string, number> = {}

    // Monthly Trend (Selected Year)
    const monthlyData: Record<number, number> = {}
    for (let i = 0; i < 12; i++) monthlyData[i] = 0

    // Annual Trend (Last 5 Years relative to Selected Year)
    const annualData: Record<number, number> = {}
    for (let i = 0; i < 5; i++) annualData[selectedYear - 4 + i] = 0

    revenues?.forEach((rev: any) => {
        const amount = Number(rev.amount)
        const date = new Date(rev.period)
        const rowYear = date.getFullYear()

        lifetimeValue += amount

        // Annual Data population (only for relevant window)
        if (annualData[rowYear] !== undefined) {
            annualData[rowYear] += amount
        }

        if (rowYear === selectedYear) {
            currentYTD += amount
            monthlyData[date.getMonth()] += amount

            // Company Map (for selected year)
            // Or should company mix be lifetime? Usually dashboard filters affect all widgets.
            // Let's make company mix follow the selected year filter (like YTD).
            const companyName = Array.isArray(rev.companies)
                ? rev.companies[0]?.name
                : (rev.companies as any)?.name || "Unknown"
            companyMap[companyName] = (companyMap[companyName] || 0) + amount

        } else if (rowYear === previousYear) {
            previousYearTotal += amount
            if (date.getMonth() <= maxMonth) {
                previousYTD += amount
            }
        }
    })

    const monthlyTrend = Object.keys(monthlyData).map(key => ({
        name: new Date(2024, parseInt(key), 1).toLocaleString('it-IT', { month: 'short' }),
        amount: monthlyData[parseInt(key)]
    }))

    const annualTrend = Object.keys(annualData).map(key => ({
        name: key,
        total: annualData[parseInt(key)]
    }))

    const companyMix = Object.entries(companyMap)
        .map(([name, amount]) => ({
            name,
            amount,
            percentage: lifetimeValue > 0 ? (amount / lifetimeValue) * 100 : 0,
            value: amount // For PieChart
        }))
        .sort((a, b) => b.amount - a.amount)

    const deltaPercentage = previousYTD === 0
        ? (currentYTD > 0 ? 100 : 0)
        : ((currentYTD - previousYTD) / previousYTD) * 100

    return {
        client,
        lifetimeValue,
        currentYTD,
        previousYTD,
        previousYearTotal,
        deltaPercentage,
        monthlyTrend,
        annualTrend,
        companyMix
    }
}

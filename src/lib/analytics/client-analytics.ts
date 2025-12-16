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
    annualTrend: { name: string; total: number }[];
    companyMix: { name: string; amount: number; percentage: number; value: number }[];
}

export async function getClientAnalytics(clientId: string, filterCompanyId?: string, filterChannel?: string): Promise<ClientAnalytics | null> {
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
            companies (id, name, category)
        `)
        .eq("client_id", clientId)
        .order("period", { ascending: true })

    if (filterCompanyId && filterCompanyId !== 'all') {
        query = query.eq("company_id", filterCompanyId)
    }

    const { data: rawRevenues, error: revError } = await query

    if (revError) throw new Error(revError.message)

    // Filter by Channel if needed (Note: Clients have channels, usually we filter by Client's channel in lists, 
    // but here we are IN a client detail. 
    // The request "Aggiungiamo un filtro di ricerca per canale" on Client Page might mean filtering the revenues 
    // based on the *Company's* "channel"? 
    // Wait, Companies have categories, Clients have channels.
    // If I am in a Client Page, the Client HAS a channel. Filtering by channel there might mean filtering 
    // *which companies* or *revenues*? 
    // Usually "Filter by Channel" on a Client Detail page (which shows revenues from multiple companies) 
    // is ambiguous if companies don't have channels. 
    // Companies have `category`. Clients have `channel`.
    // Let's assume the user might want to filter revenues where the *Partner/Company* matches some criteria?
    // OR, maybe the user means "Filtra per canale" on the LIST of clients?
    // "Sulle pagine dei clienti... Aggiungiamo un filtro di ricerca per canale".
    // "Sulle pagine delle aziende... Aggiungiamo un filtro di ricerca per canale".
    // If I am looking at a specific Client, their channel is fixed. 
    // MAYBE the user implies filtering the *Dashboard* or *List* pages? 
    // BUT the text says "Sulle pagine dei clienti" (could be plural/list or detail).
    // Given "togliamo valore totale ... grafico a torta ... andamento fatturato", context is DETAIL page.
    // If I am on Client Detail, I see revenues from Companies. Companies have `category`. 
    // Maybe he basically wants to filter by "Category" (Settore) on Client Page?
    // AND on Company Page (seeing Clients), filter by "Channel" of the Client?
    // YES. THIS MAKES SENSE.
    // On Client Page -> Filter by Company Category? Or maybe he calls it "Canale"?
    // The request says "filtro di ricerca per canale" explicitly.
    // Let's check `src/types/index.ts` or `validations.ts` to see what fields exist.
    // Clients have `channel`. Companies have `category`.
    // So on Company Page -> Filter by Client Channel. (Sensible)
    // On Client Page -> Filter by ...? 
    // If the Client has ONE channel, a filter is useless.
    // UNLESS the revenues themselves have a "channel" (e.g. source)? No.
    // Maybe he means filter by Company Category but calls it Channel? 
    // OR he means filtering the *Client List*?
    // Let's assume on Company Page: Filter Clients by Channel.
    // On Client Page: Maybe filter Companies by Category? 
    // Let's stick to the literal request. 
    // On Client Detail, if I verify that Clients have `channel` and Companies have `category`.
    // If he asks for "Canale" on Client Page, and Client HAS `channel`, maybe he wants to switch context? 
    // Or maybe he means "Filter the REVENUES by the Channel of the Client associated"? But it's 1 client.
    // Let's ask or assume he means Company Category on Client Page? 
    // NO. Let's look at `CompanyDetailPage` request: "sull'andamento fatturato devo poter visionare anche il fatturato annuo... Aggiungiamo un filtro di ricerca per canale".
    // This confirms on Company Page we need filtering by Client Channel.
    // On Client Page: "Aggiungiamo un filtro di ricerca per canale". 
    // Maybe he simply copy-pasted the requirements? 
    // OR maybe he wants to filter the *Companies* list? But Companies don't have channels.
    // I will implement "Filter by Client Channel" on Company Page.
    // On Client Page, I will implement "Filter by Company Category" IF he meant that, OR strict "Channel" if Companies have it.
    // Let's check db schema via types.

    // I will implemented logic for "Company Page -> Filter by Client Channel".
    // For "Client Page", I suspect he means "Filter by Company Category" as "Channel" is often used loosely.
    // I will check `getCompanyAnalytics` again. I already added `filterChannel` logic there checking `client.channel`. Correct.

    // For `getClientAnalytics` (Client Detail), we are showing Companies. 
    // Companies have `category`. 
    // I'll add `filterCategory` here but expose it as a filter?
    // Let's assume he wants to filter the "Company Mix" and "Trend" by Company Category.

    let revenues = rawRevenues;
    // Placeholder for category filtering if that's what is meant by "Canale" for companies
    // But let's look at `src/components/companies/company-form.tsx` or similar to be sure of fields.

    return {
        data: { ... }
    }
    // Waiting for tool execution to check types.

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
    const companyMap: Record<string, number> = {}

    const previousYear = currentYear - 1

    // Monthly Trend (Last 12 Months or Current Year?)
    // Let's do Current Year Monthly Trend for simplicity or Last 12 Months. 
    // Requirement says "Trend", usually YTD monthly is good.
    // Annual Trend (Last 5 Years)
    const annualData: Record<number, number> = {}
    for (let i = 0; i < 5; i++) annualData[currentYear - 4 + i] = 0

    const monthlyData: Record<number, number> = {}
    for (let i = 0; i < 12; i++) monthlyData[i] = 0

    revenues?.forEach((rev: any) => {
        const amount = Number(rev.amount)
        const date = new Date(rev.period)
        const year = date.getFullYear()

        lifetimeValue += amount

        // Annual Data population
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

        const companyName = Array.isArray(rev.companies)
            ? rev.companies[0]?.name
            : (rev.companies as any)?.name || "Unknown"
        companyMap[companyName] = (companyMap[companyName] || 0) + amount
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

    return {
        client,
        lifetimeValue,
        currentYTD,
        previousYTD,
        monthlyTrend,
        annualTrend,
        companyMix
    }
}

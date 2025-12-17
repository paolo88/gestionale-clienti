import { getClientAnalytics } from "@/lib/analytics/client-analytics"
import { getCompanies } from "@/lib/actions/companies"
import { PageHeader } from "@/components/layout/page-header"
import { KPICard } from "@/components/layout/kpi-card"
import { Euro, TrendingUp, Wallet } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
// Reusing Dashboard components for consistency
import { TrendChart } from "@/components/dashboard/trend-chart"
import { DistributionPieChart } from "@/components/dashboard/distribution-pie-chart"
import { ClientDetailFilters } from "@/components/clients/client-detail-filters"

type Props = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ClientDetailPage(props: Props) {
    const params = await props.params
    const searchParams = await props.searchParams

    // Explicitly grab company_id string from searchParams
    const filterCompanyId = typeof searchParams.company_id === 'string' ? searchParams.company_id : undefined

    const data = await getClientAnalytics(params.id, filterCompanyId)
    const companies = await getCompanies() || []

    if (!data) return <div>Cliente non trovato</div>

    const companyList = companies.filter(c => c.is_active).map(c => ({ id: c.id, name: c.name }))

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <PageHeader
                    title={data.client.name}
                    description={`Dettaglio cliente. ${filterCompanyId ? '(Filtrato per azienda)' : ''}`}
                />
                <ClientDetailFilters companies={companyList} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <KPICard
                    title="Fatturato YTD"
                    value={formatCurrency(data.currentYTD)}
                    icon={Euro}
                    trend={data.deltaPercentage}
                    trendLabel="vs anno precedente"
                />
                <KPICard
                    title="Anno Precedente"
                    value={formatCurrency(data.previousYTD)}
                    icon={TrendingUp}
                    description="Stesso periodo anno scorso"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <TrendChart
                    data={data.monthlyTrend.map(t => ({ name: t.name, current: t.amount, previous: 0 }))}
                    annualData={data.annualTrend}
                />

                {/* Pie Chart for Company Mix */}
                <DistributionPieChart
                    title="Mix Aziende"
                    description="Distribuzione fatturato per azienda mandante"
                    data={data.companyMix}
                />
            </div>

            <div className="col-span-4 bg-white p-6 rounded-lg border border-neutral-200">
                <h3 className="font-semibold mb-2">Dettagli cliente</h3>

                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="block text-neutral-500">P.IVA</span>
                        <span>{data.client.vat_number || "-"}</span>
                    </div>
                    <div>
                        <span className="block text-neutral-500">Canale</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {data.client.channel || "Diretto"}
                        </span>
                    </div>
                </div>

                <div className="mt-4">
                    <h3 className="font-semibold mb-2">Note</h3>
                    <p className="text-neutral-600 text-sm whitespace-pre-wrap">{data.client.notes || "Nessuna nota."}</p>
                </div>
            </div>
        </div>
    )
}

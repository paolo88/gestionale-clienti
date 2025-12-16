import { getCompanyAnalytics } from "@/lib/analytics/company-analytics"
import { getClients } from "@/lib/actions/clients"
import { PageHeader } from "@/components/layout/page-header"
import { KPICard } from "@/components/layout/kpi-card"
import { Euro, TrendingUp, Wallet } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { TrendChart } from "@/components/dashboard/trend-chart"
import { DistributionPieChart } from "@/components/dashboard/distribution-pie-chart"
import { CompanyDetailFilters } from "@/components/companies/company-detail-filters"

type Props = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CompanyDetailPage(props: Props) {
    const params = await props.params
    const searchParams = await props.searchParams

    // Explicitly grab client_id and channel strings
    const filterClientId = typeof searchParams.client_id === 'string' ? searchParams.client_id : undefined
    const filterChannel = typeof searchParams.channel === 'string' ? searchParams.channel : undefined

    const data = await getCompanyAnalytics(params.id, filterClientId, filterChannel)
    const clients = await getClients() || []

    if (!data) return <div>Azienda non trovata</div>

    const clientList = clients.filter(c => c.is_active).map(c => ({ id: c.id, name: c.name }))

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <PageHeader
                    title={data.company.name}
                    description={`Dettaglio azienda. ${filterClientId ? '(Filtrato per cliente)' : ''}`}
                />
                <CompanyDetailFilters clients={clientList} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <KPICard
                    title="Fatturato YTD"
                    value={formatCurrency(data.currentYTD)}
                    icon={Euro}
                    description="Anno corrente"
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
                <DistributionPieChart
                    title="Mix Clienti"
                    description="Distribuzione fatturato per cliente"
                    data={data.clientMix.map(c => ({ name: c.name, value: c.value }))}
                />
            </div>

            <div className="col-span-4 bg-white p-6 rounded-lg border border-neutral-200">
                <h3 className="font-semibold mb-2">Dettagli Mandato</h3>

                <div className="mt-2">
                    <span className="text-neutral-500 text-sm">Categoria: </span>
                    <span className="font-medium">{data.company.category || "-"}</span>
                </div>

                <div className="mt-4">
                    <h3 className="font-semibold mb-2">Note</h3>
                    <p className="text-neutral-600 text-sm whitespace-pre-wrap">{data.company.notes || "Nessuna nota."}</p>
                </div>
            </div>
        </div>
    )
}

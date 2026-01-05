import { KPICard } from "@/components/layout/kpi-card"
import { PageHeader } from "@/components/layout/page-header"
import { Euro, TrendingUp, Users, Building2 } from "lucide-react"
import { getDashboardKPIs } from "@/lib/analytics/kpi"
import { TrendChart } from "@/components/dashboard/trend-chart"
import { TopList } from "@/components/dashboard/top-list"
import { formatCurrency, formatPercentage } from "@/lib/utils"

import { YearSelect } from "@/components/dashboard/year-select"

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DashboardPage(props: Props) {
  const searchParams = await props.searchParams
  const yearParam = typeof searchParams.year === 'string' ? searchParams.year : undefined
  const year = yearParam ? parseInt(yearParam) : undefined

  const kpis = await getDashboardKPIs(year)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <PageHeader title="Dashboard" description="Panoramica dell'andamento commerciale." />
        <YearSelect />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Fatturato YTD"
          value={formatCurrency(kpis.currentYTD)}
          icon={Euro}
          trend={kpis.deltaPercentage}
          trendLabel="vs anno precedente"
        />
        <KPICard
          title="Anno Precedente (YTD)"
          value={formatCurrency(kpis.previousYTD)}
          icon={TrendingUp}
          description="Stesso periodo anno scorso"
        />
        <KPICard
          title="Top Clienti"
          value={kpis.topClients.length > 0 ? kpis.topClients[0].name : "-"}
          icon={Users}
          description="Miglior cliente"
        />
        <KPICard
          title="Top Azienda"
          value={kpis.topCompanies.length > 0 ? kpis.topCompanies[0].name : "-"}
          icon={Building2}
          description="Miglior mandante"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <TrendChart data={kpis.monthlyTrend} annualData={kpis.annualTrend} />
        <div className="col-span-3 space-y-4">
          <TopList
            title="Top 5 Clienti"
            description="Migliori clienti per fatturato (YTD)"
            items={kpis.topClients}
          />
          <TopList
            title="Top 5 Aziende"
            description="Migliori aziende mandanti (YTD)"
            items={kpis.topCompanies}
          />
        </div>
      </div>
    </div>
  )
}

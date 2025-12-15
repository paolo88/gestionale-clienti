import { getRevenues } from "@/lib/actions/revenues"
import { getClients } from "@/lib/actions/clients"
import { getCompanies } from "@/lib/actions/companies"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { RevenueForm } from "@/components/revenues/revenue-form"
import { RevenueTable } from "@/components/revenues/revenue-table"
import { RevenueEditSheet } from "@/components/revenues/revenue-edit-sheet"
import { RevenueFilters } from "@/components/revenues/revenue-filters"

// Correctly typing searchParams for Next.js 15/latest
type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function RevenuesPage(props: Props) {
    const searchParams = await props.searchParams
    const cid = typeof searchParams.client_id === 'string' ? searchParams.client_id : undefined
    const compId = typeof searchParams.company_id === 'string' ? searchParams.company_id : undefined

    const revenues = await getRevenues({ client_id: cid, company_id: compId })
    const clients = await getClients() || []
    const companies = await getCompanies() || []

    const editId = searchParams.edit as string
    const revenueToEdit = editId ? revenues?.find((r: any) => r.id === editId) : null

    // Prepare lists for form
    const clientList = clients.filter(c => c.is_active).map(c => ({ id: c.id, name: c.name }))
    const companyList = companies.filter(c => c.is_active).map(c => ({ id: c.id, name: c.name }))

    return (
        <div className="space-y-6">
            <PageHeader title="Fatturati" description="Gestione manuale dei fatturati.">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Nuovo Inserimento
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Inserisci Fatturato</SheetTitle>
                            <SheetDescription>
                                Associa un fatturato a Cliente, Azienda e Periodo.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-4">
                            <RevenueForm
                                clients={clientList}
                                companies={companyList}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </PageHeader>

            <RevenueFilters clients={clientList} companies={companyList} />

            <RevenueTable data={revenues || []} />

            {revenueToEdit && (
                <RevenueEditSheet
                    revenue={revenueToEdit}
                    clients={clientList}
                    companies={companyList}
                />
            )}
        </div>
    )
}

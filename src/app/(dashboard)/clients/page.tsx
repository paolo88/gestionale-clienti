import { getClients, getClient } from "@/lib/actions/clients"
import { ClientTable } from "@/components/clients/client-table"
import { ClientFilters } from "@/components/clients/client-filters"
import { PageHeader } from "@/components/layout/page-header"
import { ClientSheet } from "@/components/clients/client-sheet"

export default async function ClientsPage({
    searchParams,
}: {
    searchParams?: Promise<{ query?: string; channel?: string; edit?: string }>;
}) {
    const params = await searchParams;
    const query = params?.query || "";
    const channel = params?.channel || "";
    const editId = params?.edit;

    const clients = await getClients(query, channel)
    let editClient = null;
    if (editId) {
        editClient = await getClient(editId)
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Clienti" description="Gestisci l'anagrafica dei tuoi clienti.">
                <ClientSheet client={editClient} />
            </PageHeader>

            <ClientFilters />

            <ClientTable data={clients || []} />
        </div>
    )
}

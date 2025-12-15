import { getCompanies, getCompany } from "@/lib/actions/companies"
import { CompanyTable } from "@/components/companies/company-table"
import { PageHeader } from "@/components/layout/page-header"
import { CompanySheet } from "@/components/companies/company-sheet"

export default async function CompaniesPage({
    searchParams,
}: {
    searchParams?: Promise<{ query?: string; edit?: string }>;
}) {
    const params = await searchParams;
    const query = params?.query || "";
    const editId = params?.edit;

    const companies = await getCompanies(query)
    let editCompany = null;
    if (editId) {
        editCompany = await getCompany(editId)
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Aziende" description="Gestisci i mandati e le aziende.">
                <CompanySheet company={editCompany} />
            </PageHeader>
            <CompanyTable data={companies || []} />
        </div>
    )
}

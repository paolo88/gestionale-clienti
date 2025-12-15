import { getImportBatches } from "@/lib/actions/imports"
import { ImportUploader } from "@/components/imports/import-uploader"
import { PageHeader } from "@/components/layout/page-header"
import { formatDate } from "@/lib/utils"
// import { Badge } from "@/components/ui/badge" // If needed
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default async function ImportsPage() {
    const batches = await getImportBatches()

    return (
        <div className="space-y-6">
            <PageHeader title="Import Dati" description="Carica fatturati massivi via CSV." />

            <div className="bg-white p-6 rounded-lg border border-neutral-200">
                <h3 className="text-lg font-medium mb-4">Nuovo Import</h3>
                <ImportUploader />
            </div>

            <div className="space-y-4 pt-4">
                <h3 className="text-lg font-medium">Storico Import</h3>
                <div className="rounded-md border border-neutral-200 bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>File</TableHead>
                                <TableHead>Totale</TableHead>
                                <TableHead className="text-emerald-600">Successi</TableHead>
                                <TableHead className="text-rose-600">Errori</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {batches && batches.length > 0 ? (
                                batches.map((batch: any) => (
                                    <TableRow key={batch.id}>
                                        <TableCell>{new Date(batch.imported_at).toLocaleString()}</TableCell>
                                        <TableCell>{batch.filename}</TableCell>
                                        <TableCell>{batch.total_rows}</TableCell>
                                        <TableCell>{batch.success_rows}</TableCell>
                                        <TableCell>{batch.error_rows}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">Nessun import effettuato.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

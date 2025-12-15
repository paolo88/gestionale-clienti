"use client"

import { useState } from "react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, Check, AlertCircle, Loader2, FileDown } from "lucide-react"
import { processCsvImport } from "@/lib/actions/imports"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export function ImportUploader() {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState<any>(null)
    const [errorReport, setErrorReport] = useState<any[] | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setStats(null)
            setErrorReport(null)
        }
    }

    const handleUpload = () => {
        if (!file) return

        setLoading(true)
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                if (results.errors.length > 0) {
                    // Basic CSV parsing validation
                    console.error("CSV Parse Errors", results.errors)
                }

                // Send to Server Action
                try {
                    const res = await processCsvImport(results.data as any, file.name)
                    if (res.success) {
                        setStats(res.stats)
                        setErrorReport(res.errorReport || null)
                    }
                } catch (e) {
                    console.error(e)
                } finally {
                    setLoading(false)
                }
            }
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-end gap-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Input id="csv" type="file" accept=".csv" onChange={handleFileChange} />
                </div>
                <Button onClick={handleUpload} disabled={!file || loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Carica CSV
                </Button>
            </div>

            {/* Template Info */}
            <div className="text-sm text-neutral-500">
                <p>Formato richiesto: <strong>period, client_name, company_name, amount</strong></p>
                <p className="text-xs mt-1">Es. period: "2024-01", amount: "1250.50"</p>
            </div>

            {/* Results */}
            {stats && (
                <div className="space-y-4">
                    <Alert className="border-green-200 bg-green-50">
                        <Check className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Import Completato</AlertTitle>
                        <AlertDescription className="text-green-700">
                            Processate {stats.total} righe. Successi: {stats.success}. Errori: {stats.errors}.
                        </AlertDescription>
                    </Alert>

                    {errorReport && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-4">
                            <h4 className="flex items-center text-red-800 font-medium mb-2">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Report Errori ({stats.errors})
                            </h4>
                            <div className="max-h-60 overflow-auto text-sm text-red-700">
                                <ul className="list-disc pl-5 space-y-1">
                                    {errorReport.map((err, idx) => (
                                        <li key={idx}>
                                            <strong>Riga {err.row}:</strong> {err.error} <br />
                                            <span className="text-xs opacity-80">{JSON.stringify(err.data)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

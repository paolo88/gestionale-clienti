"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, MoreHorizontal, Power, PowerOff, Trash } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Company } from "@/types"
import { toggleCompanyStatus, deleteCompany } from "@/lib/actions/companies"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface CompanyTableProps {
    data: Company[];
}

export function CompanyTable({ data }: CompanyTableProps) {
    const router = useRouter()

    async function handleToggle(id: string, currentStatus: boolean) {
        await toggleCompanyStatus(id, !currentStatus)
        router.refresh()
    }

    async function handleDelete(id: string) {
        if (!confirm("Sei sicuro di voler eliminare questa azienda?")) return
        const res = await deleteCompany(id)
        if (res.error) {
            alert(res.error)
        } else {
            router.refresh()
        }
    }

    return (
        <div className="rounded-md border border-neutral-200">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome Azienda</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                Nessuna azienda trovata.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((company) => (
                            <TableRow key={company.id} className="cursor-pointer hover:bg-neutral-50/50">
                                <TableCell className="font-medium">
                                    <Link href={`/companies/${company.id}`} className="block h-full w-full">
                                        {company.name}
                                    </Link>
                                </TableCell>
                                <TableCell>{company.category || "-"}</TableCell>
                                <TableCell>
                                    <Badge variant={company.is_active ? "default" : "destructive"}>
                                        {company.is_active ? "Attiva" : "Non attiva"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => router.push(`/companies?edit=${company.id}`)}>
                                                <Edit className="mr-2 h-4 w-4" /> Modifica
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggle(company.id, company.is_active)}>
                                                {company.is_active ? (
                                                    <>
                                                        <PowerOff className="mr-2 h-4 w-4" /> Disattiva
                                                    </>
                                                ) : (
                                                    <>
                                                        <Power className="mr-2 h-4 w-4" /> Attiva
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleDelete(company.id)} className="text-red-600 focus:text-red-600">
                                                <Trash className="mr-2 h-4 w-4" /> Elimina
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

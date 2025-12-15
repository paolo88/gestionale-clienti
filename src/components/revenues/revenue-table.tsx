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
import { Edit, MoreHorizontal, Trash } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate, formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { deleteRevenue } from "@/lib/actions/revenues"

interface RevenueTableProps {
    data: any[];
}

export function RevenueTable({ data }: RevenueTableProps) {
    const router = useRouter()

    async function handleDelete(id: string) {
        if (!confirm("Sei sicuro di voler eliminare questo fatturato?")) return
        const res = await deleteRevenue(id)
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
                        <TableHead>Periodo</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Azienda</TableHead>
                        <TableHead className="text-right">Importo</TableHead>
                        <TableHead>Fonte</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                Nessun fatturato trovato.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((rev) => (
                            <TableRow key={rev.id}>
                                <TableCell>{formatDate(rev.period)}</TableCell>
                                <TableCell>{rev.clients?.name}</TableCell>
                                <TableCell>{rev.companies?.name}</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(rev.amount)}</TableCell>
                                <TableCell className="text-xs text-neutral-500 capitalize">{rev.source}</TableCell>
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
                                            <DropdownMenuItem onClick={() => router.push(`/revenues?edit=${rev.id}`)}>
                                                <Edit className="mr-2 h-4 w-4" /> Modifica
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleDelete(rev.id)} className="text-red-600 focus:text-red-600">
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

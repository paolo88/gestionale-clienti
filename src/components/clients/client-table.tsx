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
import { Client } from "@/types"
import { toggleClientStatus, deleteClient } from "@/lib/actions/clients"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface ClientTableProps {
    data: Client[];
}

export function ClientTable({ data }: ClientTableProps) {
    const router = useRouter()

    async function handleToggle(id: string, currentStatus: boolean) {
        await toggleClientStatus(id, !currentStatus)
        router.refresh()
    }

    async function handleDelete(id: string) {
        if (!confirm("Sei sicuro di voler eliminare questo cliente?")) return
        const res = await deleteClient(id)
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
                        <TableHead>Nome</TableHead>
                        <TableHead>P.IVA</TableHead>
                        <TableHead>Canale</TableHead>
                        <TableHead>Provincia</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                Nessun cliente trovato.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((client) => (
                            <TableRow key={client.id} className="cursor-pointer hover:bg-neutral-50/50">
                                <TableCell className="font-medium">
                                    <Link href={`/clients/${client.id}`} className="block h-full w-full">
                                        {client.name}
                                    </Link>
                                </TableCell>
                                <TableCell>{client.vat_number || "-"}</TableCell>
                                <TableCell>{client.channel || "-"}</TableCell>
                                <TableCell>{client.province || "-"}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${client.is_active ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'}`}>
                                        {client.is_active ? "Attivo" : "Non attivo"}
                                    </span>
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
                                            <DropdownMenuItem onClick={() => router.push(`/clients?edit=${client.id}`)}>
                                                <Edit className="mr-2 h-4 w-4" /> Modifica
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggle(client.id, client.is_active)}>
                                                {client.is_active ? (
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
                                            <DropdownMenuItem onClick={() => handleDelete(client.id)} className="text-red-600 focus:text-red-600">
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

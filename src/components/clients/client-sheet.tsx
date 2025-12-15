"use client"

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
import { ClientForm } from "@/components/clients/client-form"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ClientFormValues } from "@/lib/validations"

interface ClientSheetProps {
    client?: ClientFormValues & { id: string } | null;
}

export function ClientSheet({ client }: ClientSheetProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    // Sync open state with client prop presence
    useEffect(() => {
        if (client) {
            setOpen(true)
        }
    }, [client])

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            // Close: remove edit param
            router.push(pathname)
        }
    }

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <Button onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Nuovo Cliente
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{client ? "Modifica Cliente" : "Nuovo Cliente"}</SheetTitle>
                    <SheetDescription>
                        {client ? "Modifica i dati del cliente." : "Inserisci i dati del nuovo cliente."}
                    </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                    <ClientForm
                        initialData={client}
                        onSuccess={() => setOpen(false)}
                    />
                </div>
            </SheetContent>
        </Sheet>
    )
}

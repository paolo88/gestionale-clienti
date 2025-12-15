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
import { CompanyForm } from "@/components/companies/company-form"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { CompanyFormValues } from "@/lib/validations"

interface CompanySheetProps {
    company?: CompanyFormValues & { id: string } | null;
}

export function CompanySheet({ company }: CompanySheetProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (company) {
            setOpen(true)
        }
    }, [company])

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            router.push(pathname)
        }
    }

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
                <Button onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Nuova Azienda
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{company ? "Modifica Azienda" : "Nuova Azienda"}</SheetTitle>
                    <SheetDescription>
                        Gestisci i dati dell'azienda mandante.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                    <CompanyForm
                        initialData={company}
                        onSuccess={() => setOpen(false)}
                    />
                </div>
            </SheetContent>
        </Sheet>
    )
}

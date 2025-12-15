"use client"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { RevenueForm } from "@/components/revenues/revenue-form"
import { useRouter } from "next/navigation"

interface RevenueEditSheetProps {
    revenue: any;
    clients: any[];
    companies: any[];
}

export function RevenueEditSheet({ revenue, clients, companies }: RevenueEditSheetProps) {
    const router = useRouter()

    return (
        <Sheet open={true} onOpenChange={(open) => {
            if (!open) router.push('/revenues')
        }}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Modifica Fatturato</SheetTitle>
                    <SheetDescription>
                        Modifica i dettagli del fatturato.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                    <RevenueForm
                        clients={clients}
                        companies={companies}
                        initialData={revenue}
                        onSuccess={() => router.push('/revenues')}
                    />
                </div>
            </SheetContent>
        </Sheet>
    )
}

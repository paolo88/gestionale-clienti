"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Building2, Landmark, Upload, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
        color: "text-neutral-900",
    },
    {
        label: "Clienti",
        icon: Users,
        href: "/clients",
        color: "text-neutral-900",
    },
    {
        label: "Aziende",
        icon: Building2,
        href: "/companies",
        color: "text-neutral-900",
    },
    {
        label: "Fatturato",
        icon: Landmark,
        href: "/revenues",
        color: "text-neutral-900",
    },
    {
        label: "Import Dati",
        icon: Upload,
        href: "/imports",
        color: "text-neutral-900",
    },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-neutral-50 border-r border-neutral-200">
            <div className="px-3 py-2">
                <Link href="/" className="flex items-center pl-3 mb-14">
                    <h1 className="text-xl font-bold tracking-tight text-neutral-900">
                        Revenue Monitor
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-neutral-900 hover:bg-neutral-200/50 rounded-lg transition",
                                pathname === route.href || (pathname !== "/" && route.href !== "/" && pathname.startsWith(route.href))
                                    ? "text-neutral-900 bg-neutral-200/80"
                                    : "text-neutral-500"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

export function MobileSidebar() {
    const [open, setOpen] = useState(false)
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
                <Sidebar />
            </SheetContent>
        </Sheet>
    )
}

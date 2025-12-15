import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-[80] bg-neutral-50 shadow-sm md:shadow-none transition-all">
                <Sidebar />
            </div>
            <div className="md:pl-64 h-full flex flex-col">
                <Topbar />
                <main className="flex-1 overflow-y-auto bg-white p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}

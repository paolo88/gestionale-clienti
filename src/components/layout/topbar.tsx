"use client"

import { MobileSidebar } from "@/components/layout/sidebar";

export function Topbar() {
    return (
        <div className="flex items-center p-4 border-b border-neutral-200 h-16 bg-white shrink-0">
            <MobileSidebar />
            <div className="ml-auto flex items-center gap-x-4">
                {/* UserButton or similar would go here */}
                <span className="text-sm text-neutral-500">Admin</span>
            </div>
        </div>
    )
}

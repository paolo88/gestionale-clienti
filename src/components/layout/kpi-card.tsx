import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface KPICardProps {
    title: string;
    value: string;
    description?: string;
    icon: LucideIcon;
    trend?: number;
    trendLabel?: string;
    className?: string;
}

export function KPICard({ title, value, description, icon: Icon, trend, trendLabel, className }: KPICardProps) {
    return (
        <Card className={cn("border-neutral-200 shadow-sm", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-500">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-neutral-400" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-neutral-900">{value}</div>
                {(description || trend !== undefined) && (
                    <div className="flex items-center text-xs text-neutral-500 mt-1">
                        {trend !== undefined && (
                            <span className={cn(
                                "font-medium mr-1",
                                trend > 0 ? "text-emerald-600" : trend < 0 ? "text-rose-600" : "text-neutral-600"
                            )}>
                                {trend > 0 ? "+" : ""}{trend}%
                            </span>
                        )}
                        {description || trendLabel}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

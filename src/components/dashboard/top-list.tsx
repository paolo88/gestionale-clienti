import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface TopListProps {
    title: string;
    description: string;
    items: { name: string; amount: number; percentage?: number }[];
    valueLabel?: string;
    isValuePercentage?: boolean;
}

export function TopList({ title, description, items, valueLabel, isValuePercentage }: TopListProps) {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {items.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nessun dato disponibile.</p>
                    ) : (
                        items.map((item, i) => (
                            <div key={i} className="flex items-center">
                                <div className="ml-0 space-y-1">
                                    <p className="text-sm font-medium leading-none">{item.name}</p>
                                </div>
                                <div className="ml-auto font-medium">
                                    {isValuePercentage
                                        ? `${item.amount.toFixed(1)}${valueLabel || '%'}`
                                        : formatCurrency(item.amount)
                                    }
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

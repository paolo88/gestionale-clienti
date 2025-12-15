import { Separator } from "@/components/ui/separator";

interface PageHeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
    return (
        <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-neutral-900">{title}</h2>
                    {description && (
                        <p className="text-sm text-neutral-500">
                            {description}
                        </p>
                    )}
                </div>
                {children && <div className="flex items-center space-x-2">{children}</div>}
            </div>
            <Separator className="bg-neutral-200" />
        </div>
    )
}

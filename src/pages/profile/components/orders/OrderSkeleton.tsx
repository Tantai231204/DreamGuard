import { memo } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const OrderSkeleton = memo(() => {
    return (
        <Card className="rounded-2xl border-slate-200/60 p-0 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <div>
                        <Skeleton className="h-3 w-24 mb-1.5" />
                        <Skeleton className="h-2 w-16" />
                    </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-lg" />
            </div>
            <div className="p-6 flex gap-6">
                <Skeleton className="w-20 h-20 rounded-xl" />
                <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-6 w-24 rounded-md" />
                        </div>
                        <div className="space-y-2 text-right">
                            <Skeleton className="h-2 w-16 ml-auto" />
                            <Skeleton className="h-6 w-24 ml-auto" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <Skeleton className="h-3 w-48" />
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24 rounded-lg" />
                    <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
            </div>
        </Card>
    )
})

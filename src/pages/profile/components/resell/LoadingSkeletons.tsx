import { Card, CardContent } from "../../../../components/ui/card"
import { Skeleton } from "../../../../components/ui/skeleton"

export function TradeInRequestSkeleton() {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-[100px]" />
                        <Skeleton className="h-3 w-[80px]" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function StatsCardsSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-4">
                        <Skeleton className="h-8 w-12 mb-2" />
                        <Skeleton className="h-4 w-20" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

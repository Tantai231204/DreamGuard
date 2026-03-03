import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DollarSign, TrendingDown, Package } from "lucide-react"

interface TradeInSummaryProps {
    totalOriginalPrice: number
    totalEstimatedPrice: number
    itemCount: number
}

export function TradeInSummary({ totalOriginalPrice, totalEstimatedPrice, itemCount }: TradeInSummaryProps) {
    const savingsPercent = totalOriginalPrice > 0
        ? Math.round((1 - totalEstimatedPrice / totalOriginalPrice) * 100)
        : 0

    return (
        <Card className="p-5 border rounded-lg bg-emerald-50">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded bg-emerald-600">
                    <DollarSign className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">
                    Price Summary
                </h3>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1.5">
                        <Package className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-600">Items Count</span>
                    </div>
                    <span className="font-semibold text-gray-900">{itemCount}</span>
                </div>

                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Original Value</span>
                    <span className="font-semibold text-gray-900">
                        {totalOriginalPrice.toLocaleString("vi-VN")}₫
                    </span>
                </div>

                <Separator className="my-3" />

                <div className="p-3 bg-emerald-600 rounded-lg">
                    <div className="text-xs text-emerald-100 mb-1">Estimated Value</div>
                    {totalEstimatedPrice > 0 ? (
                        <div className="text-2xl font-bold text-white">
                            {totalEstimatedPrice.toLocaleString("vi-VN")}₫
                        </div>
                    ) : (
                        <div className="text-base text-emerald-100 italic">
                            Not priced yet
                        </div>
                    )}
                </div>

                {totalEstimatedPrice > 0 && savingsPercent > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <TrendingDown className="h-3.5 w-3.5" />
                        <span>~{savingsPercent}% depreciation</span>
                    </div>
                )}
            </div>
        </Card>
    )
}

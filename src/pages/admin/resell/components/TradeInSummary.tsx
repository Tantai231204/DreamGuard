import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

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
        <Card className="p-5 border border-gray-200 rounded-xl bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
                Price Summary
            </h3>
            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items Count</span>
                    <span className="font-medium text-gray-900">{itemCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Original Price</span>
                    <span className="font-medium text-gray-900">{totalOriginalPrice.toLocaleString("vi-VN")}₫</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between items-baseline pt-1">
                    <span className="font-semibold text-gray-900">Estimated Value</span>
                    {totalEstimatedPrice > 0 ? (
                        <span className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                            {totalEstimatedPrice.toLocaleString("vi-VN")}₫
                        </span>
                    ) : (
                        <span className="text-lg text-gray-400 italic">Not priced yet</span>
                    )}
                </div>
                {totalEstimatedPrice > 0 && savingsPercent > 0 && (
                    <div className="text-xs text-right text-gray-500">
                        ~{savingsPercent}% of original value
                    </div>
                )}
            </div>
        </Card>
    )
}

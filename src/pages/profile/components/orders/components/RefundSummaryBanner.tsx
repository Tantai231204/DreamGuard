import { memo } from "react"
import { RotateCcw, TrendingDown } from "lucide-react"
import { formatPrice } from "../../../utils"

interface RefundSummaryBannerProps {
    refundingAmount: number
    refundedAmount: number
}

/**
 * Displays refund progress for a CheckoutOrder.
 * Only rendered when there's active refund activity.
 */
export const RefundSummaryBanner = memo(({ refundingAmount, refundedAmount }: RefundSummaryBannerProps) => {
    if (refundingAmount === 0 && refundedAmount === 0) return null

    return (
        <div className="mx-6 mb-2">
            <div className="flex items-stretch gap-3 rounded-xl overflow-hidden border border-amber-100/80">
                {/* Refunding */}
                {refundingAmount > 0 && (
                    <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-orange-50/60">
                        <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <RotateCcw className="w-3.5 h-3.5 text-orange-500 animate-spin" style={{ animationDuration: '3s' }} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Refunding</p>
                            <p className="text-sm font-black text-orange-600 tracking-tight">{formatPrice(refundingAmount)}</p>
                        </div>
                    </div>
                )}

                {/* Refunded */}
                {refundedAmount > 0 && (
                    <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-emerald-50/60">
                        <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Refunded</p>
                            <p className="text-sm font-black text-emerald-600 tracking-tight">{formatPrice(refundedAmount)}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
})

RefundSummaryBanner.displayName = 'RefundSummaryBanner'

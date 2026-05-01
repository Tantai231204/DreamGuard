import { memo } from "react"
import { formatPrice } from "../../../utils"
import type { CheckoutOrderResponse } from "@/api/types/checkoutOrder"
import { getStatusTheme } from "../../../constants"

interface CheckoutPricingSummaryProps {
    order: CheckoutOrderResponse
}

export const CheckoutPricingSummary = memo(({ order }: CheckoutPricingSummaryProps) => {
    return (
        <div className="bg-white px-6 py-5 space-y-3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                Payment Summary
            </span>

            {order.childOrders.map((child) => {
                const childTheme = getStatusTheme(child.status)
                const isCancelled = childTheme.label.toLowerCase().includes("cancel")
                return (
                    <div key={child.id} className="flex justify-between items-center text-[13px] font-medium text-gray-500">
                        <span className={isCancelled ? "line-through text-gray-300" : ""}>
                            #{child.orderCode.split('-').pop()}
                        </span>
                        <span className={isCancelled ? "line-through text-gray-300" : "text-gray-900"}>
                            {formatPrice(child.totalAmount)}
                        </span>
                    </div>
                )
            })}

            {order.refundedAmount > 0 && (
                <div className="flex justify-between items-center text-[13px] font-medium text-emerald-600">
                    <span>Refunded</span>
                    <span>-{formatPrice(order.refundedAmount)}</span>
                </div>
            )}

            {order.refundingAmount > 0 && (
                <div className="flex justify-between items-center text-[13px] font-medium text-orange-500">
                    <span>Refunding...</span>
                    <span>-{formatPrice(order.refundingAmount)}</span>
                </div>
            )}

            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="text-[15px] font-bold text-gray-900">Total</span>
                <span className="text-[22px] font-black text-[#4988c4] tracking-tighter">
                    {formatPrice(order.totalAmount)}
                </span>
            </div>
        </div>
    )
})

CheckoutPricingSummary.displayName = 'CheckoutPricingSummary'

import { Separator } from "@/components/ui/separator"
import { formatPrice } from "../../../utils"
import type { OrderDetailResponse } from "@/api/types/order"

interface PricingSummaryProps {
  order: OrderDetailResponse
}

export function PricingSummary({ order }: PricingSummaryProps) {
    return (
        <div className="bg-white px-6 pb-4 pt-4 space-y-3">
            <div className="flex justify-between items-center text-[13px] font-medium text-gray-500">
                <span>Subtotal</span>
                <span className="text-gray-900">{formatPrice(order.subTotal || 0)}</span>
            </div>
            <div className="flex justify-between items-center text-[13px] font-medium text-gray-500">
                <span>Shipping Fee</span>
                <span className="text-gray-900">{formatPrice(0)}</span>
            </div>
            {order.discountAmount !== undefined && order.discountAmount > 0 && (
                <div className="flex justify-between items-center text-[13px] font-medium text-gray-500">
                    <span>Promotion Discount</span>
                    <span className="text-red-500">-{formatPrice(order.discountAmount)}</span>
                </div>
            )}
            <Separator className="bg-gray-50 my-2" />
            <div className="flex justify-between items-center pt-1">
                <span className="text-[15px] font-bold text-gray-900">Total Payment</span>
                <span className="text-[22px] font-black text-[#4988c4] tracking-tighter">
                    {formatPrice(order.totalAmount)}
                </span>
            </div>
        </div>
    );
}

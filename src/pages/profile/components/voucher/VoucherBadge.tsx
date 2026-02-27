import { Sparkles } from "lucide-react"
import type { Voucher } from "../../types"
import { getDiscountDisplay, getDiscountTypeLabel } from "./utils"

interface VoucherBadgeProps {
    voucher: Voucher
}

export default function VoucherBadge({ voucher }: VoucherBadgeProps) {
    const isActive = voucher.status === "active"

    return (
        <div
            className={`relative w-full sm:w-32 py-6 sm:py-0 flex-shrink-0 flex flex-col items-center justify-center text-white overflow-hidden ${
                isActive
                    ? "bg-gradient-to-br from-[#4988c4] via-[#5ba3e0] to-[#4988c4]"
                    : "bg-gradient-to-br from-gray-300 to-gray-400"
            }`}
        >
            {/* Decorative sparkles */}
            <div className="absolute top-2 right-2 opacity-20">
                <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <div
                className="absolute bottom-2 left-2 opacity-20"
                style={{ animationDelay: "0.5s" }}
            >
                <Sparkles className="h-4 w-4 animate-pulse" />
            </div>

            {/* Discount amount */}
            <div className="text-center z-10">
                <div className="text-4xl font-black mb-1 drop-shadow-lg">
                    {getDiscountDisplay(voucher)}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider opacity-90">
                    {getDiscountTypeLabel(voucher.discountType)}
                </div>
            </div>

            {/* Semicircle for torn effect - hidden on mobile */}
            <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full" />
        </div>
    )
}

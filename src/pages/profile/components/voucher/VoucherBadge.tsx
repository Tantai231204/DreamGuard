import type { Voucher } from "../../types"
import { getDiscountDisplay, getDiscountTypeLabel } from "./utils"

interface VoucherBadgeProps {
    voucher: Voucher
}

export default function VoucherBadge({ voucher }: VoucherBadgeProps) {
    const isActive = voucher.status === "active"

    return (
        <div
            className={`relative w-full sm:w-40 h-full flex flex-col items-center justify-center text-white p-6 ${
                isActive
                    ? "bg-primary"
                    : "bg-slate-300"
            }`}
        >
            {/* Discount amount */}
            <div className="text-center z-10 transition-transform duration-500 group-hover:scale-110">
                <div className="text-3xl font-bold mb-0.5 leading-none">
                    {getDiscountDisplay(voucher)}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                    {getDiscountTypeLabel(voucher.discountType)}
                </div>
            </div>

            {/* Subtle Texture/Pattern could go here if needed, but keeping it clean for now */}
        </div>
    )
}

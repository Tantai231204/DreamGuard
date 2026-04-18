import { Sparkles } from "lucide-react"
import VoucherVisualCard from "@/components/common/VoucherVisualCard"
import type { ProfileVoucher } from "./types"
import { getStatusLabel, isExpiringSoon } from "./utils"

interface VoucherCardProps {
    voucher: ProfileVoucher
    onClick?: () => void
}

export default function VoucherCard({ voucher, onClick }: VoucherCardProps) {
    const state =
        voucher.status === "claimable"
            ? "draft"
            : voucher.status === "used"
                ? "used"
                : voucher.status === "expired"
                    ? "expired"
                    : "active"
    const isActive = state === "active"

    return (
        <div
            className="group relative cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:drop-shadow-[0_12px_30px_rgba(73,136,196,0.22)]"
            onClick={onClick}
        >
            {isExpiringSoon(voucher) && isActive && (
                <div className="absolute top-3 left-3 z-30 rounded-full bg-rose-500/90 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Expiring
                </div>
            )}

            <VoucherVisualCard
                code={voucher.code}
                name={voucher.name}
                voucherType={voucher.voucherType}
                discountValue={voucher.discountValue}
                maxDiscountAmount={voucher.maxDiscountAmount}
                requiredCoin={voucher.requiredCoin}
                endDate={voucher.endDate}
                state={state}
                statusLabel={getStatusLabel(voucher.status)}
                className={!isActive ? "opacity-95" : undefined}
            />
        </div>
    )
}

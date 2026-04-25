import { Sparkles } from "lucide-react"
import VoucherVisualCard from "@/components/common/VoucherVisualCard"
import { cn } from "@/lib/utils"
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
    const isExpiring = isExpiringSoon(voucher) && isActive

    return (
        <div
            className={cn(
                "group relative cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:drop-shadow-[0_12px_30px_rgba(73,136,196,0.22)]",
                isExpiring && "ring-2 ring-rose-400/40 rounded-2xl"
            )}
            onClick={onClick}
        >
            {isExpiring && (
                <div className="absolute top-3 left-3 z-30 rounded-full bg-rose-600 shadow-lg shadow-rose-900/10 text-white text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 flex items-center gap-1.5 animate-in slide-in-from-top-1 duration-500">
                    <Sparkles className="h-3 w-3" />
                    Expiring Soon
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
                className={cn(!isActive && "opacity-95", isExpiring && "border-rose-100")}
            />
        </div>
    )
}

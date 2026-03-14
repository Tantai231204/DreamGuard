import { Calendar, Sparkles, Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Voucher } from "../../types"
import { VOUCHER_STATUS_COLORS } from "../../constants"
import VoucherBadge from "./VoucherBadge"
import VoucherCode from "./VoucherCode"
import { formatDate, formatCurrency, getStatusLabel, isExpiringSoon } from "./utils"

interface VoucherCardProps {
    voucher: Voucher
    onClick?: () => void
}

export default function VoucherCard({ voucher, onClick }: VoucherCardProps) {
    const statusColors = VOUCHER_STATUS_COLORS[voucher.status]
    const isActive = voucher.status === "active"

    return (
        <Card
            className={`group relative overflow-hidden transition-all duration-300 cursor-pointer rounded-2xl border-slate-200/60 shadow-sm hover:shadow-md ${!isActive && "opacity-60 grayscale-[0.3]"}`}
            onClick={onClick}
        >
            <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row h-full sm:min-h-[160px]">
                    {/* Left - Discount Area */}
                    <div className="relative w-full sm:w-40 flex-shrink-0">
                        <VoucherBadge voucher={voucher} />
                    </div>

                    {/* Right - Voucher Info */}
                    <div className="flex-1 p-5 flex flex-col justify-between bg-white relative">
                        <div className="relative z-10">
                            {/* Header: Title + Status */}
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{voucher.category || "General"}</h4>
                                        {isExpiringSoon(voucher) && (isActive) && (
                                            <span className="flex items-center gap-1 text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                <Sparkles className="h-2.5 w-2.5" />
                                                Expiring
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                                        {voucher.title}
                                    </h3>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className={`${statusColors.bg} ${statusColors.text} border-none font-bold uppercase tracking-wider text-[9px] px-2.5 py-0.5 rounded-lg shadow-none`}
                                >
                                    {getStatusLabel(voucher.status)}
                                </Badge>
                            </div>

                            {/* Description */}
                            <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed mb-4">
                                {voucher.description}
                            </p>

                            {/* Voucher Code */}
                            <div className="flex items-center justify-between gap-4 pt-1">
                                <VoucherCode code={voucher.code} isActive={isActive} />
                                <div className="flex items-center gap-1.5 text-slate-300 group-hover:text-primary transition-colors">
                                   <Info className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        {/* Terms & Expiry Footer */}
                        <div className="relative z-10 mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Min Spend</span>
                                <span className="text-sm font-bold text-slate-900 leading-none mt-1">
                                    {formatCurrency(voucher.minPurchase)}
                                </span>
                            </div>

                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Valid Until</span>
                                <div className="flex items-center gap-1.5 text-slate-600 mt-1">
                                    <Calendar className="h-3.5 w-3.5 text-primary" />
                                    <span className="text-[11px] font-bold">
                                        {formatDate(voucher.validTo)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

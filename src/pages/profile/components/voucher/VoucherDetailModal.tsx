import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Clock, Calendar, Coins } from "lucide-react"
import type { ProfileVoucher } from "./types"
import { VOUCHER_STATUS_COLORS } from "../../constants"
import {
    formatCoin,
    formatCurrency,
    formatDate,
    getDiscountDisplay,
    getStatusLabel,
    getDaysRemaining,
    isExpiringSoon,
    getVoucherTypeLabel,
} from "./utils"

interface VoucherDetailModalProps {
    voucher: ProfileVoucher | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onApplyToCheckout?: (voucher: ProfileVoucher) => void
}

export default function VoucherDetailModal({
    voucher,
    open,
    onOpenChange,
    onApplyToCheckout,
}: VoucherDetailModalProps) {
    const [copied, setCopied] = useState(false)

    if (!voucher) return null

    const statusColors = VOUCHER_STATUS_COLORS[voucher.status]
    const isActive = voucher.status === "active"

    const handleCopy = () => {
        navigator.clipboard.writeText(voucher.code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleApply = () => {
        handleCopy()
        onApplyToCheckout?.(voucher)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-0 gap-0 rounded-2xl border-none shadow-2xl">
                <DialogHeader className="px-6 py-5 border-b border-slate-100 flex-row items-center justify-between space-y-0">
                    <DialogTitle className="text-lg font-bold text-slate-900">
                        Voucher Details
                    </DialogTitle>
                    <Badge
                        className={`${statusColors.bg} ${statusColors.text} ${statusColors.border} border font-bold uppercase tracking-wider text-[10px] px-3 py-1 rounded-lg shadow-none`}
                    >
                        {getStatusLabel(voucher.status)}
                    </Badge>
                </DialogHeader>

                {/* Body */}
                <div className="px-6 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Title & Description */}
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">
                            {voucher.name}
                        </h3>
                        {isActive && isExpiringSoon(voucher) && (
                            <p className="flex items-center gap-1.5 text-rose-500 font-bold text-sm mb-3">
                                <Clock className="h-4 w-4" />
                                Expires in {getDaysRemaining(voucher.endDate)} days
                            </p>
                        )}
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            {voucher.description}
                        </p>
                    </div>

                    {/* Voucher Code Area */}
                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Code</p>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                <code className="text-xl font-bold text-slate-900 tracking-wider">
                                    {voucher.code}
                                </code>
                            </div>
                            <Button
                                variant="outline"
                                disabled={!isActive}
                                onClick={handleCopy}
                                className="h-[52px] px-6 border-slate-200 hover:bg-[#4988c4] hover:border-[#4988c4] hover:text-white transition-all font-bold text-sm rounded-xl"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy Code
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                                Benefits
                            </h4>
                            <div className="space-y-3 text-sm text-slate-600 font-medium">
                                <p className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#4988c4] mt-1.5 shrink-0" />
                                    <span>Discount: <strong>{getDiscountDisplay(voucher)}</strong></span>
                                </p>
                                <p className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#4988c4] mt-1.5 shrink-0" />
                                    <span>Max discount: <strong>{formatCurrency(voucher.maxDiscountAmount)}</strong></span>
                                </p>
                                {voucher.requiredCoin !== undefined && voucher.requiredCoin > 0 && (
                                    <p className="flex items-start gap-2">
                                        <Coins className="h-4 w-4 text-amber-500 shrink-0" />
                                        <span>Required coin: <strong>{formatCoin(voucher.requiredCoin)}</strong></span>
                                    </p>
                                )}
                                <p className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#4988c4] mt-1.5 shrink-0" />
                                    <span>Applicable to: <strong>{getVoucherTypeLabel(voucher.voucherType)}</strong></span>
                                </p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                                Validity
                            </h4>
                            <div className="space-y-3 text-sm text-slate-600 font-medium">
                                {voucher.startDate && (
                                    <p className="flex items-start gap-2">
                                        <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                                        <span>From: <strong>{formatDate(voucher.startDate)}</strong></span>
                                    </p>
                                )}
                                <p className="flex items-start gap-2">
                                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                                    <span>Until: <strong>{formatDate(voucher.endDate)}</strong></span>
                                </p>
                                {voucher.claimedAt && (
                                    <p className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#4988c4] mt-1.5 shrink-0" />
                                        <span>Claimed at: <strong>{formatDate(voucher.claimedAt)}</strong></span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Used Status Info */}
                    {voucher.status === "used" && voucher.usedAt && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                            <p className="text-sm text-emerald-700 font-bold flex items-center justify-center gap-2">
                                <Check className="h-4 w-4" />
                                Used on {formatDate(voucher.usedAt)}
                            </p>
                        </div>
                    )}

                    {/* Final Action Button */}
                    {isActive && (
                        <Button
                            size="lg"
                            className="w-full bg-[#4988c4] hover:bg-[#3a6fa0] h-12 text-sm font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95"
                            onClick={handleApply}
                        >
                            Apply to Checkout
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

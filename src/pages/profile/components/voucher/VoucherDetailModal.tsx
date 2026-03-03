import { useState } from "react"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Copy, Check, Clock } from "lucide-react"
import type { Voucher } from "../../types"
import { VOUCHER_STATUS_COLORS } from "../../data"
import {
    formatCurrency,
    formatDate,
    getDiscountDisplay,
    getStatusLabel,
    getDaysRemaining,
    isExpiringSoon,
} from "./utils"

interface VoucherDetailModalProps {
    voucher: Voucher | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function VoucherDetailModal({
    voucher,
    open,
    onOpenChange,
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
        // TODO: Navigate to products/checkout
        console.log("Apply voucher:", voucher.code)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-0 gap-0">
                {/* Header - Simple */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-bold text-gray-900">Chi tiết khuyến mại</h2>
                    <Badge
                        className={`${statusColors.bg} ${statusColors.text} ${statusColors.border} border font-semibold`}
                    >
                        {getStatusLabel(voucher.status)}
                    </Badge>
                </div>

                {/* Hero Image/Banner */}
                {voucher.image && (
                    <div className="relative w-full aspect-[16/9] overflow-hidden bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500">
                        <img
                            src={voucher.image}
                            alt={voucher.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Body */}
                <div className="px-6 py-6 space-y-6">
                    {/* Title & Description */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {voucher.title}
                        </h3>
                        {isActive && isExpiringSoon(voucher) && (
                            <p className="text-red-600 font-semibold text-sm mb-2">
                                Hết hạn sau {getDaysRemaining(voucher.validTo)} ngày
                            </p>
                        )}
                        <p className="text-gray-600 text-sm">
                            {voucher.description}
                        </p>
                    </div>

                    <Separator />

                    {/* Voucher Code */}
                    <div>
                        <p className="text-sm text-gray-500 mb-2">Mã voucher</p>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                                <code className="text-xl font-bold text-[#4988c4] tracking-wider">
                                    {voucher.code}
                                </code>
                            </div>
                            <Button
                                variant="outline"
                                disabled={!isActive}
                                onClick={handleCopy}
                                className="h-12 px-4 border-[#4988c4] text-[#4988c4] hover:bg-[#4988c4] hover:text-white"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Đã copy
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy mã
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* CHI TIẾT Section */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                            Chi tiết
                        </h4>

                        <div className="space-y-3 text-sm text-gray-700">
                            {/* Discount info */}
                            <p className="leading-relaxed">
                                - Ưu đãi giảm <span className="font-bold">{getDiscountDisplay(voucher)}</span>
                                {voucher.discountType === "percentage" && voucher.maxDiscount && (
                                    <>, tối đa <span className="font-bold">{formatCurrency(voucher.maxDiscount)}</span></>
                                )}
                            </p>

                            {/* Min purchase */}
                            <p className="leading-relaxed">
                                - Áp dụng cho đơn hàng từ <span className="font-bold">{formatCurrency(voucher.minPurchase)}</span>
                            </p>

                            {/* Category */}
                            {voucher.category && (
                                <p className="leading-relaxed">
                                    - Áp dụng cho: <span className="font-bold">{voucher.category}</span>
                                </p>
                            )}

                            {/* Validity */}
                            <p className="leading-relaxed">
                                - Có thể áp dụng đồng thời với các ưu đãi ăn uống, ưu đãi giao hàng khác
                            </p>

                            {/* Valid dates */}
                            <p className="leading-relaxed">
                                - Thời gian: <span className="font-bold">{formatDate(voucher.validFrom)} - {formatDate(voucher.validTo)}</span>
                            </p>

                            {/* Quantity */}
                            {voucher.quantity !== undefined && voucher.usedCount !== undefined && (
                                <p className="leading-relaxed">
                                    - Còn lại: <span className="font-bold">{voucher.quantity - voucher.usedCount}/{voucher.quantity}</span> voucher
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Terms if exists */}
                    {voucher.terms && voucher.terms.length > 0 && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                                    Điều kiện áp dụng
                                </h4>
                                <div className="space-y-2 text-sm text-gray-700">
                                    {voucher.terms.map((term, i) => (
                                        <p key={i} className="leading-relaxed">- {term}</p>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Usage instructions if exists */}
                    {voucher.usageInstructions && voucher.usageInstructions.length > 0 && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                                    Cách sử dụng
                                </h4>
                                <div className="space-y-2 text-sm text-gray-700">
                                    {voucher.usageInstructions.map((instruction, i) => (
                                        <p key={i} className="leading-relaxed">
                                            {i + 1}. {instruction}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Used info */}
                    {voucher.status === "used" && voucher.usedAt && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                            <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                                <Clock className="h-4 w-4" />
                                Đã sử dụng vào ngày {formatDate(voucher.usedAt)}
                            </p>
                        </div>
                    )}

                    {/* Action Button */}
                    {isActive && (
                        <Button
                            size="lg"
                            className="w-full bg-[#4988c4] hover:bg-[#3a6fa0] h-14 text-base font-bold"
                            onClick={handleApply}
                        >
                            Dùng ngay
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

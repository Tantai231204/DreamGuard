import { Calendar, Tag, Sparkles, Info } from "lucide-react"
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
            className={`group overflow-hidden transition-all duration-300 cursor-pointer ${isActive
                ? "border-2 border-[#4988c4]/20 hover:border-[#4988c4]/50 hover:shadow-xl hover:scale-[1.01]"
                : "border-2 border-gray-200 opacity-60"
                }`}
            onClick={onClick}
        >
            <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                    {/* Left - Discount Badge */}
                    <VoucherBadge voucher={voucher} />

                    {/* Right - Voucher Info */}
                    <div className="flex-1 p-4">
                        {/* Header: Title + Status */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-gray-900 text-base line-clamp-1 flex-1 group-hover:text-[#4988c4] transition-colors">
                                {voucher.title}
                            </h3>
                            <Badge
                                variant="outline"
                                className={`${statusColors.bg} ${statusColors.text} ${statusColors.border} border-2 font-semibold shrink-0 text-xs px-2 py-0.5`}
                            >
                                {getStatusLabel(voucher.status)}
                            </Badge>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {voucher.description}
                        </p>

                        {/* Voucher Code */}
                        <div className="mb-3">
                            <VoucherCode code={voucher.code} isActive={isActive} />
                        </div>

                        {/* Meta Info: Category + Date */}
                        <div className="flex items-center justify-between gap-2 text-sm mb-3">
                            {/* Category */}
                            {voucher.category && (
                                <div className="flex items-center gap-1.5 text-[#4988c4]">
                                    <Tag className="h-3.5 w-3.5" />
                                    <span className="font-medium text-xs">{voucher.category}</span>
                                </div>
                            )}

                            {/* Expiring Soon Badge */}
                            {isExpiringSoon(voucher) && (
                                <Badge
                                    variant="outline"
                                    className="bg-orange-50 text-orange-600 border-orange-200 text-xs px-2 py-0.5 animate-pulse"
                                >
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    Sắp hết hạn
                                </Badge>
                            )}

                            {/* Expiry Date */}
                            <div className="flex items-center gap-1 text-gray-500 ml-auto">
                                <Calendar className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium">
                                    HSD: {formatDate(voucher.validTo)}
                                </span>
                            </div>
                        </div>

                        {/* Purchase Info */}
                        <div className="pt-3 border-t border-gray-100 space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Đơn tối thiểu</span>
                                <span className="font-bold text-gray-900">
                                    {formatCurrency(voucher.minPurchase)}
                                </span>
                            </div>
                            {voucher.maxDiscount && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Giảm tối đa</span>
                                    <span className="font-bold text-[#4988c4]">
                                        {formatCurrency(voucher.maxDiscount)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Click hint */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-400 text-center group-hover:text-[#4988c4] transition-colors flex items-center justify-center gap-1">
                                <Info className="h-3 w-3" />
                                Nhấn để xem chi tiết điều kiện áp dụng
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

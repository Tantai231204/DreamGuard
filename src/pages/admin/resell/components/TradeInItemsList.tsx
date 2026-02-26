import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, ImageIcon } from "lucide-react"
import type { TradeInItem } from "../types"

interface TradeInItemsListProps {
    items: TradeInItem[]
}

const CONDITION_CONFIG = {
    excellent: { label: "Excellent", color: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
    good: { label: "Good", color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
    fair: { label: "Fair", color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
    poor: { label: "Poor", color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200" },
}

export function TradeInItemsList({ items }: TradeInItemsListProps) {
    return (
        <Card className="p-6 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-6 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
                    Trade-in Items
                </h2>
                <span className="ml-auto text-sm text-gray-500">
                    {items.length} {items.length === 1 ? "item" : "items"}
                </span>
            </div>
            <div className="space-y-4">
                {items.map((item, index) => {
                    const conditionConfig = item.condition ? CONDITION_CONFIG[item.condition] : null
                    return (
                        <motion.div
                            key={item.productId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex gap-4 p-4 rounded-xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 transition-all group"
                        >
                            {/* Product Image */}
                            <div className="relative flex-shrink-0">
                                {item.productImage ? (
                                    <img
                                        src={item.productImage}
                                        alt={item.productName}
                                        className="w-20 h-20 object-cover rounded-lg shadow-sm"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                                        <Package className="h-8 w-8 text-gray-400" />
                                    </div>
                                )}
                                {item.mediaCount > 0 && (
                                    <div className="absolute -bottom-1.5 -right-1.5 min-w-[24px] h-6 px-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-full flex items-center justify-center gap-0.5 shadow-sm">
                                        <ImageIcon className="h-3 w-3" />
                                        {item.mediaCount}
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate group-hover:text-[var(--color-primary)] transition-colors">
                                    {item.productName}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                    {conditionConfig && (
                                        <Badge
                                            variant="outline"
                                            className={`${conditionConfig.bgColor} ${conditionConfig.color} ${conditionConfig.borderColor} text-xs px-2 py-0.5`}
                                        >
                                            {conditionConfig.label}
                                        </Badge>
                                    )}
                                </div>
                                {item.note && (
                                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                        {item.note}
                                    </p>
                                )}
                            </div>

                            {/* Pricing */}
                            <div className="text-right flex-shrink-0 space-y-1">
                                <div className="text-xs text-gray-500">Original</div>
                                <div className="text-sm font-medium text-gray-600">
                                    {item.originalPrice.toLocaleString("vi-VN")}₫
                                </div>
                                <div className="text-xs text-gray-500 mt-2">Estimated</div>
                                {item.estimatedPrice > 0 ? (
                                    <div className="text-base font-bold text-emerald-600">
                                        {item.estimatedPrice.toLocaleString("vi-VN")}₫
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-400 italic">Not priced</div>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </Card>
    )
}

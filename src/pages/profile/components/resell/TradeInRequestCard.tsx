import { memo, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "../../../../components/ui/card"
import { Badge } from "../../../../components/ui/badge"
import { formatPrice, formatDate } from "../../utils"
import { STATUS_CONFIG } from "./constants"
import type { TradeInRequest } from "./types"
import { Package, ImageIcon } from "lucide-react"

interface TradeInRequestCardProps {
    request: TradeInRequest
    index?: number
}

function TradeInRequestCard({ request, index = 0 }: TradeInRequestCardProps) {
    const statusConfig = STATUS_CONFIG[request.status]
    
    // Memoize calculations
    const { totalEstimated, totalMediaCount, itemCount, firstItem, productNames } = useMemo(() => ({
        totalEstimated: request.items.reduce((sum, item) => sum + item.estimatedPrice, 0),
        totalMediaCount: request.items.reduce((sum, item) => sum + item.mediaCount, 0),
        itemCount: request.items.length,
        firstItem: request.items[0],
        productNames: request.items.map(i => i.productName).join(", "),
    }), [request.items])

    return (
        <motion.article
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
            whileHover={{ scale: 1.005 }}
            role="listitem"
            aria-label={`Yêu cầu thu mua ${itemCount} sản phẩm - ${statusConfig.label}`}
        >
            <Card 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4" 
                style={{ borderLeftColor: statusConfig.borderColor || '#e5e7eb' }}
                tabIndex={0}
            >
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        {/* Thumbnail */}
                        <div className="relative flex-shrink-0">
                            {firstItem ? (
                                <img
                                    src={firstItem.productImage}
                                    alt=""
                                    className="w-16 h-16 rounded-lg object-cover bg-gray-100 shadow-sm"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <Package className="h-8 w-8 text-gray-400" aria-hidden="true" />
                                </div>
                            )}
                            {itemCount > 1 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                                    className="absolute -top-2 -right-2 bg-gradient-to-r from-[#4988c4] to-[#3a73a8] text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-md"
                                    aria-label={`và ${itemCount - 1} sản phẩm khác`}
                                >
                                    +{itemCount - 1}
                                </motion.span>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="font-medium text-gray-900 truncate">
                                    {itemCount === 1 
                                        ? firstItem?.productName 
                                        : `${itemCount} sản phẩm`}
                                </h4>
                                <Badge className={statusConfig.color}>
                                    <span aria-hidden="true">{statusConfig.icon}</span>
                                    <span className="ml-1">{statusConfig.label}</span>
                                </Badge>
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span>{totalMediaCount} ảnh/video</span>
                                </span>
                                <span aria-hidden="true">•</span>
                                <time dateTime={request.createdAt}>{formatDate(request.createdAt)}</time>
                            </div>
                            
                            {/* Show all product names if multiple */}
                            {itemCount > 1 && (
                                <p className="text-xs text-gray-400 mt-1 truncate" title={productNames}>
                                    {productNames}
                                </p>
                            )}
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                            <motion.p
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-xl font-bold text-[#4988c4] tabular-nums"
                            >
                                {totalEstimated > 0 ? formatPrice(totalEstimated) : "Đang định giá"}
                            </motion.p>
                            <p className="text-xs text-gray-500">
                                {totalEstimated > 0 ? "Giá thu mua" : "Chờ nhân viên đánh giá"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.article>
    )
}

export default memo(TradeInRequestCard)

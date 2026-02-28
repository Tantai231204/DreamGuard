import { memo, useMemo, useCallback } from "react"
import { Check, AlertCircle, CheckSquare, Square } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "../../../../../components/ui/badge"
import { Button } from "../../../../../components/ui/button"
import { formatPrice, formatDate } from "../../../utils"
import type { EligibleProduct } from "../types"

interface ProductSelectionProps {
    products: EligibleProduct[]
    selectedProducts: EligibleProduct[]
    onToggleProduct: (product: EligibleProduct) => void
    onSelectAll: () => void
    onDeselectAll: () => void
}

// Memoized product item for better performance
const ProductItem = memo(function ProductItem({
    product,
    isSelected,
    onToggle,
    index,
}: {
    product: EligibleProduct
    isSelected: boolean
    onToggle: () => void
    index: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
        >
            <div
                role="checkbox"
                aria-checked={isSelected}
                aria-disabled={!product.canTradeIn}
                tabIndex={product.canTradeIn ? 0 : -1}
                onClick={product.canTradeIn ? onToggle : undefined}
                onKeyDown={(e) => {
                    if (product.canTradeIn && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault()
                        onToggle()
                    }
                }}
                className={`flex items-center gap-4 p-4 border rounded-xl transition-all duration-200 ${
                    product.canTradeIn
                        ? isSelected
                            ? "border-[#4988c4] bg-[#f0f9ff] cursor-pointer ring-2 ring-[#4988c4]/20"
                            : "hover:border-gray-300 hover:bg-gray-50/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4988c4]/40"
                        : "opacity-60 cursor-not-allowed bg-gray-50"
                }`}
            >
                {/* Checkbox */}
                <motion.div 
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${
                        isSelected
                            ? "border-[#4988c4] bg-[#4988c4]"
                            : product.canTradeIn 
                                ? "border-gray-300 group-hover:border-gray-400"
                                : "border-gray-200 bg-gray-100"
                    }`}
                    whileTap={product.canTradeIn ? { scale: 0.9 } : undefined}
                >
                    <AnimatePresence>
                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <Check className="h-4 w-4 text-white" aria-hidden="true" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Product Image */}
                <img
                    src={product.image}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                    loading="lazy"
                />

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">Mua: {formatDate(product.purchaseDate)}</p>
                    <p className="text-sm font-semibold text-[#4988c4]">{formatPrice(product.originalPrice)}</p>
                </div>

                {/* Not eligible reason */}
                {!product.canTradeIn && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                        <AlertCircle className="h-3 w-3" aria-hidden="true" />
                        <span className="max-w-[150px] truncate">{product.reason}</span>
                    </div>
                )}
            </div>
        </motion.div>
    )
})

function ProductSelection({ 
    products, 
    selectedProducts, 
    onToggleProduct,
    onSelectAll,
    onDeselectAll 
}: ProductSelectionProps) {
    const eligibleProducts = useMemo(() => products.filter(p => p.canTradeIn), [products])
    const allSelected = eligibleProducts.length > 0 && selectedProducts.length === eligibleProducts.length

    // Memoize total value calculation
    const totalValue = useMemo(() => 
        selectedProducts.reduce((sum, p) => sum + p.originalPrice, 0),
    [selectedProducts])

    // Memoize selection check
    const selectedIds = useMemo(() => new Set(selectedProducts.map(p => p.id)), [selectedProducts])

    // Memoized toggle handler
    const createToggleHandler = useCallback((product: EligibleProduct) => {
        return () => onToggleProduct(product)
    }, [onToggleProduct])

    return (
        <div className="space-y-4" role="group" aria-label="Chọn sản phẩm muốn bán lại">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Chọn sản phẩm muốn bán lại</h3>
                    <p className="text-sm text-gray-500">Có thể chọn nhiều sản phẩm cùng lúc</p>
                </div>
                <div className="flex items-center gap-2">
                    <AnimatePresence>
                        {selectedProducts.length > 0 && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                            >
                                <Badge className="bg-[#4988c4] text-white">
                                    Đã chọn: {selectedProducts.length}
                                </Badge>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={allSelected ? onDeselectAll : onSelectAll}
                        className="text-xs"
                        aria-label={allSelected ? "Bỏ chọn tất cả sản phẩm" : "Chọn tất cả sản phẩm"}
                    >
                        {allSelected ? (
                            <>
                                <Square className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                                Bỏ chọn tất cả
                            </>
                        ) : (
                            <>
                                <CheckSquare className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                                Chọn tất cả
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div 
                className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                role="listbox"
                aria-multiselectable="true"
            >
                {products.map((product, index) => (
                    <ProductItem
                        key={product.id}
                        product={product}
                        isSelected={selectedIds.has(product.id)}
                        onToggle={createToggleHandler(product)}
                        index={index}
                    />
                ))}
            </div>

            {/* Summary */}
            <AnimatePresence>
                {selectedProducts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="bg-[#f0f9ff] border border-[#4988c4]/20 rounded-xl p-4"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Tổng giá trị gốc:</span>
                            <span className="text-lg font-bold text-[#4988c4] tabular-nums">
                                {formatPrice(totalValue)}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            * Giá thu mua thực tế sẽ được nhân viên đánh giá dựa trên hình ảnh/video
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default memo(ProductSelection)

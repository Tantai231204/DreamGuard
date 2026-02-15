import { useState, useCallback, useMemo, memo } from "react"
import { Info, ChevronDown, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "../../../../../components/ui/card"
import { Badge } from "../../../../../components/ui/badge"
import { Progress } from "../../../../../components/ui/progress"
import { formatPrice } from "../../../utils"
import MediaUploadZone from "../MediaUploadZone"
import type { EligibleProduct, MediaFile, SelectedProductWithMedia } from "../types"

interface MediaUploadProps {
    selectedProducts: EligibleProduct[]
    productsWithMedia: SelectedProductWithMedia[]
    onUpdateProductMedia: (productId: string, media: MediaFile[], note: string) => void
}

export default memo(function MediaUpload({ 
    selectedProducts, 
    productsWithMedia,
    onUpdateProductMedia 
}: MediaUploadProps) {
    const [expandedProduct, setExpandedProduct] = useState<string | null>(selectedProducts[0]?.id || null)

    const handleUpdateMedia = useCallback((productId: string, media: MediaFile[]) => {
        const currentProduct = productsWithMedia.find(p => p.product.id === productId)
        onUpdateProductMedia(productId, media, currentProduct?.note || "")
    }, [productsWithMedia, onUpdateProductMedia])

    const handleNoteChange = useCallback((productId: string, note: string) => {
        const currentProduct = productsWithMedia.find(p => p.product.id === productId)
        onUpdateProductMedia(productId, currentProduct?.media || [], note)
    }, [productsWithMedia, onUpdateProductMedia])

    const handleToggleExpand = useCallback((productId: string) => {
        setExpandedProduct(prev => prev === productId ? null : productId)
    }, [])

    // Memoize progress calculation
    const { productsWithMedia_count, progress } = useMemo(() => {
        const count = productsWithMedia.filter(p => p.media.length > 0).length
        return {
            productsWithMedia_count: count,
            progress: (count / selectedProducts.length) * 100
        }
    }, [productsWithMedia, selectedProducts.length])

    return (
        <div className="space-y-4">
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Tải hình ảnh & video sản phẩm</h3>
                        <p className="text-sm text-gray-500">
                            Chụp ảnh/quay video để nhân viên đánh giá tình trạng và định giá chính xác
                        </p>
                    </div>
                    <Badge className="bg-[#4988c4] text-white">
                        {productsWithMedia_count}/{selectedProducts.length} hoàn thành
                    </Badge>
                </div>
                
                {/* Overall Progress */}
                <div className="mt-3">
                    <Progress value={progress} className="h-2" />
                </div>
            </div>

            {/* Instructions */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex gap-3">
                            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-gray-900 mb-2">Hướng dẫn chụp ảnh/quay video:</p>
                                <ul className="space-y-1 text-gray-600">
                                    <li>• Chụp tổng thể sản phẩm từ nhiều góc độ</li>
                                    <li>• Chụp cận cảnh các chi tiết, tem mác, nhãn hiệu</li>
                                    <li>• Ghi hình các vết bẩn, hư hỏng (nếu có)</li>
                                    <li>• Video ngắn 10-30s giúp đánh giá tốt hơn</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Product list with media upload */}
            <div className="space-y-3">
                <AnimatePresence>
                    {selectedProducts.map((product, index) => {
                        const productMedia = productsWithMedia.find(p => p.product.id === product.id)
                        const media = productMedia?.media || []
                        const note = productMedia?.note || ""
                        const isExpanded = expandedProduct === product.id
                        const hasMedia = media.length > 0

                        return (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className={`overflow-hidden transition-all ${hasMedia ? "border-green-300 shadow-sm" : ""}`}>
                                    {/* Product Header - Collapsible */}
                                    <div 
                                        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => handleToggleExpand(product.id)}
                                        role="button"
                                        aria-expanded={isExpanded}
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault()
                                                handleToggleExpand(product.id)
                                            }
                                        }}
                                    >
                                        <img 
                                            src={product.image} 
                                            alt={product.name} 
                                            className="w-14 h-14 rounded-lg object-cover bg-gray-100 flex-shrink-0" 
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{product.name}</p>
                                            <p className="text-sm text-[#4988c4] font-semibold">{formatPrice(product.originalPrice)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {hasMedia ? (
                                                <Badge className="bg-green-100 text-green-700 border-green-300">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    {media.length} file
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-gray-500">
                                                    Chưa có file
                                                </Badge>
                                            )}
                                            <motion.div
                                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronDown className="h-5 w-5 text-gray-400" />
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Expandable Content */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <CardContent className="pt-0 pb-4 px-4 border-t">
                                                    <div className="mt-4 space-y-4">
                                                        {/* Media Upload Zone */}
                                                        <MediaUploadZone
                                                            media={media}
                                                            onMediaChange={(newMedia) => handleUpdateMedia(product.id, newMedia)}
                                                            maxFiles={10}
                                                        />

                                                        {/* Note */}
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                                                Ghi chú về tình trạng (tùy chọn)
                                                            </label>
                                                            <textarea
                                                                value={note}
                                                                onChange={(e) => handleNoteChange(product.id, e.target.value)}
                                                                placeholder="Ví dụ: Còn mới 95%, hộp nguyên seal, có vài vết xước nhỏ..."
                                                                className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4988c4]/20 focus:border-[#4988c4] resize-none transition-all"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {/* Summary */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700">
                                <strong>Lưu ý:</strong> Nhân viên sẽ xem xét hình ảnh/video và báo giá thu mua trong vòng 24 giờ. 
                                Giá thu mua phụ thuộc vào tình trạng thực tế của sản phẩm.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
})

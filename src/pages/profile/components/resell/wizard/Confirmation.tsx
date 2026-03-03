import { Image, Film, Package } from "lucide-react"
import { Card, CardContent } from "../../../../../components/ui/card"
import { Badge } from "../../../../../components/ui/badge"
import { formatPrice } from "../../../utils"
import type { SelectedProductWithMedia } from "../types"

interface ConfirmationProps {
    productsWithMedia: SelectedProductWithMedia[]
    agreedTerms: boolean
    onToggleTerms: (agreed: boolean) => void
}

export default function Confirmation({ productsWithMedia, agreedTerms, onToggleTerms }: ConfirmationProps) {
    const totalOriginalPrice = productsWithMedia.reduce((sum, p) => sum + p.product.originalPrice, 0)
    const totalImages = productsWithMedia.reduce((sum, p) => sum + p.media.filter(m => m.type === "image").length, 0)
    const totalVideos = productsWithMedia.reduce((sum, p) => sum + p.media.filter(m => m.type === "video").length, 0)

    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-semibold text-gray-900 mb-1">Xác nhận yêu cầu</h3>
                <p className="text-sm text-gray-500">Kiểm tra thông tin và gửi yêu cầu bán lại</p>
            </div>

            {/* Products Summary Card */}
            <Card className="border-2 border-[#4988c4]/30">
                <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-[#4988c4]" />
                            <span className="font-semibold text-gray-900">
                                {productsWithMedia.length} sản phẩm
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {totalImages > 0 && (
                                <Badge variant="outline" className="text-xs">
                                    <Image className="h-3 w-3 mr-1" />
                                    {totalImages} ảnh
                                </Badge>
                            )}
                            {totalVideos > 0 && (
                                <Badge variant="outline" className="text-xs">
                                    <Film className="h-3 w-3 mr-1" />
                                    {totalVideos} video
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Product List */}
                    <div className="space-y-3 max-h-[250px] overflow-y-auto">
                        {productsWithMedia.map(({ product, media, note }) => (
                            <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0" 
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate text-sm">{product.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm font-semibold text-[#4988c4]">
                                            {formatPrice(product.originalPrice)}
                                        </span>
                                        {media.length > 0 && (
                                            <Badge className="bg-green-100 text-green-700 text-[10px]">
                                                {media.length} file
                                            </Badge>
                                        )}
                                    </div>
                                    {note && (
                                        <p className="text-xs text-gray-500 mt-1 truncate">
                                            Ghi chú: {note}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-baseline">
                            <span className="text-gray-500">Tổng giá trị gốc:</span>
                            <span className="text-2xl font-bold text-[#4988c4]">
                                {formatPrice(totalOriginalPrice)}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-right">
                            * Giá thu mua sẽ được nhân viên báo sau khi xem xét
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Process Info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <p className="font-medium text-gray-900">Quy trình tiếp theo:</p>
                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#4988c4] text-white flex items-center justify-center text-xs font-semibold">1</div>
                        <span>Nhân viên xem xét hình ảnh/video và <strong>báo giá trong 24 giờ</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#4988c4] text-white flex items-center justify-center text-xs font-semibold">2</div>
                        <span>Bạn xác nhận đồng ý với giá thu mua</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#4988c4] text-white flex items-center justify-center text-xs font-semibold">3</div>
                        <span>Shipper đến <strong>lấy hàng miễn phí</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#4988c4] text-white flex items-center justify-center text-xs font-semibold">4</div>
                        <span>Kiểm tra thực tế và <strong>thanh toán trong 24h</strong></span>
                    </div>
                </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer p-3 border rounded-xl hover:bg-gray-50 transition-colors">
                <input 
                    type="checkbox" 
                    checked={agreedTerms}
                    onChange={(e) => onToggleTerms(e.target.checked)}
                    className="mt-0.5 h-5 w-5 text-[#4988c4] rounded border-gray-300 focus:ring-[#4988c4]" 
                />
                <span className="text-sm text-gray-600">
                    Tôi xác nhận thông tin sản phẩm là chính xác và đồng ý với{" "}
                    <a href="#" className="text-[#4988c4] hover:underline font-medium">điều khoản thu mua</a>
                    {" "}của DreamGuard
                </span>
            </label>
        </div>
    )
}

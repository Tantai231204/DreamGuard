import { HeartFilledIcon } from "@radix-ui/react-icons"
import { ShoppingCart, Heart, Trash2, Share2 } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Card, CardContent } from "../../../components/ui/card"
import { mockWishlist } from "../data"
import { formatPrice } from "../utils"

export default function WishlistTab() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Sản phẩm yêu thích</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {mockWishlist.length} sản phẩm trong danh sách
                    </p>
                </div>
                {mockWishlist.length > 0 && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-2" />
                            Chia sẻ
                        </Button>
                        <Button size="sm">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Thêm tất cả vào giỏ
                        </Button>
                    </div>
                )}
            </div>

            {/* Wishlist Grid */}
            {mockWishlist.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {mockWishlist.map((item) => (
                        <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                            {/* Product Image */}
                            <div className="relative aspect-square bg-gray-100">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />

                                {/* Badges */}
                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                    {item.discount && (
                                        <Badge variant="danger" className="shadow-sm">
                                            -{item.discount}%
                                        </Badge>
                                    )}
                                    {!item.inStock && (
                                        <Badge variant="secondary" className="shadow-sm">
                                            Hết hàng
                                        </Badge>
                                    )}
                                </div>

                                {/* Remove Button */}
                                <button className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all shadow-sm">
                                    <Trash2 className="h-4 w-4" />
                                </button>

                                {/* Heart Icon */}
                                <div className="absolute bottom-3 right-3">
                                    <div className="p-2 rounded-full bg-[#4988c4]/10 text-[#4988c4]">
                                        <HeartFilledIcon className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>

                            <CardContent className="p-4">
                                {/* Product Info */}
                                <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[2.5rem] group-hover:text-[#4988c4] transition-colors">
                                    {item.name}
                                </h3>

                                {/* Price */}
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-lg font-semibold text-[#4988c4]">
                                        {formatPrice(item.price)}
                                    </span>
                                    {item.originalPrice && (
                                        <span className="text-sm text-gray-400 line-through">
                                            {formatPrice(item.originalPrice)}
                                        </span>
                                    )}
                                </div>

                                {/* Added Date */}
                                <p className="mt-2 text-xs text-gray-400">
                                    Đã thêm: {new Date(item.addedAt).toLocaleDateString("vi-VN")}
                                </p>

                                {/* Actions */}
                                <div className="mt-4 flex gap-2">
                                    <Button
                                        className="flex-1"
                                        size="sm"
                                        disabled={!item.inStock}
                                    >
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        {item.inStock ? "Thêm vào giỏ" : "Hết hàng"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <Card>
                    <CardContent className="py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
                            <Heart className="h-8 w-8 text-pink-400" />
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">Chưa có sản phẩm yêu thích</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Hãy khám phá và thêm sản phẩm vào danh sách yêu thích
                        </p>
                        <Button>Khám phá ngay</Button>
                    </CardContent>
                </Card>
            )}

            {/* Recently Viewed */}
            {mockWishlist.length > 0 && (
                <Card>
                    <CardContent className="p-5">
                        <h3 className="font-semibold text-gray-900 mb-4">Có thể bạn cũng thích</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="group cursor-pointer">
                                    <div className="aspect-square rounded-lg bg-gray-100 overflow-hidden mb-2">
                                        <img
                                            src={`/images/product-${i}.jpg`}
                                            alt={`Product ${i}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#4988c4] transition-colors">
                                        Sản phẩm gợi ý {i}
                                    </p>
                                    <p className="text-sm font-semibold text-[#4988c4]">299.000đ</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

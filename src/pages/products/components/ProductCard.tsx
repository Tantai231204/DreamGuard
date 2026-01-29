import type { FC } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart } from 'lucide-react'
import type { Product } from '../types'
import { cn } from '@/lib/utils'

interface ProductCardProps {
    product: Product
    onAddToCart?: (productId: string) => void
    onToggleWishlist?: (productId: string) => void
    isInWishlist?: boolean
}


export const ProductCard: FC<ProductCardProps> = ({
    product,
    onToggleWishlist,
    isInWishlist = false,
}) => {
    return (
        <Card className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
            {/* Badges */}
            <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
                {product.isNew && (
                    <Badge className="rounded-full bg-sky-400 px-2 py-0.5 text-[10px] font-semibold text-white">
                        1–3 YOs
                    </Badge>
                )}

                {product.discount && (
                    <Badge className="rounded-full bg-orange-400 px-2 py-0.5 text-[10px] font-semibold text-white">
                        SALE
                    </Badge>
                )}
            </div>

            {/* Wishlist */}
            <button
                onClick={() => onToggleWishlist?.(product.id)}
                className="absolute right-2 top-2 z-10 rounded-full bg-white p-1.5 shadow-sm transition hover:scale-110"
            >
                <Heart
                    className={cn(
                        'h-4 w-4',
                        isInWishlist
                            ? 'fill-pink-500 text-pink-500'
                            : 'text-sky-400'
                    )}
                />
            </button>

            {/* Image */}
            <div className="aspect-square bg-gray-50">
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                        e.currentTarget.src =
                            'https://via.placeholder.com/300x300?text=Product'
                    }}
                />
            </div>

            {/* Info */}
            <div className="space-y-1.5 p-3">
                <h3 className="line-clamp-2 text-xs font-medium text-gray-800">
                    {product.name}
                </h3>

                <p className="text-base font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, index) => (
                        <svg
                            key={index}
                            className={cn(
                                'h-3.5 w-3.5',
                                index < Math.round(product.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-gray-200 text-gray-200'
                            )}
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    ))}
                </div>
            </div>
        </Card>
    )
}

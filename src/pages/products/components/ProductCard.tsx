import type { FC } from 'react'
import { Link } from 'react-router-dom'
import {
    Star,
    Sparkles,
    Flame,
    Tag,
    ShoppingCart
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Product } from '../types'
import { cn } from '@/lib/utils'

interface ProductCardProps {
    product: Product
    onAddToCart?: (productId: string) => void
}

export const ProductCard: FC<ProductCardProps> = ({
    product,
    onAddToCart,
}) => {
    const formatPrice = (price: number) => `$${price.toFixed(2)}`

    return (
        <Link to={`/products/${product.slug || product.id}`}>
            <Card className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-gray-200)] bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:border-[var(--color-primary)]/30 hover:shadow-[var(--shadow-card-hover)]">
                {/* Image */}
                <div className="relative p-3">
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-[var(--color-gray-50)]">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                                e.currentTarget.src =
                                    'https://via.placeholder.com/400x400?text=Product'
                            }}
                        />

                    {/* Badges */}
                    <div className="absolute left-2 top-2 flex flex-col gap-1.5">
                        {product.isNew && (
                            <Badge className="gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 shadow-sm">
                                <Sparkles className="h-3 w-3" />
                                New
                            </Badge>
                        )}
                        {product.discount && (
                            <Badge className="gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600 shadow-sm">
                                <Tag className="h-3 w-3" />
                                -{product.discount}%
                            </Badge>
                        )}
                        {product.isBestSeller && (
                            <Badge className="gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-600 shadow-sm">
                                <Flame className="h-3 w-3" />
                                Best
                            </Badge>
                        )}
                    </div>

                    {/* Hover action */}
                    <div className="absolute inset-x-3 bottom-3 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <Button
                            size="sm"
                            className="w-full gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-[var(--color-primary-hover)] hover:shadow-lg active:scale-[0.98]"
                            onClick={() => onAddToCart?.(product.id)}
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Add to cart
                        </Button>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col px-4 pb-4">
                <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-[var(--color-gray-800)] transition-colors group-hover:text-[var(--color-primary-dark)]">
                    {product.name}
                </h3>

                {/* Meta */}
                <div className="mt-1.5 flex items-center gap-2 text-xs text-[var(--color-gray-500)]">
                    <span className="font-medium text-[var(--color-gray-600)]">{product.material || 'Cotton'}</span>
                    <span className="text-[var(--color-gray-300)]">•</span>
                    <span className="font-medium text-[var(--color-gray-600)]">{product.ageRange || '0–12M'}</span>
                </div>

                {/* Rating */}
                <div className="mt-2.5 flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={cn(
                                    'h-4 w-4',
                                    i < Math.round(product.rating)
                                        ? 'fill-[var(--color-amber)] text-[var(--color-amber)]'
                                        : 'fill-[var(--color-gray-200)] text-[var(--color-gray-200)]'
                                )}
                                strokeWidth={1.5}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-[var(--color-gray-400)]">
                        ({product.reviewCount})
                    </span>
                </div>

                {/* Price */}
                <div className="mt-auto flex items-baseline gap-2 pt-3">
                    <span className="text-xl font-bold text-[var(--color-gray-900)]">
                        {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                        <span className="text-sm text-[var(--color-gray-400)] line-through">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                </div>

                {/* Promo */}
                {product.isBestSeller && (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50/80 px-3 py-2 text-xs font-medium text-rose-600 shadow-sm">
                        <span className="text-sm">🎁</span>
                        Free gift included
                    </div>
                )}
            </div>
        </Card>
        </Link>
    )
}

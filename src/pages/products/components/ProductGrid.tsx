import type { FC } from 'react'
import type { Product } from '../types'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
    products: Product[]
    isLoading?: boolean
    onAddToCart?: (productId: string) => void
    onToggleWishlist?: (productId: string) => void
    wishlistItems?: string[]
}

export const ProductGrid: FC<ProductGridProps> = ({
    products,
    isLoading = false,
    onAddToCart,
    onToggleWishlist,
    wishlistItems = [],
}) => {
    /* ================= Loading ================= */
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[...Array(8)].map((_, index) => (
                    <div
                        key={index}
                        className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white"
                    >
                        <div className="aspect-square bg-gray-200" />
                        <div className="space-y-2 p-3">
                            <div className="h-3 rounded bg-gray-200" />
                            <div className="h-3 w-2/3 rounded bg-gray-200" />
                            <div className="h-3 w-1/2 rounded bg-gray-200" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    /* ================= Empty ================= */
    if (products.length === 0) {
        return (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed bg-gray-50 text-center">
                <svg
                    className="mb-4 h-14 w-14 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5"
                    />
                </svg>
                <h3 className="mb-1 text-base font-semibold text-gray-900">
                    No products found
                </h3>
                <p className="text-sm text-gray-500">
                    Try adjusting your filters or search
                </p>
            </div>
        )
    }

    /* ================= Grid ================= */
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                    isInWishlist={wishlistItems.includes(product.id)}
                />
            ))}
        </div>
    )
}

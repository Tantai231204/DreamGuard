import { Star } from 'lucide-react'
import * as AspectRatio from '@radix-ui/react-aspect-ratio'
import type { Product } from './productData'

interface Props {
    product: Product
}

export default function ProductCard({ product }: Props) {
    return (
        <div
            className="
                group relative
                rounded-xl overflow-hidden
                bg-white
                shadow-sm hover:shadow-md
                transition
            "
        >
            {/* Discount */}
            {product.discount && (
                <span
                    className="
                        absolute top-2 left-2 z-10
                        bg-[var(--color-product-discount)]
                        text-white text-[10px] font-semibold
                        px-2 py-0.5 rounded-full
                    "
                >
                    -{product.discount}%
                </span>
            )}

            {/* Image */}
            <AspectRatio.Root ratio={1} className="relative bg-gray-100">
                <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="
                        h-full w-full object-cover
                        transition-transform duration-500
                        group-hover:scale-105
                    "
                />

                {/* FULL WIDTH Add to cart */}
                <button
                    className="
                        absolute left-3 right-3 bottom-3
                        py-2.5
                        text-xs font-semibold uppercase
                        text-black
                        rounded-full
                        bg-[var(--color-product-tab-active)]
                        shadow-lg

                        opacity-0 translate-y-2
                        group-hover:opacity-100 group-hover:translate-y-0
                        transition-all duration-300
                    "
                >
                    Add to cart
                </button>
            </AspectRatio.Root>

            {/* Info */}
            <div className="px-3 py-2.5 space-y-1">
                <h3 className="text-sm font-semibold truncate text-black">
                    {product.name}
                </h3>

                <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-black">
                        ${product.price.toFixed(2)}
                    </span>

                    {product.rating && (
                        <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`
                                        w-3 h-3
                                        ${i < product.rating!
                                            ? 'fill-[var(--color-product-rating)] text-[var(--color-product-rating)]'
                                            : 'text-gray-300'
                                        }
                                    `}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

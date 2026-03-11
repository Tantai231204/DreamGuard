import type { FC } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, Plus } from "lucide-react"

import type { Product } from "../types"
import { getProductDetailRoute } from "@/lib/constants"

interface ProductCardProps {
    product: Product
}

const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price)

export const ProductCard: FC<ProductCardProps> = ({ product }) => {
    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const discountPercent = product.discount
        ? product.discount
        : product.originalPrice && product.originalPrice > product.price
            ? Math.round((1 - product.price / product.originalPrice) * 100)
            : null

    const ratingValue = product.rating || 4.8
    const reviewCount = product.reviewCount || 0

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="group"
        >
            <Link to={getProductDetailRoute(product.slug)}>
                <div className="flex flex-col">

                    {/* IMAGE SECTION */}
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] bg-slate-50 border border-slate-100/50">
                        <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                            onError={(e) => {
                                e.currentTarget.src = "/images/placeholder-product.svg"
                            }}
                        />

                        {/* Badges */}
                        <div className="absolute left-4 top-4 flex flex-col gap-1.5 z-10">
                            {discountPercent && discountPercent > 0 && (
                                <Badge className="bg-rose-500 text-white border-0 px-3 py-1 text-[10px] font-bold rounded-full tracking-widest uppercase shadow-sm">
                                    -{discountPercent}%
                                </Badge>
                            )}
                            {product.isNew && !discountPercent && (
                                <Badge className="bg-slate-900 text-white border-0 px-3 py-1 text-[10px] font-bold rounded-full tracking-widest uppercase shadow-sm">
                                    New
                                </Badge>
                            )}
                        </div>

                        {/* Wishlist */}
                        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-400 z-10">
                            <button
                                onClick={handleLike}
                                className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-400 shadow-xl hover:text-rose-500 hover:bg-white transition-all"
                            >
                                <Heart className="h-4.5 w-4.5" />
                            </button>
                        </div>

                        {/* Out of Stock Overlay */}
                        {!product.inStock && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                                <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm tracking-wider uppercase">
                                    Out of Stock
                                </span>
                            </div>
                        )}
                    </div>

                    {/* CONTENT SECTION */}
                    <div className="pt-5 px-3 flex flex-col flex-1">
                        
                        {/* Rating & Secondary Info */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                                <span className="flex items-center gap-0.5 text-[12px] font-bold text-slate-900">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" strokeWidth={0} />
                                    {ratingValue.toFixed(1)}
                                </span>
                                {reviewCount > 0 && (
                                    <span className="text-[11px] text-slate-400 font-medium">
                                        ({reviewCount >= 1000 ? `${(reviewCount / 1000).toFixed(1)}k` : reviewCount})
                                    </span>
                                )}
                            </div>
                            
                            {product.ageRange && (
                                <div className="px-2.5 py-0.5 rounded-full bg-[#4988c4]/5 border border-[#4988c4]/10">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#4988c4]">
                                        {product.ageRange}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Name */}
                        <h3 className="text-[17px] font-bold text-slate-800 line-clamp-1 group-hover:text-slate-950 transition-colors leading-snug mb-4">
                            {product.name}
                        </h3>

                        {/* Price & Action */}
                        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[22px] font-black text-slate-900 tracking-tighter leading-none">
                                    {formatPrice(product.price)}
                                </span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="text-[11px] text-slate-400 line-through mt-1.5 font-medium">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                )}
                            </div>

                            <div className="h-9 w-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all duration-500">
                                <Plus className="w-4 h-4" strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>

                </div>
            </Link>
        </motion.div>
    )
}

ProductCard.displayName = "ProductCard"
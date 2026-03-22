import type { FC } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, Plus } from "lucide-react"

import type { Product } from "../types"
import { getProductDetailRoute } from "@/lib/constants"
import { useFavoriteProducts, useAddFavorite, useDeleteFavorite } from "@/hooks/useFavorite"
import { cn } from "@/lib/utils"

interface ProductCardProps {
    product: Product
}



export const ProductCard: FC<ProductCardProps> = ({ product }) => {
    const { data: favorites } = useFavoriteProducts()
    const addFavorite = useAddFavorite()
    const deleteFavorite = useDeleteFavorite()

    const isLiked = favorites?.items?.some(f => String(f.productId) === String(product.id))

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (isLiked) {
            deleteFavorite.mutate(String(product.id))
        } else {
            addFavorite.mutate(String(product.id))
        }
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
                                <Badge className="bg-indigo-600 text-white border-0 px-3 py-1 text-[10px] font-bold rounded-full tracking-widest uppercase shadow-sm">
                                    New Arrival
                                </Badge>
                            )}
                        </div>

                        {/* Wishlist */}
                        <div className={cn(
                            "absolute right-4 top-4 transition-all duration-400 z-10",
                            isLiked 
                                ? "opacity-100 translate-x-0" 
                                : "opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                        )}>
                            <button
                                onClick={handleLike}
                                className={cn(
                                    "h-9 w-9 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center transition-all border border-slate-100 shadow-xl",
                                    isLiked 
                                        ? "text-rose-500 bg-white" 
                                        : "text-slate-400 hover:text-rose-500 hover:bg-white"
                                )}
                                aria-pressed={isLiked}
                                aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
                            >
                                <Heart
                                    className="h-4.5 w-4.5"
                                    fill={isLiked ? "currentColor" : "none"}
                                    stroke={isLiked ? "currentColor" : "currentColor"}
                                />
                            </button>
                        </div>
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
                                <div className="px-3 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                                        {(() => {
                                            const ageString = product.ageRange.toString().toLowerCase();
                                            if (ageString === "0-6" || ageString === "0") return "Newborn";
                                            if (ageString === "6-12") return "6+ Months";
                                            if (ageString === "12") return "1 Year";
                                            if (ageString === "24") return "2 Years";
                                            // Fallback logic for generic numbers
                                            const ageNum = parseInt(ageString);
                                            if (!isNaN(ageNum)) {
                                                if (ageNum < 12) return `${ageNum} Months`;
                                                return `${Math.floor(ageNum / 12)} Year${Math.floor(ageNum / 12) > 1 ? 's' : ''}`;
                                            }
                                            return product.ageRange;
                                        })()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Name */}
                        <h3 className="text-[17px] font-bold text-slate-800 line-clamp-1 group-hover:text-slate-950 transition-colors leading-snug mb-4">
                            {product.name}
                        </h3>

                        {/* Action Footer */}
                        <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
                             <div className="flex items-center gap-1.5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Stock</span>
                             </div>
                            <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-[#4988c4] group-hover:text-white group-hover:border-[#4988c4] transition-all duration-500 shadow-sm">
                                <Plus className="w-5 h-5" strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>

                </div>
            </Link>
        </motion.div>
    )
}

ProductCard.displayName = "ProductCard"
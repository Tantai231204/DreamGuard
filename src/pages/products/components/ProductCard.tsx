import type { FC } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, Plus } from "lucide-react"

import type { Product } from "../types"
import { getProductDetailRoute } from "@/lib/constants"
import { useFavoriteProducts, useAddFavorite, useDeleteFavorite } from "@/hooks/useFavorite"
import { cn } from "@/lib/utils"

import { formatPrice } from "@/lib/utils"

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

    const priceToDisplay = (product.price && product.price > 0) ? product.price : (product.originalPrice || 0);
    const hasDiscount = !!(product.originalPrice && product.originalPrice > product.price && product.price > 0);

    const discountPercent = product.discount
        ? product.discount
        : hasDiscount && product.originalPrice
            ? Math.round((1 - product.price / product.originalPrice) * 100)
            : null

    const ratingValue = product.rating || 4.8

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="group relative"
        >
            <Link to={getProductDetailRoute(product.slug)} className="block">
                <div className="flex flex-col h-full bg-white rounded-[2rem] overflow-hidden shadow-[0_4px_20px_-4px_rgba(148,163,184,0.12)] hover:shadow-[0_20px_40px_-4px_rgba(148,163,184,0.18)] border border-slate-50/80 transition-all duration-500">

                    {/* IMAGE SECTION - Clean Full Bleed with rounded corners at top */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-50/50">
                        <img
                            src={product.image || "/images/placeholder-product.svg"}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                                e.currentTarget.src = "/images/placeholder-product.svg"
                            }}
                        />

                        {/* Top Gradient Header Overlay - GPU backstop */}
                        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/20 to-transparent opacity-100 transition-opacity duration-500 group-hover:opacity-80 will-change-transform" />

                        <div className="absolute left-4 top-4 flex flex-col gap-1.5 z-10">
                            {discountPercent && discountPercent > 0 && (
                                <Badge className="bg-rose-500 text-white border-0 px-2.5 py-0.5 text-[9px] font-black rounded-lg tracking-wider shadow-md">
                                    -{discountPercent}%
                                </Badge>
                            )}
                            {product.isNew && !discountPercent && (
                                <Badge className="bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0 px-2.5 py-0.5 text-[9px] font-black rounded-lg tracking-wider shadow-md">
                                    New
                                </Badge>
                            )}
                        </div>

                        {/* Wishlist button floating transparent */}
                        <div className={cn(
                            "absolute right-4 top-4 transition-all duration-300 z-10",
                            isLiked ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                        )}>
                            <button
                                onClick={handleLike}
                                className={cn(
                                    "h-8 w-8 rounded-xl bg-white/80 backdrop-blur-md flex items-center justify-center transition-all border border-white/40 shadow-sm active:scale-95",
                                    isLiked ? "text-rose-500 bg-white" : "text-slate-400 hover:text-rose-500"
                                )}
                            >
                                <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-current")} />
                            </button>
                        </div>
                    </div>

                    {/* CONTENT SECTION - Clean White base */}
                    <div className="pt-4 pb-5 px-5 flex flex-col flex-1">
                        <div className="flex items-center gap-1.5 mb-2">
                            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50/80 border border-amber-100/30">
                                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                                <span className="text-[10px] font-black text-amber-700">{ratingValue.toFixed(1)}</span>
                            </div>
                            <span className="text-[9px] text-emerald-600 font-black uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                Available
                            </span>
                        </div>

                        {/* Name */}
                        <h3 className="text-[15px] font-bold text-slate-800 group-hover:text-[#4988c4] transition-colors line-clamp-1 leading-snug tracking-tight mb-1">
                            {product.name}
                        </h3>

                        <p className="text-[11px] text-slate-500 line-clamp-1 mb-4 leading-relaxed font-medium">
                            Premium kids collection
                        </p>

                        {/* Price Block & Action Footer stacked beautifully */}
                        <div className="mt-auto flex items-center justify-between">
                            <div className="flex flex-col">
                                {hasDiscount && product.originalPrice && (
                                    <span className="text-[10px] text-slate-400 line-through font-bold">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                )}
                                <span className={cn(
                                    "font-black tracking-tight leading-none mt-0.5",
                                    priceToDisplay > 0 ? "text-[16px] text-[#4988c4]" : "text-[12px] text-slate-400 uppercase tracking-widest font-black"
                                )}>
                                    {priceToDisplay > 0 ? formatPrice(priceToDisplay) : "Explore"}
                                </span>
                            </div>

                            <div className="h-8 w-8 rounded-xl bg-slate-50 border border-slate-100/50 flex items-center justify-center text-slate-600 group-hover:bg-[#4988c4] group-hover:text-white group-hover:border-[#4988c4] group-hover:scale-105 transition-all duration-300 shadow-sm transform active:scale-95">
                                <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>

                </div>
            </Link>
        </motion.div>
    )
}

ProductCard.displayName = "ProductCard"
import { memo, type FC } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Combo } from "../types"
import { useFavoriteProducts, useAddFavoriteCombo, useDeleteFavoriteCombo } from "@/hooks/useFavorite"
import { getComboDetailRoute } from "@/lib/constants"
import { formatPrice } from "@/lib/utils"
interface ComboCardProps {
    combo: Combo
}

export const ComboCard: FC<ComboCardProps> = memo(({ combo }) => {
    const { data: favorites } = useFavoriteProducts()
    const addFavoriteCombo = useAddFavoriteCombo()
    const deleteFavoriteCombo = useDeleteFavoriteCombo()

    const isLiked = favorites?.items?.some(f => String(f.comboId) === String(combo.id))

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (isLiked) {
            deleteFavoriteCombo.mutate(String(combo.id))
        } else {
            addFavoriteCombo.mutate(String(combo.id))
        }
    }

    const priceToDisplay = combo.salePrice > 0 ? combo.salePrice : combo.basePrice;
    const hasDiscount = combo.basePrice > combo.salePrice && combo.salePrice > 0;

    const discountPercent = hasDiscount
        ? Math.round((1 - combo.salePrice / combo.basePrice) * 100)
        : null

    const ratingValue = combo.averageRating || 4.9

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="group relative"
        >
            <Link to={getComboDetailRoute(combo.slug)} className="block">
                <div className="flex flex-col h-full bg-white rounded-[2rem] overflow-hidden shadow-[0_4px_20px_-4px_rgba(148,163,184,0.12)] hover:shadow-[0_20px_40px_-4px_rgba(148,163,184,0.18)] border border-slate-50/80 transition-all duration-500">

                    {/* IMAGE SECTION - Clean Full Bleed with rounded corners at top */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-50/50">
                        <img
                            src={combo.imageUrl || "/images/placeholder-product.svg"}
                            alt={combo.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                                e.currentTarget.src = "/images/placeholder-product.svg"
                            }}
                        />

                        {/* Top Gradient Header Overlay - with backface for GPU boost */}
                        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/10 to-transparent transition-opacity duration-500 group-hover:opacity-60 will-change-transform" />

                        {/* Badges Floating Left */}
                        <div className="absolute left-4 top-4 flex flex-col gap-1.5 z-10">
                            {discountPercent && discountPercent > 0 && (
                                <Badge className="bg-rose-500 text-white border-0 px-2.5 py-0.5 text-[9px] font-black rounded-lg tracking-wider shadow-md">
                                    -{discountPercent}%
                                </Badge>
                            )}
                            <Badge className="bg-gradient-to-r from-[#4988c4] to-[#366c9c] text-white border-0 px-2.5 py-0.5 text-[9px] font-black rounded-lg tracking-wider shadow-md">
                                Bundle
                            </Badge>
                        </div>

                        {/* Wishlist button Floating Right */}
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
                            <span className="text-[9px] text-primary-600 font-black uppercase tracking-wider bg-primary-50 px-1.5 py-0.5 rounded-md">
                                Package Set
                            </span>
                        </div>

                        {/* Name */}
                        <h3 className="text-[15px] font-bold text-slate-800 group-hover:text-[#4988c4] transition-colors line-clamp-1 leading-snug tracking-tight mb-1">
                            {combo.name}
                        </h3>

                        <p className="text-[11px] text-slate-500 line-clamp-1 mb-4 leading-relaxed font-medium">
                            Premium Sleep Collection set
                        </p>

                        {/* Price Block & Action Footer stacked beautifully */}
                        <div className="mt-auto flex items-center justify-between">
                            <div className="flex flex-col">
                                {hasDiscount && (
                                    <span className="text-[10px] text-slate-400 line-through font-bold">
                                        {formatPrice(combo.basePrice)}
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
})

ComboCard.displayName = "ComboCard"

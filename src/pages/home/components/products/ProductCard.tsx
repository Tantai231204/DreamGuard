import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { getProductDetailRoute } from '@/lib/constants'
import { Star, Plus, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ProductExtended } from '@/pages/products/utils'
import { useFavoriteProducts, useAddFavorite, useDeleteFavorite } from '@/hooks/useFavorite'
import { cn } from '@/lib/utils'

interface Props {
    product: ProductExtended
}

export default function ProductCard({ product }: Props) {
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

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="group cursor-pointer h-full"
        >
            <Link to={getProductDetailRoute(product.slug)} className="flex flex-col h-full">
                {/* Media Container - Soft Rounded Corner */}
                <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-slate-50 border border-slate-100/50">
                    <motion.img
                        src={product.image || "/images/placeholder-product.svg"}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />

                    {/* Overlay Gradient - Minimalist Touch */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Status Badges */}
                    <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
                        {product.discount ? (
                            <Badge className="bg-rose-500 text-white border-0 px-3 py-1 text-[10px] font-bold rounded-full tracking-widest uppercase shadow-sm">
                                -{product.discount}%
                            </Badge>
                        ) : product.isNew ? (
                            <Badge className="bg-[#4988c4] text-white border-0 px-3 py-1 text-[10px] font-bold rounded-full tracking-widest uppercase shadow-sm">
                                New
                            </Badge>
                        ) : (
                            <Badge className="bg-slate-900 text-white border-0 px-3 py-1 text-[10px] font-bold rounded-full tracking-widest uppercase shadow-sm">
                                Featured
                            </Badge>
                        )}
                    </div>

                    {/* Quick Action - Wishlist */}
                    <div className={cn(
                        "absolute right-4 top-4 transition-all duration-400 z-10",
                        isLiked 
                            ? "opacity-100 translate-x-0" 
                            : "opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                    )}>
                        <button
                            onClick={handleLike}
                            className={cn(
                                "h-9 w-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center transition-all shadow-xl",
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

                {/* Content Section - Typography Focused */}
                <div className="pt-5 px-3 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <span className="flex items-center gap-0.5 text-[12px] font-bold text-slate-900">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" strokeWidth={0} />
                                {product.rating?.toFixed(1) || '5.0'}
                            </span>
                        </div>
                    </div>

                    <h3 className="text-[18px] font-bold text-slate-800 line-clamp-1 group-hover:text-slate-950 transition-colors leading-snug mb-2">
                        {product.name}
                    </h3>

                    <p className="text-[12px] text-slate-500 line-clamp-1 mb-4 font-medium italic">
                        {product.summary || 'Premium collection for kids'}
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-end">
                        <div className="h-10 w-10 rounded-full bg-transparent border border-slate-200 flex items-center justify-center text-slate-900 transition-all duration-500 group-hover:bg-black group-hover:border-black group-hover:text-white group-hover:scale-110 group-hover:shadow-lg active:scale-95">
                            <Plus className="w-5 h-5" strokeWidth={2} />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

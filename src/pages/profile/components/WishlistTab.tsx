import { useState } from "react"
import { Heart, ShoppingBag, Trash2, Star, GridIcon, ListIcon } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { getProductDetailRoute, getComboDetailRoute } from "@/lib/constants"
import { Link } from "react-router-dom"
import { useFavoriteProducts, useDeleteFavorite, useDeleteFavoriteCombo } from "@/hooks/useFavorite"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export default function WishlistTab() {
    const { data, isLoading } = useFavoriteProducts()
    const deleteFavorite = useDeleteFavorite()
    const deleteFavoriteCombo = useDeleteFavoriteCombo()

    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
    const wishlist = data?.items || []

    const handleRemove = (e: React.MouseEvent, item: import('@/api/services/favoriteService').FavoriteProduct) => {
        e.preventDefault()
        e.stopPropagation()
        if (item.comboId) {
            deleteFavoriteCombo.mutate(String(item.comboId))
        } else {
            deleteFavorite.mutate(String(item.productId))
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-[#4988c4]/20 border-t-[#4988c4] animate-spin" />
                    <p className="text-sm text-gray-400 font-medium">Loading items...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100/80">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Your Wishlist</h2>
                    <p className="text-sm text-gray-400 mt-1 font-medium">
                        You have {data?.totalCount || 0} items saved.
                    </p>
                </div>

                {/* View Controller - Luxury Toggle */}
                {wishlist.length > 0 && (
                    <div className="flex items-center self-end sm:self-auto gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-2 rounded-lg transition-all duration-200",
                                viewMode === 'grid' ? "bg-white shadow-sm text-[#4988c4]" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <GridIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-2 rounded-lg transition-all duration-200",
                                viewMode === 'list' ? "bg-white shadow-sm text-[#4988c4]" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {wishlist.length > 0 ? (
                viewMode === 'list' ? (
                    /* LIST VIEW - Horizontal Row Cards */
                    <div className="flex flex-col gap-4">
                        <AnimatePresence mode="popLayout">
                            {wishlist.map((item) => {
                                const name = item.productName || item.comboName || "Unnamed Item";
                                const image = item.imageUrls?.[0] || "/images/placeholder-product.svg";
                                const price = item.salePrice > 0 ? item.salePrice : item.basePrice;
                                const originalPrice = item.basePrice || item.salePrice;
                                const hasDiscount = originalPrice > price && price > 0;
                                const rating = item.averageRating || 5.0;
                                const url = item.comboId ? getComboDetailRoute(item.slug) : getProductDetailRoute(item.slug);
                                const isOutOfStock = item.status === 'OutOfStock' || item.status === 'Out of Stock';

                                return (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: 50, scale: 0.95 }}
                                        transition={{ duration: 0.25, ease: "easeInOut" }}
                                    >
                                        <div className={cn(
                                            "flex relative items-center gap-4 p-3 bg-white rounded-3xl border border-slate-100/80 shadow-sm hover:shadow-md transition-all duration-300",
                                            isOutOfStock && "opacity-80"
                                        )}>
                                            <Link to={url} className="relative aspect-square w-20 sm:w-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100/50 flex-shrink-0">
                                                <img src={image} alt={name} className={cn("w-full h-full object-cover", isOutOfStock && "grayscale")} onError={(e) => { e.currentTarget.src = "/images/placeholder-product.svg" }} />
                                                {isOutOfStock && (
                                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                        <span className="bg-rose-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-md shadow-lg">Sold Out</span>
                                                    </div>
                                                )}
                                            </Link>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                    <span className="text-[11px] font-bold text-slate-800">{rating.toFixed(1)}</span>
                                                </div>
                                                <Link to={url}>
                                                    <h3 className="text-sm sm:text-base font-black text-slate-900 hover:text-[#4988c4] transition-colors line-clamp-1 tracking-tight">{name}</h3>
                                                </Link>
                                                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">{item.comboId ? 'Bundled Package' : 'Premium item'}</p>
                                                <div className="flex items-baseline gap-2 mt-2">
                                                    <span className="text-[14px] sm:text-[16px] font-black text-[#4988c4]">{price > 0 ? formatPrice(price) : "Updating..."}</span>
                                                    {hasDiscount && <span className="text-[10px] sm:text-[11px] text-slate-300 line-through font-bold">{formatPrice(originalPrice)}</span>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 ml-2">
                                                <button onClick={(e) => handleRemove(e, item)} className="h-8 w-8 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-100/50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all duration-200 active:scale-90"><Trash2 className="w-3.5 h-3.5" /></button>
                                                {!isOutOfStock ? (
                                                    <Link to={url} className="h-8 w-8 rounded-xl bg-[#4988c4] flex items-center justify-center text-white shadow-sm hover:bg-[#366c9c] transition-all">
                                                        <ShoppingBag className="w-3.5 h-3.5" />
                                                    </Link>
                                                ) : (
                                                    <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300 cursor-not-allowed">
                                                        <ShoppingBag className="w-3.5 h-3.5" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                ) : (
                    /* GRID VIEW - Luxurious Poster style overlapping blurred card */
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence mode="popLayout">
                            {wishlist.map((item) => {
                                const name = item.productName || item.comboName || "Unnamed Item";
                                const image = item.imageUrls?.[0] || "/images/placeholder-product.svg";
                                const price = item.salePrice > 0 ? item.salePrice : item.basePrice;
                                const originalPrice = item.basePrice || item.salePrice;
                                const hasDiscount = originalPrice > price && price > 0;
                                const rating = item.averageRating || 5.0;
                                const url = item.comboId ? getComboDetailRoute(item.slug) : getProductDetailRoute(item.slug);
                                const isOutOfStock = item.status === 'OutOfStock' || item.status === 'Out of Stock';

                                return (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                                        whileHover={!isOutOfStock ? { y: -8 } : {}}
                                        transition={{ duration: 0.35, ease: "easeOut" }}
                                        className={cn(
                                            "group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500",
                                            isOutOfStock && "opacity-90"
                                        )}
                                    >
                                        <img
                                            src={image}
                                            alt={name}
                                            className={cn(
                                                "absolute inset-0 h-full w-full object-cover transition-transform duration-700",
                                                !isOutOfStock && "group-hover:scale-110",
                                                isOutOfStock && "grayscale opacity-60"
                                            )}
                                            onError={(e) => { e.currentTarget.src = "/images/placeholder-product.svg" }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent transition-opacity duration-500 group-hover:opacity-60" />

                                        {isOutOfStock && (
                                            <div className="absolute top-4 left-4 z-10">
                                                <span className="bg-rose-500/90 backdrop-blur-sm text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl shadow-lg border border-white/20">Sold Out</span>
                                            </div>
                                        )}

                                        {/* Action Buttons Floating Top */}
                                        <button
                                            onClick={(e) => handleRemove(e, item)}
                                            className="absolute top-4 right-4 h-8 w-8 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:bg-rose-500 hover:border-rose-500 hover:scale-105 active:scale-90 transition-all duration-200 shadow-md z-10"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>

                                        {/* Glassy Overlap Footer */}
                                        <div className="absolute inset-x-4 bottom-4 p-4 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-xl flex flex-col gap-1.5 transition-transform duration-500 group-hover:translate-y-[-4px]">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                    <span className="text-[11px] font-black text-slate-800">{rating.toFixed(1)}</span>
                                                </div>
                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                                                    {item.comboId ? "Package" : "Item"}
                                                </span>
                                            </div>

                                            <h3 className="text-[13px] font-black text-slate-900 line-clamp-1 leading-tight tracking-tight">
                                                {name}
                                            </h3>

                                            <div className="flex items-end justify-between mt-1 pt-2 border-t border-slate-100/30">
                                                <div className="flex flex-col">
                                                    {hasDiscount && (
                                                        <span className="text-[10px] text-slate-300 line-through font-bold">
                                                            {formatPrice(originalPrice)}
                                                        </span>
                                                    )}
                                                    <span className="text-[14px] font-black text-[#4988c4] leading-tight mt-0.5">
                                                        {price > 0 ? formatPrice(price) : "Updating..."}
                                                    </span>
                                                </div>

                                                {!isOutOfStock ? (
                                                    <Link
                                                        to={url}
                                                        className="h-8 w-8 rounded-xl bg-[#4988c4] flex items-center justify-center text-white hover:bg-[#366c9c] transition-colors shadow-sm shadow-[#4988c4]/20 active:scale-95 transform"
                                                    >
                                                        <ShoppingBag className="w-3.5 h-3.5" />
                                                    </Link>
                                                ) : (
                                                    <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300 cursor-not-allowed">
                                                        <ShoppingBag className="w-3.5 h-3.5" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                )
            ) : (
                <div className="rounded-3xl border-2 border-dash border-gray-100 bg-gray-50/50 py-24 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-white shadow-md flex items-center justify-center mx-auto mb-6">
                        <Heart className="h-8 w-8 text-primary/40 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Your wishlist is empty</h3>
                    <p className="text-sm text-gray-400 max-w-xs mx-auto mt-2 font-medium leading-relaxed">
                        Explore our collections and save your favorite items here.
                    </p>
                    <Button variant="premium" size="premiumLg" className="relative mt-8" asChild>
                        <a href="/products">Start Shopping</a>
                    </Button>
                </div>
            )}
        </div>
    )
}

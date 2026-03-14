import { Trash2, Heart } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { useFavoriteProducts, useDeleteFavorite } from "../../../hooks/useFavorite"
import { formatPrice } from "../utils"
import { Link } from "react-router-dom"
import { getProductDetailRoute } from "@/lib/constants"

export default function WishlistTab() {

    const { data, isLoading } = useFavoriteProducts()
    const deleteFavorite = useDeleteFavorite()

    const wishlist = data?.items || []

    if (isLoading) return <p>Loading...</p>

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Your Wishlist</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        You have {data?.totalCount || 0} items saved to your collection.
                    </p>
                </div>
            </div>

            {wishlist.length > 0 ? (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlist.map((item) => (
                        <div
                            key={item.id}
                            className="group relative rounded-[3rem] bg-white border border-slate-100/60 shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_50px_rgba(73,136,196,0.08)] overflow-hidden flex flex-col h-[390px] transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1.5"
                        >
                            <Link to={getProductDetailRoute(item.slug)} className="absolute inset-0 z-10 flex flex-col">
                                {/* Ambient Background Graphic */}
                                <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
                                    <img
                                        src={item.imageUrls?.[0] || "/images/placeholder-product.svg"}
                                        alt={item.productName}
                                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                        onError={(e) => {
                                            e.currentTarget.src = "/images/placeholder-product.svg"
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/25 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                                </div>

                                {/* Floating Ambient Spheres */}
                                <div className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute top-1/4 left-1/4 w-7 h-7 rounded-full bg-white/20 blur-sm" />
                                    <div className="absolute top-1/2 right-1/4 w-11 h-11 rounded-full bg-primary/10 blur-md" />
                                </div>

                                {/* Detached Quick Action - Remove */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        deleteFavorite.mutate(item.productId)
                                    }}
                                    className="absolute top-5 right-5 w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md text-slate-400 hover:text-white hover:bg-rose-500 shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:shadow-rose-500/20 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 z-20"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>

                                {/* Floating Translucent Glass Panel */}
                                <div className="relative mt-auto mx-4 mb-4 p-5 rounded-[2.25rem] bg-white/90 backdrop-blur-md border border-white/80 shadow-[0_10px_25px_rgba(73,136,196,0.03)] group-hover:border-primary/30 transition-[margin,border-color,background-color] duration-500 flex flex-col gap-2 group-hover:mb-5">

                                    {/* Accent Floating Tooltip */}
                                    <div className="absolute -top-3 left-7 px-3 py-1 rounded-full bg-primary text-white text-[8px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1">
                                        <Heart className="h-2 w-2 fill-white" /> Saved
                                    </div>

                                    <h3 className="text-[14px] font-bold text-slate-800 line-clamp-1 tracking-tight group-hover:text-primary transition-colors duration-300 mt-1">
                                        {item.productName || "Unnamed Product"}
                                    </h3>

                                    <div className="flex items-center justify-between border-t border-slate-100/60 pt-3 mt-1">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Price</span>
                                            <span className="text-[17px] font-black text-primary tracking-tight flex items-baseline gap-1">
                                                <span className="text-[9px] font-bold text-slate-400">From</span>
                                                {formatPrice(item.salePrice)}
                                            </span>
                                        </div>

                                        <div className="h-9 px-4 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-[9px] uppercase tracking-widest shadow-sm hover:bg-primary-hover active:scale-95 transition-all duration-300">
                                            Details
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-slate-50/50 py-24 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-white shadow-[0_15px_30px_rgba(73,136,196,0.1)] flex items-center justify-center mx-auto mb-6">
                        <Heart className="h-8 w-8 text-primary/40 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Your wishlist is empty</h3>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2 font-medium">
                        Explore our collections and save your favorite items here.
                    </p>
                    <Button className="mt-8 h-12 px-8 rounded-full bg-slate-900 hover:bg-black text-white font-bold uppercase tracking-wider text-[11px] shadow-lg shadow-slate-200 transition-all active:scale-95">
                        Start Shopping
                    </Button>
                </div>
            )}
        </div>
    )
}

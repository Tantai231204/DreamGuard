import { ShoppingCart, Trash2, Heart } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { useFavoriteProducts, useDeleteFavorite } from "../../../hooks/useFavorite"
import { formatPrice } from "../utils"

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
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlist.map((item) => (
                        <div
                            key={item.id}
                            className="group relative rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
                        >
                            {/* Image Section */}
                            <div className="relative aspect-square overflow-hidden bg-slate-50/50">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />

                                {/* Quick Remove Button */}
                                <button
                                    onClick={() => deleteFavorite.mutate(item.id)}
                                    className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md text-slate-400 hover:text-rose-500 shadow-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-sm font-bold text-slate-900 line-clamp-2 tracking-tight mb-3 group-hover:text-primary transition-colors leading-snug">
                                    {item.name}
                                </h3>

                                <div className="mt-auto">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-lg font-bold text-primary">
                                            {formatPrice(item.price)}
                                        </span>
                                    </div>

                                    <Button
                                        className="w-full h-10 rounded-xl font-bold uppercase tracking-wider text-[11px] shadow-sm transition-all active:scale-95 gap-2"
                                    >
                                        <ShoppingCart className="h-4 w-4" />
                                        Add to Cart
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 py-20 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-6">
                        <Heart className="h-8 w-8 text-slate-200" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Your wishlist is empty</h3>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2 font-medium">
                        Explore our collections and save your favorite items here.
                    </p>
                    <Button className="mt-8 h-11 px-8 rounded-xl bg-slate-900 hover:bg-black text-white font-bold uppercase tracking-wider text-[11px] shadow-sm transition-all active:scale-95">
                        Start Shopping
                    </Button>
                </div>
            )}
        </div>
    )
}

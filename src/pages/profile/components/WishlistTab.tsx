import { Heart } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { useFavoriteProducts } from "../../../hooks/useFavorite"
import { ProductCard } from "@/pages/products/components/ProductCard"

export default function WishlistTab() {
    const { data, isLoading } = useFavoriteProducts()
    const wishlist = data?.items || []

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Your Wishlist</h2>
                    <p className="text-sm text-gray-400 mt-1 font-medium">
                        You have {data?.totalCount || 0} items saved to your collection.
                    </p>
                </div>
            </div>

            {wishlist.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlist.map((item) => {
                        const mappedProduct = {
                            id: item.productId,
                            name: item.productName,
                            price: item.salePrice,
                            originalPrice: item.basePrice || item.salePrice,
                            image: item.imageUrls?.[0] || "/images/placeholder-product.svg",
                            slug: item.slug,
                            rating: item.averageRating,
                            reviewCount: 0,
                            discount: item.basePrice > item.salePrice ? Math.round((1 - item.salePrice / item.basePrice) * 100) : 0,
                            category: "Wishlist",
                            inStock: true,
                        }

                        return (
                            <ProductCard key={item.id} product={mappedProduct} />
                        )
                    })}
                </div>
            ) : (
                <div className="rounded-3xl border-2 border-dashed border-gray-100 bg-gray-50/50 py-24 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-white shadow-md shadow-gray-100 flex items-center justify-center mx-auto mb-6">
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

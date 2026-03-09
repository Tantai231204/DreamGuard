import type { FC } from "react"
import { Link } from "react-router-dom"
import { Star, Heart } from "lucide-react"
import { motion } from "framer-motion"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import type { Product } from "../types"
import { getProductDetailRoute } from "@/lib/constants"

interface ProductCardProps {
    product: Product
}

export const ProductCard: FC<ProductCardProps> = ({ product }) => {
    const formatPrice = (price: number) =>
        `$${price.toLocaleString()}`

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group"
        >
            <Link to={getProductDetailRoute(product.slug)}>
                <Card className="relative flex flex-col overflow-hidden rounded-[2.5rem] border-0 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500">

                    {/* IMAGE SECTION */}
                    <div className="relative aspect-square overflow-hidden rounded-[2.5rem] m-2 bg-slate-50">
                        <motion.img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            onError={(e) => {
                                e.currentTarget.src = "/images/placeholder-product.svg"
                            }}
                        />

                        {/* TOP BADGES */}
                        <div className="absolute left-4 top-4 flex flex-wrap gap-2 z-10">
                            {product.isNew && (
                                <Badge className="bg-slate-900 hover:bg-slate-800 text-white border-0 px-3 py-1 text-[10px] font-bold rounded-full tracking-wider uppercase">
                                    New Arrival
                                </Badge>
                            )}
                            {product.inStock && (
                                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0 px-3 py-1 text-[10px] font-bold rounded-full tracking-wider flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    In Stock
                                </Badge>
                            )}
                        </div>

                        {/* WISHLIST BUTTON */}
                        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                            <button
                                onClick={handleLike}
                                className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-rose-500 shadow-lg hover:bg-rose-500 hover:text-white transition-colors"
                            >
                                <Heart className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* CONTENT SECTION */}
                    <div className="flex flex-col pt-4 pb-7 px-6">
                        {/* Rating & Secondary Info */}
                        <div className="flex items-center justify-between mb-3 text-[11px] font-semibold tracking-wide">
                            <div className="flex items-center gap-1 text-slate-400">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-slate-900">{product.rating || '4.8'}</span>
                                <span>({product.reviewCount || '0'})</span>
                            </div>
                            {product.ageRange && (
                                <span className="text-slate-400 uppercase tracking-widest">{product.ageRange} YOs</span>
                            )}
                        </div>

                        {/* Name */}
                        <h3 className="line-clamp-1 text-[16px] font-bold text-slate-800 tracking-tight leading-snug group-hover:text-amber-500 transition-colors mb-4">
                            {product.name}
                        </h3>

                        {/* Footer: Price */}
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                            <div className="flex flex-col">
                                <span className="text-[20px] font-black text-slate-900 tracking-tighter">
                                    {formatPrice(product.price)}
                                </span>
                                {product.discount && (
                                    <span className="text-[10px] text-rose-500 font-bold tracking-wider uppercase">
                                        Save {product.discount}%
                                    </span>
                                )}
                            </div>

                            <div className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-slate-800 group-hover:text-slate-800 transition-all duration-300">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                </Card>
            </Link>
        </motion.div>
    )
}

ProductCard.displayName = "ProductCard"
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { getProductDetailRoute } from '@/lib/constants'
import { Heart, Star, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from './productData'

interface Props {
    product: Product
}

export default function ProductCard({ product }: Props) {
    // Generate slug-safe link fallback if slug is missing in simple test data
    const slug = product.name?.toLowerCase().replace(/\s+/g, '-')

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="group cursor-pointer"
        >
            <Link to={getProductDetailRoute(slug || 'product')}>
                <div className="flex flex-col">
                    {/* Media Container - Soft Rounded Corner */}
                    <div className="relative aspect-square overflow-hidden rounded-[2.5rem] bg-slate-50 border border-slate-100/50">
                        <motion.img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />

                        {/* Overlay Gradient - Minimalist Touch */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Featured Badge */}
                        <div className="absolute left-4 top-4 z-10">
                            {product.discount ? (
                                <Badge className="bg-rose-500 text-white border-0 px-3 py-1 text-[10px] font-bold rounded-full tracking-widest uppercase shadow-sm">
                                    -{product.discount}%
                                </Badge>
                            ) : (
                                <Badge className="bg-slate-900 text-white border-0 px-3 py-1 text-[10px] font-bold rounded-full tracking-widest uppercase shadow-sm">
                                    Featured
                                </Badge>
                            )}
                        </div>

                        {/* Quick Action - Wishlist */}
                        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-400">
                            <button className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-400 shadow-xl hover:text-rose-500 hover:bg-white transition-all">
                                <Heart className="h-4.5 w-4.5" />
                            </button>
                        </div>
                    </div>

                    {/* Content Section - Typography Focused */}
                    <div className="pt-5 px-3 flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                                <span className="flex items-center gap-0.5 text-[12px] font-bold text-slate-900">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" strokeWidth={0} />
                                    {product.rating || '5.0'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-700">Stock</span>
                            </div>
                        </div>

                        <h3 className="text-[17px] font-bold text-slate-800 line-clamp-1 group-hover:text-slate-950 transition-colors leading-snug mb-4">
                            {product.name}
                        </h3>

                        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-[22px] font-black text-slate-900 tracking-tighter leading-none">
                                ${product.price.toFixed(2)}
                            </span>

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

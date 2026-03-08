import type { FC } from 'react'
import { Link } from 'react-router-dom'
import {
    Star,
    Sparkles,
    Tag,
    ArrowUpRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Product } from '../types'
import { getProductDetailRoute } from '@/lib/constants'

interface ProductCardProps {
    product: Product
}

export const ProductCard: FC<ProductCardProps> = ({
    product,
}) => {
    const formatPrice = (price: number) =>
        `$${price.toLocaleString()}`

    const hasRating = product.rating > 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="group"
        >
            <Link to={getProductDetailRoute(product.slug)}>
                <Card className="relative flex flex-col overflow-hidden rounded-[2.5rem] border-0 bg-white transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)]">
                    {/* Media Section */}
                    <div className="relative aspect-[4/5] overflow-hidden m-2 rounded-[2rem] bg-gray-50">
                        <motion.img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            onError={(e) => {
                                e.currentTarget.src = '/images/placeholder-product.svg'
                            }}
                        />

                        {/* Status Badges */}
                        <div className="absolute left-6 top-6 flex flex-col gap-2 z-10">
                            {product.isNew && (
                                <Badge className="bg-white/90 backdrop-blur-md text-emerald-600 border-0 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] shadow-sm rounded-full">
                                    <Sparkles className="h-3 w-3 mr-2 fill-emerald-600" />
                                    New Arrival
                                </Badge>
                            )}
                            {product.discount && product.discount > 0 && (
                                <Badge className="bg-gray-950 text-white border-0 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
                                    -{product.discount}%
                                </Badge>
                            )}
                            {!product.inStock && (
                                <Badge className="bg-gray-100 text-gray-400 border-0 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
                                    Sold Out
                                </Badge>
                            )}
                        </div>

                        <div className="absolute right-6 top-6 h-10 w-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-950 opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-xl">
                            <ArrowUpRight className="h-5 w-5" />
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col px-10 pb-10 pt-4">
                        <div className="space-y-2">
                            {product.category && (
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">
                                    {product.category}
                                </p>
                            )}
                            <h3 className="line-clamp-1 text-xl font-black tracking-tighter text-gray-950 uppercase italic leading-tight group-hover:text-emerald-600 transition-colors">
                                {product.name}
                            </h3>
                        </div>

                        <div className="mt-8 flex items-end justify-between">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-black text-gray-950 tracking-tighter">
                                        {formatPrice(product.price)}
                                    </span>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                        <Tag className="h-4 w-4 text-emerald-500" />
                                    )}
                                </div>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="text-xs text-gray-300 line-through font-bold tracking-widest">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                )}
                            </div>

                            {hasRating && (
                                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                    <Star className="h-3 w-3 fill-gray-950 text-gray-950" />
                                    <span className="text-[10px] font-black text-gray-950">{product.rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </Link>
        </motion.div>
    )
}

ProductCard.displayName = 'ProductCard'

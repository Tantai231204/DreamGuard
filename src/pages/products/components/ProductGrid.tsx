import type { FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Product } from '../types'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
    products: Product[]
    isLoading?: boolean
    onAddToCart?: (productId: string) => void
    onResetFilters?: () => void
}

// Container animation
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
}

export const ProductGrid: FC<ProductGridProps> = ({
    products,
    isLoading = false,
    onAddToCart,
    onResetFilters,
}) => {
    /* ================= Loading ================= */
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                    <motion.div
                        key={index}
                        className="overflow-hidden rounded-2xl border border-[var(--color-gray-200)] bg-white shadow-[var(--shadow-card)]"
                        initial={{ opacity: 0.4 }}
                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: index * 0.1
                        }}
                    >
                        <div className="aspect-square bg-gradient-to-br from-[var(--color-gray-100)] to-[var(--color-gray-50)] p-4">
                            <div className="h-full w-full rounded-xl bg-[var(--color-gray-200)]/50" />
                        </div>
                        <div className="space-y-3 p-4">
                            <div className="h-4 w-3/4 rounded-full bg-[var(--color-gray-200)]" />
                            <div className="flex gap-2">
                                <div className="h-3 w-16 rounded-full bg-[var(--color-gray-100)]" />
                                <div className="h-3 w-12 rounded-full bg-[var(--color-gray-100)]" />
                            </div>
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-3 w-3 rounded-full bg-[var(--color-gray-200)]" />
                                ))}
                            </div>
                            <div className="h-5 w-20 rounded-full bg-[var(--color-gray-200)]" />
                        </div>
                    </motion.div>
                ))}
            </div>
        )
    }

    /* ================= Empty ================= */
    if (products.length === 0) {
        return (
            <motion.div
                className="flex min-h-[450px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-gray-200)] bg-white text-center px-8 shadow-[var(--shadow-sm)]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
            >
                <motion.div
                    className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--color-primary-light)] shadow-md"
                    initial={{ rotate: -10, scale: 0.9 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <Package className="h-10 w-10 text-[var(--color-primary)]" />
                </motion.div>
                <h3 className="mb-2 text-xl font-semibold text-[var(--color-gray-800)]">
                    Nothing here yet
                </h3>
                <p className="mb-6 max-w-sm text-sm text-[var(--color-gray-500)]">
                    Can't find what you're looking for? Try changing your filters or search terms.
                </p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                        onClick={onResetFilters}
                        className="gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-2.5 font-medium text-white shadow-md transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-lg"
                    >
                        <Search className="h-4 w-4" />
                        Clear Filters
                    </Button>
                </motion.div>
            </motion.div>
        )
    }

    /* ================= Grid ================= */
    return (
        <AnimatePresence mode="wait">
            <motion.div
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key="product-grid"
            >
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={onAddToCart}
                    />
                ))}
            </motion.div>
        </AnimatePresence>
    )
}

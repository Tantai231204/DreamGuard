import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchX, RefreshCcw } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { Button } from '@/components/ui/button';
import type { Product } from '../types';

interface ProductGridProps {
    products: Product[];
    isLoading?: boolean;
    onResetFilters: () => void;
}

export const ProductGrid = memo(({
    products,
    isLoading,
    onResetFilters,
}: ProductGridProps) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
                {[...Array(6)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex min-h-[450px] flex-col items-center justify-center rounded-[2.5rem] bg-sky-50/30 border-2 border-dashed border-sky-100/50 px-8 text-center"
            >
                <div className="relative mb-8">
                    <div className="h-20 w-20 bg-white rounded-[2rem] shadow-[0_15px_30px_rgba(73,136,196,0.15)] flex items-center justify-center relative z-10">
                        <SearchX className="h-8 w-8 text-sky-400" />
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">No products found</h3>
                <p className="max-w-xs text-sm text-gray-400 leading-relaxed mb-10">
                    We couldn't find any items matching your current filters. Try adjusting your search!
                </p>

                <Button
                    onClick={onResetFilters}
                    size="lg"
                    className="h-14 px-8 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-lg shadow-sky-100 transition-all active:scale-95"
                >
                    <RefreshCcw className="mr-3 h-4 w-4" />
                    Reset all filters
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
            <AnimatePresence mode="popLayout">
                {products.map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.05,
                            ease: [0.22, 1, 0.36, 1]
                        }}
                    >
                        <ProductCard product={product} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
});

ProductGrid.displayName = 'ProductGrid';

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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                {[...Array(6)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex min-h-[500px] flex-col items-center justify-center rounded-[3rem] bg-gray-50 border-2 border-dashed border-gray-100 px-8 text-center"
            >
                <div className="relative mb-8">
                    <div className="h-20 w-20 bg-white rounded-3xl shadow-xl flex items-center justify-center relative z-10">
                        <SearchX className="h-8 w-8 text-gray-950" />
                    </div>
                </div>

                <h3 className="text-3xl font-black tracking-tighter text-gray-950 uppercase mb-4">No results found</h3>
                <p className="max-w-md text-[11px] font-black text-gray-400 uppercase tracking-widest leading-relaxed mb-10">
                    Try adjusting your filters or search query to find what you're looking for.
                </p>

                <Button
                    onClick={onResetFilters}
                    size="lg"
                    className="h-16 px-10 rounded-2xl bg-gray-950 text-white font-black uppercase tracking-widest transition-all active:scale-95"
                >
                    <RefreshCcw className="mr-3 h-4 w-4" />
                    Clear all filters
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-16">
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
                            ease: [0.16, 1, 0.3, 1]
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

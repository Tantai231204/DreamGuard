import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ComboCard } from './ComboCard';
import type { Combo } from '../types';

interface Props {
    combos: Combo[];
    isLoading: boolean;
    onResetFilters: () => void;
}

const GridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-5">
                <Skeleton className="aspect-[4/3] rounded-[2.5rem] w-full shadow-sm" />
                <div className="space-y-3 px-2">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-3/4 rounded-md" />
                    <Skeleton className="h-4 w-1/4 rounded-md" />
                </div>
            </div>
        ))}
    </div>
);

export const ComboGrid = ({ combos, isLoading, onResetFilters }: Props) => {
    return (
        <AnimatePresence mode="wait">
            {isLoading ? (
                <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <GridSkeleton />
                </motion.div>
            ) : combos.length > 0 ? (
                <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12"
                >
                    {combos.map((combo, idx) => (
                        <motion.div
                            key={combo.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <ComboCard combo={combo} />
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-20 text-center space-y-4 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm"
                >
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-8 h-8 text-slate-200" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">No combos found</h3>
                    <p className="text-slate-400 font-medium">Try adjusting your search query or clear filters.</p>
                    <Button 
                        variant="outline" 
                        onClick={onResetFilters}
                        className="rounded-xl font-bold border-slate-200 hover:bg-slate-50 transition-all mt-4"
                    >
                        Reset Collection
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

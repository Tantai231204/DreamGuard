import { memo } from 'react';
import { Minus, Plus, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface QuantitySelectorProps {
    value: number;
    onChange: (value: number) => void;
    max?: number;
    stockLeft?: number;
}

export const QuantitySelector = memo(({
    value,
    onChange,
    max = 99,
    stockLeft
}: QuantitySelectorProps) => {
    const handleChange = (delta: number) => {
        onChange(Math.max(1, Math.min(max, value + delta)));
    };

    const isLowStock = stockLeft !== undefined && stockLeft > 0 && stockLeft < 10;
    const isOutOfStock = stockLeft === 0;

    return (
        <div className="space-y-4">
            <div className="flex items-baseline justify-between">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Quantity</span>
                    <span className="text-[9px] text-slate-300 font-medium">Select item count</span>
                </div>
                {stockLeft !== undefined && (
                    <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border",
                        isOutOfStock
                            ? "bg-rose-50 text-rose-600 border-rose-100"
                            : isLowStock
                                ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
                                : "bg-emerald-50 text-emerald-600 border-emerald-100"
                    )}>
                        <Package className="h-3 w-3" />
                        <span>{isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock"}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border-2 border-slate-100 shadow-sm w-fit group hover:border-[#4988c4]/20 transition-all duration-300">
                <button
                    type="button"
                    onClick={() => handleChange(-1)}
                    disabled={value <= 1 || isOutOfStock}
                    className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200",
                        "bg-slate-50 text-slate-400 border border-slate-100",
                        "hover:bg-white hover:text-[#4988c4] hover:border-[#4988c4] hover:shadow-md hover:scale-105 active:scale-95",
                        "disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                    )}
                    aria-label="Decrease quantity"
                >
                    <Minus className="h-4 w-4 stroke-[3]" />
                </button>

                <div className="relative flex h-12 w-16 items-center justify-center overflow-hidden bg-slate-50/50 rounded-xl border border-slate-100">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={value}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="text-xl font-black text-slate-900 tabular-nums"
                        >
                            {value}
                        </motion.span>
                    </AnimatePresence>
                </div>

                <button
                    type="button"
                    onClick={() => handleChange(1)}
                    disabled={value >= max || (stockLeft !== undefined && value >= stockLeft) || isOutOfStock}
                    className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200",
                        "bg-slate-50 text-slate-400 border border-slate-100",
                        "hover:bg-white hover:text-[#4988c4] hover:border-[#4988c4] hover:shadow-md hover:scale-105 active:scale-95",
                        "disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                    )}
                    aria-label="Increase quantity"
                >
                    <Plus className="h-4 w-4 stroke-[3]" />
                </button>
            </div>
        </div>
    );
});

QuantitySelector.displayName = 'QuantitySelector';

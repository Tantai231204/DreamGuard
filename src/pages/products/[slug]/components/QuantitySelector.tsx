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
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-black text-primary-dark uppercase tracking-widest leading-none">Quantity</span>
                {stockLeft !== undefined && (
                    <div className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors",
                        isOutOfStock
                            ? "bg-red-50 text-red-600"
                            : isLowStock
                                ? "bg-amber-50 text-amber-600"
                                : "bg-emerald-50 text-emerald-600"
                    )}>
                        <Package className="h-3 w-3" />
                        <span>{isOutOfStock ? "Tạm hết hàng" : isLowStock ? "Low Stock" : "In stock"}</span>
                    </div>
                )}
            </div>

            <div className="inline-flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-100 shadow-sm transition-all hover:border-slate-200">
                <button
                    type="button"
                    onClick={() => handleChange(-1)}
                    disabled={value <= 1 || isOutOfStock}
                    className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                        "text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-sm",
                        "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    )}
                    aria-label="Decrease quantity"
                >
                    <Minus className="h-4 w-4 stroke-[2.5]" />
                </button>

                <div className="relative flex h-10 w-14 items-center justify-center overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={value}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="text-lg font-black text-primary-dark tabular-nums"
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
                        "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                        "text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-sm",
                        "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    )}
                    aria-label="Increase quantity"
                >
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                </button>
            </div>
        </div>
    );
});

QuantitySelector.displayName = 'QuantitySelector';

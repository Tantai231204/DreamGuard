import { memo, useState, useRef, useEffect } from 'react';
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
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (delta: number) => {
        onChange(Math.max(1, Math.min(max, value + delta)));
    };

    const isLowStock = stockLeft !== undefined && stockLeft > 0 && stockLeft < 10;
    const isOutOfStock = stockLeft === 0;

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

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
                        <span>{isOutOfStock ? "Out of Stock" : `${stockLeft} in stock`}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border-2 border-slate-100 shadow-sm w-fit group hover:border-[#4988c4]/20 transition-all duration-300">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleChange(-1);
                    }}
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

                <div
                    onClick={() => !isOutOfStock && setIsEditing(true)}
                    className={cn(
                        "relative flex h-12 w-16 items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100 transition-all cursor-text",
                        isEditing && "border-[#4988c4]/40 ring-1 ring-[#4988c4]/20 bg-white"
                    )}
                >
                    <AnimatePresence mode="wait">
                        {!isEditing ? (
                            <motion.span
                                key="display"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="text-xl font-black text-slate-900 tabular-nums select-none"
                            >
                                <motion.span
                                    key={value}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -10, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="inline-block"
                                >
                                    {value}
                                </motion.span>
                            </motion.span>
                        ) : (
                            <motion.input
                                key="input"
                                ref={inputRef}
                                type="text"
                                inputMode="numeric"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                value={value || ''}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    if (val === '') {
                                        onChange(0);
                                        return;
                                    }
                                    const num = parseInt(val);
                                    if (!isNaN(num)) {
                                        onChange(Math.max(0, Math.min(max, stockLeft ?? max, num)));
                                    }
                                }}
                                onBlur={() => {
                                    setIsEditing(false);
                                    if (value < 1) onChange(1);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') setIsEditing(false);
                                }}
                                className="w-full bg-transparent text-center text-xl font-black text-slate-900 focus:outline-none tabular-nums"
                            />
                        )}
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

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Trash2, Loader2, Minus, Plus } from 'lucide-react';
import { AdminStatusBadge } from '@/components/admin';
import type { ComboItem } from '../../types';

import { getColorHex, parseVariantLabel } from './combo-utils';
import { cn, formatNumber } from '@/lib/utils';

interface ComboVariantRowProps {
    item: ComboItem & { basePrice?: number; salePrice?: number };
    onQuantityChange?: (itemKey: string, qty: number) => void;
    onDelete?: (itemKey: string) => void;
    isLoading?: boolean;
    isDense?: boolean;
}

export default function ComboVariantRow({
    item,
    onQuantityChange,
    onDelete,
    isLoading = false,
    isDense
}: ComboVariantRowProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editQty, setEditQty] = useState(item.quantity);

    // Sync state during render
    const [prevQty, setPrevQty] = useState(item.quantity);
    if (item.quantity !== prevQty) {
        setPrevQty(item.quantity);
        if (!isEditing) {
            setEditQty(item.quantity);
        }
    }

    const itemKey = item.variantId || item.productId || 'default';
    const { color, size } = item.variantLabel
        ? parseVariantLabel(item.variantLabel)
        : { color: '—', size: null };
    const colorHex = getColorHex(color);
    const sku = item.variantId ?? null;

    const basePrice = item.basePrice || 0;
    const salePrice = item.salePrice || 0;
    const hasSale = salePrice > 0 && salePrice < basePrice;

    const handleSave = () => {
        const next = Math.max(1, editQty);
        if (next !== item.quantity) {
            onQuantityChange?.(itemKey, next);
        }
        setIsEditing(false);
    };

    const handleQuickChange = (delta: number) => {
        const next = Math.max(1, item.quantity + delta);
        if (next !== item.quantity) {
            onQuantityChange?.(itemKey, next);
        }
    };

    return (
        <div className={cn(
            "grid grid-cols-[1fr_120px_120px_60px] gap-4 items-center transition-all duration-300 group relative",
            isDense ? "px-4 py-2 hover:bg-slate-50/50" : "px-6 py-3.5 hover:bg-slate-50/50",
            isLoading && "opacity-60 pointer-events-none"
        )}>
            {/* Loading Overlay (Subtle) */}
            {isLoading && (
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-primary-100 overflow-hidden">
                    <div className="h-full bg-primary-600 w-1/2 animate-shimmer-fast" />
                </div>
            )}

            {/* Product / Variant Info */}
            <div className="flex items-center gap-4 min-w-0">
                <div className="relative flex-shrink-0 group/img">
                    <div
                        className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover/img:border-primary-400 transition-all"
                        title={`Color: ${color}`}
                    >
                        <span
                            className="h-4 w-4 rounded-full border border-slate-100 shadow-inner"
                            style={{ backgroundColor: colorHex }}
                        />
                    </div>
                </div>
                <div className="min-w-0">
                    <div className="text-[13px] font-bold text-slate-700 line-clamp-2 leading-tight group-hover:text-primary-700 transition-colors">
                        {item.productName}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {sku && (
                            <span className="font-mono text-[9px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 uppercase tracking-tighter">
                                {sku}
                            </span>
                        )}
                        {size && (
                            <AdminStatusBadge 
                                status={`SZ-${size}`} 
                                type="neutral" 
                                dot={false} 
                                className="h-4.5 px-2 bg-slate-100 border-slate-200 text-slate-600 shadow-none" 
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Price Info */}
            <div className="text-right flex flex-col items-end">
                {salePrice > 0 ? (
                    <>
                        <div className="text-[13px] font-bold text-slate-800 tabular-nums">
                            {formatNumber(salePrice)}
                            <span className="text-[9px] ml-0.5 text-slate-400 font-bold uppercase">₫</span>
                        </div>
                        {hasSale && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-400 line-through font-bold">
                                    {formatNumber(basePrice)}₫
                                </span>
                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1 rounded flex items-center">
                                    -{Math.round((1 - salePrice / basePrice) * 100)}%
                                </span>
                            </div>
                        )}
                    </>
                ) : (
                    <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Price N/A</span>
                )}
            </div>

            {/* Quantity Stepper (Senior UI) */}
            <div className="flex justify-center">
                {isEditing ? (
                    <div className="flex items-center gap-1 animate-in zoom-in-95 duration-200">
                        <Input
                            type="number"
                            value={editQty}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                setEditQty(val);
                                // Trigger immediate update to show price mismatch notice in parent
                                onQuantityChange?.(itemKey, val);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave();
                                if (e.key === 'Escape') setIsEditing(false);
                            }}
                            className="h-8 w-14 px-1 text-center text-[13px] font-black border-2 border-primary-600 focus-visible:ring-0 bg-white shadow-md rounded-lg"
                            min={1}
                            autoFocus
                        />
                        <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 bg-primary-600 hover:bg-primary-700 text-white shadow-sm shrink-0"
                            onClick={handleSave}
                        >
                            <Save className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                ) : (
                    <div className="relative group/stepper">
                        <div className="flex items-center bg-slate-100/80 p-0.5 rounded-xl border border-slate-200 group-hover:bg-white group-hover:border-primary-400/60 shadow-none hover:shadow-sm transition-all duration-300 ring-4 ring-transparent hover:ring-primary-50/50">
                            <button
                                onClick={() => handleQuickChange(-1)}
                                className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-slate-100 hover:text-red-500 text-slate-400 disabled:opacity-20 transition-all active:scale-90"
                                disabled={item.quantity <= 1 || isLoading}
                            >
                                <Minus className="h-3.5 w-3.5 stroke-[3]" />
                            </button>

                            <div
                                className="px-3 h-7 flex items-center justify-center text-[13px] font-black text-slate-800 tabular-nums cursor-text hover:text-primary-600 min-w-[36px]"
                                onClick={() => { setIsEditing(true); setEditQty(item.quantity); }}
                            >
                                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-500" /> : item.quantity}
                            </div>

                            <button
                                onClick={() => handleQuickChange(1)}
                                className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-slate-100 hover:text-primary-600 text-slate-400 transition-all active:scale-90"
                                disabled={isLoading}
                            >
                                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Action */}
            <div className="flex justify-end pr-2">
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95"
                    onClick={() => onDelete?.(itemKey)}
                    disabled={isLoading}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

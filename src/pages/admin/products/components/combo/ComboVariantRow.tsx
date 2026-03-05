import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ComboItem } from '../../types';

import { getColorHex, parseVariantLabel } from './combo-utils';

interface ComboVariantRowProps {
    item: ComboItem & { basePrice?: number; salePrice?: number };
    onQuantityChange?: (itemKey: string, qty: number) => void;
    onDelete?: (itemKey: string) => void;
    isDense?: boolean;
}

export default function ComboVariantRow({ item, onQuantityChange, onDelete, isDense }: ComboVariantRowProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editQty, setEditQty] = useState(item.quantity);

    const itemKey = `${item.productId}-${item.variantId ?? 'default'}`;
    const { color, size } = item.variantLabel
        ? parseVariantLabel(item.variantLabel)
        : { color: '—', size: null };
    const colorHex = getColorHex(color);
    const sku = item.variantId ?? null;

    // Use prices if available in the item (they are in productItems from detailed API)
    const basePrice = (item as any).basePrice || 0;
    const salePrice = (item as any).salePrice || 0;
    const hasSale = salePrice > 0 && salePrice < basePrice;

    const handleSave = () => {
        onQuantityChange?.(itemKey, editQty);
        setIsEditing(false);
    };

    const handleQuickChange = (delta: number) => {
        const next = Math.max(1, item.quantity + delta);
        onQuantityChange?.(itemKey, next);
    };

    return (
        <div className={[
            "grid grid-cols-[1fr_120px_100px_80px] gap-4 items-center transition-all duration-200 group",
            isDense ? "px-6 py-2 hover:bg-white" : "px-8 py-5 hover:bg-indigo-50/20"
        ].join(' ')}>

            {/* Product / Variant Info */}
            <div className="flex items-center gap-4 min-w-0">
                <div className="relative flex-shrink-0">
                    <div
                        className="h-10 w-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:border-indigo-200 group-hover:shadow-md transition-all duration-300"
                        title={`Color: ${color}`}
                    >
                        <span
                            className="h-5 w-5 rounded-full border border-gray-100 shadow-inner"
                            style={{ backgroundColor: colorHex }}
                        />
                    </div>
                </div>
                <div className="min-w-0">
                    <div className="text-[14px] font-bold text-gray-900 truncate leading-tight tracking-tight">
                        {item.productName}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {sku && (
                            <span className="font-mono text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 uppercase tracking-tighter">
                                {sku}
                            </span>
                        )}
                        {size && (
                            <Badge variant="outline" className="text-[9px] font-black h-4 px-1.5 bg-indigo-50 border-indigo-100 text-indigo-600 uppercase">
                                SIZE {size}
                            </Badge>
                        )}
                        {!sku && !size && <span className="text-[10px] text-gray-300 font-medium">Standard Edition</span>}
                    </div>
                </div>
            </div>

            {/* Price Info */}
            <div className="text-right flex flex-col items-end">
                {salePrice > 0 ? (
                    <>
                        <div className="text-[14px] font-black text-gray-900 tracking-tight">
                            {salePrice.toLocaleString('vi-VN')}đ
                        </div>
                        {hasSale && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-gray-400 line-through">
                                    {basePrice.toLocaleString('vi-VN')}đ
                                </span>
                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1 rounded">
                                    -{Math.round((1 - salePrice / basePrice) * 100)}%
                                </span>
                            </div>
                        )}
                    </>
                ) : (
                    <span className="text-[11px] text-gray-300 italic font-medium">No Price</span>
                )}
            </div>

            {/* Quantity Control (Premium Stepper) */}
            <div className="flex items-center justify-center h-full">
                {isEditing ? (
                    <div className="flex items-center gap-1.5 animate-in zoom-in-95 duration-200">
                        <Input
                            type="number"
                            value={editQty}
                            onChange={(e) => setEditQty(Number(e.target.value))}
                            className="h-8 w-14 px-1 text-center text-xs font-black border-2 border-indigo-600 focus-visible:ring-indigo-500/20 bg-white shadow-sm"
                            min={1}
                            autoFocus
                        />
                        <Button
                            size="icon"
                            className="h-8 w-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                            onClick={handleSave}
                        >
                            <Save className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center bg-gray-100/50 p-1 rounded-xl border border-gray-200 group-hover:bg-white group-hover:border-indigo-100 transition-all duration-300">
                        <button
                            onClick={() => handleQuickChange(-1)}
                            className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 disabled:opacity-30 transition-colors"
                            disabled={item.quantity <= 1}
                        >
                            <span className="text-sm font-bold">−</span>
                        </button>

                        <div
                            className="px-3 h-6 flex items-center justify-center text-[13px] font-black text-gray-800 tabular-nums cursor-text hover:text-indigo-600"
                            onClick={() => { setIsEditing(true); setEditQty(item.quantity); }}
                        >
                            {item.quantity}
                        </div>

                        <button
                            onClick={() => handleQuickChange(1)}
                            className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-emerald-50 hover:text-emerald-600 text-gray-400 transition-colors"
                        >
                            <span className="text-sm font-bold">+</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end pr-2">
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                    onClick={() => onDelete?.(itemKey)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

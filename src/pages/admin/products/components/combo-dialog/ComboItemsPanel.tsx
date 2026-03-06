/**
 * ComboItemsPanel — Right panel for managing combo items
 *
 * Displays the list of combo items with add/remove/quantity controls,
 * variant selection via VirtualVariantSelect, and a summary footer.
 */

import { memo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
    Plus, Trash2, Minus, ShoppingBag,
    GripVertical, AlertCircle, Sparkles,
} from 'lucide-react';
import type { VariantOption } from '@/hooks/queries/useProduct';
import type { ComboItemEntry } from './index';
import { colorHex, colorLabel, nextItemId, VirtualVariantSelect } from './index';


// ── Props ────────────────────────────────────────────────
interface ComboItemsPanelProps {
    items: ComboItemEntry[];
    onChange: (items: ComboItemEntry[]) => void;
    variantOptions: VariantOption[];
    isLoadingVariants: boolean;
    disabled?: boolean;
    comboPriceOverride?: number;
}

// ── Component ────────────────────────────────────────────
const ComboItemsPanel = memo(function ComboItemsPanel({
    items, onChange, variantOptions, isLoadingVariants, disabled, comboPriceOverride,
}: ComboItemsPanelProps) {
    const excludeIds = items.map(i => i.productVariantId).filter(Boolean);

    // ── Handlers ─────────────────────────────────────────
    const handleAdd = useCallback(() => {
        onChange([...items, {
            id: nextItemId(), productVariantId: '', quantity: 1,
            label: '', productName: '', sku: '',
            color: undefined, size: undefined, salePrice: 0, basePrice: 0,
        }]);
    }, [items, onChange]);

    const handleRemove = useCallback(
        (id: string) => onChange(items.filter(i => i.id !== id)),
        [items, onChange],
    );

    const handleVariantChange = useCallback(
        (id: string, variantId: string, option: VariantOption | null) => {
            onChange(items.map(item => item.id === id ? {
                ...item, productVariantId: variantId,
                label: option?.label ?? '', productName: option?.productName ?? '',
                sku: option?.sku ?? '', color: option?.color,
                size: option?.size, salePrice: option?.salePrice ?? 0, basePrice: option?.basePrice ?? 0,
            } : item));
        },
        [items, onChange],
    );

    const handleQty = useCallback(
        (id: string, qty: number) => {
            if (qty < 1) return;
            onChange(items.map(i => i.id === id ? { ...i, quantity: qty } : i));
        },
        [items, onChange],
    );

    const clearUnselected = useCallback(
        () => onChange(items.filter(i => i.productVariantId)),
        [items, onChange],
    );

    // ── Derived values ───────────────────────────────────
    const totalVariantPrice = items.reduce((sum, i) => sum + i.salePrice * i.quantity, 0);
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const pendingCount = items.filter(i => !i.productVariantId).length;
    const discount = comboPriceOverride && totalVariantPrice > 0
        ? Math.round(((totalVariantPrice - comboPriceOverride) / totalVariantPrice) * 100)
        : 0;

    // ── Render ───────────────────────────────────────────
    return (
        <div className="flex flex-col h-full">
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80 shrink-0">
                <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-semibold text-slate-800">Combo Items</span>
                    {items.length > 0 && (
                        <Badge variant="secondary" className="h-5 text-[10px] font-bold px-1.5 bg-purple-100 text-purple-700 border-0">
                            {items.filter(i => i.productVariantId).length}/{items.length}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-1.5">
                    {pendingCount > 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button type="button" onClick={clearUnselected}
                                        className="h-7 px-2 text-[11px] font-medium rounded-md text-orange-600 hover:bg-orange-50 border border-orange-200 transition-all flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Clear {pendingCount} empty
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">
                                    Remove {pendingCount} item{pendingCount > 1 ? 's' : ''} without a variant selected
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={disabled}
                        className={cn(
                            'h-7 px-3 text-[11px] font-semibold rounded-lg flex items-center gap-1',
                            'bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-sm',
                            'disabled:opacity-40 disabled:cursor-not-allowed',
                        )}
                    >
                        <Plus className="h-3 w-3" />
                        Add
                    </button>
                </div>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {items.length === 0 ? (
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={disabled}
                        className={cn(
                            'flex flex-col items-center justify-center w-full h-full min-h-[200px]',
                            'border-2 border-dashed border-slate-200 rounded-xl',
                            'hover:border-[#4988c4]/60 hover:bg-purple-50/20 transition-all cursor-pointer',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                        )}
                    >
                        <div className="h-14 w-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-3">
                            <ShoppingBag className="h-7 w-7 text-purple-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-600">No items yet</p>
                        <p className="text-xs text-slate-400 mt-1">Click to add your first product</p>
                    </button>
                ) : (
                    items.map((item, index) => {
                        const hasVariant = !!item.productVariantId;
                        const subtotal = item.salePrice * item.quantity;

                        return (
                            <div
                                key={item.id}
                                className={cn(
                                    'rounded-xl border transition-all',
                                    hasVariant
                                        ? 'border-purple-100 bg-white shadow-sm'
                                        : 'border-orange-200 bg-orange-50/30',
                                )}
                            >
                                {/* Item header */}
                                <div className="flex items-center gap-2 px-3 pt-2.5 pb-2">
                                    <GripVertical className="h-4 w-4 text-slate-300 cursor-grab shrink-0" />
                                    <div className={cn(
                                        'flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold shrink-0',
                                        hasVariant ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-600',
                                    )}>
                                        {index + 1}
                                    </div>

                                    {hasVariant ? (
                                        <div className="flex-1 min-w-0 flex items-center gap-2">
                                            {colorHex(item.color) && (
                                                <div className="h-5 w-5 rounded-md border border-black/10 shrink-0"
                                                    style={{ backgroundColor: colorHex(item.color) }} />
                                            )}
                                            <span className="text-[13px] font-semibold text-slate-800 truncate">{item.productName}</span>
                                            {colorLabel(item.color) && (
                                                <span className="text-[11px] text-slate-500 shrink-0">{colorLabel(item.color)}</span>
                                            )}
                                            {item.size && (
                                                <span className="text-[11px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 shrink-0">{item.size}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="flex-1 text-[12px] text-orange-500 font-medium flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            Select a variant below
                                        </span>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => handleRemove(item.id)}
                                        disabled={disabled}
                                        className="h-6 w-6 flex items-center justify-center rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                {/* Variant selector / compact info row */}
                                <div className="px-3 pb-3">
                                    {!hasVariant ? (
                                        <VirtualVariantSelect
                                            value={item.productVariantId}
                                            onChange={(vid, opt) => handleVariantChange(item.id, vid, opt)}
                                            variantOptions={variantOptions}
                                            isLoading={isLoadingVariants}
                                            excludeIds={excludeIds.filter(e => e !== item.productVariantId)}
                                            disabled={disabled}
                                            placeholder={`Select variant #${index + 1}...`}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            {/* Price info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[11px] text-slate-400 font-mono truncate">{item.sku}</span>
                                                    <span className="text-[11px] font-bold text-purple-600">
                                                        {item.salePrice.toLocaleString('en-US')}₫
                                                    </span>
                                                    {item.salePrice < item.basePrice && (
                                                        <span className="text-[10px] text-slate-400 line-through">
                                                            {item.basePrice.toLocaleString('en-US')}₫
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quantity stepper */}
                                            <div className="flex items-center gap-0.5">
                                                <button type="button"
                                                    className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-purple-50 hover:text-purple-700 text-slate-400 transition-all disabled:opacity-30"
                                                    onClick={() => handleQty(item.id, item.quantity - 1)}
                                                    disabled={disabled || item.quantity <= 1}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <input
                                                    type="number" min={1} value={item.quantity}
                                                    onChange={e => handleQty(item.id, parseInt(e.target.value) || 1)}
                                                    disabled={disabled}
                                                    className="h-6 w-9 text-center text-xs font-bold rounded-md border border-slate-200 bg-slate-50 outline-none focus:border-[#4988c4] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                                <button type="button"
                                                    className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-purple-50 hover:text-purple-700 text-slate-400 transition-all disabled:opacity-30"
                                                    onClick={() => handleQty(item.id, item.quantity + 1)}
                                                    disabled={disabled}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>

                                            {/* Subtotal */}
                                            <span className="text-[12px] font-bold text-slate-800 min-w-[60px] text-right">
                                                {subtotal.toLocaleString('en-US')}₫
                                            </span>

                                            {/* Change variant */}
                                            <VirtualVariantSelect
                                                value={item.productVariantId}
                                                onChange={(vid, opt) => handleVariantChange(item.id, vid, opt)}
                                                variantOptions={variantOptions}
                                                isLoading={isLoadingVariants}
                                                excludeIds={excludeIds.filter(e => e !== item.productVariantId)}
                                                disabled={disabled}
                                                compact
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Summary footer */}
            {items.length > 0 && (
                <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>
                            <span className="font-bold text-slate-700">{items.filter(i => i.productVariantId).length}</span> products ·{' '}
                            <span className="font-bold text-slate-700">{totalItems}</span> items total
                        </span>
                        <span>
                            Variant total:{' '}
                            <span className="font-bold text-slate-800">{totalVariantPrice.toLocaleString('en-US')}₫</span>
                        </span>
                    </div>

                    {discount > 0 && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="text-[12px] text-emerald-700 font-medium">
                                Combo saves customers <span className="font-bold">{discount}%</span> vs buying separately
                            </span>
                        </div>
                    )}

                    {pendingCount > 0 && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 border border-orange-200">
                            <AlertCircle className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                            <span className="text-[12px] text-orange-700">
                                <span className="font-bold">{pendingCount}</span> item{pendingCount > 1 ? 's' : ''} still need a variant selected
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

export default ComboItemsPanel;

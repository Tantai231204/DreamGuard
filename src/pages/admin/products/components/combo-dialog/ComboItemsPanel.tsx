/**
 * ComboItemsPanel — bundle item management workspace
 *
 * Right panel of the variant combo dialog. Manages the list of
 * constituent product variants with quantity controls, a running
 * market-value total, and a one-click sync to the sale price.
 */

import { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';
import {
    Plus, Trash2, Minus, ShoppingBag,
    AlertCircle, RefreshCw, CheckCircle2,
} from 'lucide-react';
import type { VariantOption } from '@/hooks/queries/useProduct';
import type { ComboItemEntry } from './index';
import { colorHex, colorLabel, nextItemId, VirtualVariantSelect } from './index';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface ComboItemsPanelProps {
    items: ComboItemEntry[];
    onChange: (items: ComboItemEntry[]) => void;
    onSyncPrice?: (total: number) => void;
    variantOptions: VariantOption[];
    isLoadingVariants: boolean;
    disabled?: boolean;
    comboPriceOverride?: number;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

const ComboItemsPanel = memo(function ComboItemsPanel({
    items,
    onChange,
    onSyncPrice,
    variantOptions,
    isLoadingVariants,
    disabled,
    comboPriceOverride,
}: ComboItemsPanelProps) {
    const excludeIds = items.map(i => i.productVariantId).filter(Boolean);

    // ── Handlers ─────────────────────────────────────────────

    const handleAdd = useCallback(() => {
        onChange([
            ...items,
            {
                id: nextItemId(),
                productVariantId: '',
                quantity: 1,
                label: '',
                productName: '',
                sku: '',
                color: undefined,
                size: undefined,
                salePrice: 0,
                basePrice: 0,
            },
        ]);
    }, [items, onChange]);

    const handleRemove = useCallback(
        (id: string) => onChange(items.filter(i => i.id !== id)),
        [items, onChange],
    );

    const handleVariantChange = useCallback(
        (id: string, variantId: string, option: VariantOption | null) => {
            onChange(
                items.map(item =>
                    item.id === id
                        ? {
                            ...item,
                            productVariantId: variantId,
                            label: option?.label ?? '',
                            productName: option?.productName ?? '',
                            sku: option?.sku ?? '',
                            color: option?.color,
                            size: option?.size,
                            salePrice: option?.salePrice ?? 0,
                            basePrice: option?.basePrice ?? 0,
                        }
                        : item,
                ),
            );
        },
        [items, onChange],
    );

    const handleQty = useCallback(
        (id: string, qty: number) => {
            if (qty < 1) return;
            onChange(items.map(i => (i.id === id ? { ...i, quantity: qty } : i)));
        },
        [items, onChange],
    );

    const clearPending = useCallback(
        () => onChange(items.filter(i => i.productVariantId)),
        [items, onChange],
    );

    // ── Derived values ────────────────────────────────────────

    const marketTotal = items.reduce((sum, i) => sum + i.salePrice * i.quantity, 0);
    const totalUnits = items.reduce((sum, i) => sum + i.quantity, 0);
    const pendingCount = items.filter(i => !i.productVariantId).length;

    const isSynced = comboPriceOverride === marketTotal;
    const hasDiscount =
        (comboPriceOverride ?? 0) > 0 &&
        marketTotal > 0 &&
        (comboPriceOverride ?? 0) < marketTotal;
    const discountPct = hasDiscount
        ? Math.round(((marketTotal - comboPriceOverride!) / marketTotal) * 100)
        : 0;

    // ── Render ────────────────────────────────────────────────

    return (
        <div className="flex flex-col h-full bg-white">

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-white shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <ShoppingBag className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-800 leading-tight">Bundle items</p>
                        <p className="text-[10px] text-slate-400">
                            {items.length} item{items.length !== 1 ? 's' : ''} · {totalUnits} unit{totalUnits !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {pendingCount > 0 && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearPending}
                            className="h-7 text-[11px] text-orange-600 hover:bg-orange-50 gap-1.5 font-medium"
                        >
                            <Trash2 className="h-3 w-3" />
                            Clear empty ({pendingCount})
                        </Button>
                    )}
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleAdd}
                        disabled={disabled}
                        className="h-8 px-3 text-[11px] font-semibold gap-1.5 rounded-lg"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add item
                    </Button>
                </div>
            </div>

            {/* ── Item list ── */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {items.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center px-6">
                        <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                            <ShoppingBag className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-500">No items yet</p>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                            Add product variants to build this bundle.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {items.map((item, index) => {
                            const hasVariant = !!item.productVariantId;
                            const subtotal = item.salePrice * item.quantity;

                            return (
                                <div
                                    key={item.id}
                                    className={cn(
                                        'group px-5 py-4 transition-colors',
                                        hasVariant
                                            ? 'hover:bg-slate-50/60'
                                            : 'bg-amber-50/40',
                                    )}
                                >
                                    {hasVariant ? (
                                        /* ── Filled item row ── */
                                        <div className="flex items-start gap-3">
                                            {/* Index badge */}
                                            <div className="h-6 w-6 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5">
                                                {index + 1}
                                            </div>

                                            {/* Product info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 truncate leading-snug">
                                                    {item.productName}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                        {item.sku}
                                                    </span>
                                                    {item.color && (
                                                        <span className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                            <span
                                                                className="h-2 w-2 rounded-full shrink-0"
                                                                style={{ backgroundColor: colorHex(item.color) }}
                                                            />
                                                            {colorLabel(item.color)}
                                                        </span>
                                                    )}
                                                    {item.size && (
                                                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                                                            {item.size}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Qty stepper */}
                                            <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5 shrink-0">
                                                <button
                                                    type="button"
                                                    className="h-7 w-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors disabled:opacity-30"
                                                    onClick={() => handleQty(item.id, item.quantity - 1)}
                                                    disabled={disabled || item.quantity <= 1}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-semibold text-slate-900 select-none">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="h-7 w-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 transition-colors disabled:opacity-30"
                                                    onClick={() => handleQty(item.id, item.quantity + 1)}
                                                    disabled={disabled}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>

                                            {/* Subtotal + unit price */}
                                            <div className="text-right shrink-0 min-w-[88px]">
                                                <p className="text-sm font-semibold text-slate-900 tabular-nums">
                                                    {formatPrice(subtotal)}
                                                </p>
                                                <p className="text-[10px] text-slate-400 tabular-nums mt-0.5">
                                                    {formatPrice(item.salePrice)} / unit
                                                </p>
                                            </div>

                                            {/* Remove — visible on hover */}
                                            <button
                                                type="button"
                                                onClick={() => handleRemove(item.id)}
                                                disabled={disabled}
                                                className="h-7 w-7 rounded-md flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                                                title="Remove item"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        /* ── Pending item row (no variant selected yet) ── */
                                        <div className="flex items-center gap-3">
                                            <div className="h-6 w-6 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-semibold shrink-0">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <VirtualVariantSelect
                                                    value={item.productVariantId}
                                                    onChange={(vid, opt) =>
                                                        handleVariantChange(item.id, vid, opt)
                                                    }
                                                    variantOptions={variantOptions}
                                                    isLoading={isLoadingVariants}
                                                    excludeIds={excludeIds.filter(
                                                        e => e !== item.productVariantId,
                                                    )}
                                                    disabled={disabled}
                                                    placeholder="Search for a product variant…"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemove(item.id)}
                                                disabled={disabled}
                                                className="h-7 w-7 rounded-md flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Footer summary ── */}
            {items.length > 0 && (
                <div className="shrink-0 border-t border-slate-100 bg-white">

                    {/* Totals row */}
                    <div className="flex items-center justify-between px-5 py-3">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                                Market total
                            </p>
                            <p className="text-base font-semibold text-slate-900 tabular-nums">
                                {formatPrice(marketTotal)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                                Sale price
                            </p>
                            <div className="flex items-center justify-end gap-2">
                                {hasDiscount && (
                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        -{discountPct}%
                                    </span>
                                )}
                                <p
                                    className={cn(
                                        'text-base font-semibold tabular-nums',
                                        isSynced ? 'text-slate-900' : 'text-blue-600',
                                    )}
                                >
                                    {formatPrice(comboPriceOverride ?? 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sync action */}
                    <div className="px-5 pb-4 flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onSyncPrice?.(marketTotal)}
                            disabled={isSynced || disabled || marketTotal === 0}
                            className={cn(
                                'flex-1 h-9 text-[11px] font-semibold gap-1.5 rounded-lg border-slate-200',
                                isSynced
                                    ? 'text-slate-400 cursor-default'
                                    : 'text-blue-600 border-blue-200 hover:bg-blue-50',
                            )}
                        >
                            {isSynced ? (
                                <>
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Price synced
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Sync sale price to market total
                                </>
                            )}
                        </Button>

                        <div className="flex flex-col items-center justify-center px-4 h-9 rounded-lg bg-slate-50 border border-slate-200 shrink-0">
                            <span className="text-[9px] font-semibold text-slate-400 uppercase leading-none mb-0.5">
                                Units
                            </span>
                            <span className="text-sm font-semibold text-slate-800 leading-none tabular-nums">
                                {totalUnits}
                            </span>
                        </div>
                    </div>

                    {/* Drift warning (sale price ≠ market total) */}
                    {!isSynced && marketTotal > 0 && (
                        <div className="mx-5 mb-4 flex flex-col gap-2 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-start gap-2.5">
                                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-amber-800 uppercase tracking-tight">
                                        Important Notice: Price Mismatch Detected
                                    </p>
                                    <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                                        {(comboPriceOverride ?? 0) > marketTotal
                                            ? 'The sale price currently exceeds the combined total of your items.'
                                            : 'The sale price is lower than the combined total of your items.'}
                                        <span className="block mt-1 font-bold text-amber-900 border-t border-amber-200/50 pt-1">
                                            Note: You have modified the quantities. Please adjust the price accordingly before saving changes.
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

ComboItemsPanel.displayName = 'ComboItemsPanel';
export default ComboItemsPanel;
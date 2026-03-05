/**
 * VirtualVariantSelect — Virtualized variant search dropdown
 *
 * Uses TanStack Virtual to handle 500+ variants without lag.
 * Displays product-grouped rows with color swatches, stock badges, and prices.
 */

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';
import {
    Search, X, ChevronDown, Check, Package,
} from 'lucide-react';
import type { VariantOption } from '@/hooks/queries/useProduct';
import { colorHex, colorLabel } from './index';

// ── Types ────────────────────────────────────────────────
export interface VirtualVariantSelectProps {
    value: string;
    onChange: (variantId: string, option: VariantOption | null) => void;
    variantOptions: VariantOption[];
    isLoading?: boolean;
    excludeIds?: string[];
    disabled?: boolean;
    placeholder?: string;
    /** compact trigger: just show a small "Change" button */
    compact?: boolean;
}

type FlatRow =
    | { kind: 'header'; productId: string; productName: string; count: number }
    | { kind: 'variant'; variant: VariantOption };

// ── Stock badge helper ───────────────────────────────────
function stockBadge(status: string, qty?: number) {
    const cls = status === 'InStock'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : status === 'LowStock'
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-red-50 text-red-600 border-red-200';
    return (
        <span className={cn('text-[10px] px-1.5 py-0.5 rounded-md border font-semibold shrink-0', cls)}>
            {qty ?? 0}
        </span>
    );
}

// ── Component ────────────────────────────────────────────
const VirtualVariantSelect = memo(function VirtualVariantSelect({
    value, onChange, variantOptions, isLoading = false,
    excludeIds = [], disabled, placeholder = 'Search product variant...', compact = false,
}: VirtualVariantSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const parentRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // ── Filtering ────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        return variantOptions
            .filter(v => !excludeIds.includes(v.variantId))
            .filter(v => !q
                || v.productName.toLowerCase().includes(q)
                || v.sku.toLowerCase().includes(q)
                || (v.color && v.color.toLowerCase().includes(q))
                || (v.size && v.size.toLowerCase().includes(q)));
    }, [variantOptions, search, excludeIds]);

    // ── Flatten into header + variant rows ───────────────
    const rows = useMemo<FlatRow[]>(() => {
        const map = new Map<string, { productName: string; variants: VariantOption[] }>();
        for (const v of filtered) {
            const g = map.get(v.productId);
            if (g) g.variants.push(v);
            else map.set(v.productId, { productName: v.productName, variants: [v] });
        }
        const out: FlatRow[] = [];
        for (const [productId, group] of map) {
            out.push({ kind: 'header', productId, productName: group.productName, count: group.variants.length });
            for (const v of group.variants) out.push({ kind: 'variant', variant: v });
        }
        return out;
    }, [filtered]);

    // ── Virtualizer ──────────────────────────────────────
    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: (i) => rows[i]?.kind === 'header' ? 36 : 52,
        overscan: 8,
        enabled: open,
    });

    const selectedOption = useMemo(
        () => variantOptions.find(v => v.variantId === value) ?? null,
        [variantOptions, value],
    );

    const handleSelect = useCallback((variantId: string) => {
        const opt = variantOptions.find(v => v.variantId === variantId) ?? null;
        onChange(variantId, opt);
        setSearch('');
        setOpen(false);
    }, [variantOptions, onChange]);

    // When popover opens, the portal mounts asynchronously.
    // Force virtualizer to remeasure once the scroll container is in the DOM.
    useEffect(() => {
        if (!open) return;

        const id = requestAnimationFrame(() => {
            searchRef.current?.focus();
            virtualizer.measure();
        });

        return () => cancelAnimationFrame(id);
    }, [open, virtualizer]);

    // ── Trigger ──────────────────────────────────────────
    const TriggerContent = () => {
        if (compact) {
            return (
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setOpen(true)}
                    className={cn(
                        'h-7 px-2.5 text-[11px] font-medium rounded-md border border-gray-200',
                        'text-gray-500 hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50',
                        'transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1',
                    )}
                >
                    <ChevronDown className="h-3 w-3" />
                    Change
                </button>
            );
        }

        if (!selectedOption) {
            return (
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setOpen(true)}
                    className={cn(
                        'flex w-full items-center gap-2 h-10 rounded-lg border border-dashed border-gray-300',
                        'px-3 text-sm text-gray-400 hover:border-violet-400 hover:text-violet-500 hover:bg-violet-50/50',
                        'transition-all disabled:opacity-40 disabled:cursor-not-allowed',
                    )}
                >
                    <Package className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{placeholder}</span>
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                </button>
            );
        }

        const hex = colorHex(selectedOption.color);
        return (
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(true)}
                className={cn(
                    'flex w-full items-center gap-2.5 min-h-[48px] py-2 px-3 rounded-lg',
                    'border border-violet-200 bg-violet-50/40',
                    'hover:border-violet-300 hover:bg-violet-50/70 transition-all',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                )}
            >
                {hex ? (
                    <div className="h-8 w-8 rounded-md border-2 border-white shadow-sm shrink-0" style={{ backgroundColor: hex }} />
                ) : (
                    <div className="h-8 w-8 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                        <Package className="h-4 w-4 text-gray-400" />
                    </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                    <div className="text-[13px] font-semibold text-gray-900 truncate">{selectedOption.productName}</div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {colorLabel(selectedOption.color) && (
                            <span className="text-[11px] bg-white border border-gray-200 text-gray-600 rounded px-1.5 py-0.5">
                                {colorLabel(selectedOption.color)}
                            </span>
                        )}
                        {selectedOption.size && (
                            <span className="text-[11px] bg-white border border-gray-200 text-gray-600 rounded px-1.5 py-0.5">
                                {selectedOption.size}
                            </span>
                        )}
                        <span className="text-[10px] text-gray-400 font-mono">{selectedOption.sku}</span>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-violet-600">{selectedOption.salePrice.toLocaleString('en-US')}₫</div>
                    <ChevronDown className="h-3 w-3 text-gray-400 mx-auto mt-0.5" />
                </div>
            </button>
        );
    };

    // ── Render ────────────────────────────────────────────
    return (
        <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
            <PopoverPrimitive.Trigger asChild>
                <span>
                    <TriggerContent />
                </span>
            </PopoverPrimitive.Trigger>

            <PopoverPrimitive.Portal>
                <PopoverPrimitive.Content
                    sideOffset={6}
                    align="start"
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    className={cn(
                        'z-[300] w-[520px]',
                        'rounded-xl border border-gray-200 bg-white shadow-2xl shadow-black/15',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out',
                        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                        'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
                    )}
                >
                    {/* Search bar */}
                    <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5 bg-gray-50/80">
                        <Search className="h-4 w-4 text-gray-400 shrink-0" />
                        <input
                            ref={searchRef}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search product name, SKU, color, size..."
                            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                        />
                        {search && (
                            <button type="button" onClick={() => setSearch('')}
                                className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-gray-200 bg-white px-1.5 text-[10px] font-medium text-gray-500">
                            ESC
                        </kbd>
                    </div>

                    {/* Stats bar */}
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 bg-gray-50/50">
                        <span className="text-[11px] text-gray-400">
                            <span className="font-semibold text-gray-600">{filtered.length}</span> variants available
                        </span>
                        {excludeIds.length > 0 && (
                            <span className="text-[11px] text-violet-500 font-medium">
                                {excludeIds.length} already in combo
                            </span>
                        )}
                    </div>

                    {/* Virtualized list */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <div className="h-6 w-6 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
                            <span className="text-sm text-gray-500">Loading variants...</span>
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                            <Package className="h-8 w-8 text-gray-300" />
                            <p className="text-sm text-gray-400">No matching variants found</p>
                            {search && (
                                <button type="button" onClick={() => setSearch('')}
                                    className="text-xs text-violet-500 hover:underline">
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div
                            ref={parentRef}
                            className="overflow-y-auto"
                            style={{ maxHeight: 340, minHeight: Math.min(rows.length * 44, 220), height: Math.min(rows.length * 44, 340) }}
                        >
                            <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
                                {virtualizer.getVirtualItems().map(virtualRow => {
                                    const row = rows[virtualRow.index];
                                    return (
                                        <div
                                            key={virtualRow.key}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                transform: `translateY(${virtualRow.start}px)`,
                                            }}
                                        >
                                            {row.kind === 'header' ? (
                                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-y border-gray-100">
                                                    <Package className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                                                    <span className="text-[12px] font-bold text-gray-800 truncate flex-1">
                                                        {row.productName || `Product ${row.productId.slice(0, 8)}…`}
                                                    </span>
                                                    <span className="text-[10px] text-violet-500 font-semibold bg-violet-50 px-1.5 py-0.5 rounded shrink-0">
                                                        {row.count} variant{row.count !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSelect(row.variant.variantId)}
                                                    className={cn(
                                                        'flex items-center gap-3 w-full px-3 py-2.5 text-left',
                                                        'transition-colors outline-none',
                                                        value === row.variant.variantId
                                                            ? 'bg-violet-50 border-l-2 border-violet-500'
                                                            : 'hover:bg-gray-50 border-l-2 border-transparent',
                                                    )}
                                                >
                                                    {/* Color swatch */}
                                                    <div className="shrink-0">
                                                        {colorHex(row.variant.color) ? (
                                                            <div
                                                                className="h-6 w-6 rounded-md border border-black/10"
                                                                style={{ backgroundColor: colorHex(row.variant.color) }}
                                                            />
                                                        ) : (
                                                            <div className="h-6 w-6 rounded-md bg-gray-100 border border-gray-200" />
                                                        )}
                                                    </div>

                                                    {/* Attributes */}
                                                    <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                                                        {colorLabel(row.variant.color) && (
                                                            <span className="text-[12px] font-medium text-gray-800">
                                                                {colorLabel(row.variant.color)}
                                                            </span>
                                                        )}
                                                        {colorLabel(row.variant.color) && row.variant.size && (
                                                            <span className="text-gray-300 text-xs">/</span>
                                                        )}
                                                        {row.variant.size && (
                                                            <span className="text-[12px] font-medium text-gray-800">{row.variant.size}</span>
                                                        )}
                                                        {!colorLabel(row.variant.color) && !row.variant.size && (
                                                            <span className="text-[12px] text-gray-400 italic">Default</span>
                                                        )}
                                                        <span className="text-[10px] text-gray-400 font-mono">{row.variant.sku}</span>
                                                    </div>

                                                    {/* Stock */}
                                                    {row.variant.stockStatus && stockBadge(row.variant.stockStatus, row.variant.stockQuantity)}

                                                    {/* Price */}
                                                    <div className="text-right shrink-0 min-w-[60px]">
                                                        <div className="text-[12px] font-bold text-gray-800">
                                                            {row.variant.salePrice.toLocaleString('en-US')}₫
                                                        </div>
                                                        {row.variant.salePrice < row.variant.basePrice && (
                                                            <div className="text-[10px] text-gray-400 line-through">
                                                                {row.variant.basePrice.toLocaleString('en-US')}₫
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Check mark */}
                                                    {value === row.variant.variantId && (
                                                        <Check className="h-4 w-4 text-violet-600 shrink-0" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
    );
});

export default VirtualVariantSelect;

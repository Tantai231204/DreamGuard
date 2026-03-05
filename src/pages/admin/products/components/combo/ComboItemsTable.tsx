import { motion } from 'framer-motion';
import { ShoppingBag, Plus, GitBranch, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { useComboDetail } from '@/hooks/queries/useCombo';
import ComboProductGroup from './ComboProductGroup';
import type { ComboItem } from '../../types';
import type { ComboResponse } from '@/api/services/comboService';

/* ──────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────── */

function groupByProduct(items: ComboItem[]): Record<string, ComboItem[]> {
    return items.reduce<Record<string, ComboItem[]>>((acc, item) => {
        const key = item.productName ?? 'Unknown';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});
}

function toComboItems(raw: ComboResponse['items']): ComboItem[] {
    return (raw ?? []).map((pi) => ({
        productId: pi.productId,
        productName: pi.productName,
        variantId: pi.variantId,
        variantLabel: pi.variantLabel,
        quantity: pi.quantity,
    }));
}

/* ──────────────────────────────────────────────────────────
   ChildComboSection  
   One collapsible section per childCombo variant
────────────────────────────────────────────────────────── */

function ChildComboSection({
    child,
    idx,
    defaultOpen = false,
}: {
    child: ComboResponse;
    idx: number;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    const items = toComboItems(child.items ?? []);
    const productGroups = groupByProduct(items);
    const totalQty = items.reduce((s, i) => s + i.quantity, 0);

    const STATUS_MAP: Record<string, string> = {
        Published: 'bg-green-50 text-green-700 border-green-300',
        Active: 'bg-green-50 text-green-700 border-green-300',
        Draft: 'bg-amber-50 text-amber-700 border-amber-300',
        Hidden: 'bg-gray-50 text-gray-500 border-gray-300',
        OutOfStock: 'bg-red-50 text-red-700 border-red-300',
    };

    return (
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
            {/* Variant header — click to expand/collapse */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-50/60 to-violet-50/30 hover:from-indigo-50 hover:to-violet-50 transition-colors text-left group"
            >
                {open
                    ? <ChevronDown className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                    : <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                }

                <div className="h-[22px] w-[22px] rounded-md bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <GitBranch className="h-3 w-3 text-indigo-600" />
                </div>

                <span className="text-[13px] font-bold text-gray-800 flex-1 min-w-0 truncate">
                    {child.name || `Variant ${idx + 1}`}
                </span>

                {/* Color / Size badges */}
                {child.color && (
                    <Badge variant="outline" className="text-[10px] bg-white text-violet-600 border-violet-200">
                        🎨 {child.color}
                    </Badge>
                )}
                {child.size && (
                    <Badge variant="outline" className="text-[10px] bg-white text-slate-500 border-slate-200">
                        📐 {child.size}
                    </Badge>
                )}

                {/* Item count */}
                <Badge variant="outline" className="text-[10px] bg-white border-gray-200 text-gray-500 ml-1">
                    {items.length} items · qty {totalQty}
                </Badge>

                {/* Status */}
                {child.status && (
                    <Badge variant="outline" className={`text-[10px] ${STATUS_MAP[child.status] ?? 'bg-gray-50 text-gray-500'}`}>
                        {child.status}
                    </Badge>
                )}

                {/* Sku */}
                {child.sku && (
                    <span className="font-mono text-[10px] text-gray-400 ml-1">{child.sku}</span>
                )}
            </button>

            {/* Collapsible product groups */}
            {open && (
                <div className="p-3 space-y-2 bg-gray-50/50">
                    {Object.entries(productGroups).length === 0 ? (
                        <p className="text-xs text-gray-400 italic text-center py-3">
                            No product items in this variant.
                        </p>
                    ) : (
                        Object.entries(productGroups).map(([productName, pItems], i) => (
                            <ComboProductGroup
                                key={productName}
                                productRef={`#V${idx + 1}.P${i + 1}`}
                                productName={productName}
                                items={pItems}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

/* ──────────────────────────────────────────────────────────
   LeafItemsView  
   For leaf combos that have their own items directly
────────────────────────────────────────────────────────── */

function LeafItemsView({
    items,
    onQuantityChange,
    onDelete,
}: {
    items: ComboItem[];
    onQuantityChange?: (key: string, qty: number) => void;
    onDelete?: (key: string) => void;
}) {
    const productGroups = groupByProduct(items);

    if (!items.length) {
        return (
            <p className="text-xs text-gray-400 italic text-center py-4">
                No product items found.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {Object.entries(productGroups).map(([productName, pItems], i) => (
                <ComboProductGroup
                    key={productName}
                    productRef={`#PRD${String(i + 1).padStart(3, '0')}`}
                    productName={productName}
                    items={pItems}
                    onQuantityChange={onQuantityChange}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

/* ──────────────────────────────────────────────────────────
   Main ComboItemsTable
────────────────────────────────────────────────────────── */

interface ComboItemsTableProps {
    comboId: string;
    items: ComboItem[];         // fallback items (usually empty for parents)
    comboName: string;
    discount: number;
}

export default function ComboItemsTable({
    comboId,
    items: fallbackItems,
    comboName,
    discount,
}: ComboItemsTableProps) {
    const { data: detail, isLoading, isError } = useComboDetail(comboId);

    /* ── Loading ───────────────────────────────────────────── */
    if (isLoading) {
        return (
            <div className="bg-[#fafafa] border-t border-b border-gray-100 px-8 py-6 space-y-3">
                <div className="flex items-center gap-3 mb-5">
                    <Skeleton className="h-8 w-8 rounded-lg bg-gray-200" />
                    <Skeleton className="h-5 w-48 bg-gray-200" />
                    <Skeleton className="h-5 w-16 bg-gray-100 rounded-full" />
                </div>
                <Skeleton className="h-[60px] w-full rounded-xl bg-gray-100" />
                <Skeleton className="h-[60px] w-full rounded-xl bg-gray-100" />
                <Skeleton className="h-[60px] w-full rounded-xl bg-gray-100" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-[#fafafa] border-t border-b border-gray-100 px-8 py-6 text-center">
                <p className="text-sm text-red-500 font-medium">Failed to load combo items.</p>
                <p className="text-xs text-gray-400 mt-1">Please try again or contact support.</p>
            </div>
        );
    }

    /* ── Decide: parent with children, or leaf with own items ── */
    const childCombos: ComboResponse[] = detail?.childCombos ?? [];
    const isParent = childCombos.length > 0;

    // For leaf combos, use detail.items (has variantLabel) > fallbackItems
    const leafItems: ComboItem[] = isParent
        ? []
        : toComboItems(detail?.items ?? []).length
            ? toComboItems(detail?.items ?? [])
            : fallbackItems;

    // Aggregate stats
    const totalVariants = isParent ? childCombos.length : leafItems.length;
    const totalQty = isParent
        ? childCombos.reduce((s, c) => s + (c.items ?? []).reduce((ss, i) => ss + i.quantity, 0), 0)
        : leafItems.reduce((s, i) => s + i.quantity, 0);

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
        >
            <div className="bg-[#fafafa] border-t-2 border-b-2 border-gray-100 px-8 py-6">

                {/* ── Header ──────────────────────────────────────────── */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="h-7 w-7 rounded-lg bg-purple-100 flex items-center justify-center">
                            <ShoppingBag className="h-3.5 w-3.5 text-purple-600" />
                        </div>
                        <span className="text-[14px] font-semibold text-gray-700">
                            {isParent ? 'Variants of' : 'Items in'}{' '}
                            <span className="text-purple-600 font-extrabold">{comboName}</span>
                        </span>
                        <Badge
                            variant="outline"
                            className="text-[11px] font-medium bg-white border-gray-300 text-gray-600 rounded-full px-2.5"
                        >
                            {isParent ? `${childCombos.length} variant${childCombos.length !== 1 ? 's' : ''}` : `${leafItems.length} item${leafItems.length !== 1 ? 's' : ''}`}
                        </Badge>
                        {discount > 0 && (
                            <Badge
                                variant="outline"
                                className="text-[11px] font-bold bg-orange-50 text-orange-600 border-orange-200 rounded-full px-2.5 uppercase tracking-tight"
                            >
                                {discount}% OFF
                            </Badge>
                        )}
                    </div>
                    <Button
                        size="sm"
                        className="h-8 px-4 gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm"
                        onClick={() => console.log('Add item/variant to combo:', comboId)}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        {isParent ? '+ Add Variant' : '+ Add Item'}
                    </Button>
                </div>

                {/* ── Body ────────────────────────────────────────────── */}
                {isParent ? (
                    /* Parent: show each childCombo as a collapsible variant section */
                    <div className="space-y-2">
                        {childCombos.map((child, idx) => (
                            <ChildComboSection
                                key={child.id}
                                child={child}
                                idx={idx}
                                defaultOpen={childCombos.length === 1}
                            />
                        ))}
                    </div>
                ) : (
                    /* Leaf: show its own product items grouped by product */
                    <LeafItemsView
                        items={leafItems}
                        onQuantityChange={(key, qty) => console.log('qty change', key, qty)}
                        onDelete={(key) => console.log('delete', key)}
                    />
                )}

                {/* ── Footer stats ─────────────────────────────────────── */}
                <div className="mt-5 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-gray-500">
                    {isParent ? (
                        <>
                            <span>
                                Variants:{' '}
                                <span className="font-bold text-gray-800">{childCombos.length}</span>
                            </span>
                            <span className="text-gray-300">|</span>
                            <span>
                                Total Qty:{' '}
                                <span className="font-bold text-gray-800">{totalQty}</span>
                            </span>
                        </>
                    ) : (
                        <>
                            <span>
                                Total Items:{' '}
                                <span className="font-bold text-gray-800">{totalQty}</span>
                            </span>
                            <span className="text-gray-300">|</span>
                            <span>
                                Products:{' '}
                                <span className="font-bold text-gray-800">
                                    {Object.keys(groupByProduct(leafItems)).length}
                                </span>
                            </span>
                            <span className="text-gray-300">|</span>
                            <span>
                                Variants:{' '}
                                <span className="font-bold text-gray-800">{leafItems.length}</span>
                            </span>
                        </>
                    )}
                    {discount > 0 && (
                        <>
                            <span className="text-gray-300">|</span>
                            <span>
                                Discount:{' '}
                                <span className="font-bold text-orange-500">{discount}%</span>
                            </span>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

import { useState, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Calculator, X } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useComboDetail, useUpdateCombo, useUpdateComboItems } from '@/hooks/queries/useCombo';
import { toComboItems } from './combo-utils';
import ComboVariantRow from './ComboVariantRow';
import type { Combo, ComboItem } from '../../types';
import { cn, formatNumber, unformatNumber, formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import type { ComboResponse } from '@/api';

interface ChildComboItemsProps {
    childId: string;
    childName: string;
    parentChildData?: Combo;
    isDense?: boolean;
}

// ── Types ─────────────────────────────────────────
interface RichComboItem extends ComboItem {
    basePrice?: number;
    salePrice?: number;
}

function ChildComboItems({
    childId,
    childName,
    parentChildData,
    isDense = false
}: ChildComboItemsProps) {
    const { data: detail, isLoading } = useComboDetail(childId, true);
    const updateComboMutation = useUpdateCombo();
    const updateComboItemsMutation = useUpdateComboItems();

    // ── Local State ──────────────────────────────────
    const [draftItems, setDraftItems] = useState<Record<string, number>>({});
    const [draftSalePrice, setDraftSalePrice] = useState<number | null>(null);
    const [deleteItemKey, setDeleteItemKey] = useState<string | null>(null);
    const [lastSyncedId, setLastSyncedId] = useState<string | null>(null);
    const [isFullySynced, setIsFullySynced] = useState(false);

    // ── State Synchronization ────────────────────────
    const source = detail || parentChildData;

    if (childId !== lastSyncedId || (detail && !isFullySynced)) {
        if (source) {
            const itemMap: Record<string, number> = {};
            source.items?.forEach(i => {
                const key = i.variantId || i.productId || '';
                itemMap[key] = i.quantity;
            });
            setDraftItems(itemMap);
            setDraftSalePrice(source.salePrice);
            setLastSyncedId(childId);
            setIsFullySynced(!!detail);
        }
    }

    // ── Calculations ─────────────────────────────────
    const items = useMemo(() => toComboItems(source) as RichComboItem[], [source]);

    const theoreticalValue = useMemo(() => {
        return items.reduce((sum, item) => {
            const key = item.variantId || item.productId || '';
            const qty = draftItems[key] ?? item.quantity;
            const price = item.salePrice || 0;
            return sum + price * qty;
        }, 0);
    }, [items, draftItems]);

    // Reliable Change Detection
    const itemsChanged = useMemo(() => {
        if (!source?.items || Object.keys(draftItems).length === 0) return false;
        
        // Filter out items that are marked for deletion (quantity 0) from both sides if needed,
        // but since we keep them in the array, direct comparison is fine.
        return source.items.some(i => {
            const key = i.variantId || i.productId || '';
            const currentQty = draftItems[key];
            // Only flag as changed if we have a valid draft value that differs from server
            return currentQty !== undefined && currentQty !== i.quantity;
        });
    }, [source, draftItems]);

    const isDirty = useMemo(() => {
        if (!source) return false;
        if (itemsChanged) return true;
        return draftSalePrice !== null && draftSalePrice !== source.salePrice;
    }, [source, itemsChanged, draftSalePrice]);

    // User request: Show note whenever there is a mismatch, only allow apply when matched
    const hasMismatch = Math.abs((draftSalePrice || 0) - theoreticalValue) > 0.01;
    const canApply = isDirty && !hasMismatch;

    // ── Handlers ─────────────────────────────────────
    const handleQuantityChange = useCallback((itemKey: string, newQty: number) => {
        setDraftItems(prev => ({ ...prev, [itemKey]: Math.max(1, newQty) }));
    }, []);

    const handleReset = useCallback(() => {
        if (!detail) return;
        const itemMap: Record<string, number> = {};
        detail.items?.forEach(i => {
            const id = i.variantId || i.productId || '';
            itemMap[id] = i.quantity;
        });
        setDraftItems(itemMap);
        setDraftSalePrice(detail.salePrice);
    }, [detail]);

    const handleSaveAll = async () => {
        if (!detail) return;

        const itemsChanged = detail.items?.some(i => {
             const id = i.variantId || i.productId || '';
             return draftItems[id] !== i.quantity;
        });
        const priceOrInfoChanged = (draftSalePrice !== detail.salePrice) || (theoreticalValue !== detail.basePrice);

        const updatedItems = detail.items?.map(i => {
            const id = i.variantId || i.productId || '';
            return {
                productVariantId: id,
                quantity: draftItems[id] ?? i.quantity
            };
        }) || [];

        try {
            const tasks: Promise<ComboResponse | void>[] = [];

            if (priceOrInfoChanged) {
                tasks.push(updateComboMutation.mutateAsync({
                    id: childId,
                    data: {
                        name: detail.name,
                        slug: detail.slug,
                        ageGroup: detail.ageGroup ?? 0,
                        color: detail.color,
                        size: detail.size,
                        basePrice: theoreticalValue,
                        description: detail.description,
                        imageUrl: detail.imageUrl,
                        imagePublicId: detail.imagePublicId,
                        status: detail.status,
                        comboParentId: detail.comboParentId ?? undefined,
                        salePrice: draftSalePrice ?? detail.salePrice,
                        items: updatedItems,
                    }
                }));
            }

            if (itemsChanged) {
                tasks.push(updateComboItemsMutation.mutateAsync({
                    id: childId,
                    items: updatedItems
                }));
            }

            if (tasks.length > 0) {
                await Promise.all(tasks);
                toast.success("Combo configuration & pricing synchronized!", { id: 'child-combo-sync' });
            }
        } catch {
            // Error handled by mutation onError
        }
    };

    const handleDeleteItem = async (itemKey: string) => {
        setDeleteItemKey(itemKey);
    };

    const confirmDelete = async () => {
        if (!deleteItemKey || !childId) return;
        
        // Use filtering to remove the item and preserve draft quantities for remaining items
        const itemsUpdate = items
            .filter(item => {
                const id = String(item.variantId || item.productId);
                return id !== String(deleteItemKey);
            })
            .map(item => {
                const id = String(item.variantId || item.productId);
                return {
                    productVariantId: id,
                    quantity: draftItems[id] ?? item.quantity
                };
            });

        try {
            await updateComboItemsMutation.mutateAsync({ 
                id: childId, 
                items: itemsUpdate 
            });
            toast.success("Item removed from combo structure.");
        } catch (error) {
            console.error("Deletion failed:", error);
        } finally {
            setDeleteItemKey(null);
        }
    };

    // ── Render Helpers ───────────────────────────────
    if (isLoading && !detail) {
        return (
            <div className="p-8 space-y-4">
                <Skeleton className="h-6 w-1/3 bg-slate-100" />
                <Skeleton className="h-14 w-full bg-slate-100/50 rounded-xl" />
                <Skeleton className="h-14 w-full bg-slate-100/50 rounded-xl" />
                <Skeleton className="h-32 w-full bg-slate-100/30 rounded-2xl" />
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-100">
                <ShoppingBag className="h-10 w-10 text-gray-200 mb-3" />
                <p className="text-sm text-gray-400 font-medium">No constituent components found for: <br /><span className="text-gray-600 font-bold">{childName}</span></p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Items Table */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden ring-1 ring-slate-200/40">
                <div className={cn(
                    "grid grid-cols-[1fr_120px_120px_60px] gap-4 px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100",
                    isDense && "px-4 py-2"
                )}>
                    <div>Component Description</div>
                    <div className="text-right">Unit Value</div>
                    <div className="text-center">Quantity</div>
                    <div className="text-right">Action</div>
                </div>
                <div className="divide-y divide-slate-50">
                    {items.map((item, i) => {
                        const itemKey = item.variantId || item.productId || `fallback-${i}`;
                        return (
                            <ComboVariantRow
                                key={itemKey}
                                item={{
                                    ...item,
                                    quantity: draftItems[itemKey] ?? item.quantity
                                }}
                                onQuantityChange={handleQuantityChange}
                                onDelete={handleDeleteItem}
                                isLoading={updateComboMutation.isPending}
                                isDense={isDense}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Change Notice - Always show if mismatched */}
            {hasMismatch && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-1 flex flex-col gap-2 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 shadow-sm"
                >
                    <div className="flex items-start gap-2.5">
                        <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <Calculator className="h-3 w-3 text-amber-600" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-tight">
                                Important Notice: Price Mismatch Detected
                            </p>
                            <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                                You have modified the components or quantities of this combo. 
                                <span className="block mt-1 font-bold text-amber-900 border-t border-amber-200/50 pt-1">
                                    Note: Please adjust the sale price accordingly (or click "Match") before applying changes.
                                </span>
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Compact Pricing Panel */}
            <div className={cn(
                "relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden",
                isDirty
                    ? "border-primary-500/30 shadow-md ring-1 ring-primary-500/5"
                    : "border-slate-200/60 shadow-sm"
            )}>

                <div className="p-5 md:px-6 md:py-4 flex flex-col md:flex-row items-center justify-between gap-5">

                    {/* Left: Info */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Calculator className={cn("h-4 w-4", isDirty ? "text-primary-500" : "text-slate-400")} />
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pricing</span>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="space-y-0.5">
                                <p className="text-[9px] text-slate-400 font-bold uppercase">Sum</p>
                                <div className="text-sm font-bold text-slate-800 tabular-nums">
                                    {formatPrice(theoreticalValue)}
                                </div>
                            </div>
                            <div className="h-6 w-px bg-slate-100 hidden sm:block" />
                            <div className="space-y-0.5">
                                <p className="text-[9px] text-primary-500/70 font-bold uppercase">Current</p>
                                <div className="text-sm font-bold text-primary-600 tabular-nums">
                                    {formatPrice(detail?.salePrice || 0)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative group flex-1 md:w-48">
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 z-10">
                                VNĐ
                            </div>
                            <Input
                                type="text"
                                value={formatNumber(draftSalePrice ?? '')}
                                onChange={e => setDraftSalePrice(unformatNumber(e.target.value))}
                                className="pl-4 pr-24 h-9 bg-slate-50/50 border-slate-200 rounded-lg font-bold text-sm focus:bg-white transition-all focus:border-primary-500"
                                placeholder="0"
                            />
                            <button
                                onClick={() => setDraftSalePrice(theoreticalValue)}
                                className="absolute right-10 top-1/2 -translate-y-1/2 h-6 px-2 text-[8px] font-bold uppercase bg-white border border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-200 rounded transition-colors"
                            >
                                Match
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            {isDirty && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleReset}
                                    className="h-9 px-3 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                            <Button
                                onClick={handleSaveAll}
                                disabled={updateComboItemsMutation.isPending || !canApply}
                                size="sm"
                                className={cn(
                                    "h-9 px-5 rounded-lg font-bold uppercase text-[10px] tracking-wider transition-all",
                                    canApply
                                        ? "bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
                                        : "bg-slate-100 text-slate-400"
                                )}
                            >
                                {updateComboMutation.isPending ? "Syncing..." : "Apply Changes"}
                            </Button>
                        </div>
                    </div>
                </div>

            {/* Dynamic Progress Bar (Only show when saving) */}
            <AnimatePresence>
                {updateComboMutation.isPending && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 2, opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="w-full bg-slate-100 overflow-hidden relative"
                    >
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{
                                duration: 1.5,
                                ease: "easeInOut",
                            }}
                            className="h-full bg-primary-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2 animate-[shimmer_1.5s_infinite] -translate-x-full" />
                    </motion.div>
                )}
            </AnimatePresence>
            </div>

            <ConfirmDialog
                open={!!deleteItemKey}
                onOpenChange={(open) => !open && setDeleteItemKey(null)}
                title="Remove Component?"
                description="Are you sure you want to remove this product from the combo variant structure? This will synchronize with the server immediately."
                onConfirm={confirmDelete}
                confirmText="Remove Component"
                variant="danger"
                isLoading={updateComboItemsMutation.isPending}
            />
        </div>
    );
}

export default memo(ChildComboItems);

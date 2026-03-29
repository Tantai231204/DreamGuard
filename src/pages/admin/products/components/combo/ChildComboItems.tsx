import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Calculator, X } from 'lucide-react';
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

export default function ChildComboItems({
    childId,
    childName,
    parentChildData,
    isDense = false
}: ChildComboItemsProps) {
    const { data: detail, isLoading } = useComboDetail(childId, true);
    const updateComboMutation = useUpdateCombo();
    const updateComboItemsMutation = useUpdateComboItems();

    // ── Local State For Batch Updates ──────────────────
    const [draftItems, setDraftItems] = useState<Record<string, number>>({});
    const [draftSalePrice, setDraftSalePrice] = useState<number | null>(null);
    const [initializedId, setInitializedId] = useState<string | null>(null);
    const [hasFullDetail, setHasFullDetail] = useState(false);

    // Sync state during render (React handles this safely if it's conditional)
    // This avoids useEffect cascading renders and is the recommended way to sync props to state.
    if (childId !== initializedId || (detail && !hasFullDetail)) {
        const source = detail || parentChildData;
        if (source) {
            const itemMap: Record<string, number> = {};
            if (detail) {
                detail.items?.forEach(i => {
                    const id = i.variantId || i.productId || '';
                    itemMap[id] = i.quantity;
                });
                setHasFullDetail(true);
            } else if (parentChildData) {
                parentChildData.items?.forEach(i => {
                    const id = i.variantId || i.productId;
                    itemMap[id] = i.quantity;
                });
                setHasFullDetail(false);
            }

            setDraftItems(itemMap);
            setDraftSalePrice(source.salePrice);
            setInitializedId(childId);
        }
    }

    // ── Calculations ─────────────────────────────────
    const items = useMemo(() => toComboItems(detail || parentChildData) as RichComboItem[], [detail, parentChildData]);

    const theoreticalValue = useMemo(() => {
        return items.reduce((sum, item) => {
            const qty = draftItems[item.productId] ?? item.quantity;
            const price = item.salePrice || 0;
            return sum + price * qty;
        }, 0);
    }, [items, draftItems]);

    // Senior UX: Sync draftSalePrice with theoretical sum during render (no useEffect needed)
    const [prevTheoreticalValue, setPrevTheoreticalValue] = useState(theoreticalValue);
    if (theoreticalValue !== prevTheoreticalValue) {
        setPrevTheoreticalValue(theoreticalValue);
        // Only auto-sync if it was already in a "matched" state (no discount)
        if (draftSalePrice === prevTheoreticalValue || (draftSalePrice === null && detail?.salePrice === prevTheoreticalValue)) {
            setDraftSalePrice(theoreticalValue);
        }
    }

    const isDirty = useMemo(() => {
        if (!detail) return false;

        // Check items
        const itemsChanged = detail.items?.some(i => {
             const id = i.variantId || i.productId || '';
             return draftItems[id] !== i.quantity;
        });
        if (itemsChanged) return true;

        // Check price
        if (draftSalePrice !== detail.salePrice) return true;

        return false;
    }, [detail, draftItems, draftSalePrice]);

    // ── Handlers ─────────────────────────────────────
    const handleQuantityChange = (itemKey: string, newQty: number) => {
        const [pId] = itemKey.split('|');
        setDraftItems(prev => ({ ...prev, [pId]: Math.max(1, newQty) }));
    };

    const handleReset = () => {
        if (!detail) return;
        const itemMap: Record<string, number> = {};
        detail.items?.forEach(i => {
            const id = i.variantId || i.productId || '';
            itemMap[id] = i.quantity;
        });
        setDraftItems(itemMap);
        setDraftSalePrice(detail.salePrice);
    };

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
        if (!detail || !confirm('Remove this item from combo?')) return;
        const [pId] = itemKey.split('|');

        const updatedItems = detail.items?.filter(i => {
             const id = i.variantId || i.productId || '';
             return id !== pId;
        }) || [];

        const itemsUpdate = updatedItems.map(i => {
            const id = i.variantId || i.productId || '';
            return {
                productVariantId: id,
                quantity: draftItems[id] ?? i.quantity
            };
        });

        await updateComboMutation.mutateAsync({
            id: childId,
            data: {
                name: detail.name,
                slug: detail.slug,
                ageGroup: detail.ageGroup ?? 0,
                color: detail.color,
                size: detail.size,
                basePrice: detail.basePrice,
                description: detail.description,
                imageUrl: detail.imageUrl,
                imagePublicId: detail.imagePublicId,
                status: detail.status,
                comboParentId: detail.comboParentId ?? undefined,
                salePrice: draftSalePrice ?? detail.salePrice,
                items: itemsUpdate
            }
        });
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
                    {items.map((item, i) => (
                        <ComboVariantRow
                            key={`${item.productId}|${item.variantId ?? i}`}
                            item={{
                                ...item,
                                quantity: draftItems[item.productId] ?? item.quantity
                            }}
                            onQuantityChange={handleQuantityChange}
                            onDelete={handleDeleteItem}
                            isLoading={updateComboMutation.isPending}
                            isDense={isDense}
                        />
                    ))}
                </div>
            </div>

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
                                disabled={updateComboMutation.isPending || !isDirty}
                                size="sm"
                                className={cn(
                                    "h-9 px-5 rounded-lg font-bold uppercase text-[10px] tracking-wider transition-all",
                                    isDirty
                                        ? "bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
                                        : "bg-slate-100 text-slate-400"
                                )}
                            >
                                {updateComboMutation.isPending ? "Syncing..." : "Apply Changes"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Dynamic Progress Bar */}
                <AnimatePresence>
                    {(isDirty || updateComboMutation.isPending) && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 2, opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-full bg-slate-100 overflow-hidden relative"
                        >
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{
                                    width: updateComboMutation.isPending ? "85%" : (isDirty ? "33%" : "100%")
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 50,
                                    damping: 15,
                                    restDelta: 0.01
                                }}
                                className="h-full bg-primary-500"
                            />
                            {updateComboMutation.isPending && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2 animate-[shimmer_1.5s_infinite] -translate-x-full" />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

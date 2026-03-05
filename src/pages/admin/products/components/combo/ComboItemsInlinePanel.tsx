import { motion } from 'framer-motion';
import { Package, ShoppingBag } from 'lucide-react';
import { useComboDetail } from '@/hooks/queries/useCombo';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { Combo } from '../../types';

interface ComboItemsInlinePanelProps {
    combo: Combo;
    colSpan: number;
}

/**
 * Inline expanded panel that shows the productItems of a combo variant row.
 * Rendered as a full-width table row beneath a variant (child combo) sub-row.
 */
export default function ComboItemsInlinePanel({ combo, colSpan }: ComboItemsInlinePanelProps) {
    const { data: detail, isLoading, isError } = useComboDetail(combo.id);

    const items = detail?.productItems ?? combo.productItems ?? [];

    if (isLoading) {
        return (
            <tr>
                <td colSpan={colSpan} className="p-0">
                    <div className="bg-indigo-50/40 border-t border-b border-indigo-100 px-10 py-6 space-y-3">
                        <Skeleton className="h-5 w-48 bg-indigo-100 rounded" />
                        <Skeleton className="h-12 w-full bg-indigo-100/60 rounded-xl" />
                        <Skeleton className="h-12 w-full bg-indigo-100/60 rounded-xl" />
                    </div>
                </td>
            </tr>
        );
    }

    if (isError && !items.length) {
        return (
            <tr>
                <td colSpan={colSpan} className="p-0">
                    <div className="bg-red-50/30 border-t border-b border-red-100 px-10 py-5 text-sm text-red-500">
                        Failed to load items for this variant.
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <tr>
            <td colSpan={colSpan} className="p-0">
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                >
                    <div className="bg-gradient-to-br from-indigo-50/60 to-violet-50/30 border-t border-b-2 border-indigo-100 px-10 py-6">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <ShoppingBag className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div>
                                <span className="text-[13px] font-bold text-indigo-800">
                                    Items in variant:{' '}
                                </span>
                                <span className="text-[13px] font-extrabold text-indigo-600">
                                    {combo.name}
                                </span>
                            </div>
                            <Badge
                                variant="outline"
                                className="text-[11px] bg-indigo-50 text-indigo-600 border-indigo-200 rounded-full"
                            >
                                {items.length} items
                            </Badge>
                            {combo.color && (
                                <Badge variant="outline" className="text-[11px] bg-violet-50 text-violet-700 border-violet-200">
                                    🎨 {combo.color}
                                </Badge>
                            )}
                            {combo.size && (
                                <Badge variant="outline" className="text-[11px] bg-slate-50 text-slate-600 border-slate-200">
                                    📐 {combo.size}
                                </Badge>
                            )}
                        </div>

                        {/* Items list */}
                        {items.length === 0 ? (
                            <div className="text-sm text-indigo-400 italic py-2">
                                No product items configured for this variant.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {items.map((item, idx) => {
                                    const key = (item as any).productVariantId ?? (item as any).id ?? idx;
                                    const price = (item as any).salePrice ?? (item as any).basePrice;
                                    return (
                                        <div
                                            key={key}
                                            className="flex items-center gap-4 bg-white rounded-xl border border-indigo-100 px-4 py-3 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group"
                                        >
                                            {/* Product Icon */}
                                            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                                <Package className="h-4 w-4 text-indigo-500" />
                                            </div>

                                            {/* Product Name */}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[13px] font-bold text-gray-800 truncate">
                                                    {(item as any).productName}
                                                </div>
                                                {(item as any).sku && (
                                                    <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                                                        SKU: {(item as any).sku}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quantity */}
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <span className="text-[11px] text-gray-400 font-medium">Qty:</span>
                                                <span className="inline-flex items-center justify-center h-7 px-3 rounded-lg bg-indigo-50 text-[13px] font-black text-indigo-700 min-w-[40px]">
                                                    {(item as any).quantity}
                                                </span>
                                            </div>

                                            {/* Price */}
                                            {price != null && (
                                                <div className="text-right flex-shrink-0 min-w-[90px]">
                                                    <div className="text-[13px] font-bold text-violet-700">
                                                        {price.toLocaleString('en-US')}₫
                                                    </div>
                                                    {(item as any).basePrice && (item as any).salePrice && (item as any).salePrice < (item as any).basePrice && (
                                                        <div className="text-[10px] line-through text-gray-400">
                                                            {(item as any).basePrice.toLocaleString('en-US')}₫
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Footer summary */}
                        <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center gap-4 text-[12px] text-indigo-400">
                            <span>
                                Total product types:{' '}
                                <span className="font-bold text-indigo-700">{items.length}</span>
                            </span>
                            <span className="text-indigo-200">|</span>
                            <span>
                                Total qty:{' '}
                                <span className="font-bold text-indigo-700">
                                    {items.reduce((sum, i) => sum + ((i as any).quantity ?? 0), 0)}
                                </span>
                            </span>
                            {combo.basePrice && (
                                <>
                                    <span className="text-indigo-200">|</span>
                                    <span>
                                        Combo price:{' '}
                                        <span className="font-bold text-violet-700">
                                            {combo.basePrice.toLocaleString('en-US')}₫
                                        </span>
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            </td>
        </tr>
    );
}

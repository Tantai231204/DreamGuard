import { memo } from "react";
import { motion } from "framer-motion";
import { Star, Leaf, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Combo, RichComboItem } from "../../types";
import { formatPrice } from "@/lib/utils";

interface Props {
    combo: Combo;
    activeCombo: Combo | null;
    isLoading?: boolean;
    enrichedItems?: RichComboItem[];
    totalIndividualPrice: number;
    totalBundleSavings: number;
}

export const ComboInfo = memo(({
    combo,
    activeCombo,
    isLoading,
    enrichedItems,
    totalIndividualPrice,
    totalBundleSavings
}: Props) => {
    const current = activeCombo || combo;
    const discount = current.basePrice > current.salePrice
        ? Math.round(((current.basePrice - current.salePrice) / current.basePrice) * 100)
        : null;

    const items = enrichedItems && enrichedItems.length > 0
        ? enrichedItems
        : ((current.items || current.productItems || combo.items || combo.productItems || []) as RichComboItem[]);

    const savingsPercent = totalIndividualPrice > 0 && totalBundleSavings > 0
        ? Math.round((totalBundleSavings / totalIndividualPrice) * 100)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
        >
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-[#4988c4]/10 text-[#4988c4] border-0 px-2.5 py-0.5 text-[10px] font-bold tracking-wide rounded-md">
                    Bundle
                </Badge>
                {discount && (
                    <Badge className="bg-rose-500 text-white border-0 px-2.5 py-0.5 text-[10px] font-bold tracking-wide rounded-md">
                        -{discount}% OFF
                    </Badge>
                )}
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wide rounded-md">
                    <Leaf className="w-2.5 h-2.5 mr-1 inline" />
                    Organic Material
                </Badge>
                {current.ageGroup && (
                    <Badge className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wide rounded-md">
                        AGE: {current.ageGroup} MONTHS+
                    </Badge>
                )}
            </div>

            {/* Title */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight tracking-tight">
                    {combo.name}
                </h1>
                <p className="text-[12px] text-slate-400 font-medium mt-1">
                    Premium Sleep Collection Bundle
                </p>
            </div>

            {/* Rating & Meta */}
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${i < 5 ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-100"}`}
                            />
                        ))}
                    </div>
                    <span className="text-[12px] font-bold text-slate-800">5.0</span>
                    <span className="text-[11px] text-slate-400">(48 Reviews)</span>
                </div>
                <div className="h-3 w-px bg-slate-200" />
                <span className="text-[10px] text-slate-400 font-mono tracking-tight">
                    SKU: {current.sku || "N/A"}
                </span>
                <div className="h-3 w-px bg-slate-200" />
                <div className="flex items-center gap-1.5 text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">In Stock</span>
                </div>
            </div>

            {/* Price Block */}
            <div className="bg-slate-50 rounded-xl px-5 py-4 border border-slate-100 space-y-3">
                <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                        {formatPrice(current.salePrice)}
                    </span>
                    {current.basePrice > current.salePrice && (
                        <span className="text-base text-slate-400 line-through font-medium">
                            {formatPrice(current.basePrice)}
                        </span>
                    )}
                </div>
                {totalBundleSavings > 0 && (
                    <div className="flex items-center gap-2 bg-[#4988c4]/5 border border-[#4988c4]/10 rounded-lg px-3 py-2">
                        <span className="text-[11px] font-bold text-[#4988c4]">
                            Save {formatPrice(totalBundleSavings)} compared to buying separately
                        </span>
                    </div>
                )}
                <p className="text-[11px] text-slate-400">
                    Tax included · Free shipping on bundle orders
                </p>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-500 leading-relaxed">
                {combo.description || "The ultimate premium bundle designed for maximum comfort and style."}
            </p>

            {/* ===== BUNDLE ITEMS — Simple & Clear Value Comparison ===== */}
            {(items.length > 0 || isLoading) && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-slate-900 px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-white/70" />
                            <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                                What's in the box
                            </span>
                        </div>
                        <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
                            {items.length} items
                        </span>
                    </div>

                    {/* Item List */}
                    <div className="divide-y divide-slate-100">
                        {isLoading ? (
                            [...Array(2)].map((_, i) => (
                                <div key={i} className="px-5 py-4 flex items-center gap-4">
                                    <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-2/3 rounded" />
                                        <Skeleton className="h-3 w-1/3 rounded" />
                                    </div>
                                    <Skeleton className="h-4 w-20 rounded" />
                                </div>
                            ))
                        ) : (
                            items.map((item, i) => {
                                const itemPrice = item.enrichedDetail?.salePrice || item.salePrice || 0;
                                return (
                                    <div key={i} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                                        {/* Thumbnail */}
                                        <div className="relative w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 shrink-0">
                                            <img
                                                src={item.imageUrl || "/images/placeholder-product.svg"}
                                                alt={item.productName}
                                                className="w-full h-full object-contain"
                                            />
                                            {item.quantity > 1 && (
                                                <div className="absolute -top-1 -right-1 bg-[#4988c4] text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                                                    {item.quantity}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-semibold text-slate-800 truncate">
                                                {item.productName}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                {item.quantity > 1 ? `${item.quantity} × ` : ""}
                                                {item.enrichedDetail?.size || "Standard"}
                                            </p>
                                        </div>

                                        {/* Price */}
                                        {itemPrice > 0 && (
                                            <span className="text-[12px] font-bold text-slate-400 shrink-0">
                                                {formatPrice(itemPrice * item.quantity)}
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer — Savings Summary */}
                    {totalIndividualPrice > 0 && (
                        <div className="border-t-2 border-dashed border-slate-200 bg-slate-50 px-5 py-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-slate-400 font-medium">If purchased separately</span>
                                <span className="text-[13px] text-slate-400 line-through font-medium">
                                    {formatPrice(totalIndividualPrice)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[12px] font-bold text-[#4988c4]">Bundle price</span>
                                <span className="text-[15px] font-black text-[#4988c4]">
                                    {formatPrice(current.salePrice)}
                                </span>
                            </div>
                            {totalBundleSavings > 0 && (
                                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                                    <span className="text-[12px] font-bold text-emerald-600">You save</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[14px] font-black text-emerald-600">
                                            {formatPrice(totalBundleSavings)}
                                        </span>
                                        <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                                            -{savingsPercent}%
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
});

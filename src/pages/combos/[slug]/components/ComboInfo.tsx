import { motion } from "framer-motion";
import { Star, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Combo } from "../../types";
import { formatPrice } from "@/lib/utils";

interface Props {
    combo: Combo;
    activeCombo: Combo | null;
}

export const ComboInfo = ({ combo, activeCombo }: Props) => {
    const current = activeCombo || combo;
    const discount = current.basePrice > current.salePrice
        ? Math.round(((current.basePrice - current.salePrice) / current.basePrice) * 100)
        : null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
        >
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-slate-100 text-slate-600 border-0 px-2.5 py-0.5 text-[10px] font-bold tracking-wide rounded-md">
                    Bundle
                </Badge>
                {current.isNew && (
                    <Badge className="bg-[#4988c4] text-white border-0 px-2.5 py-0.5 text-[10px] font-bold tracking-wide rounded-md">
                        Exclusive
                    </Badge>
                )}
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
                    <Badge className="bg-amber-50/80 text-amber-700 border border-amber-200/50 px-2.5 py-1 text-[10px] font-black tracking-wider rounded-lg flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
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
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        In Stock
                    </span>
                </div>
            </div>

            {/* Price Block - Match ProductInfo Original */}
            <div className="bg-slate-50 rounded-xl px-5 py-4 border border-slate-100 space-y-2">
                <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                        {formatPrice(current.salePrice)}
                    </span>
                    {current.basePrice > current.salePrice && (
                        <span className="text-lg text-slate-400 line-through font-medium">
                            {formatPrice(current.basePrice)}
                        </span>
                    )}
                    {current.basePrice > current.salePrice && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            Save {formatPrice(current.basePrice - current.salePrice)} with bundle
                        </span>
                    )}
                </div>
                <p className="text-[11px] text-slate-400">
                    Tax included · Free shipping on bundle orders
                </p>
            </div>

            {/* Summary */}
            <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-[#4988c4]/20 pl-4 py-1">
                {combo.description || "The ultimate premium bundle designed for maximum comfort and style. Includes multiple high-quality items for your little one."}
            </p>
        </motion.div>
    );
};

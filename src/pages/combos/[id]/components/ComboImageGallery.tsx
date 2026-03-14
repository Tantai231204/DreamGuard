import { motion, AnimatePresence } from "framer-motion";
import { Heart, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Combo } from "../../types";

interface Props {
    combo: Combo;
    activeCombo: Combo | null;
    isWishlisted: boolean;
    onToggleWishlist: () => void;
}

const TRUST_FEATURES = [
    { icon: Truck, label: "Free Shipping", sub: "Orders over $50" },
    { icon: ShieldCheck, label: "Warranty", sub: "Included" },
    { icon: RotateCcw, label: "30-Day", sub: "Easy Returns" },
];

export const ComboImageGallery = ({ combo, activeCombo, isWishlisted, onToggleWishlist }: Props) => {
    const discountValue = activeCombo && activeCombo.basePrice > activeCombo.salePrice
        ? Math.round(((activeCombo.basePrice - activeCombo.salePrice) / activeCombo.basePrice) * 100)
        : null;

    return (
        <div className="space-y-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square rounded-[3rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-xl"
            >
                <AnimatePresence mode="wait">
                    <motion.img 
                        key={activeCombo?.imageUrl || combo.imageUrl}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        src={activeCombo?.imageUrl || combo.imageUrl || "/images/placeholder-product.svg"} 
                        alt={combo.name}
                        className="w-full h-full object-cover"
                    />
                </AnimatePresence>
                
                {discountValue && (
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="absolute top-8 left-8"
                    >
                        <Badge className="bg-rose-500 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg border-0">
                            -{discountValue}% OFF
                        </Badge>
                    </motion.div>
                )}

                <button 
                    onClick={onToggleWishlist}
                    className={cn(
                        "absolute top-8 right-8 h-12 w-12 rounded-2xl bg-white shadow-xl flex items-center justify-center transition-all active:scale-90",
                        isWishlisted ? "text-rose-500" : "text-slate-400 hover:text-slate-900"
                    )}
                >
                    <Heart className={cn("w-5 h-5 transition-transform duration-300", isWishlisted && "fill-current scale-110")} />
                </button>
            </motion.div>

            <div className="grid grid-cols-3 gap-4">
                {TRUST_FEATURES.map((f, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                        className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-2xl border border-slate-100/50 hover:bg-white hover:shadow-md transition-all duration-300"
                    >
                        <f.icon className="w-5 h-5 text-[#4988c4] mb-2" />
                        <p className="text-[10px] font-black uppercase text-slate-800 tracking-tight">{f.label}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{f.sub}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

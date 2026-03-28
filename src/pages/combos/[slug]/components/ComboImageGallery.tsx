import { motion, AnimatePresence } from "framer-motion";
import { Heart, Truck, ShieldCheck, RotateCcw, Share2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Combo } from "../../types";

interface Props {
    combo: Combo;
    activeCombo: Combo | null;
    isWishlisted: boolean;
    onToggleWishlist: () => void;
}

const TRUST_FEATURES = [
    { icon: Truck, label: "Free Shipping", sub: "Orders over 1.000.000 VNĐ" },
    { icon: ShieldCheck, label: "Warranty", sub: "Included" },
    { icon: RotateCcw, label: "30-Day", sub: "Easy Returns" },
];

export const ComboImageGallery = ({ combo, activeCombo, isWishlisted, onToggleWishlist }: Props) => {
    const discountValue = activeCombo && activeCombo.basePrice > activeCombo.salePrice
        ? Math.round(((activeCombo.basePrice - activeCombo.salePrice) / activeCombo.basePrice) * 100)
        : null;

    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (navigator.share) {
            navigator.share({
                title: combo.name,
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    return (
        <div className="space-y-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden bg-white border-2 border-dashed border-[#4988c4]/30 group z-10 transition-colors hover:border-[#4988c4]/60"
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
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                </AnimatePresence>
                
                {/* Vibrant Modern Badge (Synced with Product) */}
                {discountValue && (
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="absolute top-10 left-8 z-20"
                    >
                        <div className="flex items-center gap-2 bg-rose-600 text-white px-4 py-1.5 rounded-xl shadow-[0_8px_30px_rgba(225,29,72,0.3)] border-0">
                            <Sparkles className="h-3.5 w-3.5 fill-white text-white" />
                            <span className="text-[11px] font-black uppercase tracking-[0.15em]">-{discountValue}% OFF</span>
                        </div>
                    </motion.div>
                )}

                {/* Floating Action Group (TOP Layer) - SYNCED WITH PRODUCT STYLE */}
                <div className="absolute right-8 top-10 flex flex-col gap-3 z-30">
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleWishlist();
                        }}
                        className={cn(
                            "h-12 w-12 rounded-xl bg-white/95 shadow-[0_15px_45px_-5px_rgba(0,0,0,0.1)] border border-white/40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 backdrop-blur-2xl group/fav ring-4 ring-white/10",
                            isWishlisted ? "text-rose-500 scale-105 ring-rose-500/10" : "text-slate-400 hover:text-rose-500"
                        )}
                    >
                        <Heart className={cn("w-5 h-5 transition-transform duration-300 group-hover/fav:scale-110", isWishlisted && "fill-current")} />
                    </button>
                    <button 
                        onClick={handleShare}
                        className="h-12 w-12 rounded-xl bg-white/95 shadow-[0_15px_45px_-5px_rgba(0,0,0,0.1)] border border-white/40 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all duration-300 hover:scale-110 active:scale-90 backdrop-blur-2xl group/share ring-4 ring-white/10"
                    >
                        <Share2 className="h-5 w-5 transition-transform group-hover/share:rotate-12" />
                    </button>
                </div>
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

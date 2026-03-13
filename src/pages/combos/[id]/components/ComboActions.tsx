import { Minus, Plus, ShoppingCart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { Combo } from "../../types";

interface Props {
    combo: Combo;
    activeCombo: Combo | null;
    quantity: number;
    setQuantity: (q: number) => void;
    onAddToCart: () => void;
}

export const ComboActions = ({ combo, activeCombo, quantity, setQuantity, onAddToCart }: Props) => {
    const handleQuantity = (delta: number) => {
        setQuantity(Math.max(1, quantity + delta));
    };

    const isOutOfStock = (activeCombo || combo).stock === 0;

    return (
        <section className="space-y-10 pt-4">
            {/* Quantity Selector Style Sync */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Quantity</span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">
                        <span>Pack ready for shipping</span>
                    </div>
                </div>

                <div className="inline-flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-100 shadow-sm transition-all hover:border-slate-200">
                    <button
                        onClick={() => handleQuantity(-1)}
                        disabled={quantity <= 1}
                        className="flex h-10 w-10 items-center justify-center rounded-xl transition-all text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-sm disabled:opacity-30"
                    >
                        <Minus className="h-4 w-4 stroke-[2.5]" />
                    </button>

                    <div className="relative flex h-10 w-14 items-center justify-center overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={quantity}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -10, opacity: 0 }}
                                className="text-lg font-black text-slate-900 tabular-nums"
                            >
                                {quantity}
                            </motion.span>
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={() => handleQuantity(1)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl transition-all text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                    >
                        <Plus className="h-4 w-4 stroke-[2.5]" />
                    </button>
                </div>
            </div>

            {/* SYNCED "ADD TO CART" BUTTON */}
            <div className="flex flex-col gap-4">
                <Button
                    size="lg"
                    disabled={isOutOfStock}
                    onClick={onAddToCart}
                    className={cn(
                        "relative w-full h-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.22em] transition-all duration-300 active:scale-[0.98] group overflow-hidden",
                        isOutOfStock
                            ? "bg-slate-100 text-slate-400 border border-slate-100 cursor-not-allowed"
                            : "bg-[#4988c4] text-white shadow-[0_10px_30px_-10px_rgba(73,136,196,0.5)] hover:shadow-[0_20px_40px_-12px_rgba(73,136,196,0.6)] hover:-translate-y-0.5 border-0"
                    )}
                >
                    {/* Gloss Effect */}
                    {!isOutOfStock && (
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    )}

                    <span className="flex items-center gap-4 relative z-10">
                        <ShoppingCart className="h-5 w-5 transition-transform group-hover:-rotate-12" />
                        {isOutOfStock ? "Bundle Sold Out" : "Add Bundle to Cart"}
                    </span>
                </Button>

                <button className="flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                    <Share2 className="w-4 h-4" />
                    Share this exclusive bundle
                </button>
            </div>
        </section>
    );
};

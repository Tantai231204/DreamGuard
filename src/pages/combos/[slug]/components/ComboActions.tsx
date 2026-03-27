import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Combo } from "../../types";
import { QuantitySelector } from "../../../products/[slug]/components/QuantitySelector";

interface Props {
    combo: Combo;
    activeCombo: Combo | null;
    quantity: number;
    setQuantity: (q: number) => void;
    onAddToCart: () => void;
}

export const ComboActions = ({ combo, activeCombo, quantity, setQuantity, onAddToCart }: Props) => {
    const isOutOfStock = (activeCombo || combo).stock === 0;

    return (
        <section className="space-y-10 pt-4 border-t border-slate-100">
            {/* Quantity Selector Style Sync */}
            <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                stockLeft={(activeCombo || combo).stock ?? undefined}
            />

            {/* SYNCED "ADD TO CART" BUTTON (Clean CTA Style) */}
            <div className="flex flex-col gap-4">
                <Button
                    variant={isOutOfStock ? "secondary" : "premium"}
                    disabled={isOutOfStock}
                    onClick={onAddToCart}
                    className={cn(
                        "w-full h-14 font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all duration-300 relative group overflow-hidden",
                        isOutOfStock
                            ? "bg-slate-100 text-slate-400 border-0 cursor-not-allowed"
                            : "shadow-blue-500/10 hover:shadow-blue-500/20"
                    )}
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="relative z-10 flex items-center justify-center gap-3">
                        <ShoppingCart className="h-5 w-5 transition-transform group-hover:-rotate-12" />
                        {isOutOfStock ? "Sold Out" : "Add to Cart"}
                    </span>
                </Button>
            </div>
        </section>
    );
};

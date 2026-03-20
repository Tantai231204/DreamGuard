import { useState, useEffect } from "react";
import {
  Check, Minus, Plus, ChevronLeft, ChevronRight,
  BedDouble, Layers, SquareStack, CloudSun, Baby, Car, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { productTypes, getProductTierPrice } from "../../../data";
import { useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";
import type { BookingFormValues } from "../schema";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";

const iconMap: Record<string, typeof BedDouble> = {
  BedDouble, Layers, SquareStack, CloudSun, Baby, Car,
};

interface StepPackageProps {
  form: UseFormReturn<BookingFormValues>;
}

export default function StepPackage({ form }: StepPackageProps) {
  const { control } = form;
  const { fields, append, update } = useFieldArray({ control, name: "items" });
  const selectedProducts: string[] = useWatch({ control, name: "selectedProducts" }) ?? [];

  // Navigate between selected products (one at a time, no scroll)
  const [activeIdx, setActiveIdx] = useState(0);

  const products = productTypes.filter((p) => selectedProducts.includes(p.id));
  const currentProduct = products[Math.min(activeIdx, products.length - 1)];

  // Determine cartItem safely for pre-selection
  const cartItem = currentProduct ? fields.find((f) => f.itemType === currentProduct.id) : undefined;

  // Pre-select the featured tier when entering the product view
  useEffect(() => {
    if (currentProduct && !cartItem) {
      const featuredTier = currentProduct.tiers.find((t) => t.featured) || currentProduct.tiers[0];
      if (featuredTier) {
        append({ itemType: currentProduct.id, packageId: featuredTier.tierId, quantity: 1 });
      }
    }
  }, [currentProduct, cartItem, append]);

  if (!currentProduct || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm font-bold text-slate-400">No products selected. Please go back and choose items.</p>
      </div>
    );
  }

  const safeIdx = Math.min(activeIdx, products.length - 1);
  const product = products[safeIdx];
  const Icon = iconMap[product.icon] || BedDouble;


  function selectTier(tierId: string) {
    const idx = fields.findIndex((f) => f.itemType === product.id);
    if (idx >= 0) {
      if (fields[idx].packageId === tierId) return; // already selected
      update(idx, { itemType: product.id, packageId: tierId, quantity: fields[idx].quantity });
    } else {
      append({ itemType: product.id, packageId: tierId, quantity: 1 });
    }

    // Auto-advance to next unconfigured product
    setTimeout(() => {
      // Re-evaluate fields state after update
      const currentValues = form.getValues("items") || [];
      const nextUnconfiguredIdx = products.findIndex(p => !currentValues.some(f => f.itemType === p.id));
      if (nextUnconfiguredIdx >= 0 && nextUnconfiguredIdx !== safeIdx) {
        setActiveIdx(nextUnconfiguredIdx);
      }
    }, 400); // Wait for animations
  }

  function changeQty(delta: number) {
    const idx = fields.findIndex((f) => f.itemType === product.id);
    if (idx < 0) return;
    const newQty = Math.max(1, fields[idx].quantity + delta);
    update(idx, { ...fields[idx], quantity: newQty });
  }

  const getBadgeStyles = (badge: string, isSelected: boolean) => {
    const t = badge.toLowerCase();
    if (t.includes("popular")) {
      return isSelected ? "bg-[#4988c4] text-white" : "bg-slate-800 text-white";
    }
    if (t.includes("value") || t.includes("best")) {
      return isSelected ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-800";
    }
    // Fallback
    return isSelected ? "bg-[#4988c4] text-white" : "bg-slate-200 text-slate-600";
  };

  // Total across all items
  const total = fields.reduce((sum, f) => {
    return sum + getProductTierPrice(f.itemType, f.packageId) * f.quantity;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#4988c4]/10 text-[#4988c4] border border-[#4988c4]/20 text-[9px] font-black uppercase tracking-widest">
          Step 02
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          Select Cleaning Level
        </h3>
        <p className="text-sm text-slate-500 font-medium tracking-wide">
          Select a depth of cleaning for your product.
        </p>
      </div>

      {/* Product Navigator — pill tabs */}
      {products.length > 1 && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={safeIdx === 0}
            onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
            className="h-8 w-8 p-0 rounded-lg border border-slate-100 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1 flex items-center gap-2 overflow-x-auto px-1 py-1 no-scrollbar">
            {products.map((p, i) => {
              const PIcon = iconMap[p.icon] || BedDouble;
              const isActive = i === safeIdx;
              const hasItem = fields.some((f) => f.itemType === p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shadow-sm
                    ${isActive
                      ? "border-[#4988c4] bg-[#4988c4] text-white shadow-md shadow-[#4988c4]/15"
                      : hasItem
                        ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                        : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                    }
                  `}
                >
                  <PIcon className={`h-4 w-4 ${isActive ? "text-white" : "text-[#4988c4]"}`} />
                  {p.label}
                  {hasItem && <Check className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-emerald-500"}`} strokeWidth={3} />}
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={safeIdx === products.length - 1}
            onClick={() => setActiveIdx((i) => Math.min(products.length - 1, i + 1))}
            className="h-8 w-8 p-0 rounded-lg border border-slate-100 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Current Product Header */}
      <AnimatePresence mode="wait">
        <motion.div
          key={product.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 bg-slate-50/30">
            <div className="h-11 w-11 rounded-xl bg-[#4988c4] text-white flex items-center justify-center shadow-md shadow-[#4988c4]/20">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-slate-900 tracking-tight">{product.label}</h4>
              <p className="text-[11px] text-slate-500 font-medium truncate">{product.description}</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#4988c4] bg-[#4988c4]/10 border border-[#4988c4]/20 rounded-lg px-2.5 py-1 flex-shrink-0">
              {safeIdx + 1} / {products.length}
            </span>
          </div>

          {/* Tier Cards - Horizontal scroll snap on mobile */}
          <div className="flex sm:grid sm:grid-cols-3 gap-3 overflow-x-auto snap-x snap-mandatory pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
            {product.tiers.map((tier) => {
              const isTierSelected = cartItem?.packageId === tier.tierId;

              return (
                <button
                  key={tier.tierId}
                  type="button"
                  onClick={() => selectTier(tier.tierId)}
                  className={`group relative flex flex-col p-5 rounded-[20px] border-2 transition-all duration-300 text-left flex-shrink-0 w-[85%] sm:w-auto snap-center overflow-hidden
                    ${isTierSelected
                      ? "border-[#4988c4]/40 bg-blue-50/40 shadow-lg shadow-[#4988c4]/10"
                      : "border-slate-100 bg-white hover:shadow-xl hover:shadow-slate-200/60"
                    }
                  `}
                  style={!isTierSelected ? { boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" } : undefined}
                >
                  {/* Accent stripe */}
                  <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 ${isTierSelected ? "bg-[#4988c4]" : "bg-slate-200 group-hover:bg-[#4988c4]/40"}`} />

                  {/* Corner Badge */}
                  {tier.badge && (
                    <div className="absolute top-0 right-0 z-10">
                      <div className={`text-[9px] font-black px-3.5 py-1.5 rounded-bl-[16px] shadow-sm flex items-center gap-1 uppercase tracking-widest leading-none transition-colors duration-300 ${getBadgeStyles(tier.badge, isTierSelected)}`}>
                        <Star className="h-2.5 w-2.5 fill-current" />
                        <span>{tier.badge}</span>
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-2 pt-1 border-b border-transparent">
                    <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
                      ${isTierSelected
                        ? "bg-[#4988c4] border-[#4988c4]"
                        : "bg-white border-slate-200 group-hover:border-[#4988c4]/40"
                      }
                    `}>
                      <Check className={`h-2.5 w-2.5 ${isTierSelected ? "text-white" : "text-transparent"}`} strokeWidth={3} />
                    </span>
                    <span className={`text-base font-black tracking-tight ${isTierSelected ? "text-[#4988c4]" : "text-slate-800"}`}>
                      {tier.name}
                    </span>
                  </div>

                  {/* Price */}
                  <p className={`text-xl font-black tracking-tighter mb-1.5 ${isTierSelected ? "text-[#4988c4]" : "text-slate-900"}`}>
                    {formatPrice(tier.price)}
                  </p>
                  <p className={`text-[11px] font-medium leading-relaxed mb-4 ${isTierSelected ? "text-[#4988c4]/80" : "text-slate-500"}`}>
                    {tier.description}
                  </p>

                  {/* Features list */}
                  <ul className="space-y-2 mt-auto pt-3 border-t border-slate-50/80">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[11px] font-bold text-slate-600">
                        <Check className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${isTierSelected ? "text-[#4988c4]" : "text-slate-400"}`} />
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {/* Tier Comparison Button & Modal */}
          {product.tiers.length > 1 && (
            <div className="flex justify-center sm:justify-end py-2">
              <Dialog>
                <DialogTrigger asChild>
                  <button type="button" className="text-[11px] font-black text-slate-500 hover:text-[#4988c4] flex items-center gap-1.5 uppercase tracking-widest transition-colors hover:underline underline-offset-4">
                    <Check className="h-3.5 w-3.5 border border-slate-300 rounded-sm p-0.5" /> Compare Tiers Side-by-Side
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden border-2 border-slate-100 rounded-[28px]">
                  <DialogHeader className="p-6 bg-slate-50/50 border-b border-slate-100">
                    <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Compare Service Tiers</DialogTitle>
                    <DialogDescription className="text-sm font-medium text-slate-500 mt-1">
                      See what's included in each cleaning level for <span className="font-bold text-slate-700">{product.label}</span>.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 max-h-[70vh] overflow-y-auto">
                    {product.tiers.map((t) => (
                      <div key={t.tierId} className="p-6 flex flex-col bg-white">
                        <div className="mb-4">
                          {t.badge && <span className={`inline-block mb-3 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${t.featured ? "text-white bg-[#4988c4]" : "text-amber-700 bg-amber-100"}`}>{t.badge}</span>}
                          <h4 className="text-lg font-black text-slate-900 tracking-tight mb-1">{t.name}</h4>
                          <p className="text-2xl font-black text-[#4988c4] tracking-tighter mb-2">{formatPrice(t.price)}</p>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{t.description}</p>
                        </div>
                        <div className="pt-4 border-t border-slate-50/80 mt-auto">
                          <ul className="space-y-3">
                            {t.features.map(f => (
                              <li key={f} className="flex gap-2.5 text-xs font-bold text-slate-700 leading-tight">
                                <Check className="h-4 w-4 flex-shrink-0 text-emerald-500 mt-0.5" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Quantity controls */}
          {cartItem && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 rounded-2xl border-2 border-[#4988c4]/15 bg-[#4988c4]/[0.03]"
            >
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Qty</span>
                <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden h-10 shadow-sm shadow-slate-200/50">
                  <button
                    type="button"
                    onClick={() => changeQty(-1)}
                    className="px-4 hover:bg-slate-50 text-slate-600 h-full border-r border-slate-200 transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-6 text-sm font-black text-slate-900">{cartItem.quantity}</span>
                  <button
                    type="button"
                    onClick={() => changeQty(1)}
                    className="px-4 hover:bg-slate-50 text-slate-600 h-full border-l border-slate-200 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-[#4988c4] tracking-tight">
                  {formatPrice(getProductTierPrice(product.id, cartItem.packageId) * cartItem.quantity)}
                </p>
                <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                  {formatPrice(getProductTierPrice(product.id, cartItem.packageId))} / each
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Running Total */}
      {fields.length > 0 && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#4988c4] to-[#3a73a8] text-white shadow-xl shadow-[#4988c4]/15">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <Check className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
                {fields.length} {fields.length === 1 ? "service" : "services"} configured
              </p>
              <p className="text-xs font-bold text-white/80">
                {fields.map((f) => {
                  const p = productTypes.find((pt) => pt.id === f.itemType);
                  return `${p?.label || f.itemType} x${f.quantity}`;
                }).join(" · ")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/50">Subtotal</p>
            <p className="text-xl font-black tracking-tighter">{formatPrice(total)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

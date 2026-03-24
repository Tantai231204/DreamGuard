import { memo, useState, useEffect, useMemo, useCallback } from "react";
// ... existing imports ...
import {
  Check, Minus, Plus, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBookingData, type ProductType, type ServiceTier } from "../useBookingData";
import { useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";
import type { BookingFormValues } from "../schema";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { ProductAssetIcons, type ProductAssetIconKey } from "@/components/common/icons";

const packageStyles = {
  standard: {
    accent: 'bg-slate-800',
    border: 'border-slate-800',
    text: 'text-slate-800',
    icon: 'text-slate-800',
    shadow: 'shadow-slate-800/10',
    badge: 'bg-slate-800 text-white'
  },
  medium: {
    accent: 'bg-blue-600',
    border: 'border-blue-600',
    text: 'text-blue-700',
    icon: 'text-blue-600',
    shadow: 'shadow-blue-600/10',
    badge: 'bg-blue-600 text-white'
  },
  premium: {
    accent: 'bg-amber-500',
    border: 'border-amber-500',
    text: 'text-amber-700',
    icon: 'text-amber-600',
    shadow: 'shadow-amber-500/10',
    badge: 'bg-amber-500 text-white'
  },
  default: {
    accent: 'bg-emerald-600',
    border: 'border-emerald-600',
    text: 'text-emerald-700',
    icon: 'text-emerald-600',
    shadow: 'shadow-emerald-600/10',
    badge: 'bg-emerald-600 text-white'
  }
};

interface StepPackageProps {
  form: UseFormReturn<BookingFormValues>;
}

const StepPackage = memo(({ form }: StepPackageProps) => {
  const { control } = form;
  const { fields, append, update } = useFieldArray({ control, name: "items" });
  const selectedProductsForm = useWatch({ control, name: "selectedProducts" });
  const selectedProducts = useMemo(() => selectedProductsForm ?? [], [selectedProductsForm]);
  const { productTypes, getProductTierPrice } = useBookingData();

  const [activeIdx, setActiveIdx] = useState(0);

  const products = useMemo(() =>
    productTypes.filter((p: ProductType) => selectedProducts.includes(p.id)),
    [productTypes, selectedProducts]);

  const safeIdx = Math.min(activeIdx, Math.max(0, products.length - 1));
  const currentProduct = products[safeIdx];

  const cartItem = useMemo(() =>
    currentProduct ? fields.find((f) => f.itemType === currentProduct.id) : undefined,
    [currentProduct, fields]);

  useEffect(() => {
    if (currentProduct) {
      const items = form.getValues("items") || [];
      const hasItem = items.some((f) => f.itemType === currentProduct.id);

      if (!hasItem) {
        const featuredTier = currentProduct.tiers.find((t: ServiceTier) => t.featured) || currentProduct.tiers[0];
        if (featuredTier) {
          append({ itemType: currentProduct.id, packageId: featuredTier.tierId, quantity: 1 });
        }
      }
    }
  }, [currentProduct, append, form]);

  const product = currentProduct;
  const iconSrc = product ? (ProductAssetIcons[product.icon as ProductAssetIconKey] || ProductAssetIcons.PRODUCT_CATEGORIES) : ProductAssetIcons.PRODUCT_CATEGORIES;

  const selectTier = useCallback((tierId: string) => {
    if (!product) return;

    const idx = fields.findIndex((f) => f.itemType === product.id);
    if (idx >= 0) {
      if (fields[idx].packageId === tierId) return; 
      update(idx, { itemType: product.id, packageId: tierId, quantity: fields[idx].quantity });
    } else {
      append({ itemType: product.id, packageId: tierId, quantity: 1 });
    }

    requestAnimationFrame(() => {
      const currentValues = form.getValues("items") || [];
      const nextUnconfiguredIdx = products.findIndex((p: ProductType) =>
        !currentValues.some((f: { itemType: string }) => f.itemType === p.id) && p.id !== product.id
      );
      if (nextUnconfiguredIdx >= 0) {
        setActiveIdx(nextUnconfiguredIdx);
      }
    });
  }, [product, fields, update, append, form, products]);

  const changeQty = useCallback((delta: number) => {
    if (!product) return;
    const idx = fields.findIndex((f) => f.itemType === product.id);
    if (idx < 0) return;
    const newQty = Math.max(1, fields[idx].quantity + delta);
    update(idx, { ...fields[idx], quantity: newQty });
  }, [product, fields, update]);

  const total = useMemo(() => fields.reduce((sum, f) => {
    return sum + getProductTierPrice(f.itemType, f.packageId) * f.quantity;
  }, 0), [fields, getProductTierPrice]);

  if (!product || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm font-bold text-slate-400">No products selected. Please go back and choose items.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            {products.map((p: ProductType, i: number) => {
              const pIconSrc = ProductAssetIcons[p.icon as ProductAssetIconKey] || ProductAssetIcons.PRODUCT_CATEGORIES;
              const isActive = i === safeIdx;
              const hasItem = fields.some((f) => f.itemType === p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shadow-sm
                     ${isActive
                      ? "border-2 border-[#4988c4] bg-[#4988c4]/[0.04] text-[#4988c4] shadow-md shadow-[#4988c4]/8 scale-[1.02] z-10"
                      : hasItem
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300"
                        : "border border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                    }
                   `}
                >
                  <img src={pIconSrc} alt={p.label} className={`h-4 w-4 object-contain transition-all duration-300 ${isActive ? "scale-115 drop-shadow-sm" : "opacity-85 group-hover:opacity-100"}`} />
                  {p.label}
                  {hasItem && <Check className={`h-3.5 w-3.5 ${isActive ? "text-[#4988c4]" : "text-emerald-500"}`} strokeWidth={3} />}
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
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#4988c4]/[0.08] to-[#4988c4]/[0.15] border border-[#4988c4]/15 flex items-center justify-center shadow-md shadow-slate-100/50">
              <img src={iconSrc} alt={product.label} className="h-8 w-8 object-contain scale-110 flex-shrink-0 drop-shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-slate-900 tracking-tight">{product.label}</h4>
              <p className="text-[11px] text-slate-500 font-medium truncate">{product.description}</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#4988c4] bg-[#4988c4]/10 border border-[#4988c4]/20 rounded-lg px-2.5 py-1 flex-shrink-0">
              {safeIdx + 1} / {products.length}
            </span>
          </div>
          <div className={`flex sm:grid gap-8 overflow-x-auto snap-x snap-mandatory pb-8 sm:pb-4 pt-4 px-4 sm:px-2 no-scrollbar
            ${product.tiers.length === 1 ? "sm:grid-cols-1 max-w-[260px] mx-auto" :
              product.tiers.length === 2 ? "sm:grid-cols-2 max-w-[540px] mx-auto" : "sm:grid-cols-3 max-w-[820px] mx-auto"}
          `}>
            {product.tiers.map((tier: ServiceTier) => {
              const isTierSelected = cartItem?.packageId === tier.tierId;

              const style = (() => {
                const l = tier.name.toLowerCase().trim();
                if (l.includes('standard')) return packageStyles.standard;
                if (l.includes('medium')) return packageStyles.medium;
                if (l.includes('premium')) return packageStyles.premium;
                return packageStyles.default;
              })();

              return (
                <button
                  key={tier.tierId}
                  type="button"
                  onClick={() => selectTier(tier.tierId)}
                  className={`group relative flex flex-col p-5 rounded-2xl border-2 transition-all duration-300 text-left flex-shrink-0 w-[210px] sm:w-full snap-center min-h-[360px] outline-none overflow-hidden bg-white
                    ${isTierSelected
                      ? `${style.border} shadow-xl ${style.shadow} scale-[1.03] z-20`
                      : "border-slate-100 hover:border-slate-200 shadow-sm z-10 hover:-translate-y-1"
                    }
                  `}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-300 ${isTierSelected ? style.accent : "bg-transparent group-hover:bg-slate-100"}`} />

                  <div className="flex items-center justify-between mb-2 mt-0.5 relative z-10 w-full">
                    <span className={`text-[11px] font-black uppercase tracking-[0.1em] ${isTierSelected ? style.text : "text-slate-500"}`}>
                      {tier.name}
                    </span>
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center transition-all duration-300 ${isTierSelected ? style.accent + " shadow-sm scale-110" : "bg-slate-50 group-hover:bg-slate-100"}`}>
                      <Check className={`h-3 w-3 transition-all duration-300 ${isTierSelected ? "text-white" : "text-transparent group-hover:text-slate-400"}`} strokeWidth={4} />
                    </div>
                  </div>

                  <div className="mb-1 relative z-10">
                    <span className={`text-2xl font-black tracking-tight ${isTierSelected ? "text-slate-900" : "text-slate-800"}`}>
                      {formatPrice(tier.price)}
                    </span>
                  </div>

                  <p className={`text-[12px] font-semibold leading-relaxed mb-4 relative z-10 line-clamp-2 ${isTierSelected ? "text-slate-700" : "text-slate-500"}`}>
                    {tier.description}
                  </p>

                  <div className={`w-full h-[1px] mb-4 relative z-10 transition-colors duration-300 ${isTierSelected ? "bg-black/5" : "bg-slate-100"}`} />

                  <ul className="space-y-3 flex-1 w-full relative z-10">
                    {tier.features.map((f: string, idx: number) => (
                      <li key={`${tier.tierId}-${f}-${idx}`} className={`flex items-start gap-2.5 text-[12px] font-semibold leading-tight ${isTierSelected ? "text-slate-800" : "text-slate-600"}`}>
                        <div className="mt-0.5 rounded-full flex-shrink-0 flex items-center justify-center">
                          <Check className={`h-3.5 w-3.5 transition-colors duration-300 ${isTierSelected ? style.icon : "text-slate-300"}`} strokeWidth={3.5} />
                        </div>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

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
                    {product.tiers.map((t: ServiceTier) => (
                      <div key={t.tierId} className="p-6 flex flex-col bg-white">
                        <div className="mb-4">
                          {t.badge && <span className={`inline-block mb-3 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${t.featured ? "text-white bg-[#4988c4]" : "text-amber-700 bg-amber-100"}`}>{t.badge}</span>}
                          <h4 className="text-lg font-black text-slate-900 tracking-tight mb-1">{t.name}</h4>
                          <p className="text-2xl font-black text-[#4988c4] tracking-tighter mb-2">{formatPrice(t.price)}</p>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{t.description}</p>
                        </div>
                        <div className="pt-4 border-t border-slate-50/80 mt-auto">
                          <ul className="space-y-3">
                            {t.features.map((f: string, idx: number) => (
                              <li key={`${t.tierId}-${f}-${idx}`} className="flex gap-2.5 text-xs font-bold text-slate-700 leading-tight">
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
                {fields.map((f: { itemType: string, quantity: number }) => {
                  const p = productTypes.find((pt: ProductType) => pt.id === f.itemType);
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
});

export default StepPackage;

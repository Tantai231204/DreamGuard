import { memo, useState, useMemo, useCallback, useEffect } from "react";
import {
  Check, Minus, Plus, ChevronLeft, ChevronRight, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBookingData, type ProductType, type ServiceTier } from "../useBookingData";
import { useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";
import type { BookingFormValues } from "../schema";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { ProductAssetIcons, type ProductAssetIconKey } from "@/components/common/icons";
import { toast } from "sonner";

/* ===================================================================
   CONSTANTS & STYLES
   =================================================================== */
const PACKAGE_STYLES = {
  standard: {
    gradient: 'from-slate-50 to-white',
    border: 'border-slate-200',
    selectedBorder: 'border-slate-900',
    accent: 'bg-slate-900',
    text: 'text-slate-900',
    icon: 'text-slate-900',
    glow: 'shadow-slate-900/10',
    label: 'Standard Performance',
    badge: null
  },
  medium: {
    gradient: 'from-blue-50/50 to-white',
    border: 'border-blue-100',
    selectedBorder: 'border-blue-600',
    accent: 'bg-blue-600',
    text: 'text-blue-700',
    icon: 'text-blue-600',
    glow: 'shadow-blue-600/20',
    label: 'Optimal Choice',
    badge: 'Popular'
  },
  premium: {
    gradient: 'from-amber-50/50 to-white',
    border: 'border-amber-100',
    selectedBorder: 'border-amber-500',
    accent: 'bg-amber-500',
    text: 'text-amber-800',
    icon: 'text-amber-600',
    glow: 'shadow-amber-500/25',
    label: 'Absolute Care',
    badge: 'Premium'
  },
  default: {
    gradient: 'from-emerald-50/50 to-white',
    border: 'border-emerald-100',
    selectedBorder: 'border-emerald-600',
    accent: 'bg-emerald-600',
    text: 'text-emerald-700',
    icon: 'text-emerald-600',
    glow: 'shadow-emerald-600/20',
    label: 'Service Plus',
    badge: null
  }
};

/* ===================================================================
   SUB-COMPONENTS (Memoized for Senior Performance)
   =================================================================== */

const SelectionReminder = memo(({
  unconfigured,
  products,
  onJump
}: {
  unconfigured: ProductType[],
  products: ProductType[],
  onJump: (idx: number) => void
}) => {
  if (unconfigured.length === 0) return null;
  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
        <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shrink-0 text-amber-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-1">Selection Required</h4>
          <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
            Configure {unconfigured.length} item{unconfigured.length > 1 ? 's' : ''}:
            <span className="font-black ml-1 text-amber-800 italic">{unconfigured.map(p => p.label).join(", ")}</span>
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {unconfigured.map(p => (
              <button key={p.id} onClick={() => onJump(products.findIndex(pr => pr.id === p.id))}
                className="text-[9px] font-black underline underline-offset-4 text-amber-600 hover:text-amber-800 transition-colors">
                Select for {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const TierCard = memo(({
  tier,
  isSelected,
  onSelect
}: {
  tier: ServiceTier,
  isSelected: boolean,
  onSelect: (id: string) => void
}) => {
  const style = useMemo(() => {
    const l = tier.name.toLowerCase().trim();
    if (l.includes('standard')) return PACKAGE_STYLES.standard;
    if (l.includes('medium')) return PACKAGE_STYLES.medium;
    if (l.includes('premium')) return PACKAGE_STYLES.premium;
    return PACKAGE_STYLES.default;
  }, [tier.name]);

  const normalizedFeatures = useMemo(() => {
    return tier.features.flatMap(f =>
      f.split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean)
    );
  }, [tier.features]);

  return (
    <button
      type="button"
      onClick={() => onSelect(tier.tierId)}
      className={cn(
        "group relative flex flex-col md:flex-row items-stretch p-0 rounded-[24px] border-2 transition-all duration-500 text-left w-full outline-none overflow-hidden bg-white mb-4 shadow-sm",
        isSelected
          ? `${style.selectedBorder} shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] ${style.glow} scale-[1.01] z-20`
          : `border-slate-100 hover:border-slate-200 z-10 hover:-translate-y-0.5`
      )}
    >
      {/* Left: Branding & Pricing */}
      <div className={cn(
        "w-full md:w-[220px] p-6 flex flex-col justify-between shrink-0 relative overflow-hidden",
        isSelected ? "bg-slate-50/40" : "bg-white"
      )}>
        <div className="relative z-10">
          {style.badge && (
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest mb-2",
              isSelected ? `${style.accent} text-white` : "bg-slate-100 text-slate-500 shadow-sm"
            )}>
              {style.badge}
            </span>
          )}
          <h4 className={cn(
            "text-[10px] font-black uppercase tracking-[0.15em] mb-1.5",
            isSelected ? style.text : "text-slate-400"
          )}>
            {tier.name}
          </h4>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-2xl font-black tracking-tighter leading-none", isSelected ? "text-slate-900" : "text-slate-800")}>
              {formatPrice(tier.price).replace(' ₫', '')}
            </span>
            <span className={cn("text-[11px] font-black uppercase", isSelected ? style.text : "text-slate-400")}>₫</span>
          </div>
        </div>
        <div className="mt-4 md:mt-2 relative z-10">
          <p className={cn("text-[9px] font-black uppercase tracking-widest", isSelected ? "text-slate-500" : "text-slate-300")}>{style.label}</p>
        </div>
        <div className={cn("absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-[0.03] transition-transform duration-700", style.accent, isSelected ? "scale-150 rotate-12" : "scale-100")} />
      </div>

      {/* Center: Details & Features */}
      <div className="flex-1 p-6 flex flex-col justify-center border-y md:border-y-0 md:border-x border-slate-50/60">
        <p className="text-[11px] font-semibold text-slate-500 mb-5 leading-relaxed">{tier.description}</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {normalizedFeatures.map((f, idx) => (
            <li key={idx} className={cn(
              "flex items-start gap-3 text-[10px] font-bold leading-tight transition-all duration-300",
              isSelected ? "text-slate-800" : "text-slate-600"
            )}>
              <div className={cn("p-0.5 rounded-full mt-0.5", isSelected ? `${style.accent}/10 ${style.icon}` : "text-slate-200")}>
                <Check className="h-2.5 w-2.5" strokeWidth={5} />
              </div>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right: Interaction Area */}
      <div className={cn(
        "w-full md:w-[100px] flex items-center justify-center p-6 transition-colors duration-500",
        isSelected ? "bg-slate-50/30" : "bg-transparent group-hover:bg-slate-50/40"
      )}>
        <div className={cn(
          "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500",
          isSelected ? `${style.accent} text-white shadow-xl shadow-current/20 scale-110` : "bg-white border-2 border-slate-100 text-slate-200 group-hover:scale-105"
        )}>
          <Check className="h-6 w-6" strokeWidth={3.5} />
        </div>
      </div>
    </button>
  );
});

const QuantitySelector = memo(({
  quantity,
  onChange,
  onDirectChange
}: {
  quantity: number,
  onChange: (d: number) => void,
  onDirectChange: (val: number) => void
}) => {
  const [localVal, setLocalVal] = useState(quantity.toString());

  useEffect(() => {
    setLocalVal(quantity.toString());
  }, [quantity]);

  const handleBlur = () => {
    let val = parseInt(localVal);
    if (isNaN(val) || val < 1) {
      setLocalVal(quantity.toString());
    } else {
      if (val > 5) val = 5;
      onDirectChange(val);
    }
  };

  return (
    <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden h-10 shadow-sm shadow-slate-200/50">
      <button type="button" onClick={() => onChange(-1)} className="px-4 hover:bg-slate-50 text-slate-600 h-full border-r border-slate-200 transition-colors"><Minus className="h-3.5 w-3.5" /></button>
      <input
        type="text"
        className="w-12 text-center text-sm font-black text-slate-900 border-none focus:ring-0 bg-transparent selection:bg-[#4988c4]/20"
        value={localVal}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "" || /^\d+$/.test(v)) {
            setLocalVal(v);
          }
        }}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          }
        }}
      />
      <button type="button" onClick={() => onChange(1)} className="px-4 hover:bg-slate-50 text-slate-600 h-full border-l border-slate-200 transition-colors"><Plus className="h-3.5 w-3.5" /></button>
    </div>
  );
});

/* ===================================================================
   MAIN COMPONENT
   =================================================================== */

interface StepPackageProps {
  form: UseFormReturn<BookingFormValues>;
}

const StepPackage = memo(({ form }: StepPackageProps) => {
  const { control, getValues } = form;
  const { fields, append, update } = useFieldArray({ control, name: "items" });

  const selectedProductsForm = useWatch({ control, name: "selectedProducts" });
  const itemsForm = useWatch({ control, name: "items" });

  const selectedProducts = useMemo(() => selectedProductsForm ?? [], [selectedProductsForm]);
  const { productTypes, getProductTierPrice } = useBookingData();
  const [activeIdx, setActiveIdx] = useState(0);

  const products = useMemo(() =>
    productTypes.filter((p) => selectedProducts.includes(p.id)),
    [productTypes, selectedProducts]);

  const safeIdx = Math.min(activeIdx, Math.max(0, products.length - 1));
  const currentProduct = products[safeIdx];

  const cartItem = useMemo(() => {
    if (!currentProduct) return undefined;
    // Use fields instead of itemsForm for direct CRUD access consistency
    return fields.find((f) => f.itemType === currentProduct.id);
  }, [currentProduct, fields]);

  const unconfiguredProducts = useMemo(() =>
    products.filter((p) => !fields.some((f) => f.itemType === p.id)),
    [products, fields]);

  const selectTier = useCallback((tierId: string) => {
    if (!currentProduct) return;
    const idx = fields.findIndex((f) => f.itemType === currentProduct.id);

    if (idx >= 0) {
      if (fields[idx].packageId === tierId) return;
      update(idx, { ...fields[idx], packageId: tierId });
    } else {
      // Check total order limit (max 5)
      const currentTotal = fields.reduce((sum, f) => sum + f.quantity, 0);
      if (currentTotal + 1 > 5) {
        toast.error("Total order quantity cannot exceed 5 items.");
        return;
      }
      append({ itemType: currentProduct.id, packageId: tierId, quantity: 1 });
    }

    requestAnimationFrame(() => {
      const vals = (getValues("items") || []) as { itemType: string }[];
      const nextIdx = products.findIndex((p: ProductType) => !vals.some((v: { itemType: string }) => v.itemType === p.id));
      if (nextIdx >= 0) setActiveIdx(nextIdx);
    });
  }, [currentProduct, fields, update, append, products, getValues]);

  const handleQtyChange = useCallback((delta: number) => {
    if (!currentProduct) return;
    const idx = fields.findIndex((f: BookingFormValues['items'][number]) => f.itemType === currentProduct.id);
    if (idx < 0) return;

    const currentTotal = fields.reduce((sum, f) => sum + f.quantity, 0);
    const nextQty = fields[idx].quantity + delta;

    if (delta > 0 && currentTotal + delta > 5) {
      toast.error("Total order quantity cannot exceed 5 items.");
      return;
    }

    update(idx, { ...fields[idx], quantity: Math.max(1, nextQty) });
  }, [currentProduct, fields, update]);

  const handleDirectQtyChange = useCallback((val: number) => {
    if (!currentProduct) return;
    const idx = fields.findIndex((f: BookingFormValues['items'][number]) => f.itemType === currentProduct.id);
    if (idx < 0) return;

    const currentQty = fields[idx].quantity;
    const currentTotal = fields.reduce((sum, f) => sum + f.quantity, 0);
    const diff = val - currentQty;

    if (diff > 0 && currentTotal + diff > 5) {
      toast.error("Total order quantity cannot exceed 5 items.");
      // Set to max possible
      const maxPossible = currentQty + (5 - currentTotal);
      update(idx, { ...fields[idx], quantity: Math.max(1, maxPossible) });
      return;
    }

    update(idx, { ...fields[idx], quantity: Math.max(1, val) });
  }, [currentProduct, fields, update]);

  const subtotal = useMemo(() =>
    fields.reduce((sum: number, f: BookingFormValues['items'][number]) => {
      return sum + getProductTierPrice(f.itemType, f.packageId) * f.quantity;
    }, 0),
    [fields, getProductTierPrice]);

  if (!currentProduct || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm font-bold text-slate-400">No products selected. Please go back.</p>
      </div>
    );
  }

  const iconSrc = ProductAssetIcons[currentProduct.icon as ProductAssetIconKey] || ProductAssetIcons.PRODUCT_CATEGORIES;

  const itemsList = (itemsForm || []) as { itemType: string; quantity: number }[];

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        <SelectionReminder
          key="reminder"
          unconfigured={unconfiguredProducts}
          products={products}
          onJump={setActiveIdx}
        />
      </AnimatePresence>

      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#4988c4]/10 text-[#4988c4] border border-[#4988c4]/20 text-[9px] font-black uppercase tracking-widest">Step 02</div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Select Cleaning Level</h3>
        <p className="text-sm text-slate-500 font-medium">Select a depth of cleaning for your product.</p>
      </div>

      {products.length > 1 && (
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" disabled={safeIdx === 0} onClick={() => setActiveIdx((i: number) => i - 1)} className="h-8 w-8 p-0 rounded-lg border border-slate-100"><ChevronLeft className="h-4 w-4" /></Button>
          <div className="flex-1 flex items-center gap-2 overflow-x-auto px-1 py-1 no-scrollbar">
            {products.map((p: ProductType, i: number) => {
              const isActive = i === safeIdx;
              const hasItem = fields.some((f: BookingFormValues['items'][number]) => f.itemType === p.id);
              return (
                <button key={p.id} type="button" onClick={() => setActiveIdx(i)}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-wider transition-all shadow-sm whitespace-nowrap",
                    isActive ? "border-2 border-[#4988c4] bg-[#4988c4]/[0.04] text-[#4988c4] scale-[1.02] z-10" : hasItem ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-100 bg-white text-slate-600"
                  )}>
                  <img src={ProductAssetIcons[p.icon as ProductAssetIconKey] || ProductAssetIcons.PRODUCT_CATEGORIES} alt="" className="h-4 w-4 object-contain" />
                  {p.label}
                  {hasItem && <Check className={cn("h-3.5 w-3.5", isActive ? "text-[#4988c4]" : "text-emerald-500")} strokeWidth={3} />}
                </button>
              );
            })}
          </div>
          <Button type="button" variant="ghost" size="sm" disabled={safeIdx === products.length - 1} onClick={() => setActiveIdx((i: number) => i + 1)} className="h-8 w-8 p-0 rounded-lg border border-slate-100"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={currentProduct.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} className="space-y-4">
          <div className="flex items-center gap-5 p-5 rounded-[22px] border border-white bg-white/40 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative overflow-hidden group">
            {/* Subtle mesh background effect */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#4988c4]/5 rounded-full blur-3xl group-hover:bg-[#4988c4]/10 transition-all duration-700" />

            <div className="h-16 w-16 rounded-[18px] bg-gradient-to-br from-white to-slate-50 flex items-center justify-center border border-slate-100 shadow-sm relative z-10">
              <img src={iconSrc} alt="" className="h-9 w-9 object-contain scale-110 drop-shadow-sm transition-transform duration-500 group-hover:scale-125" />
            </div>

            <div className="flex-1 min-w-0 relative z-10">
              <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                {currentProduct.label}
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Focus Item</span>
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed line-clamp-1">{currentProduct.description}</p>
            </div>

            <div className="flex flex-col items-end gap-1 relative z-10 shrink-0">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/[0.03] border border-slate-900/5 rounded-full shadow-inner">
                <span className="text-[11px] font-black text-slate-900">{safeIdx + 1}</span>
                <span className="text-[9px] font-black text-slate-300">/</span>
                <span className="text-[11px] font-black text-slate-400">{products.length}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 pb-4 pt-4 px-2">
            {currentProduct.tiers.map((tier: ServiceTier) => (
              <TierCard key={tier.tierId} tier={tier} isSelected={cartItem?.packageId === tier.tierId} onSelect={selectTier} />
            ))}
          </div>

          <div className="flex justify-center sm:justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <button type="button" className="text-[11px] font-black text-slate-500 hover:text-[#4988c4] flex items-center gap-1.5 uppercase transition-colors hover:underline underline-offset-4">
                  <Check className="h-3.5 w-3.5 border border-slate-300 rounded-sm p-0.5" /> Compare Tiers Side-by-Side
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0 rounded-[28px] overflow-hidden border-2 border-slate-100">
                <DialogHeader className="p-6 bg-slate-50/50 border-b border-slate-100">
                  <DialogTitle className="text-xl font-black">Compare Service Tiers</DialogTitle>
                  <DialogDescription className="text-sm font-medium">Included features for <span className="font-bold text-slate-700">{currentProduct.label}</span>.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 max-h-[70vh] overflow-y-auto">
                  {currentProduct.tiers.map((t: ServiceTier) => (
                    <div key={t.tierId} className="p-6 flex flex-col bg-white">
                      <div className="mb-4">
                        {t.badge && <span className={cn("inline-block mb-3 px-2.5 py-1 text-[9px] font-black uppercase rounded-lg", t.featured ? "text-white bg-[#4988c4]" : "text-amber-700 bg-amber-100")}>{t.badge}</span>}
                        <h4 className="text-lg font-black tracking-tight mb-1">{t.name}</h4>
                        <p className="text-2xl font-black text-[#4988c4] tracking-tighter mb-2">{formatPrice(t.price)}</p>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{t.description}</p>
                      </div>
                      <ul className="pt-4 border-t border-slate-50/80 mt-auto space-y-3">
                        {t.features.map((f: string, idx: number) => (
                          <li key={idx} className="flex gap-2.5 text-xs font-bold text-slate-700"><Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" /><span>{f}</span></li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {cartItem && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between p-4 rounded-2xl border-2 border-[#4988c4]/15 bg-[#4988c4]/[0.03]">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-black uppercase text-slate-500">Qty</span>
                <QuantitySelector quantity={cartItem.quantity} onChange={handleQtyChange} onDirectChange={handleDirectQtyChange} />
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-[#4988c4] tracking-tight">{formatPrice(getProductTierPrice(currentProduct.id, cartItem.packageId) * cartItem.quantity)}</p>
                <p className="text-[10px] font-bold text-slate-500 mt-0.5">{formatPrice(getProductTierPrice(currentProduct.id, cartItem.packageId))} / each</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {(itemsList.length > 0) && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#4988c4] to-[#3a73a8] text-white shadow-xl shadow-[#4988c4]/15 transition-all">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm shadow-inner"><Check className="h-4 w-4 text-white" /></div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase text-white/60">{itemsList.length} service{itemsList.length > 1 ? 's' : ''} configured</p>
              <p className="text-xs font-bold text-white/90 truncate max-w-[200px] sm:max-w-none">
                {itemsList.map((f: { itemType: string; quantity: number }) => {
                  const p = productTypes.find((pt: ProductType) => pt.id === f.itemType);
                  return `${p?.label || f.itemType} x${f.quantity}`;
                }).join(" · ")}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[9px] font-black uppercase text-white/50">Subtotal</p>
            <p className="text-xl font-black tracking-tighter">{formatPrice(subtotal)}</p>
          </div>
        </div>
      )}
    </div>
  );
});

export default StepPackage;

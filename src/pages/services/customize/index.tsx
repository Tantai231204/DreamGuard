import { useState, Suspense, lazy, memo, useRef, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, ShoppingCart, ArrowLeft, Palette, Ruler, Layers, Type, Camera, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { DesignConfig, CustomizableProduct, EmbroideryPosition } from "./types";
import {
  customizableProducts, patternOptions,
  materialOptions, calculateCustomPrice,
} from "./data";

const ProductPreview3D = lazy(() => import("./components/ProductPreview3D"));

/* ===================================================================
   MEMOIZED UI COMPONENTS (PREVENTS SIDEBAR JANK)
   =================================================================== */

const ConfigSection = memo(({ title, step, icon, defaultOpen = false, children }: {
  title: string; step: number; icon: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100/60 last:border-0 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between px-6 py-4.5 transition-all duration-300",
          open ? "bg-slate-50/50" : "hover:bg-slate-50/30"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-all duration-300",
            open ? "bg-[#4988c4] text-white shadow-md shadow-[#4988c4]/20" : "bg-slate-100 text-slate-400"
          )}>
            {step}
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="text-slate-400">{icon}</span>
            <span className="text-[11px] font-black uppercase tracking-[0.1em]">{title}</span>
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-300 ease-out", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="px-6 pb-6 space-y-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const Chip = memo(({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => {
  return (
    <button type="button" onClick={onClick} className={cn("px-3 py-1.5 rounded-full border-2 text-[11px] font-black transition-all duration-150", active ? "border-[#4988c4] bg-[#4988c4]/10 text-[#4988c4] shadow-sm" : "border-slate-100 text-slate-500 hover:border-[#4988c4]/30")}>
      {children}
    </button>
  );
});

const MemoizedProductGrid = memo(({ selectedId, onSelect }: { selectedId?: string; onSelect: (p: CustomizableProduct) => void }) => (
  <ConfigSection title="Choice Product" step={1} icon={<ShoppingCart className="h-3.5 w-3.5" />} defaultOpen={true}>
    <div className="grid grid-cols-2 gap-3">
      {customizableProducts.map(p => (
        <button
          key={p.id}
          type="button"
          onClick={() => onSelect(p)}
          className={cn(
            "flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 text-center relative group",
            selectedId === p.id
              ? "border-[#4988c4] bg-[#4988c4]/[0.03] shadow-lg shadow-[#4988c4]/10"
              : "border-slate-50 bg-white hover:border-slate-200 hover:shadow-sm"
          )}
        >
          <div className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center text-3xl mb-3 transition-transform duration-300 group-hover:scale-110",
            selectedId === p.id ? "bg-white shadow-sm" : "bg-slate-50"
          )}>
            {p.icon}
          </div>
          <span className={cn(
            "text-[11px] font-black tracking-tight",
            selectedId === p.id ? "text-[#4988c4]" : "text-slate-700"
          )}>
            {p.name}
          </span>
          <span className="text-[10px] font-bold text-slate-400 mt-1">
            From {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p.basePrice)}
          </span>
        </button>
      ))}
    </div>
  </ConfigSection>
));

const MemoizedSizeChips = memo(({ product, selectedSize, onSelect }: { product: CustomizableProduct; selectedSize: string; onSelect: (s: string) => void }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-1.5 px-0.5">
      <Ruler className="h-3 w-3 text-slate-400" />
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">Select Size</p>
    </div>
    <div className="flex flex-wrap gap-2">
      {product.availableSizes.map(s => (
        <Chip key={s.id} active={selectedSize === s.id} onClick={() => onSelect(s.id)}>
          {s.label}
        </Chip>
      ))}
    </div>
  </div>
));

const MemoizedPatternChips = memo(({ selectedPattern, onSelect }: { selectedPattern: string; onSelect: (p: string) => void }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-1.5 px-0.5">
      <Sparkles className="h-3 w-3 text-slate-400" />
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">Texture Pattern</p>
    </div>
    <div className="flex flex-wrap gap-2">
      {patternOptions.map(p => (
        <Chip key={p.id} active={selectedPattern === p.id} onClick={() => onSelect(p.id)}>
          {p.emoji} {p.name}
        </Chip>
      ))}
    </div>
  </div>
));

const MemoizedMaterialGrid = memo(({ selectedMaterial, onSelect }: { selectedMaterial: string; onSelect: (m: string) => void }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-1.5 px-0.5">
      <Layers className="h-3 w-3 text-slate-400" />
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">Fabric Material</p>
    </div>
    <div className="grid grid-cols-1 gap-2.5">
      {materialOptions.map(m => (
        <button
          key={m.id}
          type="button"
          onClick={() => onSelect(m.id)}
          className={cn(
            "w-full flex items-start gap-3 p-3.5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group",
            selectedMaterial === m.id
              ? "border-[#4988c4] bg-[#4988c4]/[0.03] shadow-md shadow-[#4988c4]/5"
              : "border-slate-50 bg-white hover:border-slate-200"
          )}
        >
          <div className={cn(
            "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center bg-slate-50 transition-colors",
            selectedMaterial === m.id && "bg-[#4988c4]/10 text-[#4988c4]"
          )}>
            <Layers className="h-4 w-4 opacity-50" />
          </div>
          <div className="min-w-0 pr-8">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={cn(
                "text-[11px] font-black uppercase tracking-tight",
                selectedMaterial === m.id ? "text-[#4988c4]" : "text-slate-800"
              )}>
                {m.name}
              </span>
              {m.badge && (
                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-[#4988c4]/10 text-[#4988c4] animate-pulse">
                  {m.badge}
                </span>
              )}
            </div>
            <p className="text-[10px] font-medium text-slate-400 leading-relaxed">{m.description}</p>
          </div>
          {m.priceMultiplier !== 1 && (
            <div className="absolute top-3 right-3 text-[10px] font-black text-slate-300">
              ×{m.priceMultiplier.toFixed(2)}
            </div>
          )}
        </button>
      ))}
    </div>
  </div>
));

const ColorPickerModule = memo(({ color, onChange }: { color: string; onChange: (c: string) => void }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localColor, setLocalColor] = useState(color);
  useEffect(() => { setLocalColor(color); }, [color]);

  return (
    <div className="relative group">
      <div className="bg-slate-50/50 p-1.5 rounded-[1.75rem] border border-slate-100/50">
        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 group-hover:border-[#4988c4]/30 transition-all">
          <div className="relative">
            <input
              type="color"
              ref={inputRef}
              value={localColor}
              onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                setLocalColor(e.target.value);
                onChange(e.target.value);
              }}
              className="w-14 h-14 rounded-2xl border-4 border-slate-50 shadow-inner cursor-pointer p-0 appearance-none bg-transparent overflow-hidden"
            />
            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-white rounded-full border border-slate-100 flex items-center justify-center shadow-sm pointer-events-none">
              <Palette className="h-3 w-3 text-[#4988c4]" />
            </div>
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-mono">Hex Code</span>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-[9px] font-black text-[#4988c4] uppercase h-5 px-2 bg-[#4988c4]/5 rounded-md hover:bg-[#4988c4]/10 transition-colors"
              >
                Edit
              </button>
            </div>
            <div className="text-sm font-black text-slate-800 font-mono tracking-tight">{localColor.toUpperCase()}</div>
          </div>
        </div>
      </div>
    </div>
  );
});

const ImageUploadModule = memo(({ value, mode, onChange, onModeChange }: { value?: string; mode: "print" | "wrap"; onChange: (v?: string) => void; onModeChange: (m: "print" | "wrap") => void }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange(url);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        onClick={() => !value && fileRef.current?.click()}
        className={cn(
          "relative h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer overflow-hidden group",
          value 
            ? "border-[#4988c4] bg-[#4988c4]/[0.02]" 
            : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
        )}
      >
        <input type="file" ref={fileRef} onChange={handleUpload} accept="image/*" className="hidden" />
        
        {value ? (
          <>
            <img src={value} alt="Preview" className={cn("h-full w-full object-cover", mode === 'wrap' ? "opacity-100" : "opacity-40")} />
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center gap-3">
              <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:shadow-lg transition-all">Replace</button>
              <button onClick={(e) => { e.stopPropagation(); onChange(undefined); }} className="h-8 px-3 rounded-lg bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all">Remove</button>
            </div>
          </>
        ) : (
          <>
            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-all">
              <Plus className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Upload Custom Logo</p>
          </>
        )}
      </div>
      
      {value && (
        <div className="bg-slate-50 p-1 rounded-xl flex gap-1 border border-slate-100">
          {(["print", "wrap"] as const).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={cn(
                "flex-1 py-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg transition-all",
                mode === m 
                  ? "bg-white text-[#4988c4] shadow-sm border border-slate-100" 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {m === 'print' ? 'Logo Print' : 'Full Wrap'}
            </button>
          ))}
        </div>
      )}
      <p className="text-[9px] font-medium text-slate-400 text-center uppercase tracking-widest leading-relaxed">
        {mode === 'wrap' ? "Image will repeat as fabric pattern" : "Image will be printed at center front"}
      </p>
    </div>
  );
});

/* ===================================================================
   MAIN PAGE
   =================================================================== */

export default function CustomizePage() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<CustomizableProduct | null>(null);
  const [design, setDesign] = useState<DesignConfig>({ 
    size: "", baseColor: "#B0D4F1", pattern: "solid", embroideryText: "", embroideryPosition: "center", material: "organic_cotton", customImage: undefined, imageMode: "print"
  });

  const currentMaterial = useMemo(() => materialOptions.find(m => m.id === design.material) || materialOptions[0], [design.material]);
  const currentSize = useMemo(() => selectedProduct?.availableSizes.find(s => s.id === design.size), [selectedProduct, design.size]);
  const totalPrice = useMemo(() => selectedProduct ? calculateCustomPrice(selectedProduct.basePrice, currentSize?.priceAdd ?? 0, currentMaterial?.priceMultiplier ?? 1, design.embroideryText.trim().length > 0) : 0, [selectedProduct, currentSize, currentMaterial, design.embroideryText]);

  const selectProduct = useCallback((p: CustomizableProduct) => {
    setSelectedProduct(p);
    const defaultPos: EmbroideryPosition = p.id === "crib_bedding_set" ? "front-rail" : "center";
    setDesign(prev => ({ ...prev, size: p.availableSizes[0]?.id || "", embroideryPosition: defaultPos }));
  }, []);

  const updateDesign = useCallback((updates: Partial<DesignConfig>) => {
    setDesign(prev => ({ ...prev, ...updates }));
  }, []);

  const updatePosition = useCallback((pos: EmbroideryPosition) => {
    updateDesign({ embroideryPosition: pos });
  }, [updateDesign]);

  const formatCurrency = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

  return (
    <div className="h-screen flex flex-col bg-[#fcfcfd] overflow-hidden">
      <div className="flex-shrink-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-8 z-20">
        <button type="button" onClick={() => navigate(-1)} className="group flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-all">
          <div className="h-8 w-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:scale-110 group-hover:border-slate-200 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Exit
        </button>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#4988c4] to-[#6ba3d6] flex items-center justify-center shadow-lg shadow-[#4988c4]/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-black text-slate-800 tracking-[-0.03em]">Bespoke Studio</span>
        </div>
        <div className="px-5 py-2 rounded-2xl bg-slate-50 border border-slate-100">
          <motion.p key={totalPrice} initial={{ y: 5 }} animate={{ y: 0 }} className="text-[13px] font-black text-slate-800 tabular-nums">
            {formatCurrency(totalPrice || 0)}
          </motion.p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[340px] flex-shrink-0 bg-white border-r border-slate-100 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
          <MemoizedProductGrid selectedId={selectedProduct?.id} onSelect={selectProduct} />

          <ConfigSection title="Brand & Visuals" step={4} icon={<Camera className="h-3.5 w-3.5" />}>
            <ImageUploadModule 
              value={design.customImage}
              mode={design.imageMode}
              onChange={(v) => updateDesign({ customImage: v })}
              onModeChange={(m) => updateDesign({ imageMode: m })}
            />
          </ConfigSection>

          <ConfigSection title="Custom Design" step={2} icon={<Palette className="h-3.5 w-3.5" />} defaultOpen={true}>
            {selectedProduct && <MemoizedSizeChips product={selectedProduct} selectedSize={design.size} onSelect={(s) => updateDesign({ size: s })} />}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 px-0.5">
                <Palette className="h-3 w-3 text-slate-400" /><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">Base Color</p>
              </div>
              <ColorPickerModule color={design.baseColor} onChange={(c) => updateDesign({ baseColor: c })} />
            </div>
            <MemoizedPatternChips selectedPattern={design.pattern} onSelect={(p) => updateDesign({ pattern: p })} />
            <MemoizedMaterialGrid selectedMaterial={design.material} onSelect={(m) => updateDesign({ material: m })} />

            <div className="space-y-3">
              <div className="flex items-center gap-1.5 px-0.5">
                <Type className="h-3 w-3 text-slate-400" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">{selectedProduct?.id === "crib_bedding_set" ? "Wooden Engraving" : "Bespoke Embroidery"}</p>
              </div>
              <div className="space-y-2.5">
                <div className="relative">
                  <Input value={design.embroideryText} onChange={e => updateDesign({ embroideryText: e.target.value.slice(0, 15) })} placeholder="Enter custom text..." maxLength={15} className="h-11 rounded-xl border-2 border-slate-50 bg-white px-4 text-xs font-black placeholder:text-slate-300 focus:border-[#4988c4]/40 focus:ring-0 shadow-sm transition-all" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300">{design.embroideryText.length}/15</div>
                </div>
                <AnimatePresence>
                  {design.embroideryText.trim() && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2.5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">📍 Preferred Position</p>
                      <div className="flex flex-wrap gap-2">
                        {(selectedProduct?.id === "crib_bedding_set" ? [{ id: "front-rail", label: "Front Rail", icon: "🪵" }, { id: "side-rail", label: "Side Rail", icon: "📐" }, { id: "headboard", label: "Headboard", icon: "🛏️" }] : [{ id: "center", label: "Center", icon: "⊕" }, { id: "corner", label: "Corner", icon: "◳" }, { id: "bottom-edge", label: "Bottom Edge", icon: "▁" }]).map(pos => (
                          <Chip key={pos.id} active={design.embroideryPosition === pos.id} onClick={() => updateDesign({ embroideryPosition: pos.id as EmbroideryPosition })}>{pos.icon} {pos.label}</Chip>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </ConfigSection>
        </div>

        <div className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-br from-[#f8fafc] via-white to-[#f1f5f9]">
          {!selectedProduct ? (
            <div className="flex-1 flex items-center justify-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 px-8">
                <div className="relative inline-block"><div className="text-8xl animate-float">🎨</div><div className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-[#4988c4]/10 flex items-center justify-center animate-pulse"><Sparkles className="h-6 w-6 text-[#4988c4]" /></div></div>
                <div className="space-y-2"><h2 className="text-4xl font-black text-slate-800 tracking-tight">Studio Experience</h2><p className="text-sm text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">Select a product from the left panel to begin your immersive 3D custom design journey.</p></div>
              </motion.div>
            </div>
          ) : (
            <div className="flex-1 relative">
              <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><div className="text-center space-y-4"><div className="relative h-16 w-16 mx-auto"><div className="absolute inset-0 border-4 border-slate-100 rounded-full" /><div className="absolute inset-0 border-4 border-[#4988c4] border-t-transparent rounded-full animate-spin" /></div><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Initializing 3D World</p></div></div>}>
                <ProductPreview3D product={selectedProduct} design={design} totalPrice={totalPrice} onPositionChange={updatePosition} />
              </Suspense>

              <div className="absolute bottom-6 left-6 right-6 z-10">
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white/70 backdrop-blur-2xl border border-white/50 px-8 py-5 rounded-[2.5rem] flex items-center justify-between shadow-2xl shadow-slate-300/40">
                  <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Current Valuation</p><motion.p key={totalPrice} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="text-3xl font-black tracking-tight tabular-nums">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice)}</motion.p></div>
                  <button type="button" className="flex items-center gap-3 px-10 py-4 rounded-[2rem] text-xs font-black text-white bg-[#0f172a] hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-all active:scale-95 group"><ShoppingCart className="h-4 w-4" /> Proceed to Checkout</button>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

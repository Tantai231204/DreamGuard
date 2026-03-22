import { useState, useMemo, Suspense, lazy, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, ShoppingCart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { ChildProfile, DesignConfig, CustomizableProduct, EmbroideryPosition } from "./types";
import {
  customizableProducts, colorOptions, patternOptions,
  getRecommendedMaterials, calculateCustomPrice,
  allergyOptions, healthConditionOptions,
} from "./data";

const ProductPreview3D = lazy(() => import("./components/ProductPreview3D"));

const ConfigSection = memo(({ title, step, icon, defaultOpen = false, children }: {
  title: string; step: number; icon: string; defaultOpen?: boolean; children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100/80 last:border-0">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
        <div className="flex items-center gap-2.5">
          <span className="h-6 w-6 rounded-lg bg-[#4988c4]/10 text-[#4988c4] flex items-center justify-center text-xs font-black">{step}</span>
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{icon} {title}</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-5 pb-4 space-y-3">{children}</div>
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

const ColorSwatch = memo(({ hex, name, active, onClick }: { hex: string; name: string; active: boolean; onClick: () => void }) => {
  return (
    <button type="button" onClick={onClick} title={name} className={cn("h-8 w-8 rounded-lg border-2 transition-all duration-150 relative", active ? "border-[#4988c4] scale-110 ring-2 ring-[#4988c4]/20 shadow-md" : "border-slate-200/60 hover:scale-105")} style={{ backgroundColor: hex }}>
      {active && (
        <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#4988c4] flex items-center justify-center">
          <svg className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
});

/* ===== Helpers ===== */
function formatPrice(v: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);
}

/* ===================================================================
   MAIN PAGE COMPONENT
   =================================================================== */
export default function CustomizePage() {
  const navigate = useNavigate();

  const [selectedProduct, setSelectedProduct] = useState<CustomizableProduct | null>(null);
  const [childProfile, setChildProfile] = useState<ChildProfile>({ ageGroup: "infant", allergies: [], skinSensitivity: 1, healthConditions: [] });
  const [design, setDesign] = useState<DesignConfig>({ size: "", baseColor: "sky", pattern: "solid", embroideryText: "", embroideryPosition: "center", material: "organic_cotton" });

  // Derived
  const recommendedMaterials = useMemo(() => getRecommendedMaterials(
    childProfile.allergies.length > 0 ? childProfile.allergies : ["none"],
    childProfile.skinSensitivity
  ), [childProfile.allergies, childProfile.skinSensitivity]);

  const currentColor = colorOptions.find(c => c.id === design.baseColor)!;
  const currentMaterial = recommendedMaterials.find(m => m.id === design.material) || recommendedMaterials[0];
  const currentSize = selectedProduct?.availableSizes.find(s => s.id === design.size);

  const totalPrice = selectedProduct ? calculateCustomPrice(
    selectedProduct.basePrice,
    currentSize?.priceAdd ?? 0,
    currentMaterial?.priceMultiplier ?? 1,
    design.embroideryText.trim().length > 0
  ) : 0;

  // Handlers
  const selectProduct = (p: CustomizableProduct) => {
    setSelectedProduct(p);
    const defaultPos: EmbroideryPosition = p.id === "crib_bedding_set" ? "front-rail" : "center";
    setDesign(prev => ({ ...prev, size: p.availableSizes[0]?.id || "", embroideryPosition: defaultPos }));
  };

  const toggleAllergy = (id: string) => {
    if (id === "none") { setChildProfile(p => ({ ...p, allergies: ["none"] })); return; }
    setChildProfile(p => {
      const filtered = p.allergies.filter(a => a !== "none");
      return { ...p, allergies: filtered.includes(id) ? filtered.filter(a => a !== id) : [...filtered, id] };
    });
  };

  const toggleCondition = (id: string) => {
    if (id === "none") { setChildProfile(p => ({ ...p, healthConditions: ["none"] })); return; }
    setChildProfile(p => {
      const filtered = p.healthConditions.filter(c => c !== "none");
      return { ...p, healthConditions: filtered.includes(id) ? filtered.filter(c => c !== id) : [...filtered, id] };
    });
  };

  // Smart recommendation
  const getRecommendation = () => {
    if (childProfile.skinSensitivity >= 3) return { text: "Hypoallergenic Silk is ideal for very sensitive skin", level: "warning" as const };
    if (childProfile.allergies.includes("wool")) return { text: "Wool-free materials have been auto-selected", level: "info" as const };
    if (childProfile.healthConditions.includes("eczema")) return { text: "We recommend Bamboo Fiber for eczema-prone skin", level: "info" as const };
    return null;
  };
  const recommendation = getRecommendation();

  return (
    <div className="h-screen flex flex-col bg-slate-50/50 overflow-hidden">
      {/* Top Bar */}
      <div className="flex-shrink-0 h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-20">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-black text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex items-center gap-2 text-[#4988c4]">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-black tracking-tight">DreamGuard Studio</span>
        </div>
        <div className="text-right">
          {totalPrice > 0 && (
            <motion.span key={totalPrice} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="text-sm font-black text-slate-800">
              {formatPrice(totalPrice)}
            </motion.span>
          )}
        </div>
      </div>

      {/* Main Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* ======= LEFT: Config Sidebar ======= */}
        <div className="w-[340px] flex-shrink-0 bg-white border-r border-slate-100 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">

          {/* Smart Recommendation Banner */}
          <AnimatePresence>
            {recommendation && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className={cn("px-5 py-3 text-[10px] font-black tracking-wide border-b flex items-center gap-2",
                  recommendation.level === "warning" ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-blue-50 text-blue-700 border-blue-100"
                )}>
                  <span className="text-base">{recommendation.level === "warning" ? "⚠️" : "💡"}</span>
                  {recommendation.text}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Section 1: Product */}
          <ConfigSection title="Product" step={1} icon="🛍️" defaultOpen={true}>
            <div className="grid grid-cols-2 gap-2">
              {customizableProducts.map(p => (
                <button key={p.id} type="button" onClick={() => selectProduct(p)}
                  className={cn("flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center",
                    selectedProduct?.id === p.id
                      ? "border-[#4988c4] bg-[#4988c4]/[0.04] shadow-sm"
                      : "border-slate-100/80 border-dashed hover:border-[#4988c4]/30"
                  )}>
                  <span className="text-2xl">{p.icon}</span>
                  <span className={cn("text-[10px] font-black mt-1", selectedProduct?.id === p.id ? "text-[#4988c4]" : "text-slate-700")}>{p.name}</span>
                  <span className="text-[9px] font-bold text-slate-400">{(p.basePrice / 1000).toFixed(0)}K</span>
                </button>
              ))}
            </div>
          </ConfigSection>

          {/* Section 2: Health Profile */}
          <ConfigSection title="Health Profile" step={2} icon="🩺">
            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Age Group</p>
              <div className="flex gap-1.5">
                {(["newborn", "infant", "toddler"] as const).map(a => (
                  <Chip key={a} active={childProfile.ageGroup === a} onClick={() => setChildProfile(p => ({ ...p, ageGroup: a }))}>
                    {a === "newborn" ? "👶 0-6m" : a === "infant" ? "🍼 6-12m" : "🧒 1-3y"}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Allergies</p>
              <div className="flex flex-wrap gap-1.5">
                {allergyOptions.map(o => (
                  <Chip key={o.id} active={childProfile.allergies.includes(o.id)} onClick={() => toggleAllergy(o.id)}>
                    {o.emoji} {o.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Skin Sensitivity</p>
              <div className="flex gap-1.5">
                {[{ v: 1, l: "Normal", c: "bg-emerald-400" }, { v: 2, l: "Sensitive", c: "bg-amber-400" }, { v: 3, l: "Very Sensitive", c: "bg-rose-400" }].map(s => (
                  <button key={s.v} type="button" onClick={() => setChildProfile(p => ({ ...p, skinSensitivity: s.v }))}
                    className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 text-[10px] font-black transition-all",
                      childProfile.skinSensitivity === s.v ? "border-[#4988c4] bg-[#4988c4]/[0.04] text-[#4988c4]" : "border-slate-100 text-slate-500 hover:border-[#4988c4]/30"
                    )}>
                    <div className={cn("h-2 w-2 rounded-full", s.c)} /> {s.l}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Conditions</p>
              <div className="flex flex-wrap gap-1.5">
                {healthConditionOptions.map(o => (
                  <Chip key={o.id} active={childProfile.healthConditions.includes(o.id)} onClick={() => toggleCondition(o.id)}>
                    {o.emoji} {o.label}
                  </Chip>
                ))}
              </div>
            </div>
          </ConfigSection>

          {/* Section 3: Design */}
          <ConfigSection title="Design" step={3} icon="🎨" defaultOpen={true}>
            {selectedProduct && (
              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Size</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProduct.availableSizes.map(s => (
                    <Chip key={s.id} active={design.size === s.id} onClick={() => setDesign(d => ({ ...d, size: s.id }))}>
                      {s.label} {s.priceAdd !== 0 && `(${s.priceAdd > 0 ? "+" : ""}${(s.priceAdd / 1000).toFixed(0)}K)`}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Color — {currentColor.name}</p>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map(c => (
                  <ColorSwatch key={c.id} hex={c.hex} name={c.name} active={design.baseColor === c.id} onClick={() => setDesign(d => ({ ...d, baseColor: c.id }))} />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pattern</p>
              <div className="flex flex-wrap gap-1.5">
                {patternOptions.map(p => (
                  <Chip key={p.id} active={design.pattern === p.id} onClick={() => setDesign(d => ({ ...d, pattern: p.id }))}>
                    {p.emoji} {p.name}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Material <span className="text-[#4988c4]">({recommendedMaterials.length} safe)</span></p>
              <div className="space-y-1.5">
                {recommendedMaterials.map(m => (
                  <button key={m.id} type="button" onClick={() => setDesign(d => ({ ...d, material: m.id }))}
                    className={cn("w-full flex items-center justify-between p-2.5 rounded-xl border-2 text-left transition-all",
                      design.material === m.id ? "border-[#4988c4] bg-[#4988c4]/[0.04]" : "border-slate-100/80 border-dashed hover:border-[#4988c4]/30"
                    )}>
                    <div className="min-w-0">
                      <span className={cn("text-[11px] font-black", design.material === m.id ? "text-[#4988c4]" : "text-slate-700")}>{m.name}</span>
                      {m.badge && <span className="ml-1.5 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-[#4988c4]/10 text-[#4988c4]">{m.badge}</span>}
                      <p className="text-[9px] font-bold text-slate-400 mt-0.5 truncate">{m.description}</p>
                    </div>
                    {m.priceMultiplier !== 1 && <span className="text-[9px] font-black text-slate-400 ml-2">×{m.priceMultiplier.toFixed(2)}</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {selectedProduct?.id === "crib_bedding_set" ? "✏️ Name Engraving (+80K)" : "🧵 Embroidery (+80K)"}
              </p>
              <Input
                value={design.embroideryText}
                onChange={e => setDesign(d => ({ ...d, embroideryText: e.target.value.slice(0, 15) }))}
                placeholder="Baby's name..."
                maxLength={15}
                className="h-9 rounded-lg border-slate-200 text-xs font-black placeholder:text-slate-300 focus:border-[#4988c4] focus:ring-1 focus:ring-[#4988c4]/20"
              />
              <p className="text-[9px] font-bold text-slate-400 text-right">{design.embroideryText.length}/15</p>

              {/* Position Picker */}
              {design.embroideryText.trim() && (
                <div className="space-y-1.5 mt-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    📍 {selectedProduct?.id === "crib_bedding_set" ? "Nameplate Position" : "Embroidery Position"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedProduct?.id === "crib_bedding_set"
                      ? [
                        { id: "front-rail" as EmbroideryPosition, label: "Front Rail", icon: "🪵" },
                        { id: "side-rail" as EmbroideryPosition, label: "Side Rail", icon: "📐" },
                        { id: "headboard" as EmbroideryPosition, label: "Headboard", icon: "🛏️" },
                      ]
                      : [
                        { id: "center" as EmbroideryPosition, label: "Center", icon: "⊕" },
                        { id: "corner" as EmbroideryPosition, label: "Corner", icon: "◳" },
                        { id: "bottom-edge" as EmbroideryPosition, label: "Bottom Edge", icon: "▁" },
                      ]
                    ).map(pos => (
                      <Chip
                        key={pos.id}
                        active={design.embroideryPosition === pos.id}
                        onClick={() => setDesign(d => ({ ...d, embroideryPosition: pos.id }))}
                      >
                        {pos.icon} {pos.label}
                      </Chip>
                    ))}
                  </div>
                  <p className="text-[8px] font-bold text-slate-300 italic">
                    {selectedProduct?.id === "crib_bedding_set"
                      ? "💡 Click a hotspot on the 3D model to place the nameplate"
                      : "💡 Click a hotspot on the 3D model to place the embroidery"}
                  </p>
                </div>
              )}
            </div>
          </ConfigSection>
        </div>

        {/* ======= CENTER: 3D Visual Preview ======= */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
          {!selectedProduct ? (
            <div className="flex-1 flex items-center justify-center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4 px-8">
                <div className="text-7xl">🎨</div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Start Designing</h2>
                <p className="text-sm text-slate-400 font-medium max-w-sm mx-auto">Select a product from the panel to begin your 3D custom design experience.</p>
              </motion.div>
            </div>
          ) : (
            <>
              {/* Live Preview Badge */}
              <div className="absolute top-4 left-4 z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-100 shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">3D Preview</span>
                </div>
              </div>
              <div className="absolute top-4 right-4 z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-100 shadow-sm">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{selectedProduct.name}</span>
                </div>
              </div>

              {/* 3D Canvas Area */}
              <div className="flex-1">
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="h-10 w-10 mx-auto border-3 border-[#4988c4] border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading 3D Engine...</p>
                    </div>
                  </div>
                }>
                  <ProductPreview3D
                    product={selectedProduct}
                    design={design}
                    totalPrice={totalPrice}
                    onPositionChange={(pos: EmbroideryPosition) => setDesign(d => ({ ...d, embroideryPosition: pos }))}
                  />
                </Suspense>
              </div>

              {/* Bottom Price Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 px-8 py-4 flex items-center justify-between z-10">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estimated Total</p>
                  <motion.p key={totalPrice} initial={{ scale: 1.05, color: "#4988c4" }} animate={{ scale: 1, color: "#0f172a" }} className="text-2xl font-black">
                    {formatPrice(totalPrice)}
                  </motion.p>
                </div>
                <button type="button" className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white bg-gradient-to-r from-[#4988c4] to-[#3a73a8] hover:from-[#3a73a8] hover:to-[#2d5d8a] shadow-lg shadow-[#4988c4]/25 transition-all active:scale-95">
                  <ShoppingCart className="h-4 w-4" /> Add to Cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

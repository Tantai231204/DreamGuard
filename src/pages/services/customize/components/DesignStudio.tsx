import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { CustomizableProduct, ChildProfile, DesignConfig } from "../types";
import { colorOptions, patternOptions, getRecommendedMaterials, calculateCustomPrice } from "../data";
import ProductPreview from "./ProductPreview";

interface DesignStudioProps {
  product: CustomizableProduct;
  childProfile: ChildProfile;
  design: DesignConfig;
  onChange: (design: DesignConfig) => void;
}

export default function DesignStudio({ product, childProfile, design, onChange }: DesignStudioProps) {
  const recommendedMaterials = getRecommendedMaterials(childProfile.allergies, childProfile.skinSensitivity);
  const currentSize = product.availableSizes.find((s) => s.id === design.size);
  const currentMaterial = recommendedMaterials.find((m) => m.id === design.material) || recommendedMaterials[0];
  const totalPrice = calculateCustomPrice(
    product.basePrice,
    currentSize?.priceAdd ?? 0,
    currentMaterial?.priceMultiplier ?? 1,
    design.embroideryText.trim().length > 0
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Design Studio</h2>
        <p className="text-sm text-slate-500 font-medium">Create the perfect look — preview updates in real time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-start">
        {/* Left: Controls */}
        <div className="space-y-6 bg-white border border-slate-100 rounded-3xl p-6 shadow-lg shadow-slate-100/30">
          {/* Size */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">📐 Size</Label>
            <div className="flex flex-wrap gap-2">
              {product.availableSizes.map((size) => {
                const isActive = design.size === size.id;
                return (
                  <button key={size.id} type="button" onClick={() => onChange({ ...design, size: size.id })} className={cn("px-4 py-2 rounded-xl border-2 text-xs font-black transition-all", isActive ? "border-[#4988c4] bg-[#4988c4]/[0.04] text-[#4988c4]" : "border-slate-100 border-dashed text-slate-600 hover:border-[#4988c4]/30")}>
                    {size.label}
                    {size.priceAdd !== 0 && (
                      <span className="ml-1 text-[10px] opacity-60">({size.priceAdd > 0 ? "+" : ""}{(size.priceAdd / 1000).toFixed(0)}K)</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Base Color */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">🎨 Base Color</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => {
                const isActive = design.baseColor === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => onChange({ ...design, baseColor: color.id })}
                    className={cn("h-10 w-10 rounded-xl border-2 transition-all duration-200 relative group", isActive ? "border-[#4988c4] scale-110 shadow-md shadow-[#4988c4]/20 ring-2 ring-[#4988c4]/20" : "border-slate-200 hover:scale-105 hover:border-[#4988c4]/40")}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {isActive && (
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#4988c4] flex items-center justify-center">
                        <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] font-bold text-slate-400">Selected: {colorOptions.find((c) => c.id === design.baseColor)?.name}</p>
          </div>

          {/* Pattern */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">✨ Pattern</Label>
            <div className="flex flex-wrap gap-2">
              {patternOptions.map((pat) => {
                const isActive = design.pattern === pat.id;
                return (
                  <button key={pat.id} type="button" onClick={() => onChange({ ...design, pattern: pat.id })} className={cn("px-3 py-2 rounded-xl border-2 text-xs font-black transition-all", isActive ? "border-[#4988c4] bg-[#4988c4]/[0.04] text-[#4988c4]" : "border-slate-100 border-dashed text-slate-600 hover:border-[#4988c4]/30")}>
                    {pat.emoji} {pat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Material */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">🧵 Material (Auto-filtered)</Label>
            <div className="space-y-2">
              {recommendedMaterials.map((mat) => {
                const isActive = design.material === mat.id;
                return (
                  <button key={mat.id} type="button" onClick={() => onChange({ ...design, material: mat.id })} className={cn("w-full flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all", isActive ? "border-[#4988c4] bg-[#4988c4]/[0.04] shadow-sm" : "border-slate-100 border-dashed hover:border-[#4988c4]/30")}>
                    <div>
                      <span className={cn("text-sm font-black", isActive ? "text-[#4988c4]" : "text-slate-800")}>{mat.name}</span>
                      {mat.badge && <span className="ml-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#4988c4]/10 text-[#4988c4]">{mat.badge}</span>}
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{mat.description}</p>
                    </div>
                    {mat.priceMultiplier !== 1 && <span className="text-[10px] font-black text-slate-500 flex-shrink-0 ml-3">×{mat.priceMultiplier.toFixed(2)}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Embroidery */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">✍️ Embroidery Name (Optional +80K)</Label>
            <Input
              value={design.embroideryText}
              onChange={(e) => onChange({ ...design, embroideryText: e.target.value.slice(0, 15) })}
              placeholder="E.g. Baby An"
              maxLength={15}
              className="rounded-xl border-slate-200 focus:border-[#4988c4] focus:ring-1 focus:ring-[#4988c4]/20 font-black text-slate-800 placeholder:text-slate-300 text-sm"
            />
            <p className="text-[10px] font-bold text-slate-400">{design.embroideryText.length}/15 characters</p>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="lg:sticky lg:top-8">
          <ProductPreview product={product} design={design} totalPrice={totalPrice} />
        </div>
      </div>
    </div>
  );
}

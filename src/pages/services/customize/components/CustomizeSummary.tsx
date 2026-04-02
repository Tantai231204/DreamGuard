import { Sparkles, Heart } from "lucide-react";
import type { CustomizableProduct, DesignConfig } from "../types";
import { patternOptions, materialOptions, calculateCustomPrice } from "../data";
import ProductPreview from "./ProductPreview";

interface CustomizeSummaryProps {
  product: CustomizableProduct;
  design: DesignConfig;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export default function CustomizeSummary({ product, design }: CustomizeSummaryProps) {
  const currentSize = product.availableSizes.find((s) => s.id === design.size);
  const currentPattern = patternOptions.find((p) => p.id === design.pattern);
  const currentMaterial = materialOptions.find((m) => m.id === design.material);
  const hasEmbroidery = design.embroideryText.trim().length > 0;
  const totalPrice = calculateCustomPrice(
    product.basePrice,
    currentSize?.priceAdd ?? 0,
    100000, // Color add-on fee
    currentMaterial?.priceAdd ?? 0,
    currentMaterial?.priceMultiplier ?? 1,
    hasEmbroidery
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Review Your Design</h2>
        <p className="text-sm text-slate-500 font-medium">Everything looks perfect? Let's make it real.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <ProductPreview product={product} design={design} totalPrice={totalPrice} />

        <div className="space-y-5">
          {/* Design Details Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-lg shadow-slate-100/20 space-y-4">
            <div className="flex items-center gap-2 text-[#4988c4]">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-black">Design Specifications</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Product", value: product.name },
                { label: "Size", value: currentSize?.label || "–" },
                { label: "Color", value: design.baseColor, swatch: design.baseColor },
                { label: "Pattern", value: `${currentPattern?.emoji} ${currentPattern?.name}` },
                { label: "Material", value: currentMaterial?.name || "–", badge: currentMaterial?.badge },
                ...(hasEmbroidery ? [{ label: "Embroidery", value: `"${design.embroideryText}"` }] : []),
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                  <div className="flex items-center gap-2">
                    {"swatch" in item && item.swatch && <div className="h-4 w-4 rounded-md border border-slate-200" style={{ backgroundColor: item.swatch }} />}
                    <span className="text-sm font-black text-slate-800">{item.value}</span>
                    {"badge" in item && item.badge && <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#4988c4]/10 text-[#4988c4]">{item.badge}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-gradient-to-br from-[#4988c4] to-[#3a73a8] rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5" />
              <span className="text-sm font-black">Price Breakdown</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Base price</span>
                <span className="font-black">{formatPrice(product.basePrice)}</span>
              </div>
              {(currentSize?.priceAdd ?? 0) !== 0 && (
                <div className="flex justify-between">
                  <span className="text-white/70">Size adjustment</span>
                  <span className="font-black">{(currentSize?.priceAdd ?? 0) > 0 ? "+" : ""}{formatPrice(currentSize?.priceAdd ?? 0)}</span>
                </div>
              )}
              {(currentMaterial?.priceMultiplier ?? 1) !== 1 && (
                <div className="flex justify-between">
                  <span className="text-white/70">Material ({currentMaterial?.name})</span>
                  <span className="font-black">×{currentMaterial?.priceMultiplier.toFixed(2)}</span>
                </div>
              )}
              {hasEmbroidery && (
                <div className="flex justify-between">
                  <span className="text-white/70">Embroidery</span>
                  <span className="font-black">+{formatPrice(80000)}</span>
                </div>
              )}
              <div className="border-t border-white/20 pt-3 mt-3 flex justify-between items-center">
                <span className="text-white/80 font-black text-xs uppercase tracking-widest">Total</span>
                <span className="text-2xl font-black">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

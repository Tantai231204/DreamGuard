import { motion } from "framer-motion";
import type { CustomizableProduct, DesignConfig } from "../types";
import { colorOptions, patternOptions, materialOptions } from "../data";

interface ProductPreviewProps {
  product: CustomizableProduct;
  design: DesignConfig;
  totalPrice: number;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function isLightColor(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

export default function ProductPreview({ product, design, totalPrice }: ProductPreviewProps) {
  const currentColor = colorOptions.find((c) => c.id === design.baseColor);
  const currentPattern = patternOptions.find((p) => p.id === design.pattern);
  const currentMaterial = materialOptions.find((m) => m.id === design.material);
  const currentSize = product.availableSizes.find((s) => s.id === design.size);

  const getPatternStyle = (): React.CSSProperties => {
    if (!currentPattern?.cssPattern) return {};
    const patternColor = isLightColor(currentColor?.hex || "#fff") ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.15)";
    return {
      backgroundImage: currentPattern.cssPattern.replace(/currentColor/g, patternColor),
      backgroundSize: currentPattern.id === "dots" ? "20px 20px" : currentPattern.id === "stripes" ? "14px 14px" : "40px 40px",
    };
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/30 overflow-hidden">
      <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] text-center">Live Preview</p>
      </div>

      <div className="p-8 flex items-center justify-center min-h-[320px] bg-[#fafbfc]">
        <motion.div
          key={`${design.baseColor}-${design.pattern}-${design.embroideryText}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative w-64 h-64 rounded-3xl overflow-hidden shadow-2xl"
          style={{ backgroundColor: currentColor?.hex || "#f8f8f8" }}
        >
          <div className="absolute inset-0" style={getPatternStyle()} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl drop-shadow-lg">{product.icon}</span>
            {design.embroideryText && (
              <motion.p
                key={design.embroideryText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-lg font-black tracking-wide italic"
                style={{ color: isLightColor(currentColor?.hex || "#fff") ? "#475569" : "#f8fafc", textShadow: "0 1px 4px rgba(0,0,0,0.1)" }}
              >
                {design.embroideryText}
              </motion.p>
            )}
          </div>
          {currentMaterial && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-700">{currentMaterial.name}</span>
            </div>
          )}
          {currentPattern && currentPattern.id !== "solid" && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-700">{currentPattern.emoji} {currentPattern.name}</span>
            </div>
          )}
        </motion.div>
      </div>

      <div className="px-6 py-5 border-t border-slate-100 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Product</p>
            <p className="text-sm font-black text-slate-800">{product.name}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Size</p>
            <p className="text-sm font-black text-slate-800">{currentSize?.label || "–"}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Color</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-4 w-4 rounded-md border border-slate-200" style={{ backgroundColor: currentColor?.hex }} />
              <span className="text-sm font-black text-slate-800">{currentColor?.name}</span>
            </div>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Material</p>
            <p className="text-sm font-black text-slate-800">{currentMaterial?.name || "–"}</p>
          </div>
        </div>
        {design.embroideryText && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Embroidery</p>
            <p className="text-sm font-black italic text-[#4988c4]">"{design.embroideryText}"</p>
          </div>
        )}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Price</span>
          <motion.span key={totalPrice} initial={{ scale: 1.15, color: "#4988c4" }} animate={{ scale: 1, color: "#1e293b" }} className="text-xl font-black">
            {formatPrice(totalPrice)}
          </motion.span>
        </div>
      </div>
    </div>
  );
}

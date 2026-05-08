import { motion } from "framer-motion";
import type { CustomizableProduct, DesignConfig } from "../types";
import { materialOptions } from "../data";

interface ProductPreviewProps {
  product: CustomizableProduct;
  design: DesignConfig;
  totalPrice: number;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function isLightColor(hex: string) {
  if (!hex || hex === "transparent") return true;
  const h = hex.startsWith("#") ? hex.slice(1) : hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

export default function ProductPreview({ product, design, totalPrice }: ProductPreviewProps) {
  const currentMaterial = materialOptions.find((m) => m.id === design.material);
  const currentSize = product.availableSizes.find((s) => s.id === design.size);


  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden group">
      <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Visual Reference</p>
        <div className="h-2 w-2 rounded-full bg-[#4988c4] animate-pulse" />
      </div>

      <div className="p-10 flex items-center justify-center min-h-[360px] bg-[#fafbfc] relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4988c4]/5 rounded-full blur-3xl translate-x-10 -translate-y-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#4988c4]/5 rounded-full blur-3xl -translate-x-10 translate-y-10" />

        <motion.div
          key={`${design.baseColor}-${design.embroideryText}`}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-72 h-72 rounded-[3.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] outline outline-8 outline-white/50"
          style={{ backgroundColor: design.baseColor || "#f8f8f8" }}
        >
          <div className="absolute inset-0 transition-opacity duration-500" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-7xl drop-shadow-2xl filter brightness-110">{product.icon}</span>
            {design.embroideryText && (
              <motion.p
                key={design.embroideryText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-xl font-black tracking-tight"
                style={{ 
                  color: isLightColor(design.baseColor) ? "#1e293b" : "#f8fafc", 
                  textShadow: isLightColor(design.baseColor) ? "none" : "0 2px 8px rgba(0,0,0,0.2)"
                }}
              >
                {design.embroideryText.toUpperCase()}
              </motion.p>
            )}
          </div>
          {currentMaterial && (
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md shadow-sm border border-white/50">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">{currentMaterial.name}</span>
            </div>
          )}
        </motion.div>
      </div>

      <div className="px-10 py-8 border-t border-slate-100 space-y-6">
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-mono">Product Base</p>
            <p className="text-sm font-black text-slate-800 tracking-tight">{product.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-mono">Dimensions</p>
            <p className="text-sm font-black text-slate-800 tracking-tight">{currentSize?.label || "Standard"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-mono">Chrome Value</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="h-4.5 w-4.5 rounded-lg border-2 border-slate-50 shadow-sm" style={{ backgroundColor: design.baseColor }} />
              <span className="text-xs font-black text-slate-800 font-mono tracking-tighter uppercase">{design.baseColor}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-mono">Fabrication</p>
            <p className="text-sm font-black text-slate-800 tracking-tight">{currentMaterial?.name || "–"}</p>
          </div>
        </div>
        
        {design.embroideryText && (
          <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-mono">Bespoke Detail</p>
            <p className="text-sm font-black italic text-[#4988c4] tracking-tight">" {design.embroideryText} "</p>
          </div>
        )}

        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Est. Final Price</span>
          <motion.span key={totalPrice} initial={{ scale: 1.1, color: "#4988c4" }} animate={{ scale: 1, color: "#0f172a" }} className="text-2xl font-black tabular-nums">
            {formatPrice(totalPrice)}
          </motion.span>
        </div>
      </div>
    </div>
  );
}

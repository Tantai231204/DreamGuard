import { memo, useMemo, useState } from "react";
import { Upload, X, Box } from "lucide-react";
import { cn } from "@/lib/utils";
import { patternOptions } from "../data";
import type { MaterialOption } from "../types";

interface TextureLabProps {
  selectedPattern: string;
  selectedMaterial: string;
  materials: MaterialOption[];
  basePrice: number;
  onPatternSelect: (p: string) => void;
  onMaterialSelect: (m: string) => void;
  onImageUpload: (f: File | null) => void;
}

export const TextureLab = memo(({
  selectedPattern,
  selectedMaterial,
  materials,
  basePrice = 0,
  onPatternSelect,
  onMaterialSelect,
  onImageUpload
}: TextureLabProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  const currentMaterial = useMemo(() => materials.find(m => m.id === selectedMaterial), [materials, selectedMaterial]);
  const addOnAmount = useMemo(() => {
    if (!currentMaterial || currentMaterial.priceMultiplier === 1) return 0;
    return basePrice * (currentMaterial.priceMultiplier - 1);
  }, [basePrice, currentMaterial]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* WRAP SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="space-y-1">
            <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em]">Bespoke Wrap</p>
            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Image Overlay Projection</p>
          </div>
          <div className="h-px bg-slate-100 flex-1 ml-6" />
        </div>

        {!preview ? (
          <label className="group block w-full h-32 rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-slate-50/20 hover:bg-white hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-50/50 transition-all duration-700 cursor-pointer relative overflow-hidden">
            <input type="file" className="hidden" accept="image/*" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setPreview(URL.createObjectURL(f));
                onImageUpload(f);
              }
            }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="h-14 w-14 rounded-3xl bg-white shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Drop Visual Asset</p>
            </div>
          </label>
        ) : (
          <div className="relative h-32 w-full rounded-[2.5rem] overflow-hidden border-2 border-blue-600 shadow-2xl group animate-in zoom-in-95 duration-700">
            <img src={preview} alt="Preview" className="w-full h-full object-cover grayscale-[0.1] contrast-[1.05]" />
            <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm">
              <button
                onClick={() => { setPreview(null); onImageUpload(null); }}
                className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
              >
                <X className="h-5 w-5 text-rose-500" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PATTERNS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="space-y-1">
            <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em]">Organic Textures</p>
            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Generative Pattern Lab</p>
          </div>
          <div className="h-px bg-slate-100 flex-1 ml-6" />
        </div>
        
        <div className="flex flex-wrap gap-3">
          {patternOptions.map((p) => (
            <button
              key={p.id}
              onClick={() => onPatternSelect(p.id)}
              className={cn(
                "px-5 py-3 rounded-2xl border-2 transition-all duration-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 group relative overflow-hidden",
                selectedPattern === p.id
                  ? "border-blue-600 bg-white text-blue-600 shadow-xl shadow-blue-50"
                  : "border-slate-50 bg-slate-50/30 text-slate-400 hover:border-slate-200 hover:bg-white"
              )}
            >
              <span className={cn(
                  "text-lg transition-transform duration-500",
                  selectedPattern === p.id ? "scale-125" : "grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110"
              )}>{p.emoji}</span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MATERIALS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="space-y-1">
            <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em]">Textile Select</p>
            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Premium Fiber Calibration</p>
          </div>
          {addOnAmount > 0 && (
            <div className="flex flex-col items-end animate-in fade-in duration-500">
               <span className="text-[10px] font-black text-blue-600 font-mono tracking-tighter bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 shadow-sm">
                + {new Intl.NumberFormat("vi-VN").format(addOnAmount)}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {materials.map((m) => (
            <button
              key={m.id}
              onClick={() => onMaterialSelect(m.id)}
              className={cn(
                "group w-full flex items-center justify-between p-5 rounded-[2.25rem] border-2 transition-all duration-700",
                selectedMaterial === m.id
                  ? "border-blue-600 bg-blue-50/10 shadow-2xl shadow-blue-100/40"
                  : "border-slate-50 bg-slate-50/20 hover:border-slate-200 hover:bg-white hover:shadow-xl hover:shadow-slate-100"
              )}
            >
              <div className="flex items-center gap-5">
                <div className={cn(
                  "h-14 w-14 rounded-[1.25rem] flex items-center justify-center transition-all duration-700",
                  selectedMaterial === m.id ? "bg-slate-900 text-white shadow-2xl rotate-3 scale-110" : "bg-white text-slate-300 shadow-sm"
                )}>
                  <Box className="h-6 w-6" />
                </div>
                <div className="text-left space-y-1">
                  <p className={cn(
                    "text-[12px] font-black uppercase tracking-tight transition-colors",
                    selectedMaterial === m.id ? "text-slate-900" : "text-slate-600"
                  )}>{m.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 group-hover:text-slate-500 transition-colors leading-tight max-w-[180px]">{m.description}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                 {m.priceMultiplier !== 1 && (
                    <span className="text-[13px] font-black font-mono text-blue-600 tracking-tighter mb-1">x{m.priceMultiplier.toFixed(2)}</span>
                 )}
                 {m.badge && (
                    <span className="text-[7px] font-black uppercase tracking-[0.2em] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full shadow-sm">{m.badge}</span>
                 )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

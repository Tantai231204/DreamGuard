import { memo, useMemo, useState } from "react";
import { Upload, X } from "lucide-react";
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
    <div className="space-y-5">

      {/* PATTERN */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Pattern</p>
        <div className="flex flex-wrap gap-1.5">
          {patternOptions.map((p) => {
            const active = selectedPattern === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onPatternSelect(p.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-wide transition-all duration-200",
                  active
                    ? "border-[#4988c4] bg-[#4988c4]/8 text-[#4988c4]"
                    : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-white hover:text-slate-600"
                )}
              >
                <span className={cn("text-sm transition-all duration-200", active ? "" : "grayscale opacity-50")}>
                  {p.emoji}
                </span>
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* MATERIAL */}
      {materials.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Material</p>
            {addOnAmount > 0 && (
              <span className="text-[9px] font-bold text-[#4988c4] font-mono bg-[#4988c4]/8 px-2 py-0.5 rounded-md border border-[#4988c4]/20">
                +{new Intl.NumberFormat("vi-VN").format(addOnAmount)}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            {materials.map((m) => {
              const active = selectedMaterial === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onMaterialSelect(m.id)}
                  className={cn(
                    "group w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left",
                    active
                      ? "border-[#4988c4] bg-[#4988c4]/5 shadow-sm"
                      : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                  )}
                >
                  {/* Material dot/icon */}
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all duration-200",
                    active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    {m.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-[11px] font-bold uppercase tracking-wide transition-colors",
                      active ? "text-slate-900" : "text-slate-600"
                    )}>{m.name}</p>
                    {m.description && (
                      <p className="text-[9px] text-slate-400 truncate mt-0.5">{m.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {m.priceMultiplier !== 1 && (
                      <span className={cn(
                        "text-[10px] font-bold font-mono",
                        active ? "text-[#4988c4]" : "text-slate-400"
                      )}>×{m.priceMultiplier.toFixed(1)}</span>
                    )}
                    {m.badge && (
                      <span className="text-[7px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded-full">{m.badge}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* BESPOKE WRAP */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Bespoke Wrap</p>

        {!preview ? (
          <label className="group flex items-center justify-center gap-2 w-full h-16 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#4988c4]/50 hover:bg-[#4988c4]/3 transition-all duration-200 cursor-pointer">
            <input type="file" className="hidden" accept="image/*" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setPreview(URL.createObjectURL(f));
                onImageUpload(f);
              }
            }} />
            <Upload className="h-4 w-4 text-slate-300 group-hover:text-[#4988c4] transition-colors" />
            <span className="text-[10px] font-bold text-slate-300 group-hover:text-[#4988c4] uppercase tracking-wider transition-colors">Upload Image</span>
          </label>
        ) : (
          <div className="relative h-16 w-full rounded-xl overflow-hidden border-2 border-[#4988c4] group">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <button
                onClick={() => { setPreview(null); onImageUpload(null); }}
                className="h-7 w-7 rounded-lg bg-white flex items-center justify-center shadow-md hover:scale-105 transition-transform"
              >
                <X className="h-3.5 w-3.5 text-rose-500" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

import { cn } from "@/lib/utils";
import { memo } from "react";

interface SizeOption {
  id: string;
  label: string;
  priceAdd: number;
}

interface SizeSelectorProps {
  sizes: SizeOption[];
  selectedSize: string;
  onSelect: (id: string) => void;
  onModeChange?: (mode: 'mock' | 'input') => void;
  mode?: 'mock' | 'input';
  customDimensions?: { width: string; height: string };
  onDimensionsChange?: (dims: { width: string; height: string }) => void;
  recommendedDims?: { width: number; height: number };
}

// Extract just the size name (first part before dash/space)
const getSizeName = (label: string) => {
  const parts = label.split(' - ');
  return parts[0];
};

// Extract dimensions (second part or same if no dash)
const getSizeDims = (label: string) => {
  const parts = label.split(' - ');
  return parts.length > 1 ? parts[1] : null;
};

export const SizeSelector = memo(({
  sizes,
  selectedSize,
  onSelect,
  onModeChange,
  mode = 'mock',
  customDimensions = { width: "", height: "" },
  onDimensionsChange,
  recommendedDims
}: SizeSelectorProps) => {
  const isRecommended = recommendedDims && 
    parseInt(customDimensions.width) === recommendedDims.width && 
    parseInt(customDimensions.height) === recommendedDims.height;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Dimensions</p>
          {isRecommended && mode === 'input' && (
            <span className="text-[8px] font-black text-emerald-500 uppercase bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 animate-in fade-in slide-in-from-left-1">
              ✨ Recommended
            </span>
          )}
        </div>
        <div className="flex bg-slate-100 p-0.5 rounded-lg">
          <button
            onClick={() => onModeChange?.('mock')}
            className={cn(
              "px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all duration-200",
              mode === 'mock'
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            Preset
          </button>
          <button
            onClick={() => onModeChange?.('input')}
            className={cn(
              "px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all duration-200",
              mode === 'input'
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Sizes grid */}
      {mode === 'mock' ? (
        <div className="grid grid-cols-2 gap-2">
          {sizes.map((s) => {
            const active = selectedSize === s.id;
            const name = getSizeName(s.label);
            const dims = getSizeDims(s.label);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s.id)}
                className={cn(
                  "relative p-3.5 rounded-xl border text-left transition-all duration-200",
                  active
                    ? "border-[#4988c4] bg-[#4988c4]/5 shadow-sm"
                    : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wide",
                    active ? "text-slate-900" : "text-slate-500"
                  )}>
                    {name}
                  </span>
                  {active && <div className="h-1.5 w-1.5 rounded-full bg-[#4988c4]" />}
                </div>

                {dims && (
                  <p className={cn(
                    "text-[11px] font-semibold font-mono",
                    active ? "text-[#4988c4]" : "text-slate-400"
                  )}>
                    {dims}
                  </p>
                )}

                {s.priceAdd > 0 && (
                  <span className={cn(
                    "mt-1.5 inline-block text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border",
                    active
                      ? "text-[#4988c4] bg-[#4988c4]/8 border-[#4988c4]/20"
                      : "text-slate-400 bg-slate-100 border-slate-200"
                  )}>
                    +{new Intl.NumberFormat("vi-VN").format(s.priceAdd)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {["Width", "Length"].map((label, i) => (
            <div key={label} className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider pl-1">{label} (cm)</label>
              <input
                type="number"
                placeholder={i === 0 ? "60" : "120"}
                value={i === 0 ? customDimensions.width : customDimensions.height}
                onChange={(e) => {
                  const newDims = i === 0
                    ? { ...customDimensions, width: e.target.value }
                    : { ...customDimensions, height: e.target.value };
                  onDimensionsChange?.(newDims);
                  onSelect('custom');
                }}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white focus:border-[#4988c4] focus:ring-2 focus:ring-[#4988c4]/10 transition-all text-sm font-bold font-mono outline-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

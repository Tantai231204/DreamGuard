import { cn } from "@/lib/utils";
import { memo } from "react";
import { Ruler, Maximize } from "lucide-react";

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
}

export const SizeSelector = memo(({ 
  sizes, 
  selectedSize, 
  onSelect, 
  onModeChange, 
  mode = 'mock',
  customDimensions = { width: "", height: "" },
  onDimensionsChange
}: SizeSelectorProps) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em]">Dimensions</p>
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Structural Calibration</p>
        </div>
        
        <div className="flex bg-slate-100/60 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner">
          <button
            onClick={() => onModeChange?.('mock')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300",
              mode === 'mock' ? "bg-white text-blue-600 shadow-md scale-105" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Ruler className="h-3 w-3" />
            Preset
          </button>
          <button
            onClick={() => onModeChange?.('input')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300",
              mode === 'input' ? "bg-white text-blue-600 shadow-md scale-105" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Maximize className="h-3 w-3" />
            Direct
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {mode === 'mock' ? (
          sizes.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className={cn(
                "group relative p-5 rounded-[2rem] border-2 transition-all duration-500 text-left flex flex-col gap-1.5",
                selectedSize === s.id 
                  ? "border-blue-600 bg-blue-50/20 shadow-xl shadow-blue-100/50" 
                  : "border-slate-50 bg-slate-50/30 hover:border-slate-200 hover:bg-white hover:shadow-xl hover:shadow-slate-100"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-wider transition-colors",
                  selectedSize === s.id ? "text-slate-900" : "text-slate-500"
                )}>{s.label.split(' - ')[0]}</span>
                {selectedSize === s.id && <div className="h-1.5 w-1.5 rounded-full bg-blue-600 shadow-sm" />}
              </div>
              
              <p className={cn(
                "text-[12px] font-bold font-mono tracking-tighter truncate",
                selectedSize === s.id ? "text-blue-600" : "text-slate-400"
              )}>
                {s.label.includes(' - ') ? s.label.split(' - ')[1] : s.label}
              </p>
              
              {s.priceAdd > 0 && (
                <div className="pt-2">
                   <span className="text-[10px] font-black text-blue-600 font-mono tracking-tighter bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    + {new Intl.NumberFormat("vi-VN").format(s.priceAdd)}
                  </span>
                </div>
              )}
            </button>
          ))
        ) : (
          <div className="col-span-2 grid grid-cols-2 gap-4 animate-in zoom-in-95 duration-500">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-300 ml-4 tracking-widest">Width (cm)</label>
              <div className="relative group">
                <input 
                  type="number"
                  placeholder="60"
                  value={customDimensions.width}
                  onChange={(e) => {
                    onDimensionsChange?.({ ...customDimensions, width: e.target.value });
                    onSelect('custom');
                  }}
                  className="w-full h-14 px-6 rounded-3xl border-2 border-slate-50 bg-slate-50/50 focus:border-blue-600 focus:bg-white transition-all text-sm font-black font-mono shadow-inner outline-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                   <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-300 ml-4 tracking-widest">Length (cm)</label>
              <div className="relative group">
                <input 
                  type="number"
                  placeholder="120"
                  value={customDimensions.height}
                  onChange={(e) => {
                    onDimensionsChange?.({ ...customDimensions, height: e.target.value });
                    onSelect('custom');
                  }}
                  className="w-full h-14 px-6 rounded-3xl border-2 border-slate-50 bg-slate-50/50 focus:border-blue-600 focus:bg-white transition-all text-sm font-black font-mono shadow-inner outline-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                   <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

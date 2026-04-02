import { memo, useRef } from "react";
import { cn } from "@/lib/utils";
import type { ProductVariant } from "../types";
import { Pipette } from "lucide-react";

interface ChromaProfileProps {
  variants: ProductVariant[];
  selectedColor: string;
  addOnFee?: number;
  onSelect: (hex: string) => void;
}

const ColorChip = memo(({ active, hex, name, onClick }: { active: boolean; hex: string; name: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "group relative flex items-center justify-center h-10 w-10 rounded-xl border-2 transition-all duration-500 hover:scale-110",
      active 
        ? "border-blue-600 bg-white shadow-xl shadow-blue-100 ring-4 ring-blue-50" 
        : "border-slate-100 bg-white hover:border-slate-300"
    )}
    title={name}
  >
    <div className={cn(
        "h-6 w-6 rounded-lg shadow-inner border border-black/5 transition-transform duration-500",
        active ? "scale-100" : "scale-75 group-hover:scale-90"
    )} style={{ backgroundColor: hex }} />
    {active && (
        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
    )}
  </button>
));

export const ChromaProfile = memo(({ variants, selectedColor, addOnFee = 0, onSelect }: ChromaProfileProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const uniqueColors = Array.from(
    variants.reduce((map, v) => {
      if (v.colorCode && v.color && v.color.toLowerCase() !== 'standard') {
        map.set(v.colorCode.toLowerCase(), v.color);
      }
      return map;
    }, new Map<string, string>()).entries()
  ).map(([hex, name]) => ({ hex, name }));

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(e.target.value);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em]">Chroma</p>
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Tonal Spectrum Selection</p>
        </div>
        
        {addOnFee > 0 && (
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-blue-600 font-mono tracking-tighter bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              + {new Intl.NumberFormat("vi-VN").format(addOnFee)}
            </span>
            <span className="text-[6px] font-black font-mono text-slate-300 uppercase mt-0.5">Surcharge</span>
          </div>
        )}
      </div>
      
      <div className="space-y-8">
        {uniqueColors.length > 0 && (
          <div className="grid grid-cols-6 gap-3">
            {uniqueColors.map((c) => (
              <ColorChip 
                key={c.hex} 
                active={selectedColor.toLowerCase() === c.hex.toLowerCase()} 
                hex={c.hex} 
                name={c.name} 
                onClick={() => onSelect(c.hex)} 
              />
            ))}
          </div>
        )}

        <div 
          className="group relative cursor-pointer overflow-hidden rounded-[2rem] border-2 border-slate-100 bg-white p-6 transition-all duration-500 hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-50"
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-2xl border-4 border-white shadow-2xl overflow-hidden relative group-hover:rotate-6 transition-transform duration-700">
                  <div className="absolute inset-0 shadow-inner" style={{ backgroundColor: selectedColor }} />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent" />
              </div>
              <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Active Calibration</p>
                  <p className="text-xl font-black text-slate-900 font-mono uppercase tracking-tighter">{selectedColor}</p>
              </div>
            </div>
            
            <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white transition-all duration-500 group-hover:bg-blue-600 group-hover:scale-110">
              <Pipette className="h-5 w-5" />
            </div>
          </div>
          
          <input ref={inputRef} name="tonal-picker" type="color" value={selectedColor} onChange={handleColorChange} className="absolute opacity-0 pointer-events-none" />
          
          {/* Subtle background decoration */}
          <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-slate-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        </div>
      </div>
    </div>
  );
});

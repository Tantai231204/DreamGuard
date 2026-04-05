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
      "relative flex items-center justify-center h-8 w-8 rounded-lg border-2 transition-all duration-200 hover:scale-110",
      active
        ? "border-[#4988c4] shadow-sm ring-2 ring-[#4988c4]/15"
        : "border-transparent hover:border-slate-200"
    )}
    title={name}
  >
    <div
      className="h-6 w-6 rounded-md border border-black/8 shadow-sm"
      style={{ backgroundColor: hex }}
    />
    {active && (
      <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-[#4988c4] rounded-full border border-white" />
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

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Color</p>
        {addOnFee > 0 && (
          <span className="text-[9px] font-bold text-[#4988c4] font-mono bg-[#4988c4]/8 px-2 py-0.5 rounded-md border border-[#4988c4]/20">
            +{new Intl.NumberFormat("vi-VN").format(addOnFee)}
          </span>
        )}
      </div>

      {/* Preset swatches */}
      {uniqueColors.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
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

      {/* Custom picker */}
      <div
        className="group flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-[#4988c4]/40 hover:bg-white cursor-pointer transition-all duration-200"
        onClick={() => inputRef.current?.click()}
      >
        {/* Color preview */}
        <div
          className="h-9 w-9 rounded-lg border-2 border-white shadow-md flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: selectedColor }}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Custom</p>
          <p className="text-[13px] font-bold text-slate-800 font-mono uppercase tracking-wider">{selectedColor}</p>
        </div>

        {/* Pipette button */}
        <div className="h-8 w-8 rounded-lg bg-slate-200 group-hover:bg-[#4988c4] flex items-center justify-center flex-shrink-0 transition-all duration-200">
          <Pipette className="h-3.5 w-3.5 text-slate-500 group-hover:text-white transition-colors" />
        </div>

        <input ref={inputRef} name="tonal-picker" type="color" value={selectedColor} onChange={(e) => onSelect(e.target.value)} className="absolute opacity-0 pointer-events-none" />
      </div>
    </div>
  );
});

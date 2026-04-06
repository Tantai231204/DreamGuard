import React, { memo } from "react";
import { Type, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { DesignConfig, EmbroideryPosition } from "../types";

interface ArtisticRefinementProps {
  design: DesignConfig;
  productName?: string;
  updateDesign: (updates: Partial<DesignConfig>) => void;
}

const Chip = memo(({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "px-5 py-2 rounded-2xl border-2 text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-500",
      active 
        ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200 scale-[1.03]" 
        : "border-slate-50 bg-white text-slate-500 hover:border-blue-100 hover:text-blue-600 hover:shadow-md"
    )}
  >
    {children}
  </button>
));

export const ArtisticRefinement = memo(({ design, productName = "", updateDesign }: ArtisticRefinementProps) => {
  const isCrib = productName.toLowerCase().includes('crib');
  
  const positions = isCrib 
    ? [{ id: "front-rail", label: "Front Rail", icon: "🪵" }, { id: "side-rail", label: "Side Rail", icon: "📐" }, { id: "headboard", label: "Headboard", icon: "🛏️" }]
    : [{ id: "center", label: "Center", icon: "⊕" }, { id: "corner", label: "Corner", icon: "◳" }, { id: "bottom-edge", label: "Bottom Edge", icon: "▁" }];

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-1">
          <Type className="h-3.5 w-3.5 text-blue-600/70" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{isCrib ? "Engraving Detail" : "Embroidery Detail"}</span>
        </div>
        
        <div className="space-y-6">
          <div className="relative group">
            <Input 
              value={design.embroideryText} 
              onChange={e => updateDesign({ embroideryText: e.target.value.slice(0, 15) })} 
              placeholder="Enter signature..." 
              maxLength={15} 
              className="h-16 rounded-[2rem] border-2 border-slate-50 bg-slate-50/20 px-7 text-[14px] font-black placeholder:text-slate-200 focus:border-blue-600/30 focus:bg-white focus:ring-0 shadow-inner transition-all duration-500" 
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 tracking-widest">{design.embroideryText.length}/15</div>
          </div>

          <AnimatePresence>
            {design.embroideryText.trim() && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 10 }} 
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} 
                className="space-y-5 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm"
              >
                <div className="flex items-center gap-2 px-1">
                   <CheckCircle2 className="h-3 w-3 text-blue-500" />
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] font-mono">📍 Position Matrix</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {positions.map((pos) => (
                    <Chip 
                      key={pos.id} 
                      active={design.embroideryPosition === pos.id} 
                      onClick={() => updateDesign({ embroideryPosition: pos.id as EmbroideryPosition })}
                    >
                      {pos.icon} {pos.label}
                    </Chip>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});

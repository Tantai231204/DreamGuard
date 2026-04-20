import { memo } from "react";
import { cn } from "@/lib/utils";
import { getColorHex } from "@/utils/color-utils";

interface TradeInAssetCardProps {
  sku?: string;
  size?: string;
  color?: string;
  imageUrl?: string;
  isLoading?: boolean;
  isDamaged?: boolean;
  label?: string;
}

export const TradeInAssetCard = memo(function TradeInAssetCard({
  sku,
  size,
  color,
  imageUrl,
  isLoading,
  isDamaged,
  label = "Affected Asset",
}: TradeInAssetCardProps) {
  return (
    <div className={cn(
      "rounded-xl border transition-all p-3",
      isDamaged ? "border-rose-200 bg-rose-50/20" : "border-slate-100 bg-white shadow-sm"
    )}>
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2 px-0.5">{label}</p>
      
      {!sku && !isLoading ? (
        <p className="text-[12px] text-slate-500">No asset information available.</p>
      ) : isLoading ? (
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-12 h-12 bg-slate-100 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-100 rounded w-3/4" />
            <div className="h-2 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-50 shrink-0 border border-slate-100/50 shadow-inner group-hover:shadow-md transition-shadow">
            <img
              src={imageUrl || "/images/placeholder-product.svg"}
              alt={sku}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-bold text-slate-800 truncate leading-none">
                {sku || "Product Variant"}
              </p>
              <span className="text-[10px] font-black text-slate-300 shrink-0">×1</span>
            </div>

            <div className="flex items-center gap-1 flex-wrap mt-0.5">
              {sku && (
                <span className="text-[9px] font-mono font-medium text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded uppercase tracking-tighter truncate max-w-[100px]">{sku}</span>
              )}
              {size && (
                <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded whitespace-nowrap">Size {size}</span>
              )}
              {color && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full ring-1 ring-black/5" style={{ backgroundColor: getColorHex(color) }} />
                  {color}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

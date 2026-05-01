import { memo } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderItem } from "@/api/types/order";
import { useVariant } from "@/hooks/queries/useVariant";
import { useProductDetail, useComboDetail } from "@/hooks/queries";
import { getColorHex } from "@/utils/color-utils";

interface ReturnItemRowProps {
  item: OrderItem;
  damaged: number;
  onQtyChange: (id: string, qty: number, max: number) => void;
}

export const ReturnItemRow = memo(function ReturnItemRow({ item, damaged, onQtyChange }: ReturnItemRowProps) {
  const isDamaged = damaged > 0;
  const isCombo = !!item.comboId;
  const { data: variant } = useVariant(isCombo ? "" : (item.productVariantId || ""));
  const { data: comboDetail } = useComboDetail(item.comboId || "", isCombo);

  // 🔥 Sync logic with OrderItemsList.tsx for perfect visual parity
  const variantAttrs = (variant?.attributes || {}) as Record<string, unknown>;
  const { data: product } = useProductDetail(variant?.productId || "", !!variant?.productId);

  const variantImage = (variantAttrs?.imageUrls as string[])?.[0] ||
    (variantAttrs?.imageUrl as string) ||
    (variantAttrs?.image as string) ||
    (variantAttrs?.thumbnail as string) ||
    product?.imageUrls?.[0] ||
    product?.assets?.[0]?.url;

  const resolvedImage = item.image || variantImage || comboDetail?.imageUrl || "/images/placeholder-product.svg";

  return (
    <div className={cn(
      "flex items-center gap-3 p-2.5 rounded-xl border transition-all group relative",
      isDamaged ? "border-rose-200 bg-rose-50/20" : "border-slate-100 hover:border-slate-200 shadow-sm bg-white"
    )}>
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-50 shrink-0 shadow-inner group-hover:shadow-md transition-shadow ring-1 ring-slate-100/50">
        <img
          src={resolvedImage}
          alt={item.itemName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-bold text-slate-800 truncate leading-none">{item.itemName}</p>
          <span className="text-[10px] font-black text-slate-300 shrink-0">×{item.quantity}</span>
        </div>

        <div className="flex items-center gap-1 overflow-hidden">
          {variant?.sku && (
            <span className="text-[9px] font-mono font-medium text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded uppercase tracking-tighter truncate max-w-[100px]">{variant.sku}</span>
          )}
          {variant?.size && (
            <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded whitespace-nowrap">{variant.size}</span>
          )}
          {!!variantAttrs.color && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full ring-1 ring-black/5" style={{ backgroundColor: getColorHex(String(variantAttrs.color)) }} />
              {String(variantAttrs.color)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          disabled={!isDamaged}
          onClick={() => onQtyChange(item.id, damaged - 1, item.quantity)}
          className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center transition-all",
            isDamaged
              ? "bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-600 shadow-sm"
              : "bg-transparent text-slate-200 cursor-not-allowed",
          )}
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className={cn("w-7 text-center text-sm font-black tabular-nums", isDamaged ? "text-rose-600 animate-in zoom-in-75 duration-75" : "text-slate-300")}>{damaged}</span>
        <button
          type="button"
          disabled={damaged >= item.quantity}
          onClick={() => onQtyChange(item.id, damaged + 1, item.quantity)}
          className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center transition-all",
            damaged < item.quantity
              ? "bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-sm"
              : "bg-transparent text-slate-200 cursor-not-allowed",
          )}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
});

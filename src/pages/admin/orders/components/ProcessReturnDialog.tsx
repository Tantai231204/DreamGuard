import { useState, useCallback, useMemo, memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, RotateCcw, Plus, Minus, Link2, FileText, ChevronDown, Package } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { OrderItem } from "@/api/types/order";
import type { ProcessReturnedRequest } from "@/api/types/shipping";
import { useProcessReturnedShippingTask } from "@/hooks/queries/useShippingTask";
import { useVariant } from "@/hooks/queries/useVariant";
import { getColorHex } from "@/utils/color-utils";

const MAX_VISIBLE = 3;

interface ProcessReturnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  taskId: string;
  items: OrderItem[];
}

export function ProcessReturnDialog({ isOpen, onClose, orderId, taskId, items }: ProcessReturnDialogProps) {
  const [damageNote, setDamageNote] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [damagedQty, setDamagedQty] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState(false);
  const processReturned = useProcessReturnedShippingTask();

  const hasDamages = Object.keys(damagedQty).length > 0;
  const totalDamaged = useMemo(() => Object.values(damagedQty).reduce((s, q) => s + q, 0), [damagedQty]);
  const totalUnits = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const needsCollapse = items.length > MAX_VISIBLE;
  const visibleItems = needsCollapse && !expanded ? items.slice(0, MAX_VISIBLE) : items;
  const hiddenCount = items.length - MAX_VISIBLE;

  const handleQtyChange = useCallback((id: string, qty: number, max: number) => {
    if (qty < 0 || qty > max) return;
    setDamagedQty(prev => {
      const next = { ...prev };
      if (qty === 0) delete next[id]; else next[id] = qty;
      return next;
    });
  }, []);

  const resetAndClose = useCallback(() => {
    setDamageNote("");
    setEvidenceUrl("");
    setDamagedQty({});
    setExpanded(false);
    onClose();
  }, [onClose]);

  const handleConfirm = useCallback(async () => {
    const data: Partial<ProcessReturnedRequest> = hasDamages
      ? {
        damageNote,
        evidenceUrls: evidenceUrl ? [evidenceUrl] : [],
        damagedItems: Object.entries(damagedQty).map(([id, qty]) => ({
          orderItemId: id,
          damagedQuantity: qty,
        })),
      }
      : {};

    try {
      await processReturned.mutateAsync({ taskId, orderId, data });
      toast.success("Return processed successfully.");
      resetAndClose();
    } catch {
      toast.error("Failed to process return.");
    }
  }, [hasDamages, damageNote, evidenceUrl, damagedQty, processReturned, taskId, orderId, resetAndClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden rounded-2xl border border-slate-200 shadow-xl gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">Process Return</DialogTitle>
              <DialogDescription className="text-[13px] text-slate-500">
                Inspect returned items and record damages
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 bg-white max-h-[62vh] overflow-y-auto custom-scrollbar">
          {/* Summary */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <Package className="w-4 h-4" />
              <span>
                <span className="font-semibold text-slate-700">{items.length}</span> item{items.length > 1 ? "s" : ""} ·{" "}
                <span className="font-semibold text-slate-700">{totalUnits}</span> units
              </span>
            </div>
            {hasDamages && (
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                {totalDamaged} damaged
              </span>
            )}
          </div>

          {/* Items */}
          <div className="space-y-2">
            {visibleItems.map((item) => (
              <ReturnItemRow
                key={item.id}
                item={item}
                damaged={damagedQty[item.id] || 0}
                onQtyChange={handleQtyChange}
              />
            ))}
            {needsCollapse && (
              <button
                type="button"
                onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 rounded-lg transition-colors"
              >
                <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
                {expanded ? "Show less" : `Show ${hiddenCount} more item${hiddenCount > 1 ? "s" : ""}`}
              </button>
            )}
          </div>

          {/* Notes & Evidence */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                {hasDamages ? "Damage Notes" : "Notes"}
                <span className={cn("text-[11px] font-normal", hasDamages ? "text-rose-500" : "text-slate-400")}>
                  {hasDamages ? "(Required)" : "(Optional)"}
                </span>
              </label>
              <Textarea
                placeholder={hasDamages ? "Describe the damages found..." : "Any notes about the return..."}
                value={damageNote}
                onChange={(e) => setDamageNote(e.target.value)}
                className="resize-none min-h-[80px] rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-300 focus:ring-blue-200/50 placeholder:text-slate-400 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-slate-400" />
                Evidence URL
                <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
              </label>
              <Input
                placeholder="https://..."
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                className="rounded-lg h-9 border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-300 focus:ring-blue-200/50 placeholder:text-slate-400 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={resetAndClose} disabled={processReturned.isPending} className="text-slate-500 hover:text-slate-700 rounded-lg h-9 px-4 text-sm">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={processReturned.isPending || (hasDamages && !damageNote.trim())}
            className={cn(
              "h-9 px-5 rounded-lg font-semibold text-sm text-white shadow-sm gap-2",
              hasDamages ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {processReturned.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {processReturned.isPending ? "Processing..." : hasDamages ? "Record Damages" : "Confirm Restock"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Memoized Item Row ───────────────────────────────────────────────

interface ReturnItemRowProps {
  item: OrderItem;
  damaged: number;
  onQtyChange: (id: string, qty: number, max: number) => void;
}

const ReturnItemRow = memo(function ReturnItemRow({ item, damaged, onQtyChange }: ReturnItemRowProps) {
  const isDamaged = damaged > 0;
  const { data: variant } = useVariant(item.comboId ? "" : (item.productVariantId || ""));
  const attributes = (variant?.attributes || {}) as Record<string, unknown>;

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all", isDamaged ? "border-rose-200 bg-rose-50/30" : "border-slate-100 hover:border-slate-200")}>
      <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0">
        <img src={item.image || "/images/placeholder-product.svg"} alt={item.itemName} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{item.itemName}</p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {variant?.sku && (
            <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">{variant.sku}</span>
          )}
          {variant?.size && (
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">{variant.size}</span>
          )}
          {!!attributes.color && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
              <span className="w-2 h-2 rounded-full ring-1 ring-black/10" style={{ backgroundColor: getColorHex(String(attributes.color)) }} />
              {String(attributes.color)}
            </span>
          )}
          <span className="text-[10px] font-medium text-slate-400">×{item.quantity}</span>
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          disabled={!isDamaged}
          onClick={() => onQtyChange(item.id, damaged - 1, item.quantity)}
          className={cn("w-7 h-7 rounded-md flex items-center justify-center transition-colors border", isDamaged ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50" : "border-transparent text-slate-300 cursor-not-allowed")}
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className={cn("w-7 text-center text-sm font-bold tabular-nums", isDamaged ? "text-rose-600" : "text-slate-400")}>{damaged}</span>
        <button
          type="button"
          disabled={damaged >= item.quantity}
          onClick={() => onQtyChange(item.id, damaged + 1, item.quantity)}
          className={cn("w-7 h-7 rounded-md flex items-center justify-center transition-colors border", damaged < item.quantity ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50" : "border-transparent text-slate-300 cursor-not-allowed")}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
});

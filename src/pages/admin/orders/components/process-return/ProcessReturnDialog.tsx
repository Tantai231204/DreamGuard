import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, ChevronDown, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderItem } from "@/api/types/order";

import { useProcessReturn } from "./useProcessReturn";
import { ReturnItemRow } from "./ReturnItemRow";
import { DamageOutcomeSection } from "./DamageOutcomeSection";
import { EvidenceUploadSection } from "./EvidenceUploadSection";
import { RefundSection } from "./RefundSection";
import { MAX_VISIBLE } from "./constants";

interface ProcessReturnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  taskId: string;
  items: OrderItem[];
  totalPrice?: number;
  paymentMethod?: string;
  paymentStatus?: string;
}

export const ProcessReturnDialog = memo(function ProcessReturnDialog({
  isOpen,
  onClose,
  orderId,
  taskId,
  items,
  totalPrice = 0,
  paymentMethod,
  paymentStatus
}: ProcessReturnDialogProps) {
  
  const isRefundableMethod = (paymentMethod?.toLowerCase() === 'vnpay' || paymentMethod?.toLowerCase() === 'other') &&
    (paymentStatus?.toLowerCase() === 'paid' || paymentStatus?.toLowerCase() === 'codpaid');
  const showRefundSection = totalPrice > 0;

  const { state, actions } = useProcessReturn({
    orderId,
    taskId,
    totalPrice,
    onClose,
    showRefundSection,
    isRefundableMethod
  });

  const {
    damageNote,
    selectedReason,
    evidenceItems,
    damagedQty,
    hasDamages,
    totalDamaged,
    expanded,
    percentage,
    refundAmount,
    isSubmitting,
    uploadedCount,
    isRefund
  } = state;

  const {
    setDamageNote,
    setSelectedReason,
    setExpanded,
    setPercentage,
    setRefundAmount,
    handleQtyChange,
    resetAndClose,
    addEvidenceFiles,
    removeEvidenceFile,
    handleConfirm,
    setIsRefund
  } = actions;

  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
  const needsCollapse = items.length > MAX_VISIBLE;
  const visibleItems = needsCollapse && !expanded ? items.slice(0, MAX_VISIBLE) : items;
  const hiddenCount = items.length - MAX_VISIBLE;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && resetAndClose()}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden rounded-2xl border border-slate-200 shadow-xl gap-0 animate-in zoom-in-95 duration-300">
        {/* Compact Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/70 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl opacity-40" />
          <div className="flex items-center gap-3 relative z-10">
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors duration-500",
              hasDamages ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
            )}>
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className={cn(
                "text-[10px] font-bold uppercase tracking-[0.16em]",
                hasDamages ? "text-rose-600" : "text-blue-600"
              )}>Recovery Workflow</p>
              <DialogTitle className="text-base font-bold text-slate-900 tracking-tight">Process Return</DialogTitle>
              <DialogDescription className="text-[13px] font-medium text-slate-500">
                Inspect manifestations and formalize auditing
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Intelligence Body */}
        <div className="px-6 py-5 space-y-5 bg-white max-h-[62vh] overflow-y-auto custom-scrollbar">
          {/* Logistics Summary */}
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-400" />
              <span>Manifest: <span className="text-slate-800">{items.length} Elements</span> / <span className="text-slate-800">{totalUnits} Units</span></span>
            </div>
            {hasDamages && (
              <span className="text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md font-semibold text-[10px] border border-rose-100 animate-in fade-in zoom-in-95 duration-300">
                {totalDamaged} Anomalies
              </span>
            )}
          </div>

          {/* Item Cluster */}
          <div className="space-y-2">
            {visibleItems.map((item: OrderItem) => (
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
                onClick={() => setExpanded((v: boolean) => !v)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold uppercase tracking-widest text-blue-600 hover:bg-slate-50 rounded-lg transition-all"
              >
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", expanded && "rotate-180")} />
                {expanded ? "Collapse manifest" : `Show ${hiddenCount} more items`}
              </button>
            )}
          </div>

          <div className="space-y-5">
            <AnimatePresence mode="wait">
              {hasDamages ? (
                <motion.div
                  key="damage-protocol"
                  initial={{ opacity: 0, height: 0, y: 10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                  className="space-y-5 overflow-hidden pb-1"
                >
                  <DamageOutcomeSection
                    selectedReason={selectedReason}
                    damageNote={damageNote}
                    setSelectedReason={setSelectedReason}
                    setDamageNote={setDamageNote}
                  />
                  
                  <EvidenceUploadSection
                    evidenceItems={evidenceItems}
                    isSubmitting={isSubmitting}
                    uploadedCount={uploadedCount}
                    addEvidenceFiles={addEvidenceFiles}
                    removeEvidenceFile={removeEvidenceFile}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="restock-ready"
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                  className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 overflow-hidden"
                >
                  <div className="flex gap-2.5">
                    <Package className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-blue-900 tracking-tight">Restock Ready</p>
                      <p className="text-[11px] font-medium text-blue-600/70 leading-relaxed">
                        All units verified as restockable. Inventory buffers will be synchronized upon confirmation.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {showRefundSection && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <RefundSection
                  hasDamages={hasDamages}
                  percentage={percentage}
                  refundAmount={refundAmount}
                  totalPrice={totalPrice}
                  setPercentage={setPercentage}
                  setRefundAmount={setRefundAmount}
                  paymentMethod={paymentMethod}
                  paymentStatus={paymentStatus}
                  isRefund={isRefund}
                  setIsRefund={setIsRefund}
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-2.5">
          <Button 
            variant="ghost" 
            onClick={resetAndClose} 
            disabled={isSubmitting} 
            className="h-9 px-4 rounded-lg text-slate-500 font-bold text-[13px] hover:bg-white hover:text-slate-700 transition-all"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || (hasDamages && !selectedReason)}
            className={cn(
              "h-9 px-5 rounded-lg font-bold text-[13px] text-white shadow-sm transition-all duration-300 gap-2 border-0",
              hasDamages 
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200" 
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
            )}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              hasDamages ? "Confirm Damages" : "Authorize Restock"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

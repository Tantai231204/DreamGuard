import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, ShieldAlert, XCircle, Loader2, RotateCcw, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RefundSection } from "../../orders/components/process-return/RefundSection";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface CancelTradeInOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: {
    reason: string;
    refundAmount?: number;
    evidenceUrls?: string[];
    shouldCreateReturn?: boolean;
    type: 'cancel' | 'refund';
  }) => Promise<void>;
  isLoading?: boolean;
  orderCode?: string;
  totalPrice?: number;
  isRefundOnly?: boolean;
  paymentMethod?: string;
  paymentStatus?: string;
}

const REASONS = [
  "Product Inspection Failed",
  "Price Disagreement",
  "Fraud Suspicion",
  "Incomplete Documentation",
  "Return",
  "Other"
];

export function CancelTradeInOrderDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  orderCode,
  totalPrice = 0,
  isRefundOnly = false,
  paymentMethod,
  paymentStatus,
}: CancelTradeInOrderDialogProps) {
  const [selectedReason, setSelectedReason] = React.useState<string>(isRefundOnly ? "Return" : "");
  const [otherReason, setOtherReason] = React.useState("");
  const [error, setError] = React.useState("");
  const [shouldCreateReturn, setShouldCreateReturn] = React.useState(false);

  const [percentage, setPercentage] = React.useState<number>(100);
  const [refundAmount, setRefundAmount] = React.useState<number>(totalPrice);

  React.useEffect(() => {
    if (open) {
      setRefundAmount(totalPrice);
      setPercentage(100);
      setSelectedReason(isRefundOnly ? "Return" : "");
      setOtherReason("");
      setError("");
      setShouldCreateReturn(false);
    }
  }, [open, totalPrice, isRefundOnly]);

  const handlePercentageChange = (val: number) => {
    setPercentage(val);
    setRefundAmount(Math.round((totalPrice * val) / 100));
  };

  const handleAmountChange = (val: number) => {
    setRefundAmount(val);
    setPercentage(totalPrice > 0 ? Math.round((val / totalPrice) * 100) : 0);
  };

  const handleConfirm = async () => {
    const finalReason = selectedReason === "Other" ? otherReason : selectedReason;

    if (!finalReason.trim()) {
      setError("Please select or provide a reason.");
      return;
    }

    if (selectedReason === "Other" && otherReason.length < 10) {
      setError("Please provide a more detailed reason (at least 10 characters).");
      return;
    }

    setError("");

    await onConfirm({
      reason: finalReason,
      refundAmount: showRefundSection ? refundAmount : undefined,
      shouldCreateReturn,
      type: isRefundOnly ? 'refund' : 'cancel'
    });
  };

  const handleClose = (val: boolean) => {
    if (!isLoading) {
      onOpenChange(val);
    }
  };

  const showRefundSection = isRefundOnly || totalPrice > 0;
  const isSubmitting = isLoading;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border border-slate-200 rounded-3xl shadow-2xl flex flex-col max-h-[92vh]">
        <DialogHeader className="px-8 pt-6 pb-4 border-b border-slate-100 bg-slate-50/70 relative shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-40" />
          <div className="flex items-center gap-4 relative z-10">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center border shadow-sm transition-colors",
              isRefundOnly ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-white border-slate-200 text-rose-600"
            )}>
              {isRefundOnly ? <RotateCcw className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-slate-900 uppercase tracking-tight">
                {isRefundOnly ? "Authorize Refund" : "Terminate Trade"}
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mt-1">
                Reference #{orderCode || 'DG-XXXXX'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "border-l-4 p-4 flex items-start gap-4 rounded-r-xl shadow-sm",
              isRefundOnly ? "bg-blue-50/30 border-blue-500" : "bg-rose-50/10 border-rose-500"
            )}
          >
            {isRefundOnly ? <RotateCcw className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" /> : <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />}
            <div className="space-y-1">
              <p className={cn("text-[10px] font-black uppercase tracking-widest", isRefundOnly ? "text-blue-600" : "text-rose-600")}>
                {isRefundOnly ? "Financial Settlement" : "Administrative Override"}
              </p>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {isRefundOnly 
                  ? "Initialize a refund settlement for auditing and payment finalization." 
                  : "Terminating triggers an automatic financial settlement and inventory reset."
                }
              </p>
              {paymentMethod && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/50">
                  <span className="text-[9px] font-black uppercase text-slate-400">Ledger Status:</span>
                  <span className="text-[9px] font-bold text-slate-600 uppercase bg-slate-100 px-2 py-0.5 rounded">
                    {paymentMethod} • {paymentStatus || 'UNPAID'}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Vertical Stack */}
          <div className="space-y-6">
            {/* Context & Reason */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                Reason <span className="text-rose-500">*</span>
              </label>
              <Select onValueChange={setSelectedReason} value={selectedReason} disabled={isSubmitting}>
                <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-white text-xs font-semibold focus:ring-0 focus:border-slate-400 shadow-sm transition-all focus:shadow-md">
                  <SelectValue placeholder="Choose a reason" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-xl overflow-hidden p-1">
                  {REASONS.map((r) => (
                    <SelectItem key={r} value={r} className="text-xs font-medium py-2.5 rounded-lg focus:bg-slate-50">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isRefundOnly && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start space-x-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/50 transition-colors cursor-pointer group"
                onClick={() => setShouldCreateReturn(!shouldCreateReturn)}
              >
                <div className="pt-0.5">
                  <Checkbox 
                    id="create-return" 
                    checked={shouldCreateReturn}
                    onCheckedChange={(val) => setShouldCreateReturn(!!val)}
                    className="rounded-md border-2 border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 transition-all"
                  />
                </div>
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="create-return"
                    className="text-[11px] font-black text-slate-700 uppercase tracking-widest cursor-pointer flex items-center gap-2"
                  >
                    Issue Return Manifest
                    <Package className="h-3 w-3 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  </label>
                  <p className="text-[10px] font-medium text-slate-500 leading-normal">
                    Automatically initialize a shipping task to return the trade-in items to the customer.
                  </p>
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {selectedReason === "Other" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                    Details <span className="text-rose-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Specify relevant details..."
                    className="min-h-[120px] rounded-xl border-slate-200 bg-white focus:ring-4 focus:ring-slate-500/5 focus:border-slate-300 transition-all resize-none text-xs font-medium p-4 shadow-sm"
                    value={otherReason}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOtherReason(e.target.value)}
                    disabled={isSubmitting}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <p className="text-[11px] font-bold text-rose-500 ml-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-left-1">
                <XCircle className="h-3.5 w-3.5" /> {error}
              </p>
            )}

            {/* Settlement */}
            <div className="space-y-6 pt-1">

              {showRefundSection && (
                <div className="pt-2">
                  <RefundSection
                    hasDamages={true}
                    percentage={percentage}
                    refundAmount={refundAmount}
                    totalPrice={totalPrice}
                    setPercentage={handlePercentageChange}
                    setRefundAmount={handleAmountChange}
                    paymentMethod={paymentMethod}
                    paymentStatus={paymentStatus}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="bg-slate-50/50 px-8 py-4 border-t border-slate-100 flex flex-row items-center justify-end gap-4 shrink-0">
          <Button
            variant="ghost"
            onClick={() => handleClose(false)}
            disabled={isSubmitting}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-transparent h-11 px-6 transition-colors"
          >
            Go Back
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || !selectedReason}
            className={cn(
              "font-black text-[10px] uppercase tracking-widest px-8 h-11 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 !border-0 shadow-lg min-w-[160px]",
              isRefundOnly 
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200/50" 
                : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200/50"
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Finalizing...
              </span>
            ) : isRefundOnly ? "Finalize Refund" : (showRefundSection && refundAmount > 0 ? "Finalize Settlement" : "Confirm Termination")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

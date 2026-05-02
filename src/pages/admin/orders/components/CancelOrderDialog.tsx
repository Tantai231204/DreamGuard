import React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
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
import { AlertTriangle, ShieldAlert, XCircle, Loader2, RotateCcw } from "lucide-react";
import { RefundSection } from "./RefundSection";

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string, refundAmount?: number) => void;
  isLoading?: boolean;
  orderCode?: string;
  isRefundOnly?: boolean;
  totalPrice?: number;
  paymentMethod?: string;
  paymentStatus?: string;
}

const REASONS = [
  "Customer requested cancellation",
  "Delivery failed (Unreachable)",
  "Stock issues / Unavailable",
  "Incorrect shipping address",
  "Refund for customer-initiated cancellation",
  "Return",
  "Other"
];

export function CancelOrderDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  orderCode,
  isRefundOnly = false,
  totalPrice = 0,
  paymentMethod,
  paymentStatus,
}: CancelOrderDialogProps) {
  const [selectedReason, setSelectedReason] = React.useState<string>(isRefundOnly ? "Return" : "");
  const [otherReason, setOtherReason] = React.useState("");
  const [error, setError] = React.useState("");
  const [percentage, setPercentage] = React.useState<number>(100);
  const [refundAmount, setRefundAmount] = React.useState<number>(totalPrice);

  // Sync refund amount when total price changes (e.g. when dialog opens with new order)
  React.useEffect(() => {
    if (open) {
      setRefundAmount(totalPrice);
      setPercentage(100);
    }
  }, [open, totalPrice]);

  const handleSetPercentage = React.useCallback((val: number) => {
    setPercentage(val);
    setRefundAmount((totalPrice * val) / 100);
  }, [totalPrice]);

  const handleSetRefundAmount = React.useCallback((val: number) => {
    setRefundAmount(val);
    if (totalPrice > 0) {
      setPercentage(Math.round((val / totalPrice) * 100));
    }
  }, [totalPrice]);

  const handleConfirm = () => {
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
    onConfirm(finalReason, showRefundSection ? refundAmount : undefined);
  };

  const handleClose = (val: boolean) => {
    if (!isLoading) {
      onOpenChange(val);
      if (!val) {
        setSelectedReason(isRefundOnly ? "Return" : "");
        setOtherReason("");
        setError("");
      }
    }
  };

  const isRefundableMethod = (paymentMethod?.toLowerCase() === 'vnpay' || paymentMethod?.toLowerCase() === 'other') &&
    (paymentStatus?.toLowerCase() === 'paid' || paymentStatus?.toLowerCase() === 'codpaid');
  const showRefundSection = isRefundOnly || (isRefundableMethod && totalPrice > 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-0 overflow-hidden border border-slate-200 rounded-3xl shadow-2xl transition-all duration-500 max-w-lg">
        <DialogHeader className="px-8 pt-6 pb-4 border-b border-slate-100 bg-slate-50/70 relative shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-40" />
          <div className="flex items-center gap-4 relative z-10">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center border transition-colors shadow-sm",
              isRefundOnly ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-white border-slate-200 text-slate-600"
            )}>
              {isRefundOnly ? (
                <RotateCcw className="h-5 w-5" />
              ) : (
                <ShieldAlert className="h-5 w-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-slate-900 uppercase tracking-tight">
                {isRefundOnly ? "Order Refund" : "Terminate Order"}
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 leading-none">
                Reference #{orderCode || 'DG-XXXXX'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-8 py-6 space-y-6 flex-1 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "border-l-4 p-4 flex items-start gap-4 rounded-r-xl shadow-sm",
              isRefundOnly ? "bg-blue-50/30 border-blue-500" : "bg-rose-50/20 border-rose-500"
            )}
          >
            <AlertTriangle className={cn("h-5 w-5 shrink-0 mt-0.5", isRefundOnly ? "text-blue-500" : "text-rose-500")} />
            <div className="space-y-1">
              <p className={cn("text-[10px] font-black uppercase tracking-widest", isRefundOnly ? "text-blue-600" : "text-rose-600")}>
                {isRefundOnly ? "Financial Settlement" : "Administrative Override"}
              </p>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {isRefundOnly 
                  ? "Initialize a refund settlement for auditing and payment finalization." 
                  : "Terminating triggers an immediate inventory reset and payment audit."
                }
              </p>
            </div>
          </motion.div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                Reason <span className="text-rose-500">*</span>
              </label>
              <Select onValueChange={setSelectedReason} value={selectedReason} disabled={isLoading}>
                <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-white text-xs font-semibold focus:ring-0 focus:border-slate-400 shadow-sm">
                  <SelectValue placeholder="Choose a reason" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                  {REASONS.map((r) => (
                    <SelectItem key={r} value={r} className="text-xs font-medium py-2.5 cursor-pointer">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                    autoFocus
                    placeholder="Specify relevant details (minimum 10 characters)..."
                    className="min-h-[120px] rounded-xl border-slate-200 bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all resize-none text-xs font-medium p-4 shadow-sm"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    disabled={isLoading}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {showRefundSection && (
              <div className="pt-2">
                <RefundSection
                  hasDamages={!isRefundOnly}
                  percentage={percentage}
                  refundAmount={refundAmount}
                  totalPrice={totalPrice}
                  setPercentage={handleSetPercentage}
                  setRefundAmount={handleSetRefundAmount}
                />
              </div>
            )}

            {error && (
              <p className="text-[11px] font-bold text-rose-500 ml-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-left-1">
                <XCircle className="h-3.5 w-3.5" /> {error}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="bg-slate-50/50 px-8 py-4 border-t border-slate-100 flex flex-row items-center justify-end gap-4 shrink-0">
          <Button
            variant="ghost"
            onClick={() => handleClose(false)}
            disabled={isLoading}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-transparent h-11 px-6"
          >
            Go Back
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !selectedReason}
            className={cn(
                "text-white font-black text-[10px] uppercase tracking-widest px-8 h-11 rounded-xl transition-all active:scale-95 disabled:opacity-50 !border-0 shadow-lg",
                isRefundOnly ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20" : "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Processing...
              </span>
            ) : isRefundOnly ? "Initialize Refund" : "Confirm Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
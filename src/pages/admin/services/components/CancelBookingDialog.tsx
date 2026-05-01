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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Percent, Calculator, RotateCcw } from "lucide-react";

interface CancelBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, refundAmount?: number) => void;
  isLoading?: boolean;
  orderCode?: string;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string;
  totalPrice?: number;
  mergedOrderTaskStatus?: string;
  isRefundOnly?: boolean;
}

const REASONS = [
  "Customer requested cancellation",
  "Out of service area / Unfeasible",
  "Technical difficulty / Equipment issue",
  "Incorrect booking information",
  "Schedule conflict / Time unavailable",
  "Technician unassigned / Unavailable",
  "Refund for customer-initiated cancellation",
  "Return",
  "Other"
];

export function CancelBookingDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  orderCode,
  status,
  paymentMethod,
  paymentStatus,
  totalPrice = 0,
  mergedOrderTaskStatus,
  isRefundOnly
}: CancelBookingDialogProps) {
  const [selectedReason, setSelectedReason] = React.useState<string>(isRefundOnly ? "Return" : "");
  const [otherReason, setOtherReason] = React.useState("");
  const [error, setError] = React.useState("");
  const [percentage, setPercentage] = React.useState<number>(100);
  const [refundAmount, setRefundAmount] = React.useState<number>(totalPrice);

  React.useEffect(() => {
    if (totalPrice > 0) {
      setRefundAmount((totalPrice * percentage) / 100);
    }
  }, [percentage, totalPrice]);

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

  const normalizedStatus = status.toLowerCase();
  const isForcedCancel = (mergedOrderTaskStatus || '').toLowerCase() === 'forcedcancelled';
  const isReject = (normalizedStatus === 'pending' || normalizedStatus === 'rescheduled' || normalizedStatus === 'waiting' || normalizedStatus === 'unconfirmed') && !isForcedCancel;

  const isVNPayPaid = paymentMethod?.toLowerCase() === 'vnpay' &&
    (paymentStatus?.toLowerCase() === 'paid' || paymentStatus?.toLowerCase() === 'codpaid');
  const showRefundSection = isRefundOnly || (isVNPayPaid && totalPrice > 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden border border-slate-200 rounded-2xl shadow-xl">
        <div className="bg-white p-6 space-y-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight uppercase">
              {isRefundOnly ? "Initialize Refund Settlement" : isForcedCancel ? "Finalize Forced Cancel" : isReject ? "Reject Service Order" : "Cancel Service Order"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Reference Identifier: <span className="font-bold text-slate-900">{orderCode}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className={`border-l-4 p-4 flex items-start gap-3 shadow-sm transition-colors ${isRefundOnly ? 'border-blue-500 bg-blue-50/20' : isForcedCancel ? 'border-amber-500 bg-amber-50/20' : 'border-rose-500 bg-white'}`}>
              <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${isRefundOnly ? 'text-blue-500' : isForcedCancel ? 'text-amber-500' : 'text-rose-500'}`} />
              <p className={`text-xs font-medium leading-relaxed ${isRefundOnly ? 'text-blue-700' : isForcedCancel ? 'text-amber-700' : 'text-rose-700'}`}>
                {isRefundOnly
                  ? "This order was cancelled by the customer. Since it was prepaid via VNPay, you need to initialize a refund settlement for financial auditing."
                  : isForcedCancel
                    ? "A technician has force-cancelled this task. You are now finalizing the order termination. Refund logic will apply if applicable."
                    : isReject
                      ? "Rejecting this order will notify the customer and terminate the service process."
                      : "Are you sure you want to cancel this service? This action cannot be undone."
                }
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Reason for {isRefundOnly ? 'settlement' : 'cancellation'} <span className="text-rose-500">*</span>
                </Label>
                <Select onValueChange={setSelectedReason} value={selectedReason}>
                  <SelectTrigger className="w-full h-10 rounded-xl border-slate-200 bg-white text-sm focus:ring-0 focus:border-slate-400">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {REASONS.map((r) => (
                      <SelectItem key={r} value={r} className="text-sm py-2.5">
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedReason === "Other" && (
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                    Details <span className="text-rose-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Enter additional details..."
                    className="min-h-[80px] rounded-xl border-slate-200 focus:ring-0 focus:border-slate-400 text-sm"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              )}

              {showRefundSection && (
                <div className="space-y-4 pt-5 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                        <RotateCcw className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Refund Calculation</span>
                    </div>
                    <div className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                      Prepaid Order
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Percentage (%)</Label>
                      <div className="relative group">
                        <Input
                          type="number"
                          value={percentage}
                          onChange={(e) => setPercentage(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                          className="h-11 rounded-xl border-slate-200 bg-white font-black text-slate-900 shadow-none pl-10 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"
                        />
                        <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-400 transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Manual Amount</Label>
                      <div className="relative group">
                        <Input
                          type="number"
                          value={refundAmount}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setRefundAmount(val);
                            setPercentage(Math.round((val / totalPrice) * 100));
                          }}
                          className="h-11 rounded-xl border-slate-200 bg-white font-black text-slate-900 shadow-none pl-10 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"
                        />
                        <Calculator className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-400 transition-colors" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 shadow-lg shadow-slate-200 flex items-center justify-between group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <div className="relative z-10">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Settlement Total</span>
                      <span className="text-xl font-black text-white tracking-tight tabular-nums">{formatPrice(refundAmount)}</span>
                    </div>
                    <div className="relative z-10 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-sm">
                      <RotateCcw className="h-5 w-5 text-blue-300" />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-[11px] font-bold text-rose-500 ml-1">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-10 font-bold text-xs text-slate-500 hover:bg-slate-200 border-none shadow-none"
          >
            Go Back
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !selectedReason}
            className={`flex-1 h-10 font-bold text-xs text-white active:scale-95 transition-all shadow-none border-none outline-none ${isRefundOnly ? 'bg-blue-600 hover:bg-blue-700' : 'bg-rose-600 hover:bg-rose-700'}`}
          >
            {isLoading ? "Processing..." : (isRefundOnly ? "Create Refund" : isReject ? "Reject Order" : "Cancel Order")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
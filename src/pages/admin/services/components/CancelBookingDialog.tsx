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
}

const REASONS = [
  "Customer requested cancellation",
  "Out of service area / Unfeasible",
  "Technical difficulty / Equipment issue",
  "Incorrect booking information",
  "Schedule conflict / Time unavailable",
  "Technician unassigned / Unavailable",
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
  totalPrice = 0
}: CancelBookingDialogProps) {
  const [selectedReason, setSelectedReason] = React.useState<string>("");
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
  const isReject = normalizedStatus === 'pending' || normalizedStatus === 'rescheduled' || normalizedStatus === 'waiting' || normalizedStatus === 'unconfirmed';

  const isVNPayPaid = paymentMethod?.toLowerCase() === 'vnpay' && 
                      (paymentStatus?.toLowerCase() === 'paid' || paymentStatus?.toLowerCase() === 'codpaid');
  const showRefundSection = isVNPayPaid && totalPrice > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden border border-slate-200 rounded-2xl shadow-xl">
        <div className="bg-white p-6 space-y-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
              {isReject ? "Reject Service Order" : "Cancel Service Order"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Reference: <span className="font-bold text-slate-900">{orderCode}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="bg-white border-l-4 border-rose-500 p-4 flex items-start gap-3 shadow-sm transition-colors hover:bg-rose-50/10">
              <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 font-medium leading-relaxed">
                {isReject
                  ? "Rejecting this order will notify the customer and terminate the service process."
                  : "Are you sure you want to cancel this service? This action cannot be undone."
                }
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Reason for cancellation <span className="text-rose-500">*</span>
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
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Refund Amount Setup</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Percent (%)</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={percentage}
                          onChange={(e) => setPercentage(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                          className="h-10 rounded-xl border-slate-200 font-bold shadow-none pl-8"
                        />
                        <Percent className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Amount (VNĐ)</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={refundAmount}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setRefundAmount(val);
                            setPercentage(Math.round((val / totalPrice) * 100));
                          }}
                          className="h-10 rounded-xl border-slate-200 font-bold shadow-none pl-8"
                        />
                        <Calculator className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Total Refund:</span>
                    <span className="text-sm font-bold text-slate-900">{formatPrice(refundAmount)}</span>
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
            className="flex-1 h-10 font-bold text-xs bg-rose-600 text-white hover:bg-rose-700 active:scale-95 transition-all shadow-none border-none outline-none"
          >
            {isLoading ? "Processing..." : (isReject ? "Reject Order" : "Cancel Order")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
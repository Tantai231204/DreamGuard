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
import { AlertTriangle, ShieldAlert, XCircle, Loader2 } from "lucide-react";

interface CancelTradeInOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
  orderCode?: string;
}

const REASONS = [
  "Product Inspection Failed",
  "Price Disagreement",
  "Fraud Suspicion",
  "Incomplete Documentation",
  "Other"
];

export function CancelTradeInOrderDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  orderCode,
}: CancelTradeInOrderDialogProps) {
  const [selectedReason, setSelectedReason] = React.useState<string>("");
  const [otherReason, setOtherReason] = React.useState("");
  const [error, setError] = React.useState("");

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
    onConfirm(finalReason);
  };

  const handleClose = (val: boolean) => {
    if (!isLoading) {
      onOpenChange(val);
      if (!val) {
        setSelectedReason("");
        setOtherReason("");
        setError("");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border border-slate-200 rounded-3xl shadow-xl">
        <div className="bg-white p-6 space-y-6">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                <ShieldAlert className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  Terminate Trade-In
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Reference #{orderCode || 'DG-XXXXX'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5">
            <div className="bg-white border-l-4 border-rose-500 p-4 flex items-start gap-3 shadow-sm transition-all hover:bg-rose-50/10">
              <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Administrative Override</p>
                <p className="text-[12px] text-slate-600 font-medium leading-relaxed">
                  This action will permanently cancel the trade-in request. Triggering an automatic refund and inventory status reset.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Cancellation Reason <span className="text-rose-500">*</span>
                </label>
                <Select onValueChange={setSelectedReason} value={selectedReason} disabled={isLoading}>
                  <SelectTrigger className="w-full h-12 rounded-xl border-slate-200 bg-white text-sm font-medium focus:ring-0 focus:border-slate-400 transition-all">
                    <SelectValue placeholder="Choose a cancellation reason" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    {REASONS.map((r) => (
                      <SelectItem key={r} value={r} className="text-sm font-medium focus:bg-slate-50 rounded-lg py-3 cursor-pointer">
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedReason === "Other" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    Detailed Explanation <span className="text-rose-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Specify the reason for this action..."
                    className="min-h-[100px] rounded-xl border-slate-200 bg-white focus:ring-0 focus:border-slate-400 transition-all resize-none text-sm font-medium"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              )}

              {error && (
                <p className="text-[10px] font-bold text-rose-500 ml-1 flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> {error}
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="bg-slate-50/50 p-6 border-t border-slate-100 flex flex-row items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => handleClose(false)}
            disabled={isLoading}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-transparent"
          >
            Go Back
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !selectedReason}
            className="bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest px-8 h-12 rounded-xl transition-all active:scale-95 disabled:opacity-50 !border-0"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Processing...
              </span>
            ) : "Confirm Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

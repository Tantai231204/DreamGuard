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
import { CheckCircle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompleteServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  orderCode: string;
}

export function CompleteServiceDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  orderCode
}: CompleteServiceDialogProps) {
  const [isVerified, setIsVerified] = React.useState(false);

  // Reset verification when dialog opens/closes
  React.useEffect(() => {
    if (!isOpen) setIsVerified(false);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border border-slate-200 shadow-2xl rounded-xl bg-white text-slate-900">
        <div className="p-10 pb-8">
          <DialogHeader className="flex flex-row items-start gap-4 mb-10 text-left">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="pt-1">
              <DialogTitle className="text-[20px] font-black text-[#1e293b] leading-tight tracking-tight uppercase">
                Complete Service Task
              </DialogTitle>
              <DialogDescription className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] mt-1.5">
                Internal Record #{orderCode || 'DGSVCORE-2026-X'}
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Protocol Info Block */}
          <div className="bg-emerald-50 border-l-[4px] border-emerald-500 p-6 rounded-r-lg mb-8 flex gap-4 text-left">
            <div className="pt-0.5">
              <Info className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5 leading-none">
                Final Execution Verified
              </h4>
              <p className="text-[13px] text-slate-600 font-bold leading-relaxed">
                Marking this task as completed signifies that all service items have been successfully executed and verified by the manager.
              </p>
            </div>
          </div>

          {/* Acknowledgement Box */}
          <div className="bg-[#f8f9fa] border border-slate-100 p-6 rounded-lg space-y-5 text-left">
            <p className="text-[11px] text-slate-400 font-bold leading-relaxed italic pr-4">
              * By completing, you confirm that the service quality meets clinical standards and the client is ready for task closure.
            </p>

            <label className="flex items-center gap-3 cursor-pointer group/check select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isVerified}
                  onChange={(e) => !isLoading && setIsVerified(e.target.checked)}
                />
                <div className={cn(
                  "w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center shrink-0",
                  isVerified
                    ? "bg-emerald-600 border-emerald-600"
                    : "bg-white border-slate-200 group-hover/check:border-slate-400"
                )}>
                  {isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight transition-colors group-hover/check:text-slate-700">
                I verify that the service execution is 100% finished
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex flex-row items-center justify-end gap-10">
          <button
            onClick={onClose}
            className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors bg-transparent border-none outline-none"
          >
            Stay Active
          </button>

          <Button
            onClick={onConfirm}
            disabled={isLoading || !isVerified}
            className={cn(
              "h-12 px-8 rounded-lg font-black uppercase tracking-widest text-[11px] text-white transition-all active:scale-95 border-none outline-none ring-0 shadow-lg shadow-emerald-500/10",
              "bg-emerald-600 hover:bg-emerald-700",
              (isLoading || !isVerified) && "opacity-50 grayscale cursor-not-allowed shadow-none"
            )}
          >
            <span className="flex items-center gap-3">
              {isLoading ? "Executing..." : "Confirm Completion"}
              {!isLoading && <CheckCircle2 className="w-4 h-4 text-white" />}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import { ShieldCheck, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  orderCode: string;
}

export function ConfirmServiceDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  orderCode
}: ConfirmServiceDialogProps) {
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
            <div className="w-12 h-12 rounded-lg bg-[#f0f9f1] border border-[#d3f0d8] flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-[#067647]" />
            </div>
            <div className="pt-1">
              <DialogTitle className="text-[20px] font-black text-[#1e293b] leading-tight tracking-tight uppercase">
                Verify Service Order
              </DialogTitle>
              <DialogDescription className="text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] mt-1.5">
                Internal Record #{orderCode || 'DGSVCORE-2026-X'}
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Protocol Info Block */}
          <div className="bg-[#f0f9f1] border-l-[4px] border-[#089451] p-6 rounded-r-lg mb-8 flex gap-4 text-left">
            <div className="pt-0.5">
              <Info className="w-5 h-5 text-[#067647]" />
            </div>
            <div>
              <h4 className="text-[10px] font-black text-[#067647] uppercase tracking-widest mb-1.5 leading-none">
                Protocol Activation
              </h4>
              <p className="text-[13px] text-slate-600 font-bold leading-relaxed">
                Confirmation signifies that financial and resource readiness is verified. This will move the order into the <strong>CONFIRMED</strong> state.
              </p>
            </div>
          </div>

          {/* Acknowledgement Box */}
          <div className="bg-[#f8f9fa] border border-slate-100 p-6 rounded-lg space-y-5 text-left">
            <p className="text-[11px] text-slate-400 font-bold leading-relaxed italic pr-4">
              * By authorizing, you acknowledge that all package requirements are understood and personnel dispatch protocols are ready to be engaged.
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
                    ? "bg-[#067647] border-[#067647]"
                    : "bg-white border-slate-200 group-hover/check:border-slate-400"
                )}>
                  {isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight transition-colors group-hover/check:text-slate-700">
                I confirm all resource allocations are verified
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
            Re-evaluate
          </button>

          <Button
            onClick={onConfirm}
            disabled={isLoading || !isVerified}
            className={cn(
              "h-12 px-8 rounded-lg font-black uppercase tracking-widest text-[11px] text-white transition-all active:scale-95 border-none outline-none ring-0 shadow-lg shadow-[#067647]/10",
              "bg-[#067647] hover:bg-[#05603a]",
              (isLoading || !isVerified) && "opacity-50 grayscale cursor-not-allowed shadow-none"
            )}
          >
            <span className="flex items-center gap-3">
              {isLoading ? "Executing..." : "Authorize Protocol"}
              {!isLoading && <CheckCircle2 className="w-4 h-4 text-white" />}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

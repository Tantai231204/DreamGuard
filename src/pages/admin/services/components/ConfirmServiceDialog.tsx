import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Info, CheckCircle2, X } from "lucide-react";
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
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-[2rem] bg-white text-slate-900">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-300 hover:text-slate-500 transition-colors z-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-10 pb-8">
          {/* Header Section */}
          <div className="flex items-start gap-4 mb-10 text-left">
            <div className="w-14 h-14 rounded-2xl bg-[#f0f9f1] border border-[#d3f0d8] flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-7 h-7 text-[#067647]" />
            </div>
            <div className="pt-1">
              <h2 className="text-[22px] font-black text-[#1e293b] leading-tight tracking-tight uppercase">
                Verify Service Order
              </h2>
              <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.15em] mt-1.5">
                Internal Record #{orderCode || 'DGSV-20260322-71F8'}
              </p>
            </div>
          </div>

          {/* Protocol Info Block */}
          <div className="bg-[#f0f9f1] border-l-[3px] border-[#089451] p-6 rounded-r-2xl mb-8 flex gap-4 text-left">
            <div className="pt-0.5">
              <Info className="w-5 h-5 text-[#067647]" />
            </div>
            <div>
              <h4 className="text-[11px] font-black text-[#067647] uppercase tracking-widest mb-1.5 leading-none">
                Protocol Activation
              </h4>
              <p className="text-[13px] text-slate-600 font-bold leading-relaxed">
                Confirmation signifies that financial and resource readiness is verified. This will move the order into the <strong>CONFIRMED</strong> state.
              </p>
            </div>
          </div>

          {/* Acknowledgement Box */}
          <div className="bg-[#f8f9fa] border border-slate-50 p-6 rounded-2xl space-y-5 text-left">
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
        <DialogFooter className="px-10 py-8 bg-slate-50/40 border-t border-slate-50 flex flex-row items-center justify-end gap-10">
          <button
            onClick={onClose}
            className="text-[12px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-500 transition-colors bg-transparent border-none outline-none"
          >
            Re-evaluate
          </button>
          
          <Button
            onClick={onConfirm}
            disabled={isLoading || !isVerified}
            className={cn(
              "h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] text-white transition-all active:scale-95 border-none outline-none ring-0 focus:ring-0 focus-visible:ring-0",
              "bg-[#067647] hover:bg-[#05603a]",
              (isLoading || !isVerified) && "opacity-50 grayscale cursor-not-allowed"
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

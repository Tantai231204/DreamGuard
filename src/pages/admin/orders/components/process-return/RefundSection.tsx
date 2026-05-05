import { cn } from "@/lib/utils";
import { memo } from "react";
import { ShieldCheck, Info } from "lucide-react";

interface RefundSectionProps {
  compact?: boolean;
  isRefund: boolean;
  setIsRefund: (val: boolean) => void;
}

export const RefundSection = memo(function RefundSection({
  compact = false,
  isRefund,
  setIsRefund,
}: RefundSectionProps) {
  return (
    <div className={cn(
      "animate-in fade-in slide-in-from-top-2 duration-400",
      compact ? "" : "mt-4"
    )}>
      <div 
        onClick={() => setIsRefund(!isRefund)}
        className={cn(
          "relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer group",
          isRefund 
            ? "border-blue-200 bg-blue-50/40 shadow-sm" 
            : "border-slate-200 bg-slate-50/50 grayscale opacity-70 hover:opacity-100 hover:grayscale-0"
        )}
      >
        <div className="px-4 py-3 flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
              isRefund ? "bg-blue-600 text-white shadow-blue-200 shadow-md" : "bg-slate-200 text-slate-500"
            )}>
              <ShieldCheck className={cn("w-5 h-5 transition-transform duration-500", isRefund && "scale-110")} />
            </div>
            <div>
              <p className={cn("text-[12px] font-black uppercase tracking-wider transition-colors", isRefund ? "text-blue-900" : "text-slate-600")}>
                Automatic Settlement
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Info className="w-3 h-3 text-blue-500/70" />
                <p className="text-[10px] font-bold text-blue-600/60 uppercase tracking-tight">
                  VNPay Reverse Transaction Enabled
                </p>
              </div>
            </div>
          </div>

          <div className={cn(
            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300",
            isRefund 
              ? "bg-blue-600 border-blue-600 text-white" 
              : "bg-white border-slate-300"
          )}>
            {isRefund && (
              <svg className="w-3.5 h-3.5 stroke-[4] animate-in zoom-in duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        
        {/* Decorative Background Elements */}
        {isRefund && (
          <>
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full -mr-12 -mt-12 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-600/5 rounded-full -ml-8 -mb-8 blur-xl" />
          </>
        )}
      </div>
    </div>
  );
});

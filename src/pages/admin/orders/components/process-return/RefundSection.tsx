import { cn, formatNumber, unformatNumber } from "@/lib/utils";
import { memo } from "react";
import { ShieldCheck, Info, CreditCard, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface RefundSectionProps {
  compact?: boolean;
  isRefund: boolean;
  setIsRefund: (val: boolean) => void;
  refundAmount: number;
  setRefundAmount: (val: number) => void;
  percentage: number;
  setPercentage: (val: number) => void;
  totalAmount: number;
}

export const RefundSection = memo(function RefundSection({
  compact = false,
  isRefund,
  setIsRefund,
  refundAmount,
  setRefundAmount,
  percentage,
  setPercentage,
  totalAmount
}: RefundSectionProps) {
  const presets = [100, 75, 50, 25, 0];

  return (
    <div className={cn(
      "animate-in fade-in slide-in-from-top-2 duration-400",
      compact ? "" : "mt-4"
    )}>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border transition-all duration-300 group",
          isRefund
            ? "border-slate-200 bg-white shadow-sm"
            : "border-slate-100 bg-slate-50/50 grayscale opacity-70 hover:opacity-100 hover:grayscale-0"
        )}
      >
        <div
          onClick={() => setIsRefund(!isRefund)}
          className="px-4 py-3 flex items-center justify-between gap-4 relative z-10 cursor-pointer border-b border-slate-50"
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
              isRefund ? "bg-slate-900 text-white shadow-md" : "bg-slate-200 text-slate-500"
            )}>
              <ShieldCheck className={cn("w-5 h-5 transition-transform duration-500", isRefund && "scale-110")} />
            </div>
            <div>
              <p className={cn("text-[12px] font-black uppercase tracking-wider transition-colors", isRefund ? "text-slate-900" : "text-slate-600")}>
                Automatic Settlement
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Info className="w-3 h-3 text-slate-400" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  Audit-Ready Reverse Transaction
                </p>
              </div>
            </div>
          </div>

          <div className={cn(
            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300",
            isRefund
              ? "bg-slate-900 border-slate-900 text-white"
              : "bg-white border-slate-300"
          )}>
            {isRefund && (
              <svg className="w-3.5 h-3.5 stroke-[4] animate-in zoom-in duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>

        {isRefund && (
          <div className="p-4 space-y-4 animate-in slide-in-from-top-1 duration-300 bg-slate-50/30">
            {/* Presets */}
            <div className="grid grid-cols-5 gap-1.5">
              {presets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPercentage(val)}
                  className={cn(
                    "h-8 rounded-lg text-[10px] font-black transition-all duration-200 border",
                    percentage === val
                      ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                  )}
                >
                  {val}%
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Override %</label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={percentage}
                    onChange={(e) => setPercentage(Number(e.target.value))}
                    className="h-9 rounded-lg border-slate-200 bg-white pr-7 text-[11px] font-bold focus-visible:ring-slate-900 shadow-sm"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Refund Amount</label>
                <div className="relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10">
                    <CreditCard className="w-3 h-3 text-slate-400" />
                  </div>
                  <Input
                    type="text"
                    value={formatNumber(refundAmount)}
                    onChange={(e) => setRefundAmount(unformatNumber(e.target.value))}
                    className="h-9 rounded-lg border-slate-200 bg-white pl-8 pr-10 text-[11px] font-bold focus-visible:ring-slate-900 shadow-sm"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase">
                    VND
                  </div>
                </div>
              </div>
            </div>

            {/* Validation & Summary */}
            <motion.div
              layout
              className="bg-white border border-slate-100 rounded-lg p-3 flex items-center justify-between shadow-xs"
            >
              <div className="space-y-0.5">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <History className="w-2.5 h-2.5" />
                  Net Audit
                </p>
                <p className="text-[10px] font-bold text-slate-400 italic">
                  Calculated: {percentage}% of {formatNumber(totalAmount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 tabular-nums">
                  {formatNumber(refundAmount)}
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Decorative Background Elements */}
        {isRefund && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-20 pointer-events-none" />
        )}
      </div>
    </div>
  );
});

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RotateCcw, Percent, Calculator } from "lucide-react";
import { formatPrice } from "@/pages/profile/utils";
import { memo, useEffect, useState } from "react";

interface RefundSectionProps {
  hasDamages?: boolean;
  percentage: number;
  refundAmount: number;
  totalPrice: number;
  setPercentage: (val: number) => void;
  setRefundAmount: (val: number) => void;
  compact?: boolean;
  paymentMethod?: string;
  paymentStatus?: string;
  isRefund: boolean;
  setIsRefund: (val: boolean) => void;
}

export const RefundSection = memo(function RefundSection({
  hasDamages = false,
  percentage,
  refundAmount,
  totalPrice,
  setPercentage,
  setRefundAmount,
  compact = false,
  paymentMethod,
  paymentStatus,
  isRefund,
  setIsRefund,
}: RefundSectionProps) {
  const [localPercentage, setLocalPercentage] = useState(percentage.toString());
  const [localAmount, setLocalAmount] = useState(refundAmount.toLocaleString('vi-VN'));

  useEffect(() => {
    setLocalPercentage(percentage.toString());
  }, [percentage]);

  useEffect(() => {
    setLocalAmount(refundAmount.toLocaleString('vi-VN'));
  }, [refundAmount]);

  return (
    <div className={cn(
      "border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300",
      compact ? "pt-3 space-y-2.5" : "pt-5 space-y-4"
    )}>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <RotateCcw className={cn(compact ? "h-3 w-3" : "h-4 w-4", hasDamages ? "text-rose-500" : "text-blue-500")} />
          <span className={cn("font-black text-slate-500 uppercase tracking-widest", compact ? "text-[8px]" : "text-[11px]")}>Settlement Setup</span>
        </div>
        
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsRefund(!isRefund)}>
          <div className={cn(
            "w-4 h-4 rounded border flex items-center justify-center transition-all duration-200",
            isRefund 
              ? "bg-blue-600 border-blue-600 text-white" 
              : "bg-white border-slate-300 text-transparent"
          )}>
            <svg className="w-2.5 h-2.5 stroke-[4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className={cn("font-bold text-slate-600 select-none", compact ? "text-[9px]" : "text-[11px]")}>Auto Refund</span>
        </div>
      </div>

      <div className={cn("grid grid-cols-1 sm:grid-cols-2", compact ? "gap-3" : "gap-4")}>
        <div className="space-y-1.5">
          <Label className={cn("font-black text-slate-400 uppercase tracking-widest ml-1", compact ? "text-[8px]" : "text-[10px]")}>Percent (%)</Label>
          <div className="relative group">
            <Input
              type="number"
              value={localPercentage}
              onChange={(e) => {
                setLocalPercentage(e.target.value);
                const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                setPercentage(val);
              }}
              onBlur={() => setLocalPercentage(percentage.toString())}
              className={cn(
                "rounded-xl border-slate-200 font-bold shadow-none pl-8 bg-white transition-all focus:ring-0",
                compact ? "h-9 text-[11px]" : "h-10 text-sm",
                hasDamages ? "focus-visible:border-rose-200" : "focus-visible:border-blue-200"
              )}
            />
            <Percent className={cn("absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 transition-colors", hasDamages ? "text-rose-400" : "text-blue-400")} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className={cn("font-black text-slate-400 uppercase tracking-widest ml-1", compact ? "text-[8px]" : "text-[10px]")}>Amount (VNĐ)</Label>
          <div className="relative group">
            <Input
              type="text"
              value={localAmount}
              onChange={(e) => {
                const rawVal = e.target.value.replace(/\D/g, '');
                setLocalAmount(e.target.value);
                const val = Math.min(totalPrice, parseInt(rawVal) || 0);
                setRefundAmount(val);
              }}
              onBlur={() => setLocalAmount(refundAmount.toLocaleString('vi-VN'))}
              className={cn(
                "rounded-xl border-slate-200 font-bold shadow-none pl-8 bg-white transition-all focus:ring-0",
                compact ? "h-9 text-[11px]" : "h-10 text-sm",
                hasDamages ? "focus-visible:border-rose-200" : "focus-visible:border-blue-200"
              )}
            />
            <Calculator className={cn("absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 transition-colors", hasDamages ? "text-rose-400" : "text-blue-400")} />
          </div>
        </div>
      </div>

      <div className={cn(
        "rounded-xl border flex items-center justify-between transition-all duration-500",
        compact ? "p-2" : "p-3",
        hasDamages
          ? "bg-rose-50/50 border-rose-100/50"
          : "bg-blue-50/50 border-blue-100/50"
      )}>
        <div className="flex flex-col">
          <span className={cn(
            "font-black uppercase tracking-widest",
            compact ? "text-[8px]" : "text-[10px]",
            hasDamages ? "text-rose-400" : "text-blue-400"
          )}>Projected Settlement</span>

          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn(
              "font-medium leading-none",
              compact ? "text-[9px]" : "text-xs",
              hasDamages ? "text-rose-600/60" : "text-blue-600/60"
            )}>Legitimacy Verified</span>

            {paymentMethod && (
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "font-black uppercase bg-white/60 px-1.5 py-0.5 rounded border border-slate-200/30",
                  compact ? "text-[7px]" : "text-[9px]",
                  hasDamages ? "text-rose-500" : "text-blue-500"
                )}>
                  {paymentMethod} • {paymentStatus || "UNPAID"}
                </span>
                {(paymentMethod.toLowerCase() === 'vnpay' || paymentMethod.toLowerCase() === 'other') && (
                  <span className="text-[7px] font-black uppercase text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                    Evidence Required
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <span className={cn(
          "font-black tracking-tight tabular-nums",
          compact ? "text-sm" : "text-base",
          hasDamages ? "text-rose-900" : "text-blue-900"
        )}>{formatPrice(refundAmount)}</span>
      </div>
    </div>
  );
});

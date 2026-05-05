import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { formatNumber, unformatNumber } from '@/lib/utils';
import { AlertCircle, History, Info } from 'lucide-react';

interface RefundSectionProps {
  hasDamages?: boolean;
  percentage: number;
  refundAmount: number;
  totalPrice: number;
  setPercentage: (val: number) => void;
  setRefundAmount: (val: number) => void;
}

export function RefundSection({
  hasDamages = false,
  percentage,
  refundAmount,
  totalPrice,
  setPercentage,
  setRefundAmount,
}: RefundSectionProps) {
  const presets = [100, 75, 50, 25, 0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-slate-900" />
          Refund Settlement
        </h3>
        <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          <Info className="w-3 h-3 text-slate-600" />
          <span className="text-[9px] font-bold text-slate-900 uppercase tracking-wider">
            {hasDamages ? 'Partial Refund (Damages)' : 'Full Settlement'}
          </span>
        </div>
      </div>

      <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-6">
        {/* Preset Percentage Grid */}
        <div className="grid grid-cols-5 gap-2">
          {presets.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setPercentage(val)}
              className={cn(
                "h-10 rounded-xl text-[11px] font-black transition-all duration-200 border-2",
                percentage === val
                  ? "bg-slate-900 border-slate-900 text-white shadow-md"
                  : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600"
              )}
            >
              {val}%
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Percentage Override</label>
            <div className="relative">
              <Input
                type="number"
                min={0}
                max={100}
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                className="h-11 rounded-xl border-slate-200 bg-white pr-8 text-xs font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 transition-all shadow-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Settlement Amount</label>
            <div className="relative">
              <Input
                type="text"
                value={formatNumber(refundAmount)}
                onChange={(e) => setRefundAmount(unformatNumber(e.target.value))}
                className="h-11 rounded-xl border-slate-200 bg-white pl-3 text-xs font-bold focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 transition-all shadow-sm pr-12"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                VND
              </div>
            </div>
          </div>
        </div>

        {/* Final Valuation Summary */}
        <div className="pt-2">
          <motion.div 
            layout
            className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-900" />
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Net Audit Value</p>
              <p className="text-xs font-bold text-slate-400">
                Calculated: {percentage}% of {formatNumber(totalPrice)}
              </p>
            </div>
            <div className="text-right flex items-center gap-1.5">
              <p className="text-xl font-black text-slate-900 tabular-nums leading-none">
                {formatNumber(refundAmount)}
              </p>
              <span className="text-[10px] font-black text-slate-400 uppercase">VND</span>
            </div>
          </motion.div>
        </div>

        {hasDamages && percentage < 100 && (
          <div className="bg-amber-50/50 rounded-xl p-3 flex gap-3 border border-amber-100/50">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[9px] font-bold text-amber-700 leading-relaxed uppercase tracking-tight">
              Audit Alert: Partial refund selected. Ensure all damages are documented in the staff logistics report.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

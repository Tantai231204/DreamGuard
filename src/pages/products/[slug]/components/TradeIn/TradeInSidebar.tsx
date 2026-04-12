import { memo } from 'react';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatTradeInPrice } from '../../utils/tradeIn';

interface TradeInSidebarProps {
  step: string;
  selectedCount: number;
  totalTradeInValue: number;
  depositAmount?: number;
  hasEstimatedValue?: boolean;
  isEstimatingPrice?: boolean;
}

const SIDEBAR_STEPS = [
  { id: 'selection', number: 1, label: 'Select Items' },
  { id: 'audit', number: 2, label: 'Condition Check' },
  { id: 'images', number: 3, label: 'Verification Photos' },
  { id: 'logistics', number: 4, label: 'Collection' },
  { id: 'summary', number: 5, label: 'Confirm' },
];

export const TradeInSidebar = memo(function TradeInSidebar({
  step,
  selectedCount,
  totalTradeInValue,
  depositAmount = 0,
  hasEstimatedValue = false,
  isEstimatingPrice = false,
}: TradeInSidebarProps) {
  const currentIndex = SIDEBAR_STEPS.findIndex((item) => item.id === step);
  const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="w-[300px] bg-[#455A48] text-[#FDFCFA] flex flex-col p-7 h-full shrink-0 relative overflow-hidden antialiased">
      {/* Precision Brand Identity */}
      <div className="flex items-center gap-3.5 mb-6 select-none">
        <div className="w-5 h-5 rounded-full border-[1.5px] border-white/40 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
        </div>
        <span className="text-[11px] font-black tracking-[0.25em] uppercase text-white">DREAM-RENEW</span>
      </div>

      {/* Hero Narrative (3-Line Serif Precision) */}
      <div className="mb-6 select-none">
        <h2 className="font-serif italic text-[40px] leading-[0.88] tracking-tight mb-4">
          Trade old,<br />
          earn<br />
          credit.
        </h2>
        <p className="text-[12px] text-white/50 leading-[1.45] font-light max-w-[175px]">
          Credit applied directly to<br />
          your next order. No<br />
          expiry.
        </p>
      </div>

      {/* Narrative Progress List */}
      <nav className="flex-1 min-h-0 space-y-4 relative z-10 pl-1">
        {SIDEBAR_STEPS.map((s, idx) => {
          const isCompleted = safeCurrentIndex > idx;
          const isActive = safeCurrentIndex === idx;

          return (
            <div key={s.id} className="flex items-center gap-6 group cursor-default">
              <div className="relative">
                {isActive && (
                  <div className="absolute inset-0 bg-white/20 blur-md rounded-full scale-150" />
                )}
                <div className={cn(
                  "w-8 h-8 rounded-full border-[1.5px] flex items-center justify-center text-[10px] font-bold transition-all duration-1000 ease-out relative z-10",
                  isCompleted
                    ? "bg-[#D9E1D9] border-[#D9E1D9] text-[#455A48]"
                    : isActive
                      ? "bg-white border-white text-[#455A48]"
                      : "border-white/10 text-white/20"
                )}>
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3.5]" /> : s.number}
                </div>
              </div>
              <span className={cn(
                "text-[13px] font-semibold tracking-wide transition-all duration-700",
                isActive ? "text-white opacity-100" : "text-white/20"
              )}>
                {s.label}
              </span>
            </div>
          );
        })}
      </nav>

      {/* Studio Credit Card (Refined Glassmorphism) */}
      <motion.div
        layout
        className="p-5 rounded-[24px] bg-white/5 border-[1px] border-white/10 backdrop-blur-2xl shadow-2xl mt-4 shrink-0"
      >
        <div className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">
          Trade-In From
        </div>
        <AnimatePresence mode="wait">
          {selectedCount > 0 ? (
            isEstimatingPrice || !hasEstimatedValue ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-2"
              >
                <div className="text-[14px] font-semibold text-white/70">Calculating...</div>
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">
                  {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="value"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <div className="font-serif italic text-[30px] leading-none mb-2 tracking-tighter text-white/95">
                  From {formatTradeInPrice(totalTradeInValue)}
                </div>
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">
                  {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                </div>
              </motion.div>
            )
          ) : (
            <div className="space-y-2 opacity-20">
              <div className="h-[2px] w-6 bg-white/50" />
              <div className="text-[11px] font-light tracking-widest">Select items...</div>
            </div>
          )}
        </AnimatePresence>

        <div className="h-px bg-white/10 my-3" />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold text-white/35 uppercase tracking-[0.18em]">Pay Today (Deposit)</span>
          <span className="text-[14px] font-bold text-white">{formatTradeInPrice(depositAmount)}</span>
        </div>
      </motion.div>

      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[120px] rounded-full translate-x-32 -translate-y-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D9E1D9]/5 blur-[80px] rounded-full -translate-x-24 translate-y-24 pointer-events-none" />
    </div>
  );
});

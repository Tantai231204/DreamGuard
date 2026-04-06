import { Check, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatTradeInPrice } from '../../utils/tradeIn';
import { STEPS, STEP_LABELS } from './constants';

const formatPrice = formatTradeInPrice;

interface TradeInSidebarProps {
  step: string;
  selectedCount: number;
  totalTradeInValue: number;
}

export function TradeInSidebar({ step, selectedCount, totalTradeInValue }: TradeInSidebarProps) {
  const stepIdx = STEPS.indexOf(step as typeof STEPS[number]);

  return (
    <div className="w-[215px] bg-[#3D5140] flex flex-col shrink-0">
      {/* Brand header */}
      <div className="px-6 pt-6 pb-5 border-b border-white/10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center border border-white/20">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-[12px] tracking-[0.05em]">
            Dream-Renew
          </span>
        </div>
        <h2 className="font-serif italic text-[21px] font-normal text-white leading-[1.2]">
          Trade old,
          <br />
          <span className="text-[#A8C5AB]">earn credit.</span>
        </h2>
        <p className="text-white/50 text-[10.5px] mt-2.5 leading-relaxed">
          Credit applied directly to your next order. No expiry.
        </p>
      </div>

      {/* Step list */}
      <div className="flex-1 px-4 py-5 flex flex-col gap-0.5">
        {STEPS.map((s, i) => {
          const isActive = s === step;
          const isDone = i < stepIdx;
          return (
            <div
              key={s}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                isActive && 'bg-white/12'
              )}
            >
              {/* Indicator */}
              <div
                className={cn(
                  'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 border',
                  isActive && 'bg-white border-white shadow-[0_0_0_3px_rgba(255,255,255,0.15)]',
                  isDone && 'bg-[#A8C5AB] border-[#A8C5AB]',
                  !isActive && !isDone && 'border-white/25 bg-transparent'
                )}
              >
                {isDone ? (
                  <Check className="w-2.5 h-2.5 text-[#3D5140] stroke-[3]" />
                ) : (
                  <span className={cn('text-[8px] font-bold', isActive ? 'text-[#3D5140]' : 'text-white/40')}>
                    {i + 1}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-[11.5px] transition-all duration-200',
                  isActive && 'text-white font-semibold',
                  isDone && 'text-[#A8C5AB] font-medium',
                  !isActive && !isDone && 'text-white/35'
                )}
              >
                {STEP_LABELS[s]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Credit card */}
      <div className="mx-4 mb-5 bg-white/10 rounded-2xl p-4 border border-white/10">
        <p className="text-[9.5px] font-bold text-white/50 uppercase tracking-[0.14em] mb-2">
          Estimated Credit
        </p>
        <AnimatePresence mode="wait">
          {selectedCount > 0 ? (
            <motion.div
              key="has-value"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              <p className="font-serif italic text-white text-[24px] font-normal leading-none">
                -{formatPrice(totalTradeInValue)}
              </p>
              <p className="text-[10px] text-white/50 mt-1.5">
                {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              <p className="text-[16px] text-white/30 font-medium">—</p>
              <p className="text-[10px] text-white/35 mt-1">Select items to begin</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

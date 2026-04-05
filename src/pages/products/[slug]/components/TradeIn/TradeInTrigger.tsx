import { memo } from 'react';
import { ArrowRight, Leaf, Recycle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatTradeInPrice } from '../../utils/tradeIn';
import type { TradeInTriggerProps } from './types';

const formatPrice = formatTradeInPrice;

/**
 * TradeInTrigger — the always-visible entry point for the Trade-In flow.
 * Designed to stand out prominently on the product page with a two-tone
 * layout: a rich forest-green left panel + an ivory right section.
 */
export const TradeInTrigger = memo(function TradeInTrigger({
  selectedCount,
  totalValue,
  ...props
}: TradeInTriggerProps) {
  const hasItems = selectedCount > 0;

  return (
    <button
      className="w-full group outline-none focus-visible:ring-2 focus-visible:ring-[#4A5D4E]/40 rounded-2xl"
      {...props}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl flex items-stretch transition-all duration-400',
          'shadow-[0_4px_20px_rgba(74,93,78,0.18)] hover:shadow-[0_8px_32px_rgba(74,93,78,0.28)]',
          'hover:-translate-y-0.5'
        )}
      >
        {/* ── LEFT PANEL — forest green ── */}
        <div className="relative bg-[#3D5140] px-5 py-4 flex items-center gap-3.5 flex-shrink-0">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '12px 12px' }}
          />

          {/* Icon */}
          <motion.div
            animate={hasItems ? { rotate: [0, -10, 12, 0] } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative z-10 w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center border border-white/20 flex-shrink-0 group-hover:bg-white/20 transition-colors"
          >
            <Leaf className={cn('w-5 h-5 text-white transition-all duration-500', hasItems && 'drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]')} />
          </motion.div>

          {/* Brand text */}
          <div className="relative z-10 text-left">
            <p className="text-white font-serif italic text-[15px] font-normal leading-none tracking-wide">
              Dream-Renew
            </p>
            <p className="text-white/60 text-[9.5px] mt-1 uppercase tracking-[0.14em] font-medium">
              Trade-In Program
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL — cream/ivory ── */}
        <div className="flex-1 bg-[#FAF8F5] border-y border-r border-[#4A5D4E]/20 px-5 py-4 flex items-center justify-between">
          {/* Left: tag line or credit value */}
          <div>
            <AnimatePresence mode="wait">
              {hasItems ? (
                <motion.div
                  key="selected"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-[10px] font-bold text-[#4A5D4E] uppercase tracking-[0.12em]">
                    Your trade-in credit
                  </p>
                  <p className="font-serif italic text-[20px] text-[#2E4032] font-normal leading-tight mt-0.5">
                    -{formatPrice(totalValue)}
                  </p>
                  <p className="text-[10px] text-[#8C7A6B] mt-0.5">
                    {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-[10px] font-bold text-[#4A5D4E] uppercase tracking-[0.12em]">
                    Got old bedding?
                  </p>
                  <p className="text-[14px] text-gray-800 font-medium leading-snug mt-0.5">
                    Trade in & save on your order
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Recycle className="w-3 h-3 text-[#4A5D4E]" />
                    <span className="text-[10px] text-[#4A5D4E] font-medium">
                      Up to 30% off · Eco-friendly
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CTA arrow */}
          <div
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300',
              hasItems
                ? 'bg-[#4A5D4E] shadow-[0_4px_12px_rgba(74,93,78,0.35)]'
                : 'bg-[#3D5140] group-hover:bg-[#4A5D4E] group-hover:shadow-[0_4px_12px_rgba(74,93,78,0.25)]'
            )}
          >
            <motion.div
              animate={{ x: [0, 2, 0] }}
              transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.4 }}
            >
              <ArrowRight className="w-4 h-4 text-white" />
            </motion.div>
          </div>
        </div>
      </div>
    </button>
  );
});

import { Check, ChevronLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { formatTradeInPrice } from '../../utils/tradeIn';

const formatPrice = formatTradeInPrice;

interface TradeInFooterProps {
  step: string;
  stepIndex: number;
  selectedCount: number;
  totalTradeInValue: number;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onComplete: () => void;
  onClose: () => void;
}

export function TradeInFooter({
  step,
  stepIndex,
  selectedCount,
  totalTradeInValue,
  isSubmitting,
  onBack,
  onNext,
  onComplete,
  onClose,
}: TradeInFooterProps) {
  return (
    <div className="px-6 py-3.5 flex items-center justify-between border-t border-[#EDE8E1] bg-white flex-shrink-0">
      {/* Credit display */}
      <div className="flex flex-col">
        <span className="text-[9px] font-bold text-[#B0A89E] uppercase tracking-[0.14em]">
          Store Credit
        </span>
        <AnimatePresence mode="wait">
          {selectedCount > 0 ? (
            <motion.span
              key="credit"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              className="font-serif italic text-[15px] text-[#3D5140] font-normal leading-tight"
            >
              -{formatPrice(totalTradeInValue)}
            </motion.span>
          ) : (
            <motion.span
              key="none"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              className="text-[12px] text-[#C4BDB5]"
            >
              None selected
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onClose}
          className="text-[11px] text-[#B0A89E] hover:text-rose-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-rose-50 font-medium"
        >
          Cancel
        </button>

        {stepIndex > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="h-8 px-3 text-[11px] rounded-lg border-[#EDE8E1] text-[#6B5E52] hover:bg-[#F5F2EE] gap-0.5"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back
          </Button>
        )}

        {step !== 'summary' ? (
          <Button
            size="sm"
            onClick={onNext}
            disabled={selectedCount === 0}
            className="h-8 px-4 text-[11.5px] rounded-lg bg-[#3D5140] hover:bg-[#4A5D4E] text-white font-semibold gap-1.5 disabled:opacity-25 transition-colors shadow-[0_2px_8px_rgba(61,81,64,0.25)]"
          >
            Next
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onComplete}
            disabled={isSubmitting}
            className="h-8 px-5 text-[11.5px] rounded-lg bg-[#3D5140] hover:bg-[#4A5D4E] text-white font-semibold gap-1.5 shadow-[0_4px_12px_rgba(61,81,64,0.3)]"
          >
            {isSubmitting ? 'Processing…' : 'Confirm'}
            {!isSubmitting && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          </Button>
        )}
      </div>
    </div>
  );
}

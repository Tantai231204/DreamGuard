import { memo } from 'react';
import { Check, ChevronLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatTradeInPrice } from '../../utils/tradeIn';

interface TradeInFooterProps {
  step: string;
  stepIndex: number;
  selectedCount: number;
  totalTradeInValue: number;
  hasEstimatedValue?: boolean;
  isEstimatingPrice?: boolean;
  isSubmitting: boolean;
  imagesCount: number;
  onBack: () => void;
  onNext: () => void;
  onComplete: () => void;
  onClose: () => void;
  contact?: {
    receiverName: string;
    phoneNumber: string;
    address: string;
  };
}

export const TradeInFooter = memo(function TradeInFooter({
  step,
  stepIndex,
  selectedCount,
  totalTradeInValue,
  hasEstimatedValue = false,
  isEstimatingPrice = false,
  isSubmitting,
  imagesCount,
  onBack,
  onNext,
  onComplete,
  onClose,
  contact,
}: TradeInFooterProps) {
  const isLogisticsValid = Boolean(
    contact?.receiverName?.trim() &&
    contact?.phoneNumber?.trim() &&
    contact?.address?.trim()
  );

  const isNextDisabled =
    (step === 'selection' && selectedCount !== 1) ||
    (step === 'images' && imagesCount < 5) ||
    (step === 'logistics' && !isLogisticsValid);

  return (
    <div className="px-8 py-6 flex items-center justify-between border-t border-[#EDE8E1] bg-white flex-shrink-0 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {/* Credit display on left */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-[#A89E94] uppercase tracking-[0.2em] mb-1">
          Trade-In From
        </span>
        <AnimatePresence mode="wait">
          {selectedCount > 0 ? (
            isEstimatingPrice || !hasEstimatedValue ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                className="text-[14px] text-[#8C7A6B] font-medium italic"
              >
                Calculating...
              </motion.span>
            ) : (
              <motion.span
                key="credit"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                className="font-serif italic text-[18px] text-[#3D5140] font-normal leading-none"
              >
                From {formatTradeInPrice(totalTradeInValue)}
              </motion.span>
            )
          ) : (
            <motion.span
              key="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[14px] text-[#B0A89E] font-medium italic"
            >
              None selected
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Actions on right */}
      <div className="flex items-center gap-4">
        <button
          onClick={onClose}
          className="text-[13px] text-[#B0A89E] hover:text-[#3D5140] transition-colors p-2 font-medium"
        >
          Cancel
        </button>

        {stepIndex > 0 && (
          <Button
            variant="outline"
            onClick={onBack}
            className="h-11 px-6 text-[13px] rounded-2xl border-[#EDE8E1] text-[#3D5140] hover:bg-[#F4F7F4] gap-2 font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        )}

        {step !== 'summary' ? (
          <Button
            onClick={onNext}
            disabled={isNextDisabled}
            className={cn(
              "h-11 px-8 text-[13px] rounded-2xl font-bold gap-2 transition-all duration-300 shadow-lg",
              "bg-[#455A48] hover:bg-[#3D5140] text-[#FDFCFA]",
              "disabled:bg-[#EDE8E1] disabled:text-[#A89E94] disabled:shadow-none"
            )}
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={onComplete}
            disabled={isSubmitting}
            className="h-11 px-8 text-[13px] rounded-2xl bg-[#455A48] hover:bg-[#3D5140] text-white font-bold gap-2 shadow-xl shadow-[#455A48]/20"
          >
            {isSubmitting ? 'Confirming...' : 'Confirm'}
            {!isSubmitting && <Check className="w-4 h-4 stroke-[3]" />}
          </Button>
        )}
      </div>
    </div>
  );
});

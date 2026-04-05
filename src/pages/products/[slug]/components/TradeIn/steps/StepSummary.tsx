import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { formatTradeInPrice } from '../../../utils/tradeIn';
import type { CollectionType } from '../types';

const formatPrice = formatTradeInPrice;

interface StepSummaryProps {
  selectedCount: number;
  totalTradeInValue: number;
  collectionType: CollectionType;
  sessionOrderId: number;
}

export function StepSummary({
  selectedCount,
  totalTradeInValue,
  collectionType,
  sessionOrderId,
}: StepSummaryProps) {
  return (
    <motion.div
      key="step-summary"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center text-center py-6"
    >
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.1 }}
        className="w-16 h-16 bg-[#3D5140] rounded-2xl flex items-center justify-center mb-5 shadow-[0_8px_24px_rgba(61,81,64,0.35)]"
      >
        <Award className="w-8 h-8 text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-serif italic text-[22px] text-gray-900 font-normal mb-1">
          Trade-in confirmed!
        </h3>
        <p className="text-[11.5px] text-[#A89E94] mb-6">
          Reference #TI-{sessionOrderId}
        </p>
      </motion.div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-[300px] bg-white border border-[#EDE8E1] rounded-2xl overflow-hidden shadow-sm"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F0EDE8]">
          <span className="text-[11.5px] text-[#8C7A6B]">Items traded in</span>
          <span className="text-[12px] font-semibold text-gray-900">
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'}
          </span>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F0EDE8]">
          <span className="text-[11.5px] text-[#8C7A6B]">Collection</span>
          <span className="text-[12px] font-semibold text-gray-900">
            {collectionType === 'pickup' ? 'Home Pickup' : 'Drop-off at Hub'}
          </span>
        </div>
        <div className="flex items-center justify-between px-5 py-4 bg-[#F2F7F2]">
          <span className="text-[12px] text-[#3D5140] font-semibold">Store credit earned</span>
          <span className="font-serif italic text-[20px] text-[#3D5140] font-normal">
            -{formatPrice(totalTradeInValue)}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Award, CreditCard, ShieldCheck, TrendingUp } from 'lucide-react';
import { formatTradeInPrice } from '../../../utils/tradeIn';

const formatPrice = formatTradeInPrice;

interface StepSummaryProps {
  totalTradeInValue: number;
  sessionOrderId: number;
  depositAmount: number;
  minTradeInPrice: number;
  currentProductPrice: number;
  estimatedTradeInValue?: number;
  estimatedAmountToPay?: number;
  isEstimatingPrice?: boolean;
}

export const StepSummary = memo(function StepSummary({
  totalTradeInValue,
  sessionOrderId,
  depositAmount,
  minTradeInPrice,
  currentProductPrice,
  estimatedTradeInValue,
  estimatedAmountToPay,
  isEstimatingPrice = false,
}: StepSummaryProps) {
  const hasServerEstimate =
    typeof estimatedTradeInValue === 'number' ||
    typeof estimatedAmountToPay === 'number';

  const resolvedTradeInValue = typeof estimatedTradeInValue === 'number'
    ? estimatedTradeInValue
    : totalTradeInValue;
  const payableAmount = Math.max(0, depositAmount);
  const resolvedPurchasePrice = currentProductPrice > 0
    ? currentProductPrice
    : Math.max(0, payableAmount + resolvedTradeInValue);
  const hasSettlementEstimate = typeof estimatedAmountToPay === 'number';
  const estimatedSettlementAmount = hasSettlementEstimate
    ? Math.max(0, estimatedAmountToPay || 0)
    : Math.max(0, resolvedPurchasePrice - minTradeInPrice - payableAmount);

  return (
    <motion.div
      key="step-summary"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center text-center space-y-8"
    >
      {/* Visual Header */}
      <div className="space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-20 h-20 bg-[#3D5140] rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-[#3D5140]/20"
        >
          <Award className="w-10 h-10 text-white" />
        </motion.div>
        <div>
          <h3 className="font-serif italic text-[32px] text-[#1A1A1A] font-normal leading-tight">
            Almost finished
          </h3>
          <p className="text-[13px] text-[#A89E94] font-medium tracking-wide mt-1">
            Reference: <span className="font-bold text-[#3D5140]">#DG-RENEW-{sessionOrderId}</span>
          </p>
        </div>
      </div>

      {/* Main Financial Breakdown Cards */}
      <div className="w-full grid grid-cols-1 gap-4">
        {/* Summary Card */}
        <div className="bg-white border-[1px] border-[#EDE8E1] rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-8 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#A89E94] font-medium tracking-wide">Selected Variant Price</span>
              <span className="text-[15px] font-bold text-[#1A1A1A]">{formatPrice(resolvedPurchasePrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#3D5140] font-bold">Trade-In Deduction</span>
              <span className="text-[16px] font-bold text-[#3D5140]">
                {isEstimatingPrice || !hasServerEstimate
                  ? 'Calculating...'
                  : `From ${formatPrice(resolvedTradeInValue)}`}
              </span>
            </div>

            <div className="h-px bg-[#F5F2EF] w-full" />

            <div className="flex items-center justify-between pt-1">
              <div className="text-left">
                <span className="block text-[15px] font-black text-[#1A1A1A] uppercase tracking-widest">Pay Today (Deposit)</span>
                <span className="text-[11px] text-[#A89E94] font-medium italic">
                  {isEstimatingPrice
                    ? 'Refreshing estimate from server...'
                    : 'Charged from the selected new variant deposit'}
                </span>
              </div>
              <span className="text-[28px] font-serif italic text-[#3D5140] tracking-tight">
                {formatPrice(payableAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[13px] text-[#3D5140] font-semibold tracking-wide">Estimated Remaining After Deposit</span>
              <span className="text-[15px] font-bold text-[#3D5140]">
                {isEstimatingPrice ? '...' : formatPrice(estimatedSettlementAmount)}
              </span>
            </div>
          </div>

          {/* Critical Financial Info (Highlighted) */}
          <div className="bg-[#FDFCFA] p-8 border-t-[1px] border-[#EDE8E1] grid grid-cols-2 gap-8 text-left">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#8C7A6B] font-black text-[10px] uppercase tracking-[0.15em]">
                <CreditCard className="w-3.5 h-3.5" />
                Payment Today
              </div>
              <div className="text-[20px] font-bold text-[#1A1A1A] leading-none">
                {formatPrice(depositAmount)}
              </div>
              <p className="text-[10px] text-[#A89E94] leading-relaxed font-medium">Deposit of the selected new variant.</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#3D5140] font-black text-[10px] uppercase tracking-[0.15em]">
                <TrendingUp className="w-3.5 h-3.5" />
                Deduction From Reference
              </div>
              <div className="text-[20px] font-bold text-[#3D5140] leading-none">
                From {formatPrice(minTradeInPrice)}
              </div>
              <p className="text-[10px] text-[#A89E94] leading-relaxed font-medium">Final deduction is based on selected old variant trade-in price.</p>
            </div>
          </div>
        </div>

        {/* Verification Info */}
        <div className="p-6 rounded-[24px] bg-[#F4F7F4]/40 border-[1px] border-[#3D5140]/10 flex items-start gap-4 text-left">
          <div className="w-6 h-6 rounded-full bg-[#3D5140] flex items-center justify-center text-white shrink-0 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <p className="text-[12px] text-[#3D5140]/80 leading-relaxed font-medium">
            You pay <span className="font-bold text-[#3D5140]">{formatPrice(depositAmount)}</span> now as deposit for the selected new variant. Trade-in values in this flow are shown as From estimates and are finalized after inspection.
          </p>
        </div>
      </div>
    </motion.div>
  );
});

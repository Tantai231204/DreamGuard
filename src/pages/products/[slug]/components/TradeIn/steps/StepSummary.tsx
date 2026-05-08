import { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Award, CreditCard, Loader2, ShieldCheck, TrendingUp, XCircle } from 'lucide-react';
import { formatTradeInPrice } from '../../../utils/tradeIn';
import type { TradeInProduct } from '../../../utils/tradeIn';
import { OrderDetailDialog } from '@/pages/profile/components/orders/OrderDetailDialog';

const formatPrice = formatTradeInPrice;

interface StepSummaryProps {
  eligibleProducts: TradeInProduct[];
  selectedProducts: string[];
  onSelectTradeInProduct: (productId: string) => void;
  targetProductName?: string;
  targetProductImage?: string;
  totalTradeInValue: number;
  sessionOrderId: number;
  depositAmount: number;
  minTradeInPrice: number;
  currentProductPrice: number;
  estimatedTradeInValue?: number;
  estimatedAmountToPay?: number;
  isEstimatingPrice?: boolean;
}

const truncateOrderId = (id: string) => {
  if (!id) return '';
  return id.length > 8 ? `...${id.slice(-8)}` : id;
};

export const StepSummary = memo(function StepSummary({
  eligibleProducts,
  selectedProducts,
  onSelectTradeInProduct,
  targetProductName,
  targetProductImage,
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
  const selectedSourceId = selectedProducts[0];
  const selectedSourceProduct = eligibleProducts.find((product) => product.id === selectedSourceId) || null;
  const alternativeSourceProducts = eligibleProducts.filter((product) => product.id !== selectedSourceId);
  const canReplaceSelectedCard = alternativeSourceProducts.length > 0;
  const resolvedTargetProductName = (targetProductName || '').trim() || 'Selected new variant';

  const handleSelectTradeInProduct = (productId: string) => {
    if (selectedSourceId === productId) return;
    onSelectTradeInProduct(productId);
  };

  const handleRemoveSelectedCard = () => {
    if (!canReplaceSelectedCard) return;
    const fallbackProduct = alternativeSourceProducts[0];
    if (!fallbackProduct) return;
    onSelectTradeInProduct(fallbackProduct.id);
  };

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

      <div className="w-full rounded-[24px] border border-[#EDE8E1] bg-white p-5 text-left shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex-1">
            <p className="text-[10px] font-black text-[#A89E94] uppercase tracking-[0.2em]">Trade Route</p>
            <p className="text-[12px] text-[#6D5F54] font-semibold mt-1">Review your sanctuary upgrade path below</p>
          </div>
          {isEstimatingPrice && (
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8C7A6B]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Recalculating
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-stretch mb-4">
          <div className="rounded-2xl border border-[#DDE9DF] bg-[#F7FBF7] px-4 py-4 shadow-sm relative overflow-hidden flex flex-col sm:flex-row gap-4">
            {selectedSourceProduct?.image && (
              <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#DDE9DF] shrink-0 bg-white shadow-sm flex items-center justify-center p-1">
                <img src={selectedSourceProduct.image} alt={selectedSourceProduct.name} className="w-full h-full object-cover rounded-lg" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.14em] font-black text-[#6F8A72] mb-1">Trading From</p>
                  <p className="text-[13px] font-bold text-[#1A1A1A] line-clamp-2">
                    {selectedSourceProduct?.name || 'No source item selected'}
                  </p>
                  {selectedSourceProduct && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <OrderDetailDialog
                        orderId={selectedSourceProduct.orderId}
                        orderCode={`#${truncateOrderId(selectedSourceProduct.orderId).toUpperCase()}`}
                        trigger={
                          <button type="button" className="group/ref inline-flex items-center gap-1.5 text-[10px] text-[#A89E94] font-black uppercase tracking-widest hover:text-[#3D5140] transition-all">
                            <ArrowRightLeft className="w-3 h-3 opacity-40 group-hover/ref:opacity-100 transition-opacity" />
                            <span>Show original order</span>
                            <div className="w-1 h-1 rounded-full bg-[#3D5140]/20 group-hover/ref:bg-[#3D5140] transition-colors" />
                          </button>
                        }
                      />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleRemoveSelectedCard}
                  disabled={!selectedSourceProduct || !canReplaceSelectedCard}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#D7E3D9] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#5E7463] hover:border-[#3D5140]/35 hover:text-[#3D5140] disabled:cursor-not-allowed disabled:opacity-45 transition-all shadow-sm"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Change
                </button>
              </div>

              <div className="mt-3 inline-flex items-center rounded-full border border-[#D7E3D9] bg-white px-3 py-1 text-[10px] font-semibold text-[#5E7463]">
                {selectedSourceProduct
                  ? `From ${formatPrice(typeof selectedSourceProduct.tradeInValue === 'number' ? selectedSourceProduct.tradeInValue : selectedSourceProduct.originalPrice)}`
                  : 'Select one card to preview estimate'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center text-[#3D5140] py-6 sm:py-0">
            <ArrowRightLeft className="w-5 h-5 opacity-40" />
          </div>

          <div className="rounded-2xl border border-[#DDE9DF] bg-[#F4F7F4] px-4 py-4 flex flex-col sm:flex-row gap-4">
            {targetProductImage && (
              <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#DDE9DF] shrink-0 bg-white shadow-sm flex items-center justify-center p-1">
                <img src={targetProductImage} alt={resolvedTargetProductName} className="w-full h-full object-cover rounded-lg" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.14em] font-black text-[#6F8A72] mb-1">Upgrading To</p>
              <p className="text-[13px] font-bold text-[#2B4A33] line-clamp-2">
                {resolvedTargetProductName}
              </p>
              <p className="text-[10px] text-[#6A7A6B] font-bold mt-1.5 uppercase tracking-wider italic">
                New sanctuary edition
              </p>
            </div>
          </div>
        </div>

        {eligibleProducts.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.14em] font-black text-[#A89E94]">Other order item cards</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {(selectedSourceProduct ? alternativeSourceProducts : eligibleProducts).map((product) => {
                const previewValue = typeof product.tradeInValue === 'number'
                  ? product.tradeInValue
                  : product.originalPrice;

                return (
                  <div
                    key={product.id}
                    onClick={() => handleSelectTradeInProduct(product.id)}
                    className="rounded-xl border border-[#EDE8E1] bg-white p-3 text-left hover:border-[#3D5140]/30 hover:bg-[#F7FBF7] transition-all flex gap-3 items-center group/card cursor-pointer"
                  >
                    {product.image && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100 shrink-0 shadow-sm bg-slate-50">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover/card:scale-110" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-[#1A1A1A] line-clamp-1">{product.name}</p>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <div onClick={(e) => e.stopPropagation()}>
                          <OrderDetailDialog
                            orderId={product.orderId}
                            orderCode={`#${truncateOrderId(product.orderId).toUpperCase()}`}
                            trigger={
                              <button type="button" className="text-[9px] font-black text-[#A89E94] uppercase tracking-widest hover:text-[#3D5140] transition-colors">
                                View Order
                              </button>
                            }
                          />
                        </div>
                        <p className="text-[10px] font-black text-[#3D5140] tracking-tight">{formatPrice(previewValue)}</p>
                      </div>
                      <div className="mt-2 inline-flex items-center rounded-full border border-[#DDE9DF] bg-[#F4F7F4] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#5E7463] transition-colors group-hover/card:bg-[#3D5140] group-hover/card:text-white">
                        Use this item
                      </div>
                    </div>
                  </div>
                );
              })}

              {selectedSourceProduct && !canReplaceSelectedCard && (
                <div className="rounded-lg border border-dashed border-[#E5DDD4] bg-[#FDFCFA] px-3 py-2 text-[11px] font-semibold text-[#8B7E71]">
                  No other order item card available to replace.
                </div>
              )}
            </div>
          </div>
        )}
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

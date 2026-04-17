import { memo } from 'react';
import { BedDouble, Check, Loader2, PackageSearch, Sparkles } from 'lucide-react';
import type { TradeInProduct } from '../../../utils/tradeIn';
import { formatTradeInPrice } from '../../../utils/tradeIn';
import { ProductCard } from '../ProductCard';

interface StepSelectionProps {
  eligibleProducts: TradeInProduct[];
  selectedProducts: string[];
  onToggle: (id: string) => void;
  isLoading?: boolean;
  estimatedTradeInValue?: number;
  isEstimatingPrice?: boolean;
  depositAmount?: number;
}

export const StepSelection = memo(function StepSelection({
  eligibleProducts,
  selectedProducts,
  onToggle,
  isLoading = false,
  estimatedTradeInValue,
  isEstimatingPrice = false,
  depositAmount = 0,
}: StepSelectionProps) {
  const selectedCount = selectedProducts.length;
  const selectedId = selectedProducts[0];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="rounded-[28px] border border-[#E1EAE3] bg-gradient-to-br from-[#F3F8F4] via-white to-[#FBFDFC] p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE7DF] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#3D5140]">
              <Sparkles className="h-3 w-3" />
              Bedding Exchange
            </div>

            <h3 className="mt-3 font-serif italic text-[28px] text-[#1F2D3A] font-normal leading-tight">
              Select one old item
            </h3>

            <p className="mt-2 text-[13px] text-[#6F7F8F] font-medium leading-relaxed">
              {isLoading
                ? 'Loading your eligible bedding order items'
                : `${eligibleProducts.length} items eligible. We show trade-in value as From estimate, then finalize after inspection.`}
            </p>
            <p className="mt-2 text-[11px] text-[#8C7A6B] font-bold italic leading-relaxed">
              * Note: Only applicable for products purchased in the same category (parent category) as the product you want to trade up to.
            </p>
          </div>

          {selectedCount > 0 && (
            <div className="whitespace-nowrap inline-flex items-center gap-2 rounded-full border border-[#3D5140]/25 bg-[#ECF4ED] px-4 py-1.5 text-[12px] font-bold text-[#3D5140] shadow-sm">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              {selectedCount} of 1 selected
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#E1EAE3] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#6E7D72]">
            <BedDouble className="h-3.5 w-3.5 text-[#3D5140]" />
            Pay today: {formatTradeInPrice(depositAmount)} deposit
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#E1EAE3] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#6E7D72]">
            <span className="h-2 w-2 rounded-full bg-[#3D5140]" />
            Deduction shown as From estimate
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center text-center px-10 bg-white rounded-[28px] border-2 border-dashed border-[#E1EAE3]">
            <div className="w-16 h-16 rounded-full bg-[#ECF4ED] flex items-center justify-center mb-6">
              <Loader2 className="w-6 h-6 text-[#3D5140] animate-spin" />
            </div>
            <h4 className="text-[18px] font-bold text-[#1F2D3A] mb-2">Preparing your order history</h4>
            <p className="text-[13px] text-[#73879A] max-w-[320px] leading-relaxed">
              Please wait while we find your eligible mattress, pillow and bedding items.
            </p>
          </div>
        ) : eligibleProducts.length > 0 ? (
          eligibleProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isSelected={selectedProducts.includes(p.id)}
              onToggle={onToggle}
              estimatedTradeInValue={p.id === selectedId ? estimatedTradeInValue : undefined}
              isEstimatingPrice={p.id === selectedId && isEstimatingPrice}
            />
          ))
        ) : (
          <div className="py-20 flex flex-col items-center text-center px-10 bg-white rounded-[28px] border-2 border-dashed border-[#E1EAE3]">
            <div className="w-16 h-16 rounded-full bg-[#ECF4ED] flex items-center justify-center mb-6">
              <PackageSearch className="w-7 h-7 text-[#3D5140]" />
            </div>
            <h4 className="text-[18px] font-bold text-[#1F2D3A] mb-2">No eligible items found</h4>
            <p className="text-[13px] text-[#73879A] max-w-[330px] leading-relaxed">
              We could not find a qualifying bedding item in your order history for this trade-in flow.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

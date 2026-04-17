import { memo, useMemo, useState } from 'react';
import { BedDouble, CalendarDays, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTradeInPrice, type TradeInProduct } from '../../utils/tradeIn';

interface ProductCardProps {
  product: TradeInProduct;
  isSelected: boolean;
  onToggle: (id: string) => void;
  estimatedTradeInValue?: number;
  isEstimatingPrice?: boolean;
}

const truncateOrderId = (id: string) => {
  if (!id) return '';
  return id.length > 8 ? `...${id.slice(-8)}` : id;
};

export const ProductCard = memo(function ProductCard({
  product,
  isSelected,
  onToggle,
  estimatedTradeInValue,
  isEstimatingPrice = false,
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  const purchaseDateLabel = useMemo(() => {
    const parsed = new Date(product.purchaseDate);
    if (Number.isNaN(parsed.getTime())) return 'Unknown date';
    return parsed.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, [product.purchaseDate]);

  const estimateLabel = useMemo(() => {
    if (isEstimatingPrice) return 'Calculating estimate...';
    if (typeof estimatedTradeInValue === 'number' && estimatedTradeInValue > 0) {
      return `From ${formatTradeInPrice(estimatedTradeInValue)}`;
    }
    if (typeof product.tradeInValue === 'number' && product.tradeInValue > 0) {
      return `From ${formatTradeInPrice(product.tradeInValue)}`;
    }
    return 'Select to estimate';
  }, [estimatedTradeInValue, isEstimatingPrice, product.tradeInValue]);

  return (
    <button
      type="button"
      onClick={() => onToggle(product.id)}
      className={cn(
        'group relative w-full text-left flex flex-col gap-4 lg:flex-row lg:items-center p-5 rounded-[26px] border cursor-pointer transition-all duration-300 ease-out antialiased',
        isSelected
          ? 'bg-gradient-to-br from-[#F3F8F4] to-[#FBFCFA] border-[#3D5140]/35 shadow-[0_14px_30px_-18px_rgba(61,81,64,0.28)] ring-1 ring-[#3D5140]/15'
          : 'bg-white border-[#E1EAE3] hover:border-[#3D5140]/25 hover:shadow-[0_12px_28px_-18px_rgba(61,81,64,0.24)]'
      )}
    >
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <div
          className={cn(
            'h-[72px] w-[72px] rounded-2xl flex-shrink-0 overflow-hidden border bg-[#FBFDFF] transition-all duration-300',
            isSelected ? 'border-[#3D5140]/30' : 'border-[#E1EAE3]'
          )}
        >
          {!imgError && product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#F2F7F4]">
              <BedDouble
                className={cn(
                  'w-7 h-7 transition-colors',
                  isSelected ? 'text-[#3D5140]' : 'text-[#A2B6A8]'
                )}
              />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
            <span className="text-[10px] font-black text-[#5C7261] uppercase tracking-[0.14em]">
              REF: {truncateOrderId(product.orderId)}
            </span>
            <span className="h-1 w-1 rounded-full bg-[#DCE7DF]" />
            <div className="flex items-center gap-1.5 text-[10px] text-[#7D8E80] font-bold uppercase tracking-wider">
              <CalendarDays className="h-3 w-3" />
              {purchaseDateLabel}
            </div>
            {typeof product.quantity === 'number' && (
              <>
                <span className="h-1 w-1 rounded-full bg-[#DCE7DF]" />
                <div className="flex items-center gap-1.5 text-[10px] text-[#3D5140]/60 font-black uppercase tracking-widest">
                  Qty: {product.quantity} ({product.tradeInUsedAmount || 0} used)
                </div>
              </>
            )}
          </div>

          <h4 className="text-[16px] font-bold text-[#1E2F3D] leading-tight tracking-tight line-clamp-1">
            {product.name}
          </h4>

          <div className="mt-2 flex items-center gap-3">
            <div className={cn(
              "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide",
              isSelected ? "bg-[#3D5140] text-white" : "bg-slate-100 text-slate-500"
            )}>
              Original: {formatTradeInPrice(product.totalPrice || 0)}
            </div>
            {isSelected && (
              <div className="flex items-center gap-1.5 text-[11px] font-black text-[#3D5140] uppercase tracking-widest animate-in fade-in slide-in-from-left-2">
                <Check className="w-3.5 h-3.5" />
                Selected
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-auto flex lg:flex-col lg:items-end items-center justify-between gap-3 border-t lg:border-t-0 lg:border-l border-[#E1EAE3] pt-4 lg:pt-0 lg:pl-6">
        <div className="text-right">
          <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-[#8EA091] mb-1">
            Est. Trade Value
          </span>
          <span className={cn(
            'block text-[15px] font-black tracking-tighter leading-none',
            isSelected ? 'text-[#3D5140]' : 'text-[#8EA091]'
          )}>
            {estimateLabel}
          </span>
        </div>
      </div>
    </button>
  );
});

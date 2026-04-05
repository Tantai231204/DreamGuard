import { memo, useState } from 'react';
import { Check, Bed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTradeInPrice, type TradeInProduct } from '../../utils/tradeIn';

const formatPrice = formatTradeInPrice;

interface ProductCardProps {
  product: TradeInProduct;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const ProductCard = memo(function ProductCard({
  product,
  isSelected,
  onToggle,
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={() => onToggle(product.id)}
      className={cn(
        // Base
        'flex items-center gap-4 p-3.5 rounded-xl border cursor-pointer',
        // Smooth transition on all changing props
        'transition-all duration-150 ease-out',
        isSelected
          ? 'bg-[#F2F7F2] border-[#4A5D4E]'
          : 'bg-white border-[#EDE8E1] hover:border-[#4A5D4E]/40 hover:bg-[#FAFAF8]'
      )}
    >
      {/* Thumbnail */}
      <div
        className={cn(
          'h-12 w-12 rounded-lg flex-shrink-0 overflow-hidden border flex items-center justify-center transition-colors duration-150',
          isSelected ? 'border-[#4A5D4E]/20 bg-[#E6F0E6]' : 'border-[#EDE8E1] bg-[#F5F2EE]'
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
          <Bed
            className={cn(
              'w-5 h-5 transition-colors duration-150',
              isSelected ? 'text-[#4A5D4E]' : 'text-[#C4BDB5]'
            )}
          />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-gray-900 leading-snug truncate">
          {product.name}
        </p>
        <p className="text-[10.5px] text-[#A89E94] mt-0.5">
          Purchased {new Date(product.purchaseDate).getFullYear()}
        </p>
      </div>

      {/* Credit + checkbox */}
      <div className="flex-shrink-0 flex flex-col items-end gap-2">
        <span
          className={cn(
            'text-[12.5px] font-semibold font-serif italic leading-none transition-colors duration-150',
            isSelected ? 'text-[#4A5D4E]' : 'text-[#8C7A6B]'
          )}
        >
          +{formatPrice(product.tradeInValue || 0)}
        </span>

        {/* Checkbox — CSS only, no framer-motion */}
        <div
          className={cn(
            'w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-150',
            isSelected
              ? 'bg-[#4A5D4E] border-[#4A5D4E]'
              : 'border-[#D0C8BF] bg-white'
          )}
        >
          <Check
            className={cn(
              'w-2.5 h-2.5 text-white stroke-[3] transition-all duration-150',
              isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            )}
          />
        </div>
      </div>
    </div>
  );
});

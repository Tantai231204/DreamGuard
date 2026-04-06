import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TradeInProduct } from '../../../utils/tradeIn';
import { ProductCard } from '../ProductCard';

interface StepSelectionProps {
  eligibleProducts: TradeInProduct[];
  selectedProducts: string[];
  onToggle: (id: string) => void;
}

export function StepSelection({ eligibleProducts, selectedProducts, onToggle }: StepSelectionProps) {
  const hasSelected = selectedProducts.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-serif italic text-[20px] text-gray-900 font-normal leading-tight">
            Pick items to trade in
          </h3>
          <p className="text-[11.5px] text-[#8C7A6B] mt-1">
            {eligibleProducts.length} {eligibleProducts.length === 1 ? 'item' : 'items'} eligible from your past orders
          </p>
        </div>

        {/* Selected counter — CSS fade-in */}
        <div
          className={cn(
            'flex items-center gap-1.5 bg-[#E6F0E6] text-[#3D5140] text-[10.5px] font-bold px-3 py-1 rounded-full border border-[#4A5D4E]/20',
            'transition-all duration-200',
            hasSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
          )}
        >
          <Check className="w-3 h-3 stroke-[2.5]" />
          {selectedProducts.length} selected
        </div>
      </div>

      {/* Product list */}
      <div className="flex flex-col gap-2">
        {eligibleProducts.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            isSelected={selectedProducts.includes(p.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

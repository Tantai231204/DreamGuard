import { memo, useMemo, useCallback, useState } from 'react';
import { 
  RefreshCcw, 
  ChevronDown, 
  ChevronUp,
  Check,
  Package,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  calculateTradeInValue, 
  formatTradeInPrice,
  type TradeInProduct 
} from '../utils/tradeIn';

export type { TradeInProduct };

interface TradeInSelectorProps {
  eligibleProducts: TradeInProduct[];
  selectedProducts: string[];
  onToggleProduct: (productId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  tradeInPercentage?: number;
  className?: string;
}

const formatPrice = formatTradeInPrice;

// Single product item - clean, compact design
const TradeInProductItem = memo(function TradeInProductItem({
  product,
  isSelected,
  tradeInPercentage,
  onToggle,
}: {
  product: TradeInProduct;
  isSelected: boolean;
  tradeInPercentage: number;
  onToggle: () => void;
}) {
  const tradeInValue = product.tradeInValue || calculateTradeInValue(product.originalPrice, tradeInPercentage);
  const isDisabled = !product.canTradeIn;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onToggle}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200',
        isDisabled && 'opacity-50 cursor-not-allowed bg-gray-50',
        !isDisabled && !isSelected && 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30',
        !isDisabled && isSelected && 'border-emerald-500 bg-emerald-50 shadow-sm'
      )}
    >
      {/* Selection indicator */}
      <div className={cn(
        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
        isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300',
        isDisabled && 'border-gray-200'
      )}>
        {isSelected && <Check className="w-3 h-3 text-white" />}
      </div>

      {/* Product Image */}
      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {isSelected && (
          <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium text-sm truncate',
          isSelected ? 'text-emerald-900' : 'text-gray-900'
        )}>
          {product.name}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
          <Calendar className="w-3 h-3" />
          <span>{new Date(product.purchaseDate).toLocaleDateString('en-US')}</span>
        </div>
        {isDisabled && product.reason && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {product.reason}
          </p>
        )}
      </div>

      {/* Trade-in Value */}
      {!isDisabled && (
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
          <p className={cn(
            'font-bold text-sm',
            isSelected ? 'text-emerald-600' : 'text-gray-600'
          )}>
            -{formatPrice(tradeInValue)}
          </p>
        </div>
      )}
    </button>
  );
});

export const TradeInSelector = memo(function TradeInSelector({
  eligibleProducts,
  selectedProducts,
  onToggleProduct,
  onSelectAll,
  onClearAll,
  tradeInPercentage = 30,
  className,
}: TradeInSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(true); // Default expanded for better UX

  const tradeableProducts = useMemo(() => 
    eligibleProducts.filter(p => p.canTradeIn),
    [eligibleProducts]
  );

  const totalTradeInValue = useMemo(() => {
    return selectedProducts.reduce((total, productId) => {
      const product = eligibleProducts.find(p => p.id === productId);
      if (product && product.canTradeIn) {
        return total + (product.tradeInValue || calculateTradeInValue(product.originalPrice, tradeInPercentage));
      }
      return total;
    }, 0);
  }, [selectedProducts, eligibleProducts, tradeInPercentage]);

  const handleToggle = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const hasEligibleProducts = tradeableProducts.length > 0;
  const selectedCount = selectedProducts.length;
  const allSelected = selectedCount === tradeableProducts.length && tradeableProducts.length > 0;

  if (!hasEligibleProducts) {
    return null;
  }

  return (
    <Card className={cn(
      'overflow-hidden border-2 transition-all duration-300',
      selectedCount > 0 
        ? 'border-emerald-400 bg-gradient-to-br from-emerald-50/80 to-green-50/50 shadow-lg shadow-emerald-100' 
        : 'border-gray-200 bg-white hover:border-emerald-200',
      className
    )}>
      <CardContent className="p-0">
        {/* Header */}
        <button
          type="button"
          className="w-full flex items-center justify-between p-4 hover:bg-emerald-50/50 transition-colors"
          onClick={handleToggle}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2.5 rounded-xl transition-colors',
              selectedCount > 0 ? 'bg-emerald-500' : 'bg-emerald-100'
            )}>
              <RefreshCcw className={cn(
                'h-5 w-5',
                selectedCount > 0 ? 'text-white' : 'text-emerald-600'
              )} />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">Trade-in Program</h3>
                {selectedCount > 0 && (
                  <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0">
                    {selectedCount} selected
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {tradeableProducts.length} {tradeableProducts.length === 1 ? 'item' : 'items'} • Up to {tradeInPercentage}% off original price
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedCount > 0 && (
              <div className="text-right mr-2">
                <p className="text-xs text-gray-500">Discount</p>
                <p className="font-bold text-emerald-600">-{formatPrice(totalTradeInValue)}</p>
              </div>
            )}
            <div className={cn(
              'p-1.5 rounded-lg transition-colors',
              isExpanded ? 'bg-gray-100' : 'bg-transparent'
            )}>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
        </button>

        {/* Expandable Content */}
        <div className={cn(
          'transition-all duration-300 ease-in-out overflow-hidden',
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="px-4 pb-4 space-y-3">
            {/* Quick Actions */}
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package className="w-4 h-4" />
                <span>Selected {selectedCount}/{tradeableProducts.length}</span>
              </div>
              <div className="flex gap-2">
                {selectedCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onClearAll} 
                    className="text-xs h-7 text-gray-500 hover:text-red-600 hover:bg-red-50"
                  >
                    Clear
                  </Button>
                )}
                {!allSelected && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onSelectAll} 
                    className="text-xs h-7 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    Select All
                  </Button>
                )}
              </div>
            </div>

            {/* Product List */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
              {eligibleProducts.map((product) => (
                <TradeInProductItem
                  key={product.id}
                  product={product}
                  isSelected={selectedProducts.includes(product.id)}
                  tradeInPercentage={tradeInPercentage}
                  onToggle={() => onToggleProduct(product.id)}
                />
              ))}
            </div>

            {/* Summary Banner */}
            {selectedCount > 0 && (
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl text-white">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <RefreshCcw className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-100">Trade-in Savings</p>
                    <p className="font-bold text-lg">-{formatPrice(totalTradeInValue)}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-emerald-100">
                  <p>Old items will be</p>
                  <p>collected on delivery</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

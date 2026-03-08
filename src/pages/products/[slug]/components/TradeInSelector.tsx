import { memo, useMemo, useState } from 'react';
import {
  RefreshCcw,
  Check,
  AlertCircle,
  TrendingDown,
  History,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  calculateTradeInValue,
  formatTradeInPrice,
  type TradeInProduct
} from '../utils/tradeIn';

export type { TradeInProduct };

const formatPrice = formatTradeInPrice;

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
  const [imageError, setImageError] = useState(false);
  const tradeInValue = product.tradeInValue || calculateTradeInValue(product.originalPrice, tradeInPercentage);
  const isDisabled = !product.canTradeIn;

  const usageMonths = useMemo(() => {
    const now = new Date().getTime();
    return Math.floor((now - new Date(product.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30.5));
  }, [product.purchaseDate]);

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onToggle}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 relative group',
        isDisabled && 'opacity-40 cursor-not-allowed grayscale bg-gray-50/50 border-gray-100/50',
        !isDisabled && !isSelected && 'border-gray-100 bg-white hover:border-gray-950/20',
        !isDisabled && isSelected && 'border-gray-950 bg-gray-50 shadow-sm'
      )}
    >
      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-gray-100 p-1 shadow-inner">
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <RefreshCcw className="w-6 h-6 text-gray-200" />
          </div>
        )}
      </div>

      <div className="flex-1 text-left min-w-0">
        <h5 className={cn(
          'font-bold text-xs uppercase tracking-tight leading-tight line-clamp-1',
          isSelected ? 'text-gray-950' : 'text-gray-600'
        )}>
          {product.name}
        </h5>

        <div className="flex items-center gap-2 mt-1.5">
          <History className="w-2.5 h-2.5 text-gray-400" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{usageMonths}M Used</span>
        </div>

        {isDisabled && product.reason && (
          <p className="text-[8px] font-black text-rose-500 mt-1 uppercase tracking-widest flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" />
            {product.reason}
          </p>
        )}
      </div>

      {!isDisabled && (
        <div className="text-right shrink-0">
          <div className={cn(
            'px-3 py-1.5 rounded-lg font-black text-[10px] flex items-center gap-1.5',
            isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'
          )}>
            <TrendingDown className="w-3 h-3" />
            <span>-{formatPrice(tradeInValue)}</span>
          </div>
        </div>
      )}

      {isSelected && (
        <div className="absolute -top-2 -right-2 h-5 w-5 bg-gray-950 rounded-full flex items-center justify-center text-white shadow-md">
          <Check className="w-3 h-3 stroke-[4]" />
        </div>
      )}
    </button>
  );
});

interface TradeInSelectorProps {
  eligibleProducts: TradeInProduct[];
  selectedProducts: string[];
  onToggleProduct: (productId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  tradeInPercentage?: number;
  className?: string;
}

export const TradeInSelector = memo(function TradeInSelector({
  eligibleProducts,
  selectedProducts,
  onToggleProduct,
  onSelectAll,
  onClearAll,
  tradeInPercentage = 30,
  className,
}: TradeInSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalTradeInValue = useMemo(() => {
    return selectedProducts.reduce((total, productId) => {
      const product = eligibleProducts.find(p => p.id === productId);
      if (product && product.canTradeIn) {
        return total + (product.tradeInValue || calculateTradeInValue(product.originalPrice, tradeInPercentage));
      }
      return total;
    }, 0);
  }, [selectedProducts, eligibleProducts, tradeInPercentage]);

  const selectedCount = selectedProducts.length;

  if (eligibleProducts.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn(
        'overflow-hidden rounded-[2rem] border-2 transition-all duration-500',
        selectedCount > 0 ? 'border-gray-950 bg-gray-50/50 backdrop-blur-md shadow-xl shadow-gray-100/50' : 'border-gray-100 bg-white hover:border-gray-200',
        className
      )}>
        <CardContent className="p-0">
          <DialogTrigger asChild>
            <button className="w-full text-left p-6 flex flex-col gap-4 group outline-none">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-lg',
                    selectedCount > 0 ? 'bg-gray-950 text-white shadow-gray-950/20' : 'bg-emerald-50 text-emerald-600 shadow-emerald-100/50'
                  )}>
                    <RefreshCcw className={cn('h-6 w-6', selectedCount > 0 && 'animate-spin-slow')} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase italic tracking-tighter text-gray-950 leading-none">Trade-in Program</h3>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">
                      Exchange for {tradeInPercentage}% credit
                    </p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-gray-950 group-hover:text-white transition-all shadow-sm">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>

              {selectedCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Applied Credit</p>
                    <p className="text-xl font-black text-emerald-600 tracking-tighter leading-none">-{formatPrice(totalTradeInValue)}</p>
                  </div>
                  <Badge variant="secondary" className="bg-gray-950 text-white rounded-lg text-[9px] px-2.5 py-0.5 font-black uppercase tracking-tighter">
                    {selectedCount} Selected
                  </Badge>
                </motion.div>
              )}
            </button>
          </DialogTrigger>
        </CardContent>
      </Card>

      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none rounded-[3rem] shadow-2xl bg-white">
        <div className="flex flex-col h-[85vh] md:h-[600px]">
          <DialogHeader className="p-10 pb-6 border-b border-gray-50 flex flex-row items-center justify-between space-y-0">
            <div>
              <DialogTitle className="text-4xl font-black italic uppercase tracking-tighter text-gray-950 leading-none">
                Trade-in History
              </DialogTitle>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                Eligible items from your past orders
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSelectAll}
                className="text-[10px] font-black uppercase text-gray-400 hover:text-gray-950 no-underline px-3"
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-[10px] font-black uppercase text-gray-400 hover:text-rose-500 no-underline px-3"
              >
                Clear
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
          </div>

          <div className="p-10 border-t border-gray-50 bg-gray-50/50">
            <div className="flex items-center justify-between gap-10">
              <div className="flex-1">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1.5">Estimated Savings Applied</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-5xl font-black tracking-tighter text-gray-950">-{formatPrice(totalTradeInValue)}</h4>
                  <div className="mb-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">verified</div>
                </div>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                className="rounded-2xl h-16 px-10 bg-gray-950 text-white font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl hover:bg-black transition-all active:scale-95"
              >
                Confirm Savings
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

TradeInSelector.displayName = 'TradeInSelector';

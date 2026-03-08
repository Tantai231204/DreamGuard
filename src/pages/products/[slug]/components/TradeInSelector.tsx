import { memo, useMemo, useState, useCallback } from 'react';
import {
  RefreshCcw,
  Check,
  AlertCircle,
  TrendingDown,
  History,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
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

/**
 * TradeInProductItem memoized to prevent unnecessary re-renders
 */
const TradeInProductItem = memo(function TradeInProductItem({
  product,
  isSelected,
  tradeInPercentage,
  referenceTime,
  onToggle,
}: {
  product: TradeInProduct;
  isSelected: boolean;
  tradeInPercentage: number;
  referenceTime: number;
  onToggle: (id: string) => void;
}) {
  const [imageError, setImageError] = useState(false);

  const tradeInValue = useMemo(() =>
    product.tradeInValue || calculateTradeInValue(product.originalPrice, tradeInPercentage)
    , [product.tradeInValue, product.originalPrice, tradeInPercentage]);

  const isDisabled = !product.canTradeIn;

  const usageMonths = useMemo(() => {
    const purchaseDate = new Date(product.purchaseDate).getTime();
    return Math.floor((referenceTime - purchaseDate) / (1000 * 60 * 60 * 24 * 30.5));
  }, [product.purchaseDate, referenceTime]);

  return (
    <motion.button
      layout
      type="button"
      disabled={isDisabled}
      onClick={() => onToggle(product.id)}
      className={cn(
        'w-full flex items-center gap-4 p-5 rounded-3xl border-2 transition-all duration-500 relative group text-left',
        isDisabled && 'opacity-40 cursor-not-allowed grayscale bg-gray-50/50 border-gray-100/50',
        !isDisabled && !isSelected && 'border-gray-100 bg-white hover:border-gray-950/20 hover:shadow-xl hover:shadow-gray-200/40',
        !isDisabled && isSelected && 'border-gray-950 bg-gray-50 shadow-2xl shadow-gray-200/60'
      )}
      whileHover={{ y: isDisabled ? 0 : -2 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
    >
      <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-white border border-gray-100 p-2 shadow-inner group-hover:scale-105 transition-transform duration-500">
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <ShoppingBag className="w-8 h-8 text-gray-200" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Past Purchase</span>
        </div>

        <h5 className={cn(
          'font-black text-xs uppercase tracking-tight leading-tight line-clamp-2 mb-2',
          isSelected ? 'text-gray-950' : 'text-gray-700'
        )}>
          {product.name}
        </h5>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-500">{usageMonths}M USED</span>
          </div>
        </div>

        {isDisabled && product.reason && (
          <p className="text-[9px] font-bold text-rose-500 mt-2 uppercase tracking-widest flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {product.reason}
          </p>
        )}
      </div>

      {!isDisabled && (
        <div className="text-right shrink-0 flex flex-col items-end gap-2">
          <div className={cn(
            'px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all duration-500',
            isSelected ? 'bg-gray-950 text-white' : 'bg-emerald-50 text-emerald-600'
          )}>
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-{formatPrice(tradeInValue)}</span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-3 -right-3 h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white z-10"
          >
            <Check className="w-4 h-4 stroke-[4]" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
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

  // Use a stable reference time for the entire session
  const [referenceTime] = useState(() => Date.now());

  // Optimize selection check using a Set
  const selectedSet = useMemo(() => new Set(selectedProducts), [selectedProducts]);

  // Optimize price calculation
  const totalTradeInValue = useMemo(() => {
    if (selectedProducts.length === 0) return 0;

    return selectedProducts.reduce((total, productId) => {
      const product = eligibleProducts.find(p => p.id === productId);
      if (product && product.canTradeIn) {
        return total + (product.tradeInValue || calculateTradeInValue(product.originalPrice, tradeInPercentage));
      }
      return total;
    }, 0);
  }, [selectedProducts, eligibleProducts, tradeInPercentage]);

  const handleToggle = useCallback((id: string) => {
    onToggleProduct(id);
  }, [onToggleProduct]);

  const selectedCount = selectedProducts.length;

  if (eligibleProducts.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn(
        'overflow-hidden rounded-[2.5rem] border-2 transition-all duration-700 relative group',
        selectedCount > 0
          ? 'border-gray-950 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)]'
          : 'border-gray-100 bg-white hover:border-gray-300',
        className
      )}>
        <CardContent className="p-0">
          <DialogTrigger asChild>
            <button className="w-full text-left p-8 flex flex-col gap-6 group/btn outline-none transition-all text-left">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    'h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-700 shadow-2xl relative',
                    selectedCount > 0
                      ? 'bg-gray-950 text-white shadow-gray-950/30 rotate-12'
                      : 'bg-emerald-50 text-emerald-600 shadow-emerald-100/50 group-hover/btn:rotate-12'
                  )}>
                    <RefreshCcw className={cn('h-7 w-7 transition-all duration-1000', selectedCount > 0 && 'rotate-180')} />
                    {selectedCount > 0 && (
                      <motion.div
                        layoutId="star-pop"
                        className="absolute -top-2 -right-2 text-emerald-500"
                      >
                        <Sparkles className="w-5 h-5 fill-current" />
                      </motion.div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 text-left">
                      <h3 className="font-black text-lg uppercase italic tracking-tighter text-gray-950 leading-none">Smart Trade-in</h3>
                      {selectedCount > 0 && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Get {tradeInPercentage}% value for your old gear
                    </p>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full border border-gray-100 flex items-center justify-center group-hover/btn:bg-gray-950 group-hover/btn:text-white transition-all shadow-sm shrink-0">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {selectedCount > 0 ? (
                  <motion.div
                    key="summary-active"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="p-6 rounded-[2rem] bg-gray-50 border border-emerald-100 flex items-center justify-between overflow-hidden"
                  >
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">Current Trade-in Credit</p>
                      <h4 className="text-3xl font-black text-emerald-600 tracking-tighter leading-none">-{formatPrice(totalTradeInValue)}</h4>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className="bg-gray-950 text-white rounded-xl text-[10px] px-3 py-1 font-black uppercase tracking-widest border-none">
                        {selectedCount} ITEMS
                      </Badge>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="summary-empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 px-1"
                  >
                    <div className="h-1 w-12 rounded-full bg-emerald-100" />
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Select items to apply savings</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </DialogTrigger>
        </CardContent>
      </Card>

      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.25)] bg-white h-[90vh] md:h-[750px] flex flex-col gap-0 [&>button]:right-8 [&>button]:top-8 [&>button]:h-10 [&>button]:w-10 [&>button]:rounded-full [&>button]:bg-gray-50 [&>button]:transition-all [&>button:hover]:bg-gray-950 [&>button:hover]:text-white [&>button]:border-none [&>button]:outline-none [&>button>svg]:w-5 [&>button>svg]:h-5">
        <div className="flex flex-col h-full bg-white relative">


          <DialogHeader className="p-12 pb-8 flex flex-col items-start space-y-6">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
                <History className="w-7 h-7" />
              </div>
              <DialogTitle className="text-5xl font-black italic uppercase tracking-tighter text-gray-950 leading-[0.85]">
                Product <br />History
              </DialogTitle>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                Found {eligibleProducts.length} items eligible for upgrade
              </p>

              <div className="flex gap-1 p-1.5 bg-gray-50 rounded-2xl border border-gray-100 items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSelectAll}
                  className="h-9 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-950 hover:bg-white rounded-xl px-4 transition-all"
                >
                  Select All
                </Button>
                <div className="h-4 w-px bg-gray-200 mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  className="h-9 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-rose-500 hover:bg-white rounded-xl px-4 transition-all"
                >
                  Clear
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-12 pb-12 scrollbar-hide">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10 pb-20 pt-8">
              {eligibleProducts.map((product) => (
                <TradeInProductItem
                  key={product.id}
                  product={product}
                  isSelected={selectedSet.has(product.id)}
                  tradeInPercentage={tradeInPercentage}
                  referenceTime={referenceTime}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>

          <div className="p-12 border-t border-gray-100 bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.02)] z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.25em]">Total Potential Savings</p>
                  <div className="h-px flex-1 bg-gray-50" />
                </div>
                <div className="flex items-center gap-4">
                  <motion.h4
                    key={totalTradeInValue}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-6xl font-black tracking-tighter text-gray-950"
                  >
                    -{formatPrice(totalTradeInValue)}
                  </motion.h4>
                  <div className="flex flex-col gap-1">
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.2em] border-none inline-flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> VERIFIED
                    </Badge>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Instant Approval</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setIsOpen(false)}
                className="w-full md:w-auto rounded-[2rem] h-20 px-14 bg-gray-950 text-white font-black uppercase text-[12px] tracking-[0.25em] shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:bg-black transition-all hover:-translate-y-1 active:scale-95 group"
              >
                Apply Gear Credit
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

TradeInSelector.displayName = 'TradeInSelector';

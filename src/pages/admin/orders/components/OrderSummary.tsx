import { Card } from '@/components/ui/card';
import { formatPrice } from '@/pages/profile/utils';
import { Receipt, Coins, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderSummaryProps {
  subTotal?: number;
  discountAmount?: number;
  totalAddonPrice?: number;
  shippingFee?: number;
  totalAmount: number;
}

export function OrderSummary({ subTotal, discountAmount, totalAddonPrice, shippingFee, totalAmount }: OrderSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full"
    >
      <Card className="border border-blue-100 bg-white rounded-2xl shadow-sm overflow-hidden h-full flex flex-col relative group">
        {/* Modern Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />

        <div className="px-6 py-4 border-b border-blue-50 flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
                <Coins className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">
              Order Summary
            </h2>
          </div>
          <Receipt className="w-4 h-4 text-slate-300" />
        </div>

        <div className="p-6 flex-1 flex flex-col relative z-10">
          <div className="space-y-5 flex-1 p-2">
            {subTotal !== undefined && (
              <div className="flex justify-between items-center group/line">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover/line:text-slate-600 transition-colors">Subtotal</span>
                <span className="text-xs font-black text-slate-700 font-mono tracking-tighter">{formatPrice(subTotal)}</span>
              </div>
            )}

            {totalAddonPrice !== undefined && totalAddonPrice > 0 && (
                <div className="flex justify-between items-center group/line">
                  <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Bespoke Addons</span>
                  </div>
                  <span className="text-xs font-black text-amber-600 font-mono tracking-tighter">+{formatPrice(totalAddonPrice)}</span>
                </div>
              )}

            {discountAmount !== undefined && discountAmount > 0 && (
              <div className="flex justify-between items-center group/line">
                <div className="flex items-center gap-2">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Discount</span>
                </div>
                <div className="flex items-center gap-2">
                     <span className="text-[9px] font-bold text-emerald-400 uppercase italic">Voucher</span>
                     <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100/50 shadow-sm shadow-emerald-50">
                        -{formatPrice(discountAmount)}
                     </span>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center group/line pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover/line:text-slate-600 transition-colors">Shipping Fee</span>
              <span className="text-xs font-black text-slate-700 font-mono tracking-tighter">+{formatPrice(shippingFee || 0)}</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-blue-50 relative">
             <div className="absolute inset-0 bg-primary/5 blur-xl -z-10 rounded-full scale-150 transform translate-y-4" />
             
              <div className="flex justify-between items-end">
                <div className="flex flex-col mb-1">
                  <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Total</span>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black text-primary tracking-tighter block drop-shadow-sm">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
             </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

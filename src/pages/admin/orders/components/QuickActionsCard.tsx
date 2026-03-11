import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Truck, XCircle, Zap, ShieldCheck, Package } from 'lucide-react';
import { OrderStatus } from '../constants';

interface QuickActionsCardProps {
  currentStatusEnum: number;
  onUpdateStatus: (status: string) => void;
  onCancelOrder: () => void;
  delay?: number;
  canCancel?: boolean;
}

export function QuickActionsCard({
  currentStatusEnum,
  onUpdateStatus,
  onCancelOrder,
  delay = 0,
  canCancel = false,
}: QuickActionsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border border-blue-100 bg-white rounded-xl shadow-sm overflow-hidden relative">
        <div className="px-5 py-3 border-b border-blue-50 flex items-center justify-between bg-blue-50/30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Quick Actions
            </h2>
          </div>
          <Zap className="w-3.5 h-3.5 text-amber-400" />
        </div>

        <div className="p-6 space-y-4">
          {currentStatusEnum === OrderStatus.Pending && (
            <Button
              onClick={() => onUpdateStatus('Confirmed')}
              className="w-full justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 text-[11px] font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-500/20 border-none group"
            >
              <CheckCircle2 className="h-4 w-4 transition-transform group-hover:scale-110" />
              Confirm Order
            </Button>
          )}

          {currentStatusEnum === OrderStatus.Confirmed && (
            <Button
              onClick={() => onUpdateStatus('Processing')}
              className="w-full justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-12 text-[11px] font-black uppercase tracking-widest transition-all shadow-md shadow-blue-500/20 border-none group"
            >
              <Package className="h-4 w-4 transition-transform group-hover:scale-110" />
              Process Order
            </Button>
          )}

          {currentStatusEnum >= OrderStatus.Processing && currentStatusEnum < OrderStatus.Completed && (
               <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                 <Truck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                   Handled by 3rd party logistics.<br/>No manual actions needed.
                 </p>
               </div>
          )}

          {currentStatusEnum === OrderStatus.Completed && (
               <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
                 <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                 <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-relaxed">
                   Order has been fully completed.
                 </p>
               </div>
          )}

          {currentStatusEnum === OrderStatus.Cancelled && (
               <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
                 <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                 <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest leading-relaxed">
                   Order has been cancelled.
                 </p>
               </div>
          )}

          {canCancel && (
            <Button
              onClick={onCancelOrder}
              variant="outline"
              className="w-full justify-center gap-2 rounded-xl border-slate-100 bg-slate-50/50 text-rose-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 h-11 text-[10px] font-black uppercase tracking-widest transition-all px-0"
            >
              <XCircle className="h-4 w-4" />
              Cancel Order
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

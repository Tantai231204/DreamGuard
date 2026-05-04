import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Truck, XCircle, Zap, ShieldCheck, Package, Clock, RefreshCw, RotateCcw } from 'lucide-react';
import { OrderStatus } from '../constants';

interface QuickActionsCardProps {
  currentStatusEnum: OrderStatus | string;
  onUpdateStatus: (status: keyof typeof OrderStatus) => void;
  onCancelOrder: () => void;
  canCancel: boolean;
  hasTask: boolean;
  delay?: number;
}

declare global {
  interface Window {
    openExchangeDialog?: () => void;
    openReturnDialog?: () => void;
  }
}

export function QuickActionsCard({
  currentStatusEnum,
  onUpdateStatus,
  onCancelOrder,
  canCancel,
  hasTask,
  delay = 0,
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
              Shipping Orchestrator
            </h2>
          </div>
          <Zap className="w-3.5 h-3.5 text-amber-400" />
        </div>

        <div className="p-6 space-y-4">
          {/* ─── Step 1: Manager confirms the order ─── */}
          {currentStatusEnum === OrderStatus.Pending && (
            <Button
              onClick={() => onUpdateStatus('Confirmed')}
              className="w-full justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-500/20 border-none group"
            >
              <CheckCircle2 className="h-4 w-4 transition-transform group-hover:scale-110" />
              Confirm Engagement
            </Button>
          )}

          {/* ─── Step 2: Deployment & Preparation ─── */}
          {currentStatusEnum === OrderStatus.Confirmed && (
            <div className="space-y-3">
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-3">
                <Truck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5 animate-pulse" />
                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.15em] leading-relaxed">
                  {hasTask
                    ? "Technical personnel deployed. You may now move to processing."
                    : "Awaiting logistics assignment to begin engagement workflow."}
                </p>
              </div>

              {hasTask && (
                <Button
                  onClick={() => onUpdateStatus('Processing')}
                  className="w-full justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-500/20 border-none group"
                >
                  <RefreshCw className="h-4 w-4 transition-transform group-active:rotate-180" />
                  Move to Processing
                </Button>
              )}
            </div>
          )}

          {currentStatusEnum === OrderStatus.Processing && (
            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-3">
              <Package className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
              <p className="text-[9px] font-bold text-amber-600 uppercase tracking-[0.15em] leading-relaxed">
                Order being prepared in warehouse. Awaiting courier pick-up to begin transit.
              </p>
            </div>
          )}

          {/* ─── Step 3: Staff is handling delivery – tracking only ─── */}
          {currentStatusEnum === OrderStatus.Shipping && (
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-3">
              <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5 animate-pulse" />
              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.15em] leading-relaxed">
                In transit. Delivery staff is updating tracking status in real-time.
              </p>
            </div>
          )}

          {/* ─── Step 4: Delivered → Staff finalizes on mobile ─── */}
          {currentStatusEnum === OrderStatus.Delivered && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.15em] leading-relaxed">
                Delivered successfully. Awaiting staff to finalize on mobile or customer to confirm receipt.
              </p>
            </div>
          )}

          {/* ─── Step 5: Completed – no more actions ─── */}
          {currentStatusEnum === OrderStatus.Completed && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.15em] leading-relaxed">
                Engagement finalized. Customer has confirmed receipt of all items.
              </p>
            </div>
          )}

          {/* ─── Step 6: Returning → Staff handles on mobile ─── */}
          {currentStatusEnum === OrderStatus.Returning && (
            <div className="space-y-3">
              <Button
                onClick={() => window.openExchangeDialog?.()}
                className="w-full justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 text-[11px] font-black uppercase tracking-widest transition-all shadow-md shadow-blue-500/20 border-none group"
              >
                <RefreshCw className="h-4 w-4 transition-transform group-hover:scale-110" />
                Process Replacement / Exchange
              </Button>
              <Button
                onClick={() => window.openReturnDialog?.()}
                className="w-full justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-12 text-[11px] font-black uppercase tracking-widest transition-all shadow-md shadow-rose-500/20 border-none group"
              >
                <RotateCcw className="h-4 w-4 transition-transform group-hover:rotate-180" />
                Process Audit / Return
              </Button>
            </div>
          )}

          {currentStatusEnum === OrderStatus.ExchangeRequested && (
            <div className="space-y-3">
              <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-3">
                <RotateCcw className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[9px] font-bold text-blue-700 uppercase tracking-[0.15em] leading-relaxed">
                  Exchange request has been approved and is being handled by staff.
                </p>
              </div>
              <Button
                onClick={() => window.openExchangeDialog?.()}
                className="w-full justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-blue-500/20 border-none group"
              >
                <RefreshCw className="h-4 w-4 transition-transform group-hover:scale-110" />
                Process Replacement / Exchange
              </Button>
            </div>
          )}

          {currentStatusEnum === OrderStatus.ShippingReplacement && (
            <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-xl flex items-start gap-3">
              <Truck className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-sky-700 uppercase tracking-[0.15em] leading-relaxed">
                Replacement delivery is staff-driven. Progress updates are managed via mobile.
              </p>
            </div>
          )}

          {/* ─── Step 7: Returned → Terminal state ─── */}
          {currentStatusEnum === OrderStatus.Returned && (
            <div className="space-y-3">
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.15em] leading-relaxed">
                  Items returned and processed by staff. Awaiting final system archival.
                </p>
              </div>
              <Button
                onClick={() => window.openReturnDialog?.()}
                className="w-full justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11 text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-rose-500/20 border-none group"
              >
                <ShieldCheck className="h-4 w-4 transition-transform group-hover:scale-110" />
                Finalize Audit / Restock
              </Button>
            </div>
          )}

          {/* ─── Terminal States ─── */}
          {(currentStatusEnum === OrderStatus.ReturnedAndRefunding || currentStatusEnum === OrderStatus.ReturnedAndRefunded) && (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] leading-relaxed">
                Case Closed. Funds have been balanced and inventory processed.
              </p>
            </div>
          )}

          {(currentStatusEnum === 'PartialCompleted' || currentStatusEnum === 'Partial_Completed') && (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] leading-relaxed">
                Batch Settlement Active. Some components of this order have reached terminal status.
              </p>
            </div>
          )}

          {currentStatusEnum === OrderStatus.Cancelled && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-rose-600 uppercase tracking-[0.25em] leading-relaxed">
                This engagement has been terminated and archived.
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
              Cancel Dispatch
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

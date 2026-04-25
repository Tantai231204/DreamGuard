import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { formatPrice } from '@/pages/profile/utils';
import { useAdminPayments } from '@/hooks/queries/usePayment';
import { CreditCard, AlertCircle, ShieldCheck, ChevronLeft, ChevronRight, FileEdit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTime } from '@/lib/utils';
import { AdminStatusBadge } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { UpdatePaymentDialog } from './UpdatePaymentDialog';

interface PaymentInfoCardProps {
  orderCode: string;
  paymentMethod?: string;
  delay?: number;
}

export const PaymentInfoCard = React.memo(({ orderCode, paymentMethod = 'COD', delay = 0 }: PaymentInfoCardProps) => {
  const { data: paymentResponse, isPending: isLoading } = useAdminPayments({ orderCode });
  const payments = paymentResponse?.items || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  const payment = payments[currentIndex];

  const handlePrev = () => setCurrentIndex(p => Math.max(0, p - 1));
  const handleNext = () => setCurrentIndex(p => Math.min(payments.length - 1, p + 1));

  const rawMethod = payment?.paymentMethod || paymentMethod || 'COD';
  const displayMethod = (rawMethod.toLowerCase() === 'cod' && payment?.status?.toLowerCase() === 'paid')
    ? 'CODPaid'
    : rawMethod;

  const isRefund = payment?.paymentType === 'Refund';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="h-full flex flex-col"
    >
      <Card className="border border-blue-100/50 bg-white rounded-2xl shadow-sm overflow-hidden h-full flex flex-col relative group">
        {/* Modern Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />

        <div className="px-6 py-4 border-b border-blue-50 flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-transparent relative z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <CreditCard className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Authorization Ledger
            </h2>
          </div>
          {payments.length > 1 ? (
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-white border-blue-100 text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5">
                {currentIndex + 1} / {payments.length}
              </Badge>
              <div className="flex gap-1">
                <button onClick={handlePrev} disabled={currentIndex === 0} className="p-1 rounded-md bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors shadow-sm">
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button onClick={handleNext} disabled={currentIndex === payments.length - 1} className="p-1 rounded-md bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors shadow-sm">
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="p-5 space-y-4 flex-1">
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-4 w-full rounded" />
            </div>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-5 flex-1 flex flex-col justify-center gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">Intended Method</p>
                <AdminStatusBadge status={paymentMethod} mode="method" className="scale-[0.8] origin-left" />
              </div>
              <div className="text-right">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Expected Entry</p>
                <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 text-[7px] font-black px-2 py-0.5">Pending Audit</Badge>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/50 border border-dashed border-slate-200 flex flex-col items-center justify-center py-4 gap-3">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <AlertCircle className="w-5 h-5 text-slate-300" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No Active Payment Records</p>
                <p className="text-[11px] font-medium text-slate-400 max-w-[200px]">
                  Order is committed via {paymentMethod || 'standard methods'}. No successful transaction found in administration logs yet.
                </p>
              </div>
            </div>

            <div className="mt-auto space-y-1">
              <div className="h-px bg-slate-100" />
              <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em] pt-2 text-center italic">
                Awaiting Payment Gateway Synchronization
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="p-6 h-full flex flex-col relative z-10"
              >
                {/* Top Row: Settlement & Status */}
                <div className="flex items-center justify-between mb-6 shrink-0">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 leading-none">Settlement</span>
                    <AdminStatusBadge
                      status={displayMethod}
                      mode="method"
                      className="scale-90 origin-left"
                    />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Process Status</span>
                    <div className="flex items-center gap-1.5">
                      <AdminStatusBadge
                        status={payment?.status || 'Pending'}
                        mode="payment"
                        className="scale-90 origin-right"
                      />
                      {isRefund && payment?.status !== 'Refunded' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-7 px-2 rounded-lg hover:bg-emerald-50 text-emerald-600 font-bold text-[9px] uppercase gap-1.5 transition-all"
                          onClick={() => setShowUpdateDialog(true)}
                        >
                          <FileEdit className="w-3 h-3" />
                          Finalize Payment
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Simplified Metadata Row */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-3 rounded-xl bg-slate-50/50 border border-slate-100/50 shrink-0">
                  <div className="min-w-0">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Reference</p>
                    <div className="font-mono text-[10px] font-bold text-slate-700 truncate">
                      {payment?.id?.toUpperCase() || 'REF-PENDING'}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Timestamp</p>
                    <p className="text-[10px] font-bold text-slate-700">
                      {payment?.createdAt ? formatTime(payment.createdAt) : '--:--:--'}
                    </p>
                  </div>
                </div>

                {/* Amount Row - Principal focus */}
                <div className="mt-auto pt-4 border-t border-slate-100/50 items-center justify-between flex">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Valuation</span>
                    <span className="text-[8px] font-bold text-slate-300 uppercase italic">Immutable Ledger</span>
                  </div>
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">
                    {formatPrice(payment?.amount || 0)}
                  </span>
                </div>

                {payment?.status === 'Failed' && (
                  <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-100 flex gap-3 items-start text-rose-600 animate-in fade-in slide-in-from-bottom-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] font-black leading-tight uppercase tracking-tight">
                      Rejection Detected. Immediate Audit Required.
                    </p>
                  </div>
                )}

                {/* Payment Evidence - Visual Proof */}
                {payment?.evidenceUrl && (
                  <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Evidence</span>
                      <a
                        href={payment.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        Open Original
                      </a>
                    </div>
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group/evidence">
                      <img
                        src={payment.evidenceUrl}
                        alt="Payment Evidence"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/evidence:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/evidence:opacity-100 transition-opacity" />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </Card>

      <UpdatePaymentDialog
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
        payment={payment}
        isRefund={isRefund}
        orderCode={orderCode}
      />
    </motion.div>
  );
});

PaymentInfoCard.displayName = 'PaymentInfoCard';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { formatPrice } from '@/pages/profile/utils';
import { useAdminPayments } from '@/hooks/queries/usePayment';
import { CreditCard, AlertCircle, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTime } from '@/lib/utils';
import { AdminStatusBadge } from '@/components/admin';

interface PaymentInfoCardProps {
  orderCode: string;
  paymentMethod?: string;
  delay?: number;
}

export const PaymentInfoCard = React.memo(({ orderCode, delay = 0 }: PaymentInfoCardProps) => {
  const { data: paymentResponse, isPending: isLoading } = useAdminPayments({ orderCode });
  const payments = paymentResponse?.items || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  const payment = payments[currentIndex];

  const handlePrev = useCallback(() => setCurrentIndex(p => Math.max(0, p - 1)), []);
  const handleNext = useCallback(() => setCurrentIndex(p => Math.min(payments.length - 1, p + 1)), [payments.length]);

  const rawMethod = payment?.paymentMethod || 'COD';
  const displayMethod = (rawMethod.toLowerCase() === 'cod' && payment?.status?.toLowerCase() === 'paid')
    ? 'CODPaid'
    : rawMethod;

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

        <div className="px-6 py-4 border-b border-blue-50 flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-transparent relative z-20">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">
              Financial Vault
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
            <CreditCard className="w-4 h-4 text-slate-300" />
          )}
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4 flex-1">
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-4 w-full rounded" />
            </div>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-slate-400">
            <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-[10px] uppercase font-black tracking-widest">No Records Found</p>
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
                className="p-6 h-full flex flex-col absolute inset-0 z-10"
              >
                {/* Top Row: Settlement, Type, Status */}
                <div className="flex items-end justify-between mb-6 gap-4">
                  <div className="flex flex-1 items-center gap-8">
                    <div className="flex flex-col items-start min-w-[90px] justify-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Settlement</span>
                      <AdminStatusBadge
                        status={displayMethod}
                        mode="method"
                        className="scale-90 origin-left"
                      />
                    </div>
                    <div className="flex flex-col items-start min-w-[90px] justify-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Type</span>
                      <AdminStatusBadge
                        status={payment?.paymentType || 'Purchase'}
                        className="scale-90 origin-left"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-end">
                      <AdminStatusBadge
                        status={payment?.status || 'Pending'}
                        mode="payment"
                        className="scale-90 origin-right"
                      />
                    </div>
                  </div>
                </div>

                {/* Fiscal Description - Core Audit Data */}
                <div className="mb-6 space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fiscal Identity</span>
                  <p className="text-[10px] font-bold text-slate-600 leading-relaxed italic">
                    {payment?.description || 'N/A: Standard Purchase Authorization'}
                  </p>
                </div>

                {/* Auth Reference & Timestamp Row */}
                <div className="flex items-end justify-between mb-6 gap-4">
                  <div className="space-y-1 flex-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Transaction Ref</p>
                    <div className="font-mono text-[10px] font-bold text-slate-600 px-2 py-1 rounded bg-white border border-slate-100/50 inline-block truncate max-w-[140px]">
                      {payment?.id?.toUpperCase() || 'REF-PENDING'}
                    </div>
                  </div>
                  <div className="space-y-1 text-right flex-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Timestamp</p>
                    <p className="text-[10px] font-bold text-slate-700">
                      {payment?.createdAt ? formatTime(payment.createdAt) : '--:--:--'}
                    </p>
                  </div>
                </div>

                {/* Amount Row */}
                <div className="mt-auto items-center justify-between flex">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authorized Gross</span>
                    <span className="text-[8px] font-bold text-slate-300 uppercase italic">Immutable Ledger Record</span>
                  </div>
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">
                    {formatPrice(payment?.amount || 0)}
                  </span>
                </div>

                {payment?.status === 'Failed' && (
                  <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-100 flex gap-3 items-start text-rose-600 animate-in fade-in slide-in-from-bottom-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p className="text-[9px] font-black leading-normal uppercase tracking-tight">
                      Transaction Rejection Detected. Immediate Audit Required by Fiscal Lead.
                    </p>
                  </div>
                )}

                {/* Payment Evidence - Visual Proof */}
                {payment?.evidenceUrl && (
                  <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Evidence</span>
                      <a
                        href={payment.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-bold text-primary hover:underline"
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
    </motion.div>
  );
});

PaymentInfoCard.displayName = 'PaymentInfoCard';

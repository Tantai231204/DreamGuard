import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { formatPrice } from '@/pages/profile/utils';
import { usePaymentByOrderId } from '@/hooks/queries/usePayment';
import { CreditCard, AlertCircle, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTime, cn } from '@/lib/utils';
import { AdminStatusBadge } from '@/components/admin';

interface PaymentInfoCardProps {
  orderId: string;
  paymentMethod: string;
  total: number;
  delay?: number;
}

export function PaymentInfoCard({ orderId, paymentMethod, total, delay = 0 }: PaymentInfoCardProps) {
  const { data: payment, isLoading } = usePaymentByOrderId(orderId);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-50';
      case 'pending': return 'bg-amber-50 text-amber-600 shadow-sm shadow-amber-50';
      case 'failed': return 'bg-rose-50 text-rose-600 shadow-sm shadow-rose-50';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="h-full"
    >
      <Card className="border border-blue-100 bg-white rounded-2xl shadow-sm overflow-hidden h-full flex flex-col relative group">
        {/* Modern Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />

        <div className="px-6 py-4 border-b border-blue-50 flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
                <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">
              Financial Vault
            </h2>
          </div>
          <CreditCard className="w-4 h-4 text-slate-300" />
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4 flex-1">
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-4 w-full rounded" />
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6 flex-1 flex flex-col relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Settlement Method</span>
                <AdminStatusBadge 
                    status={paymentMethod || payment?.paymentMethod || 'COD'} 
                    type="neutral"
                    className="group"
                />
              </div>
              <Badge variant="outline" className={cn(getStatusColor(payment?.status || 'Pending'), "border-none font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider")}>
                {payment?.status || 'UNSETTLED'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Auth Reference</p>
                <div className="font-mono text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100/50 inline-block">
                  {payment?.id?.substring(0, 12).toUpperCase() || 'REF-PENDING'}
                </div>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Timestamp</p>
                <p className="text-[10px] font-bold text-slate-700">
                  {payment?.createdAt ? formatTime(payment.createdAt) : '--:--:--'}
                </p>
              </div>
            </div>
            
            <div className="mt-auto pt-6 border-t border-blue-50 items-center justify-between flex">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authorized Gross</span>
                    <span className="text-[8px] font-bold text-slate-300 uppercase italic">Immutable Ledger Record</span>
                 </div>
                 <span className="text-2xl font-black text-slate-900 tracking-tighter">
                  {formatPrice(payment?.amount || total)}
                 </span>
            </div>

            {payment?.status === 'Failed' && (
              <div className="mt-2 p-3 rounded-xl bg-rose-50 border border-rose-100 flex gap-3 items-start text-rose-600 animate-in fade-in slide-in-from-bottom-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-[9px] font-black leading-normal uppercase tracking-tight">
                  Transaction Rejection Detected. Immediate Audit Required by Fiscal Lead.
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

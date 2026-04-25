import { memo, lazy, Suspense } from 'react';
import { Wrench, CalendarDays, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useReOrderFailedServiceOrder } from '@/hooks/queries/useServiceOrder';
import { useToast } from '@/hooks/useToast';
import type { ServiceOrderResponse } from '@/api/types/serviceOrder';
import { formatDate, formatPrice, formatDateTime } from '../../utils';
import { STATUS_THEME } from '../../constants';

// Lazy load detail dialog
const ServiceOrderDetailDialog = lazy(() => import("./ServiceOrderDetailDialog").then(m => ({ default: m.ServiceOrderDetailDialog })));

interface ServiceOrderCardProps {
  order: ServiceOrderResponse;
}

function toThemeKey(status: unknown) {
  if (status === null || status === undefined) return 'Pending';
  
  const codeMap: Record<number, string> = {
    0: 'Pending',
    1: 'Confirmed',
    2: 'Processing',
    3: 'Assigned',
    4: 'Completed',
    5: 'Cancelled',
    6: 'Cancelled', // forcedcancelled
    7: 'Rescheduled',
    8: 'Rejected',
  };

  if (typeof status === 'number') {
    return codeMap[status] || 'Pending';
  }

  const lower = String(status).toLowerCase().trim().replace(/[\s_-]/g, '');
  if (lower === 'cancelled' || lower === 'canceled' || lower === 'forcedcancelled') return 'Cancelled';
  if (lower === 'completed') return 'Completed';
  if (lower === 'confirmed') return 'Confirmed';
  if (lower === 'processing' || lower === 'inprogress') return 'Processing';
  if (lower === 'rescheduled') return 'Rescheduled';
  if (lower === 'rejected') return 'Rejected';
  if (lower === 'refunded') return 'Refunded';
  return 'Pending';
}

export const ServiceOrderCard = memo(({ order }: ServiceOrderCardProps) => {
  const orderId = order.soId || order.id || '';
  const toast = useToast();
  const reOrderFailedServiceMutation = useReOrderFailedServiceOrder();

  const theme = STATUS_THEME[toThemeKey(order.status)] || STATUS_THEME.Pending;
  const detailItems = order.items || order.orderDetails || order.serviceOrderItems || [];

  const mainServiceName = detailItems.length > 0
    ? (detailItems[0].packageName || detailItems[0].serviceName || detailItems[0].itemName || 'Service Order')
    : 'Service Order';

  const normalizedOrderStatus = toThemeKey(order.status).toLowerCase();
  const paymentMethod = String(order.paymentMethod || '').toLowerCase();
  const paymentStatus = String(order.paymentStatus || '').toLowerCase();
  const canRetryPayment = !!orderId && 
    paymentMethod.includes('vnpay') && 
    paymentStatus !== 'paid' && 
    normalizedOrderStatus === 'pending';

  const handleRetryPayment = async () => {
    if (!orderId) return;

    try {
      const response = await reOrderFailedServiceMutation.mutateAsync(orderId);
      const paymentUrl = typeof response?.paymentUrl === 'string' ? response.paymentUrl : '';

      if (paymentUrl) {
        window.location.assign(paymentUrl);
        return;
      }

      toast.warning('Unable to create payment link.', 'Please try again in a moment.');
    } catch {
      // Handled by global interceptor
    }
  };

  return (
    <Card className="group relative rounded-2xl border-slate-200/60 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md will-change-transform">
      {/* Header */}
      <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            <Wrench className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900">DreamGuard Care</span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{formatDate(order.createdAt || '')}</p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="w-fit px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border-none shadow-sm"
          style={{ backgroundColor: `${theme.color}10`, color: theme.color }}
        >
          <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: theme.color }} />
          {theme.label}
        </Badge>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col md:flex-row gap-6">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <CalendarDays className="w-8 h-8 text-slate-300" />
          </div>
          <Badge className="absolute -top-2 -right-2 h-6 min-w-[24px] rounded-lg bg-slate-900 text-white border-2 border-white font-bold text-[10px] flex items-center justify-center shadow-sm">
            {detailItems.length}
          </Badge>
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 tracking-tight">{mainServiceName}</h4>
              <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-500 font-medium">
                <span>Order ID: #{order.orderCode}</span>
              </div>
              <div className="flex items-center gap-1 mt-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-blue-50 w-fit border border-blue-100">
                <CalendarDays className="w-3 h-3" />
                {order.appointmentDate ? formatDateTime(order.appointmentDate) : 'Schedule Pending'}
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Value</p>
              <p className="text-lg font-bold text-slate-900">{formatPrice(order.totalPrice || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] text-slate-500 font-medium">
            Manage your service and view assigned staff details.
          </p>
          <button
            className="text-[10px] font-black text-[#4988c4] uppercase tracking-widest flex items-center gap-1.5 hover:underline w-fit"
            onClick={() => window.alert(`Contacting support for Order #${order.orderCode}...`)}
          >
            <ShieldCheck className="w-3 h-3" />
            Service Support
          </button>
        </div>

        <div className="flex items-center gap-2">
          {canRetryPayment && (
            <Button
              type="button"
              onClick={handleRetryPayment}
              disabled={reOrderFailedServiceMutation.isPending}
              className="h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all border-none"
            >
              {reOrderFailedServiceMutation.isPending ? 'Processing...' : 'Complete Payment'}
            </Button>
          )}

          <Suspense fallback={
            <Button
              variant="outline"
              className="h-9 px-4 rounded-lg text-xs font-bold uppercase tracking-wider border-slate-200 opacity-70 animate-pulse"
              disabled
            >
              Details
            </Button>
          }>
            <ServiceOrderDetailDialog
              serviceOrderId={orderId}
              orderCode={order.orderCode}
              trigger={
                <Button
                  variant="outline"
                  className="h-9 px-4 rounded-lg text-xs font-bold uppercase tracking-wider border-slate-200 hover:bg-white transition-all"
                  type="button"
                  disabled={!orderId}
                >
                  Details
                </Button>
              }
            />
          </Suspense>
        </div>
      </div>
    </Card>
  );
});


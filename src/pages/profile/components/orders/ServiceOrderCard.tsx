import { memo } from 'react';
import { Wrench, CalendarDays } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useReOrderFailedServiceOrder } from '@/hooks/queries/useServiceOrder';
import { useToast } from '@/hooks/useToast';
import type { ServiceOrderResponse } from '@/api/types/serviceOrder';
import { formatDate, formatPrice } from '../../utils';
import { STATUS_THEME } from '../../constants';
import { ServiceOrderDetailDialog } from './ServiceOrderDetailDialog';

interface ServiceOrderCardProps {
  order: ServiceOrderResponse;
}

function toThemeKey(status?: string) {
  if (!status) return 'Pending';
  const lower = status.toLowerCase();
  if (lower === 'cancelled' || lower === 'canceled' || lower === 'forcedcancelled') return 'Cancelled';
  if (lower === 'completed') return 'Completed';
  if (lower === 'confirmed') return 'Confirmed';
  if (lower === 'processing' || lower === 'inprogress') return 'Processing';
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

  const paymentMethod = String(order.paymentMethod || '').toLowerCase();
  const paymentStatus = String(order.paymentStatus || '').toLowerCase();
  const canRetryPayment = !!orderId && paymentMethod.includes('vnpay') && paymentStatus === 'failed';

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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Re-payment failed. Please try again.';
      toast.error('Cannot retry payment.', message);
    }
  };

  return (
    <Card className="rounded-2xl border-slate-200/60 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            <Wrench className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">DreamGuard Service</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{formatDate(order.createdAt || '')}</p>
          </div>
        </div>

        <Badge
          variant="secondary"
          className="w-fit px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border-none"
          style={{ backgroundColor: `${theme.color}10`, color: theme.color }}
        >
          {theme.label}
        </Badge>
      </div>

      <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Service Package</p>
          <h4 className="text-base font-bold text-slate-900 tracking-tight capitalize mb-1">{mainServiceName}</h4>
          <p className="text-xs text-slate-500 font-medium mb-2">Order: {order.orderCode}</p>
          <div className="flex items-center gap-1.5 text-slate-500">
            <CalendarDays className="w-3.5 h-3.5" />
            <p className="text-xs font-semibold">
              {order.appointmentDate ? formatDate(order.appointmentDate) : 'Not scheduled'}
            </p>
          </div>
        </div>

        <div className="sm:text-right text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
          <p className="text-lg font-bold text-slate-900">{formatPrice(order.totalPrice || 0)}</p>
        </div>
      </div>

      {detailItems.length > 1 && (
        <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Additional Services</p>
          <div className="space-y-1.5">
            {detailItems.slice(1).map((item, idx) => (
              <div key={item.id || idx} className="flex justify-between items-center text-xs">
                <p className="text-slate-700 font-semibold">
                  {item.packageName || item.serviceName || item.itemName || `Service ${idx + 2}`}
                </p>
                <p className="text-slate-900 font-bold">{formatPrice(item.totalPrice || 0)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-end gap-2">
        {canRetryPayment && (
          <Button
            type="button"
            onClick={handleRetryPayment}
            disabled={reOrderFailedServiceMutation.isPending}
            className="h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#4988c4] text-white hover:bg-[#3f79af]"
          >
            {reOrderFailedServiceMutation.isPending ? 'Processing...' : 'Pay Again'}
          </Button>
        )}

        <ServiceOrderDetailDialog
          serviceOrderId={orderId}
          orderCode={order.orderCode}
          trigger={
            <Button variant="outline" className="h-9 px-4 rounded-lg text-xs font-bold uppercase tracking-wider border-slate-200 hover:bg-white transition-all" type="button" disabled={!orderId}>
              Details
            </Button>
          }
        />
      </div>
    </Card>
  );
});

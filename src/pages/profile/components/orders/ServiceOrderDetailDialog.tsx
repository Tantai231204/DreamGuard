import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Phone, Package2, CreditCard } from 'lucide-react';
import { useProfile } from '@/hooks/queries';
import { useServiceOrderDetail } from '@/hooks/queries/useServiceOrder';
import { formatDate, formatPrice } from '../../utils';
import { STATUS_THEME } from '../../constants';

interface ServiceOrderDetailDialogProps {
  serviceOrderId: string;
  orderCode?: string;
  trigger: React.ReactNode;
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

function normalizePhone(phone?: string) {
  return (phone || '').replace(/\D/g, '');
}

export function ServiceOrderDetailDialog({ serviceOrderId, orderCode, trigger }: ServiceOrderDetailDialogProps) {
  const { data: profile } = useProfile();

  const rawProfile = profile as Record<string, unknown> | undefined;
  const currentCustomerId = String(rawProfile?.customerId || rawProfile?.id || rawProfile?.userId || '').trim();
  const currentPhone = normalizePhone(String(rawProfile?.phoneNumber || ''));

  const canLoadDetail = !!serviceOrderId && (!!currentCustomerId || !!currentPhone);
  const { data, isPending } = useServiceOrderDetail(serviceOrderId, { enabled: canLoadDetail });

  const detailCustomerId = (data?.customerId || '').trim();
  const detailPhone = normalizePhone(data?.phoneNumber);

  const canView = !!data && (
    (currentCustomerId && detailCustomerId === currentCustomerId) ||
    (!currentCustomerId && !!currentPhone && detailPhone === currentPhone)
  );

  const theme = STATUS_THEME[toThemeKey(data?.status)] || STATUS_THEME.Pending;
  const detailItems = data?.items || data?.orderDetails || data?.serviceOrderItems || [];

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-slate-200 p-6">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-lg font-bold text-slate-900">
              Service Order #{orderCode || data?.orderCode || serviceOrderId.slice(0, 8)}
            </DialogTitle>
            <Badge
              variant="secondary"
              className="w-fit px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border-none"
              style={{ backgroundColor: `${theme.color}14`, color: theme.color }}
            >
              {theme.label}
            </Badge>
          </div>
        </DialogHeader>

        {isPending ? (
          <div className="py-16 text-center text-sm text-slate-500 font-medium">Loading service order details...</div>
        ) : !canView ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-rose-600">Access denied for this service order.</p>
            <p className="text-xs text-slate-500 mt-1">You can only view service orders created by your account.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Created At</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{formatDate(data?.createdAt || '')}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{formatPrice(data?.totalPrice || 0)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 p-4 space-y-3 bg-blue-50/30">
              <div className="flex items-center gap-2 text-slate-700">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold">Appointment: {data?.appointmentDate ? formatDate(data.appointmentDate) : 'Not scheduled'}</span>
              </div>
              <div className="border-t border-blue-100 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">Receiver Information</p>
                <div className="space-y-2">
                  {data?.receiverName && <p className="text-sm text-slate-700"><span className="text-slate-500">Name:</span> {data.receiverName}</p>}
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">{data?.phoneNumber || 'No phone number'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 mt-0.5 text-slate-500 flex-shrink-0" />
                    <span className="text-sm">{data?.address || 'No address'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <Package2 className="w-4 h-4 text-slate-600" />
                <h4 className="text-sm font-bold text-slate-900">Service Items</h4>
              </div>

              {detailItems.length ? (
                <div className="space-y-2">
                  {detailItems.map((item, idx) => {
                    const name = item.itemName || item.serviceName || item.packageName || `Service item ${idx + 1}`;
                    return (
                      <div key={item.id || idx} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/40 px-3 py-2.5">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{name}</p>
                          <p className="text-[11px] text-slate-500">Qty: {item.quantity || 1}</p>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{formatPrice(item.totalPrice || item.unitPrice || 0)}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No service items found in this order.</p>
              )}
            </div>

            {data?.paymentMethod && (
              <div className="rounded-xl border border-slate-200 p-4 bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-slate-600" />
                  <h4 className="text-sm font-bold text-slate-900">Payment Information</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Method:</span>
                    <Badge variant="outline" className="text-xs font-semibold">{data.paymentMethod === 'COD' ? 'Cash on Delivery' : data.paymentMethod}</Badge>
                  </div>
                  {data?.paymentStatus && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Status:</span>
                      <Badge 
                        style={{
                          backgroundColor: data.paymentStatus === 'Paid' ? '#d1fae5' : '#fef3c7',
                          color: data.paymentStatus === 'Paid' ? '#065f46' : '#92400e',
                        }}
                        className="text-xs font-semibold border-none"
                      >
                        {data.paymentStatus}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(data?.customerNote || data?.note) && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">Customer Note</p>
                <p className="text-sm text-amber-800">{data.customerNote || data.note}</p>
              </div>
            )}

            {/* <div className="pt-1">
              <Button variant="outline" className="w-full rounded-xl border-slate-200" type="button">
                Close
              </Button>
            </div> */}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

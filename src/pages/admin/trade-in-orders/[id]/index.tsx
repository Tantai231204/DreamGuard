import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useAdminTradeInOrderDetail } from '@/hooks/queries';
import { useShippingTasksByTradeInOrder } from '@/hooks/queries/useShippingTask';
import { formatPrice, formatDate } from '@/lib/utils';
import { AdminStatusBadge } from '@/components/admin';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Image as ImageIcon, AlertCircle, ShoppingBag, MapPin, Truck, ArrowDown, History, RefreshCcw } from 'lucide-react';
import { PaymentInfoCard } from '@/pages/admin/orders/components/PaymentInfoCard';
import { ShippingLogisticsEvidence } from '@/pages/admin/orders/components/ShippingLogisticsEvidence';
import { AppRoute } from '@/lib/constants';
import { tradeInStatusBadgeValue } from '@/pages/admin/orders/components/tradeInStatus';
import { TradeInStaffManagement } from './components/TradeInStaffManagement';

export default function TradeInOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, isError } = useAdminTradeInOrderDetail(id!);
  const normalizedStatus = String(order?.status || '').toUpperCase();
  const canShowShippingTasks =
    normalizedStatus === 'CONFIRMED'
    || normalizedStatus === 'PROCESSING'
    || normalizedStatus === 'DELIVERED'
    || normalizedStatus === 'COMPLETED';
  const { data: shippingTasks } = useShippingTasksByTradeInOrder(
    canShowShippingTasks ? (order?.tradeInOrderId || '') : ''
  );

  const sortedShippingTasks = useMemo(() => {
    const tasks = [...(shippingTasks || [])];
    return tasks.sort((a, b) => {
      const aTime = new Date(a.completionDate || a.shippingDate || 0).getTime();
      const bTime = new Date(b.completionDate || b.shippingDate || 0).getTime();
      return bTime - aTime;
    });
  }, [shippingTasks]);

  const activeTask = useMemo(
    () => sortedShippingTasks.find((task) => task.status !== 'Reassigned'),
    [sortedShippingTasks]
  );

  const historicalEvidenceTasks = useMemo(
    () => sortedShippingTasks.filter(
      (task) =>
        task.shippingTaskId !== activeTask?.shippingTaskId
        && ((task.evidences?.length || 0) > 0 || !!task.staffNote)
    ),
    [sortedShippingTasks, activeTask]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-slate-50 p-8 space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-slate-50">
        <AlertCircle className="h-12 w-12 text-slate-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The requested trade-in order could not be retrieved.</p>
        <Button onClick={() => navigate(AppRoute.ADMIN_TRADE_IN_ORDERS)} className="mt-6 shadow-sm border border-slate-200">
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* High-Authority Header */}
      <div className="flex-shrink-0 bg-white border-b border-blue-100/50 px-8 py-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

        <div className="max-w-[1600px] mx-auto flex items-center justify-between relative z-10">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase border border-primary/20">
                {order.orderCode}
              </div>
              <AdminStatusBadge status={tradeInStatusBadgeValue(order.status)} className="scale-90" />
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-3">
              Trade-In Intelligence
              <span className="text-slate-400 font-medium">#{order.tradeInOrderId.substring(0, 8).toUpperCase()}</span>
            </h1>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6 border-r border-slate-100 pr-8">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Valuation</p>
                <p className="text-xl font-black text-primary tracking-tighter">{formatPrice(order.tradeInPrice)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Timestamp</p>
                <p className="text-sm font-bold text-slate-700">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate(AppRoute.ADMIN_TRADE_IN_ORDERS)}
              size="sm"
              className="h-10 rounded-xl border-blue-100 bg-white text-primary font-black text-[10px] uppercase tracking-widest hover:bg-blue-50/50 hover:border-primary/30 transition-all shadow-sm px-5 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Directory
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="col-span-12 lg:col-span-8 space-y-8">

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <RefreshCcw className="w-3.5 h-3.5 text-primary" />
                    Trade-In Conversion
                  </h3>
                  <div className="h-px bg-slate-100 flex-1 ml-4" />
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm flex flex-col relative">

                  {/* SOURCE (OLD) PRODUCT */}
                  <div className="flex items-start gap-4 z-10">
                    <div className="h-16 w-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                      <History className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest bg-slate-100 px-2 py-0.5 rounded-sm border border-slate-200/50">Source Product</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 leading-tight pr-4">{order.orderItem?.itemName || 'Unknown Legacy Product'}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                        O-Item ID: <span className="font-mono text-slate-500">{order.pOrderItemId?.substring(0, 8) || 'N/A'}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Original Value</p>
                      <p className="text-sm font-black text-slate-600 mt-0.5 line-through decoration-slate-300 opacity-80">{order.orderItem?.unitPrice ? formatPrice(order.orderItem.unitPrice) : '--'}</p>
                    </div>
                  </div>

                  {/* CONNECTING ARROW */}
                  <div className="ml-[29px] w-0.5 h-8 bg-gradient-to-b from-slate-200 to-primary/30 my-2 relative z-0 flex flex-col justify-center items-center">
                    <div className="absolute w-5 h-5 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center ml-[2px]">
                      <ArrowDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>

                  {/* TARGET (NEW) PRODUCT */}
                  <div className="flex items-start gap-4 z-10">
                    <div className="h-16 w-16 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
                      <ShoppingBag className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase text-primary tracking-widest bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-100/50">Target Upgrade</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 leading-tight">Product Variant Upgrade</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-r border-slate-200 pr-2">
                          SKU: <span className="font-mono text-slate-700">{order.productVariant?.sku || 'UNKNOWN'}</span>
                        </p>
                        {order.productVariant?.size && (
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            Size: <span className="text-slate-700">{order.productVariant.size}</span>
                          </p>
                        )}
                        {!!order.productVariant?.attributes?.color && (
                          <span className="px-2 py-0.5 bg-slate-50 border border-slate-200/60 rounded text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full ring-1 ring-black/10"
                              style={{ backgroundColor: order.productVariant.attributes.hexColor as string }}
                            />
                            {String(order.productVariant.attributes.color)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-[9px] font-black uppercase text-primary/70 tracking-[0.2em]">New Value</p>
                      <p className="text-sm font-black text-primary mt-0.5">{order.productVariant?.salePrice ? formatPrice(order.productVariant.salePrice) : '--'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-primary" />
                    Trade-In Assessment
                  </h3>
                  <div className="h-px bg-slate-100 flex-1 ml-4" />
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Customer Description</p>
                      <p className="text-sm font-medium text-slate-700 max-w-2xl leading-relaxed">{order.description || 'No description provided.'}</p>
                    </div>
                    <AdminStatusBadge
                      status={order.isGood ? 'good' : 'failed'}
                      type={order.isGood ? 'success' : 'rose'}
                      className="scale-90 origin-right shadow-sm"
                    />
                  </div>

                  {order.tradeInImages && order.tradeInImages.length > 0 ? (
                    <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-100">
                      {order.tradeInImages.map((image) => (
                        <div key={image.tradeInImageId} className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-50 cursor-zoom-in shrink-0">
                          <img
                            src={image.imageUrl}
                            alt="TradeIn proof"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <p className="text-sm text-slate-500 italic">No images provided for this trade-in.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col space-y-4 h-full">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-primary" />
                      Financial Vault
                    </h3>
                    <div className="h-px bg-slate-100 flex-1 ml-4" />
                  </div>
                  <div className="h-[280px]">
                    <PaymentInfoCard orderCode={order.orderCode} />
                  </div>
                </div>

                <div className="flex flex-col space-y-4 h-full">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-primary" />
                      Deployment Site
                    </h3>
                    <div className="h-px bg-slate-100 flex-1 ml-4" />
                  </div>

                  <div className="bg-white rounded-2xl border border-blue-100/50 p-5 shadow-sm overflow-hidden relative group flex-1">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-colors" />

                    <div className="flex flex-col gap-4 relative z-10">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Recipient</span>
                          <p className="text-sm font-black text-slate-900 leading-tight">{order.receiverName}</p>
                          <p className="text-[11px] font-bold text-slate-500 font-mono tracking-tighter mt-0.5">{order.phoneNumber}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-50">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-50">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Deployment Coordinates</span>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2 group/addr">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover/addr:bg-primary transition-colors mt-1.5 flex-shrink-0" />
                            <p className="text-[11px] font-bold text-slate-700 leading-relaxed uppercase">{order.address}</p>
                          </div>
                          <div className="flex items-center gap-2 group/addr pt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/addr:bg-primary transition-colors" />
                            <div className="flex items-center gap-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Location</p>
                              <span className="bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                                VERIFIED
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-primary" />
                    Ledger Summary
                  </h3>
                  <div className="h-px bg-slate-100 flex-1 ml-4" />
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-200">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Valuation Credit</span>
                      <span className="text-sm font-black text-emerald-600">-{formatPrice(order.tradeInPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-200">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Deposit Amount</span>
                      <span className="text-sm font-black text-slate-800">{formatPrice(order.depositAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Total Pending</span>
                      <span className="text-xl font-black text-primary tracking-tighter">{formatPrice(order.amountToPay)}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="col-span-12 lg:col-span-4 space-y-8">
              <TradeInStaffManagement order={order} />

              {activeTask?.shippingTaskId && (
                <ShippingLogisticsEvidence taskId={activeTask.shippingTaskId} delay={0.15} />
              )}

              {historicalEvidenceTasks.map((task, index) => (
                <ShippingLogisticsEvidence
                  key={task.shippingTaskId}
                  taskId={task.shippingTaskId}
                  delay={0.18 + (index * 0.03)}
                />
              ))}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

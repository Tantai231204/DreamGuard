import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAdminTradeInOrderDetail, useAdminPayments, usePaymentDetail } from '@/hooks/queries';
import { useShippingTasksByTradeInOrder } from '@/hooks/queries/useShippingTask';
import { formatPrice, formatDate } from '@/lib/utils';
import { AdminStatusBadge } from '@/components/admin';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Image as ImageIcon, AlertCircle, ShoppingBag, MapPin, Truck, ArrowDown, History, RefreshCcw, Wallet } from 'lucide-react';
import { PaymentInfoCard } from '@/pages/admin/orders/components/PaymentInfoCard';
import { ShippingLogisticsEvidence } from '@/pages/admin/orders/components/ShippingLogisticsEvidence';
import { OrderTimeline } from '@/pages/admin/orders/components/OrderTimeline';
import { AppRoute } from '@/lib/constants';
import { tradeInStatusBadgeValue } from '../utils/tradeInStatus';
import { normalizeTradeInStatus } from '@/utils/tradeInWorkflow';
import type { TradeInPayment } from '@/api/types/tradeInOrder';
import { TradeInStaffManagement } from './components/TradeInStaffManagement';
import { TradeInAuditLogs } from './components/TradeInAuditLogs';
import { TradeInRefundDialog } from './components/TradeInRefundDialog';
import { CheckCircle2, Info } from 'lucide-react';

const CATEGORY_CRITERIA = {
  mattress: [
    { label: 'Core Integrity', desc: 'Internal structure retains shape without sagging.' },
    { label: 'Hygiene Standards', desc: 'Free from biological stains, moisture, or odours.' },
    { label: 'Surface Quality', desc: 'No significant tears or structural fraying.' },
  ],
  bedding: [
    { label: 'Fabric Health', desc: 'No major thinning, large holes, or heavy pilling.' },
    { label: 'Filling Quality', desc: 'Fillings must not be heavily clumped or disintegrated.' },
    { label: 'Sanitation', desc: 'Thoroughly cleaned with no residual biological stains.' },
  ],
  pillow: [
    { label: 'Structural Loft', desc: 'Maintains height without permanent flat spots.' },
    { label: 'Hygiene Integrity', desc: 'Free from sweat stains, odours, or moisture damage.' },
    { label: 'Cover Condition', desc: 'Protective casing is free from tears or fraying.' },
  ],
};

const getCategoryByItemName = (name: string): 'mattress' | 'bedding' | 'pillow' => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('mattress') || lower.includes('nệm')) return 'mattress';
  if (lower.includes('pillow') || lower.includes('gối')) return 'pillow';
  return 'bedding';
};

const PaymentEvidenceItem = ({ paymentId, initialStatus }: { paymentId: string; initialStatus: string }) => {
  const { data: detail, isLoading } = usePaymentDetail(paymentId);
  const evidenceUrl = detail?.evidenceUrl;

  if (isLoading) return <Skeleton className="aspect-video rounded-xl" />;
  if (!evidenceUrl) return null;

  return (
    <div className="bg-white rounded-2xl border border-blue-100/50 p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Source Token</span>
          <span className="text-[10px] font-bold text-slate-700 font-mono">{paymentId.split('-')[0].toUpperCase()}</span>
        </div>
        <AdminStatusBadge status={detail?.status || initialStatus} mode="payment" className="scale-90 origin-right" />
      </div>
      <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-100 bg-slate-50 group/ev">
        <img 
          src={evidenceUrl} 
          alt="Payment Evidence" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover/ev:scale-105"
        />
        <a 
          href={evidenceUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute inset-0 bg-black/20 opacity-0 group-hover/ev:opacity-100 transition-opacity flex items-center justify-center"
        >
          <span className="px-3 py-1.5 bg-white/90 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-xl">View Original</span>
        </a>
      </div>
    </div>
  );
};

export default function TradeInOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, isError } = useAdminTradeInOrderDetail(id!);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const orderCreatedAt = order?.createdAt || new Date(0).toISOString();
  const normalizedStatus = normalizeTradeInStatus(order?.status);

  const canShowShippingTasks = [
    'CONFIRMED',
    'PROCESSING',
    'DELIVERING',
    'ARRIVED',
    'DELIVERED',
    'RETURNING',
    'EXCHANGE_REQUESTED',
    'SHIPPING_REPLACEMENT',
    'FORCED_CANCELLED',
    'REFUNDED_AND_RESTOCKED',
    'REFUNDED_AND_DAMAGED',
    'RETURNED_AND_REFUNDING',
    'RETURNED_AND_REFUNDED',
    'COMPLETED',
  ].includes(normalizedStatus);

  const { data: shippingTasks } = useShippingTasksByTradeInOrder(
    canShowShippingTasks ? (order?.tradeInOrderId || '') : ''
  );

  const { data: fullPaymentsResponse } = useAdminPayments({
    orderCode: order?.orderCode
  });
  const allPayments = useMemo(() => {
    const apiItems = fullPaymentsResponse?.items || [];
    const orderItems = order?.payments || [];
    const merged = new Map<string, TradeInPayment>();
    orderItems.forEach(p => merged.set(p.id, p));
    apiItems.forEach(p => merged.set(p.id, p));
    return Array.from(merged.values());
  }, [fullPaymentsResponse, order]);

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

  const timelineItems = useMemo(() => {
    const items: Array<{
      title: string;
      description?: string;
      timestamp: string;
      icon: string;
    }> = [
        {
          title: 'Trade-In Created',
          description: 'Trade-in request has been registered in the system.',
          timestamp: orderCreatedAt,
          icon: 'check',
        },
      ];

    if (normalizedStatus !== 'PENDING' && normalizedStatus !== 'WAITING_FOR_STAFF') {
      items.push({
        title: 'Reviewing',
        description: 'Staff is reviewing the request and assessing valuation.',
        timestamp: orderCreatedAt,
        icon: 'package',
      });
    }

    if ([
      'CONFIRMED', 'PROCESSING', 'DELIVERING', 'ARRIVED', 'DELIVERED',
      'COMPLETED', 'RETURNING', 'REFUNDED_AND_RESTOCKED', 'REFUNDED_AND_DAMAGED'
    ].includes(normalizedStatus)) {
      items.push({
        title: 'Valuation Confirmed',
        description: `Trade-in price finalized at ${formatPrice(order?.tradeInPrice || 0)}.`,
        timestamp: orderCreatedAt,
        icon: 'check',
      });
    }

    if (shippingTasks && shippingTasks.length > 0) {
      const timelineTasks = [...shippingTasks].sort(
        (a, b) =>
          new Date(a.shippingDate || '').getTime() -
          new Date(b.shippingDate || '').getTime(),
      );

      timelineTasks.forEach((task) => {
        if (task.shippingDate) {
          items.push({
            title: 'Dispatched',
            description: `Handed over to staff: ${task.staffName || 'Logistics Team'}.`,
            timestamp: task.shippingDate,
            icon: 'package',
          });
        }

        const taskStatus = String(task.status || '').toUpperCase();

        if (taskStatus === 'ARRIVED' && task.completionDate) {
          items.push({
            title: 'Arrived',
            description: 'Staff has arrived at the inspection location.',
            timestamp: task.completionDate,
            icon: 'check',
          });
        } else if (taskStatus === 'DELIVERED' && task.completionDate) {
          items.push({
            title: 'Delivered',
            description: 'Asset collection and upgrade delivery successful.',
            timestamp: task.completionDate,
            icon: 'check',
          });
        } else if (
          (taskStatus === 'REFUNDED_AND_RESTOCKED' ||
            taskStatus === 'REFUNDED_AND_DAMAGED' ||
            taskStatus === 'RETURNING') &&
          task.completionDate
        ) {
          items.push({
            title: 'Return Processed',
            description: `Return workflow handled. ${task.staffNote ? `(${task.staffNote})` : ''}`,
            timestamp: task.completionDate,
            icon: 'package',
          });
        }
      });
    }

    if (normalizedStatus === 'COMPLETED') {
      items.push({
        title: 'Workflow Completed',
        description: 'All steps finalized and ledger updated.',
        timestamp: orderCreatedAt,
        icon: 'check',
      });
    } else if (normalizedStatus === 'REFUNDED_AND_RESTOCKED') {
      items.push({
        title: 'Returned & Restocked',
        description: 'Asset returned to inventory in good condition.',
        timestamp: orderCreatedAt,
        icon: 'check',
      });
    } else if (normalizedStatus === 'REFUNDED_AND_DAMAGED') {
      items.push({
        title: 'Returned (Damaged)',
        description: 'Asset recorded as damaged and stored for review.',
        timestamp: orderCreatedAt,
        icon: 'package',
      });
    } else if (normalizedStatus === 'RETURNED') {
      items.push({
        title: 'Returned to Hub',
        description: 'Asset collection successful. Awaiting inspection and processing.',
        timestamp: orderCreatedAt,
        icon: 'package',
      });
    } else if (normalizedStatus.includes('CANCEL')) {
      items.push({
        title: 'Terminated',
        description: 'Trade-in workflow has been closed by administration.',
        timestamp: orderCreatedAt,
        icon: 'check',
      });
    }

    const uniqueItems: typeof items = [];
    const seenTitles = new Set();
    [...items].forEach(item => {
      const key = `${item.title}`;
      if (!seenTitles.has(key)) {
        uniqueItems.push(item);
        seenTitles.add(key);
      }
    });

    return uniqueItems.reverse();
  }, [normalizedStatus, orderCreatedAt, shippingTasks, order?.tradeInPrice]);

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
      <div className="flex-shrink-0 bg-white border-b border-blue-100/50 px-8 py-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

        <div className="max-w-[1600px] mx-auto flex items-center justify-between relative z-10">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase border border-primary/20">
                {order.orderCode}
              </div>
              <AdminStatusBadge status={tradeInStatusBadgeValue(order.status)} className="scale-90" />
              {order.shippingTaskStatus && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-md shadow-sm">
                  <Truck className="w-3 h-3 text-blue-600" />
                  <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest">Ship: {order.shippingTaskStatus}</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-3">
              Trade-In Intelligence
              <span className="text-slate-400 font-medium">#{order.tradeInOrderId.substring(0, 8).toUpperCase()}</span>
            </h1>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 border-r border-slate-100 pr-8">
              {normalizedStatus.includes('CANCEL') &&
                order.depositAmount > 0 &&
                !normalizedStatus.includes('REFUND') &&
                !allPayments?.some(p =>
                  p.paymentType?.toUpperCase().includes('REFUND') ||
                  p.status?.toUpperCase().includes('REFUND')
                ) && (
                  <Button
                    variant="outline"
                    onClick={() => setIsRefundDialogOpen(true)}
                    size="sm"
                    className="h-10 rounded-xl border-emerald-100 bg-emerald-50/30 text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:emerald-50 hover:border-emerald-200 transition-all shadow-sm px-5 gap-2"
                  >
                    <Wallet className="h-4 w-4" />
                    Refund Asset
                  </Button>
                )}
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
                    <div className="h-16 w-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                      {order.oldProductVariantUrl ? (
                        <img src={order.oldProductVariantUrl} alt="Source Product" className="w-full h-full object-cover" />
                      ) : (
                        <History className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest bg-slate-100 px-2 py-0.5 rounded-sm border border-slate-200/50">Source Product</span>
                        {order.orderId && (
                          <button
                            onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                            className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1 bg-primary/5 px-2 py-0.5 rounded"
                          >
                            <ShoppingBag className="w-2.5 h-2.5" />
                            Source Order
                          </button>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-900 leading-tight pr-4">{order.orderItem?.itemName || 'Unknown Legacy Product'}</p>
                      <div className="flex items-center gap-3 mt-1.5 ">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          O-Item ID: <span className="font-mono text-slate-500">{order.pOrderItemId?.substring(0, 8) || 'N/A'}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Source Valuation</p>
                      <p className="text-sm font-black text-emerald-600 mt-0.5">
                        {formatPrice(order.tradeInPrice)}
                      </p>
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
                    <div className="h-16 w-16 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-1">
                      {order.newProductVariantUrl ? (
                        <img src={order.newProductVariantUrl} alt="Target Upgrade" className="w-full h-full object-contain rounded-lg" />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase text-primary tracking-widest bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-100/50">Target Upgrade</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 leading-tight">Target Variant Upgrade</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-r border-slate-200 pr-2">
                          SKU: <span className="font-mono text-slate-700">{order.productVariant?.sku || 'UNKNOWN'}</span>
                        </p>
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
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {CATEGORY_CRITERIA[getCategoryByItemName(order.orderItem?.itemName || '')].map((item, idx) => (
                          <div key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-50/60 border border-emerald-100/50 flex items-center gap-1.5 shadow-sm">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span className="text-[9px] font-black uppercase tracking-tight text-emerald-800">{item.label}</span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/80 group hover:border-primary/20 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-3 h-3 text-primary" />
                          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Customer Description</p>
                        </div>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed italic pr-8">
                          "{order.description || 'No specific description provided.'}"
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <AdminStatusBadge
                        status={order.isGood ? 'premium' : 'fair'}
                        className="scale-105 origin-right"
                      />
                    </div>
                  </div>

                  {order.tradeInImages && order.tradeInImages.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-slate-100">
                      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3 ml-1">Visual Evidence</p>
                      <div className="flex flex-wrap gap-2.5">
                        {order.tradeInImages.map((image) => (
                          <div key={image.tradeInImageId} className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-50 cursor-zoom-in shrink-0">
                            <img src={image.imageUrl} alt="TradeIn proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                        ))}
                      </div>
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PAYMENT EVIDENCE - Full Width Row Below Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-primary" />
                    Payment Evidence
                  </h3>
                  <div className="h-px bg-slate-100 flex-1 ml-4" />
                </div>
                
                {allPayments?.some(p => p.status?.toUpperCase() !== 'FAILED') ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {allPayments
                      .filter(p => p.status?.toUpperCase() !== 'FAILED')
                      .map((p) => (
                        <PaymentEvidenceItem 
                          key={p.id} 
                          paymentId={p.id} 
                          initialStatus={p.status} 
                        />
                      ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 shadow-sm flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Digital Evidence</p>
                      <p className="text-[11px] font-medium text-slate-300 max-w-[400px]">Transaction receipts or transfer proofs have not been uploaded for this ledger.</p>
                    </div>
                  </div>
                )}
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
                <ShippingLogisticsEvidence taskId={activeTask.shippingTaskId} taskLabel="Current Task" orderItems={order.orderItem ? [order.orderItem] : []} delay={0.15} />
              )}

              {historicalEvidenceTasks.map((task, index) => (
                <ShippingLogisticsEvidence key={task.shippingTaskId} taskId={task.shippingTaskId} taskLabel={`Previous Task ${index + 1}`} orderItems={order.orderItem ? [order.orderItem] : []} delay={0.18 + (index * 0.03)} />
              ))}

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-primary" />
                    Engagement Timeline
                  </h3>
                  <div className="h-px bg-slate-100 flex-1 ml-4" />
                </div>
                <OrderTimeline timeline={timelineItems} defaultVisibleCount={2} />
              </div>

              <div className="pt-4 border-t border-slate-50">
                <TradeInAuditLogs tradeInOrderId={id!} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {order && (
        <TradeInRefundDialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen} tradeInOrderId={id!} orderCode={order.orderCode} depositAmount={order.depositAmount} />
      )}
    </div>
  );
}

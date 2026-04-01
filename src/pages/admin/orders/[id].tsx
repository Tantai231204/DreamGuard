import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Printer, Loader2, Truck, History, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrderDetail, useUpdateOrderStatus, useAdminCancelOrder } from '@/hooks/queries';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/pages/profile/utils';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  OrderItemsList,
  OrderSummary,
  OrderTimeline,
  CustomerInfoCard,
  ShippingAddressCard,
  QuickActionsCard,
  OrderNotFound,
  CancelOrderDialog,
} from './components';
import { AdminStatusBadge } from '@/components/admin';
import { OrderStatus, ORDER_STATUS_MAP, ADMIN_ALLOWED_TRANSITION_STATUSES, ADMIN_ORDER_STATUS_THEME } from './constants';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading, isError } = useOrderDetail(id!);
  const updateStatus = useUpdateOrderStatus();
  const cancelOrder = useAdminCancelOrder();
  const { role } = useAuthStore();
  const isAdmin = ['Admin', 'Staff'].includes(role || '');

  const [showCancelDialog, setShowCancelDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-10 w-10 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  if (isError || !order) {
    return <OrderNotFound orderId={id} />;
  }

  const handlePrint = () => window.print();

  const handleUpdateStatus = (newStatus: string) => {
    updateStatus.mutate({ id: order.id, status: newStatus }, {
      onSuccess: () => toast.success(`Order status updated to ${newStatus}`),
    });
  };

  const handleCancelOrder = (reason: string) => {
    cancelOrder.mutate({ id: order.id, reason }, {
      onSuccess: () => {
          toast.success('Order cancelled successfully');
          setShowCancelDialog(false);
      },
    });
  };

  const theme = ADMIN_ORDER_STATUS_THEME[order.status.toString()] || ADMIN_ORDER_STATUS_THEME["1"];
  const currentStatusEnum = ORDER_STATUS_MAP[order.status.toString()];

  // Flow rule: Admin can cancel when Pending or Confirmed.
  const canCancel = currentStatusEnum === OrderStatus.Pending || currentStatusEnum === OrderStatus.Confirmed;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* High-Authority Header */}
      <div className="flex-shrink-0 bg-white border-b border-blue-100/50 px-8 py-4 shadow-sm relative overflow-hidden">
        {/* Subtle Brand Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

        <div className="max-w-[1600px] mx-auto flex items-center justify-between relative z-10">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase border border-primary/20">
                {order.orderCode}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="p-0 h-auto hover:bg-transparent flex items-center gap-1 group/badge"
                  >
                    <AdminStatusBadge status={theme.label} />
                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover/badge:text-slate-600 transition-colors" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 shadow-xl border border-slate-200/60 rounded-xl p-1 animate-in fade-in zoom-in-95 duration-100 z-50">
                  <div className="px-3 py-2 border-b border-slate-50 mb-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Transition State</span>
                  </div>
                  {Object.entries(ADMIN_ORDER_STATUS_THEME)
                    .filter(([status]) => ADMIN_ALLOWED_TRANSITION_STATUSES.includes(status))
                    .map(([status, style]) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => handleUpdateStatus(status)}
                      className="rounded-lg cursor-pointer py-1.5 px-2 hover:bg-slate-50 transition-colors"
                    >
                      <AdminStatusBadge status={style.label} className="w-full justify-start" />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Order Details <span className="text-slate-400 font-medium">#{order.id.substring(0, 8).toUpperCase()}</span>
            </h1>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6 border-r border-slate-100 pr-8">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-xl font-black text-primary tracking-tighter">{formatPrice(order.totalAmount)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date Added</p>
                <p className="text-sm font-bold text-slate-700">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handlePrint}
              size="sm"
              className="h-10 rounded-xl border-blue-100 bg-white text-primary font-black text-[10px] uppercase tracking-widest hover:bg-blue-50/50 hover:border-primary/30 transition-all shadow-sm ring-1 ring-transparent hover:ring-primary/10 px-5 gap-2"
            >
              <Printer className="h-4 w-4" />
              Print Invoice
            </Button>
          </div>
        </div>
      </div>

      {/* Designer-Pro Dashboard Grid */}
      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* LEFT COLUMN: THE MANIFEST (8cols) */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              <OrderItemsList items={order.items} />

              <OrderSummary
                subTotal={order.subTotal}
                discountAmount={order.discountAmount}
                totalAmount={order.totalAmount}
              />
            </div>

            {/* RIGHT COLUMN: OPERATIONS & LOGISTICS (4cols) */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              <QuickActionsCard
                currentStatusEnum={currentStatusEnum}
                onUpdateStatus={handleUpdateStatus}
                onCancelOrder={() => setShowCancelDialog(true)}
                canCancel={canCancel && isAdmin}
              />

              <CancelOrderDialog
                open={showCancelDialog}
                onOpenChange={setShowCancelDialog}
                onConfirm={handleCancelOrder}
                isLoading={cancelOrder.isPending}
                orderCode={order.orderCode}
              />

              {/* Logistics Block */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-primary" />
                    Shipping Address
                  </h3>
                  <div className="h-px bg-slate-100 flex-1 ml-4" />
                </div>
                <div className="space-y-4">
                  <ShippingAddressCard
                    fullName={order.receiverName}
                    phone={order.phoneNumber}
                    street={order.street}
                    ward={order.ward}
                    district={order.district}
                    city={order.city}
                  />
                  <CustomerInfoCard
                    name={order.receiverName}
                    email="Sync pending..."
                    phone={order.phoneNumber}
                  />
                </div>
              </div>

              {/* Audit Block */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-primary" />
                    Fulfillment Log
                  </h3>
                  <div className="h-px bg-slate-100 flex-1 ml-4" />
                </div>
                <OrderTimeline
                  timeline={[
                    {
                      title: 'Order Placed',
                      description: 'The order has been created successfully.',
                      timestamp: order.createdAt,
                      icon: 'check',
                    },
                    ...(order.status !== 'Pending' && order.status !== 'Cancelled'
                      ? [
                        {
                          title: 'Payment Confirmed',
                          description: 'The payment has been confirmed.',
                          timestamp: new Date(new Date(order.createdAt).getTime() + 1000 * 60 * 30).toISOString(),
                          icon: 'check',
                        },
                      ]
                      : []),
                    ...(order.status === 'Shipping' || order.status === 'Delivered' || order.status === 'Completed'
                      ? [
                        {
                          title: 'Shipped',
                          description: 'The order has been handed over to the logistics partner.',
                          timestamp: new Date(new Date(order.createdAt).getTime() + 1000 * 60 * 60 * 2).toISOString(),
                          icon: 'package',
                        },
                      ]
                      : []),
                    ...(order.status === 'Delivered' || order.status === 'Completed'
                      ? [
                        {
                          title: 'Delivered',
                          description: 'The order has been delivered successfully.',
                          timestamp: order.updatedAt,
                          icon: 'check',
                        },
                      ]
                      : []),
                  ].reverse()}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

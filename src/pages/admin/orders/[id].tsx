import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { Printer, Truck, History, ChevronDown, CreditCard, RotateCcw, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrderDetail, useUpdateOrderStatus, useAdminCancelOrder, useAdminPayments, useUpdatePaymentStatus, useAdminCreateRefund, orderKeys } from '@/hooks/queries';
import { useQueryClient } from '@tanstack/react-query';
import { useShippingTasksByOrder } from '@/hooks/queries/useShippingTask';
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
  ShippingAddressCard,
  QuickActionsCard,
  OrderNotFound,
  CancelOrderDialog,
  ShippingAssignmentCard,
  PaymentInfoCard,
  AssignShippingStaffDialog,
  OrderDetailSkeleton,
  ShippingLogisticsEvidence,
  ConfirmStatusDialog,
  ProcessExchangeDialog
} from './components';
import { ProcessReturnDialog } from './components/process-return/ProcessReturnDialog';
import { AdminStatusBadge } from '@/components/admin';
import { OrderStatus, ORDER_STATUS_MAP, ADMIN_ALLOWED_TRANSITION_STATUSES, ADMIN_ORDER_STATUS_THEME } from './constants';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, isError } = useOrderDetail(id!);
  const updateStatus = useUpdateOrderStatus();
  const cancelOrder = useAdminCancelOrder();
  const updatePayment = useUpdatePaymentStatus();
  const createRefund = useAdminCreateRefund();
  const queryClient = useQueryClient();

  const { role } = useAuthStore();
  const hasPrivilege = ['Admin', 'Staff', 'Manager', 'Seller'].includes(role || '');

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showConfirmStatusDialog, setShowConfirmStatusDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showProcessReturnDialog, setShowProcessReturnDialog] = useState(false);
  const [showProcessExchangeDialog, setShowProcessExchangeDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const resolvedOrderId = order?.id || id || '';
  const currentStatusEnum = useMemo(() =>
    order ? (ORDER_STATUS_MAP[order.status.toString()] ?? OrderStatus.Pending) : OrderStatus.Pending
    , [order]);

  const { data: shippingTasks, isLoading: isTasksLoading } = useShippingTasksByOrder(resolvedOrderId);
  const { data: paymentResponse } = useAdminPayments({ orderCode: order?.orderCode });

  const isPaid = useMemo(() => {
    return paymentResponse?.items?.some(p =>
      p.status?.toLowerCase() === 'paid' ||
      p.status?.toLowerCase() === 'codpaid' ||
      p.status?.toLowerCase() === 'completed'
    );
  }, [paymentResponse]);



  const canCreateRefund = useMemo(() => {
    if (!order) return false;

    const isRefundableMethod = (order.paymentMethod?.toLowerCase() === 'vnpay' || order.paymentMethod?.toLowerCase() === 'other') && isPaid;
    if (!isRefundableMethod) return false;

    // Prevent duplicate refunds
    const hasRefundProcess = paymentResponse?.items?.some(p =>
      ['refunding', 'refunded'].includes(p.status?.toLowerCase())
    ) || ['refunding', 'refunded', 'returnedandrefunding', 'returnedandrefunded'].includes(order.paymentStatus?.toLowerCase() || '');

    const isRefundableState = currentStatusEnum === OrderStatus.Cancelled;

    return isRefundableState && !hasRefundProcess;
  }, [order, isPaid, paymentResponse, currentStatusEnum]);

  const sortedShippingTasks = useMemo(() => {
    const tasks = [...(shippingTasks || [])];
    return tasks.sort((a, b) => {
      const aTime = new Date(a.completionDate || a.shippingDate || 0).getTime();
      const bTime = new Date(b.completionDate || b.shippingDate || 0).getTime();
      return bTime - aTime;
    });
  }, [shippingTasks]);

  // Current task must always be the newest non-reassigned task.
  const activeTask = useMemo(
    () => sortedShippingTasks.find((t) => t.status !== 'Reassigned'),
    [sortedShippingTasks]
  );

  // Keep historical tasks (older tasks) visible for legacy evidence/note.
  const historicalEvidenceTasks = useMemo(
    () => sortedShippingTasks.filter(
      (task) =>
        task.shippingTaskId !== activeTask?.shippingTaskId &&
        ((task.evidences?.length || 0) > 0 || !!task.staffNote)
    ),
    [sortedShippingTasks, activeTask]
  );

  // Bridging for QuickActionsCard buttons
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as Window & {
        openReturnDialog?: () => void;
        openExchangeDialog?: () => void;
      };
      win.openReturnDialog = () => setShowProcessReturnDialog(true);
      win.openExchangeDialog = () => setShowProcessExchangeDialog(true);
    }
    return () => {
      if (typeof window !== 'undefined') {
        const win = window as Window & {
          openReturnDialog?: () => void;
          openExchangeDialog?: () => void;
        };
        delete win.openReturnDialog;
        delete win.openExchangeDialog;
      }
    };
  }, []);

  if (isLoading || isTasksLoading) {
    return <OrderDetailSkeleton />;
  }

  if (isError || !order) {
    return <OrderNotFound orderId={id} />;
  }

  const handlePrint = () => window.print();

  const handleUpdateStatus = (newStatus: string) => {
    const hasActiveTask = !!activeTask;

    if (!pendingStatus) {
      setPendingStatus(newStatus);
      setShowConfirmStatusDialog(true);
      return;
    }

    if (currentStatusEnum === OrderStatus.ShippingReplacement && newStatus === 'Processing') {
      toast.info('Replacement flow is staff-driven', {
        description: 'Keep this order at Shipping Replacement. Delivery staff should update the shipping task status directly.'
      });
      setShowConfirmStatusDialog(false);
      setPendingStatus(null);
      return;
    }

    if (newStatus === 'Delivering' && !hasActiveTask) {
      toast.error('Logistics Constraint', {
        description: 'You must assign a technical agent before transitioning to the delivery phase.'
      });
      setShowConfirmStatusDialog(false);
      setPendingStatus(null);
      return;
    }

    updateStatus.mutate({ id: order!.id, status: newStatus }, {
      onSuccess: () => {
        setShowConfirmStatusDialog(false);
        setPendingStatus(null);
      },
      onError: () => {
        setShowConfirmStatusDialog(false);
        setPendingStatus(null);
      }
    });
  };

  const handleCancelOrder = (reason: string, refundAmount?: number) => {
    cancelOrder.mutate({ id: order!.id, reason, amount: refundAmount }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(order!.id) });
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        setShowCancelDialog(false);
      }
    });
  };

  const handleRefundOrder = (_reason: string, refundAmount?: number) => {
    createRefund.mutate({
      orderId: order!.id,
      reason: "Return",
      amount: refundAmount || 0
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(order!.id) });
        queryClient.invalidateQueries({ queryKey: ['payments', 'list', { orderCode: order!.orderCode }] });
        setShowRefundDialog(false);
      }
    });
  };

  const canCancel = currentStatusEnum === OrderStatus.Pending || currentStatusEnum === OrderStatus.Confirmed;

  const getTimelineItems = () => {
    const items = [
      {
        title: 'Order Placed',
        description: 'The engagement has been initiated.',
        timestamp: order.createdAt,
        icon: 'check',
      }
    ];

    // Build high-fidelity timeline based on actual shipping tasks
    if (shippingTasks && shippingTasks.length > 0) {
      const sortedTasks = [...shippingTasks].sort((a, b) => new Date(a.shippingDate || '').getTime() - new Date(b.shippingDate || '').getTime());

      sortedTasks.forEach(task => {
        // 1. Initial assignment -> Dispatched
        if (task.shippingDate) {
          items.push({
            title: 'Dispatched',
            description: `Handed over to delivery personnel.`,
            timestamp: task.shippingDate,
            icon: 'package',
          });
        }

        // 2. Specific end states mapped properly
        if (task.status === "Arrived" && task.completionDate) {
          items.push({
            title: 'Arrived',
            description: 'Agent has reached the destination.',
            timestamp: task.completionDate,
            icon: 'check',
          });
        } else if (task.status === "Delivered" && task.completionDate) {
          items.push({
            title: 'Delivered',
            description: 'Engagement completed successfully.',
            timestamp: task.completionDate,
            icon: 'check',
          });
        } else if (task.status === "Returned" && task.completionDate) {
          items.push({
            title: 'Returned',
            description: `Items received at central hub. ${task.staffNote ? `(${task.staffNote})` : ''}`,
            timestamp: task.completionDate,
            icon: 'check',
          });
        } else if ((task.status === "ReturnedAndRefunding" || task.status === "ReturnedAndRefunded" || task.status === "Returning") && task.completionDate) {
          items.push({
            title: 'Returning',
            description: `Return procedure initiated. ${task.staffNote ? `(${task.staffNote})` : ''}`,
            timestamp: task.completionDate,
            icon: 'package',
          });
        } else if (task.status === "ExchangeRequested" && task.completionDate) {
          items.push({
            title: 'Exchange Requested',
            description: `Replacement request created. ${task.staffNote ? `(${task.staffNote})` : ''}`,
            timestamp: task.completionDate,
            icon: 'package',
          });
        } else if ((task.status === "Shipping_Replacement" || task.status === "ShippingReplacement") && task.completionDate) {
          items.push({
            title: 'Shipping Replacement',
            description: `Replacement shipment is now in transit. ${task.staffNote ? `(${task.staffNote})` : ''}`,
            timestamp: task.completionDate,
            icon: 'package',
          });
        } else if (task.status === "Cancelled" && task.completionDate) {
          items.push({
            title: 'Cancelled',
            description: `Engagement terminated. ${task.staffNote ? `(${task.staffNote})` : ''}`,
            timestamp: task.completionDate,
            icon: 'check',
          });
        }
      });
    } else {
      // Fallback legacy static states if no tasks exist
      if (currentStatusEnum === OrderStatus.Cancelled) {
        items.push({
          title: 'Cancelled',
          description: 'Engagement terminated by administration.',
          timestamp: order.updatedAt,
          icon: 'check',
        });
      } else if (currentStatusEnum === OrderStatus.ExchangeRequested) {
        items.push({
          title: 'Exchange Requested',
          description: 'Replacement request has been created by admin.',
          timestamp: order.updatedAt,
          icon: 'package',
        });
      } else if (currentStatusEnum === OrderStatus.ShippingReplacement) {
        items.push({
          title: 'Shipping Replacement',
          description: 'Replacement shipment is now being delivered.',
          timestamp: order.updatedAt,
          icon: 'package',
        });
      }
    }

    return items.reverse();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* High-Authority Header */}
      <div className="flex-shrink-0 bg-white border-b border-blue-100/50 px-8 py-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

        <div className="max-w-[1600px] mx-auto flex items-center justify-between relative z-10">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 mb-2">
              {order.checkoutOrderId ? (
                <Button
                  variant="ghost"
                  className="w-fit p-0 h-auto hover:bg-transparent text-slate-400 hover:text-primary transition-all flex items-center gap-1 group/back"
                  onClick={() => navigate(`/admin/checkout-orders/${order.checkoutOrderId}`)}
                >
                  <ChevronLeft className="w-4 h-4 group-hover/back:-translate-x-0.5 transition-transform" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Return to Batch Detail</span>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="w-fit p-0 h-auto hover:bg-transparent text-slate-400 hover:text-slate-600 transition-all flex items-center gap-1 group/back"
                  onClick={() => navigate('/admin/orders')}
                >
                  <ChevronLeft className="w-4 h-4 group-hover/back:-translate-x-0.5 transition-transform" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Back to Manifest List</span>
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase border border-primary/20">
                {order.orderCode}
              </div>
              <div className="flex items-center gap-1.5">
                <AdminStatusBadge status="order" variant="default" className="scale-90" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto hover:bg-transparent flex items-center gap-1 group/badge">
                      <AdminStatusBadge status={order.status.toString()} />
                      <ChevronDown className="w-3 h-3 text-slate-400 group-hover/badge:text-slate-600 transition-colors" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 shadow-xl border border-slate-200/60 rounded-xl p-1 animate-in fade-in zoom-in-95 duration-100 z-50">
                    <div className="px-3 py-2 border-b border-slate-50 mb-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Transition Override</span>
                    </div>
                    {(() => {
                      const seen = new Set();
                      return Object.entries(ADMIN_ORDER_STATUS_THEME)
                        .filter(([status]) => {
                          const statusLabel = ADMIN_ORDER_STATUS_THEME[status]?.label || status;
                          if (!ADMIN_ALLOWED_TRANSITION_STATUSES.includes(statusLabel) && !ADMIN_ALLOWED_TRANSITION_STATUSES.includes(status)) return false;

                          const targetStatusEnum = ORDER_STATUS_MAP[status];

                          // Terminal state check: Returned (7) is final
                          if (currentStatusEnum === OrderStatus.Returned) return false;

                          // Business Rule 1: Cannot move status backward (except to Cancelled)
                          if (targetStatusEnum !== OrderStatus.Cancelled && typeof targetStatusEnum === 'number' && typeof currentStatusEnum === 'number' && targetStatusEnum <= currentStatusEnum) return false;

                          // Business Rule 2: Cannot cancel if past Confirmed
                          if (targetStatusEnum === OrderStatus.Cancelled) {
                            return currentStatusEnum === OrderStatus.Pending || currentStatusEnum === OrderStatus.Confirmed;
                          }

                          // Unique by label
                          if (seen.has(statusLabel)) return false;
                          seen.add(statusLabel);

                          return true;
                        })
                        .map(([status]) => {
                          const statusLabel = ADMIN_ORDER_STATUS_THEME[status]?.label || status;
                          return (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => statusLabel === 'Cancelled' ? setShowCancelDialog(true) : handleUpdateStatus(statusLabel)}
                              className="rounded-lg cursor-pointer py-1.5 px-2 hover:bg-slate-50 transition-colors"
                            >
                              <AdminStatusBadge status={statusLabel} className="w-full justify-start" />
                            </DropdownMenuItem>
                          );
                        });
                    })()}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {order.items?.some(item => (item.exchangeRequestedQuantity || 0) > 0) && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md shadow-sm animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">
                    {order.items.reduce((acc, item) => acc + (item.exchangeRequestedQuantity || 0), 0)} Items Reshipping
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Logistic Intelligence <span className="text-slate-400 font-medium">#{order.id.substring(0, 8).toUpperCase()}</span>
            </h1>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6 border-r border-slate-100 pr-8">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Valuation</p>
                <p className="text-xl font-black text-primary tracking-tighter">{formatPrice(order.totalAmount)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Timestamp</p>
                <p className="text-sm font-bold text-slate-700">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handlePrint}
              size="sm"
              className="h-10 rounded-xl border-blue-100 bg-white text-primary font-black text-[10px] uppercase tracking-widest hover:bg-blue-50/50 hover:border-primary/30 transition-all shadow-sm px-5 gap-2"
            >
              <Printer className="h-4 w-4" />
              Intelligence Report
            </Button>

            {canCreateRefund && (
              <Button
                onClick={() => setShowRefundDialog(true)}
                disabled={createRefund.isPending}
                size="sm"
                className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-500/10 px-5 gap-2 border-0"
              >
                <RotateCcw className="h-4 w-4" />
                {createRefund.isPending ? "Initializing..." : "Initialize Refund"}
              </Button>
            )}


          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="col-span-12 lg:col-span-8 space-y-8">
              <OrderItemsList items={order.items} orderStatus={order.status} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col space-y-4 h-full">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-primary" />
                      Financial Vault
                    </h3>
                    <div className="h-px bg-slate-100 flex-1 ml-4" />
                  </div>
                  <div className="flex-1">
                    <PaymentInfoCard
                      orderCode={order.orderCode}
                      paymentMethod={order.paymentMethod}
                      delay={0.15}
                    />
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
                  <div className="flex-1">
                    <ShippingAddressCard fullName={order.receiverName} phone={order.phoneNumber} street={order.street} ward={order.ward} district={order.district} city={order.city} />
                  </div>
                </div>
              </div>

              <OrderSummary subTotal={order.subTotal} discountAmount={order.discountAmount} shippingFee={order.shippingFee} totalAmount={order.totalAmount} />
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-8">
              <QuickActionsCard
                currentStatusEnum={currentStatusEnum}
                onUpdateStatus={handleUpdateStatus}
                onCancelOrder={() => setShowCancelDialog(true)}
                canCancel={canCancel && hasPrivilege}
                hasTask={!!activeTask}
              />

              {currentStatusEnum !== OrderStatus.Cancelled && (
                <ShippingAssignmentCard
                  orderId={order.id}
                  currentStatusEnum={currentStatusEnum}
                  onOpenAssign={() => setShowAssignDialog(true)}
                  delay={0.1}
                  canAssign={
                    currentStatusEnum === OrderStatus.Processing || 
                    currentStatusEnum === OrderStatus.ShippingReplacement
                  }
                />
              )}

              {activeTask?.shippingTaskId && (
                <ShippingLogisticsEvidence
                  taskId={activeTask.shippingTaskId}
                  taskLabel="Current Task"
                  orderItems={order.items}
                  delay={0.15}
                />
              )}

              {historicalEvidenceTasks.map((task, index) => (
                <ShippingLogisticsEvidence
                  key={task.shippingTaskId}
                  taskId={task.shippingTaskId}
                  taskLabel={`Previous Task ${index + 1}`}
                  orderItems={order.items}
                  delay={0.18 + (index * 0.03)}
                />
              ))}

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-primary" />
                    Engagement Timeline
                  </h3>
                  <div className="h-px bg-slate-100 flex-1 ml-4" />
                </div>
                <OrderTimeline timeline={getTimelineItems()} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <CancelOrderDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancelOrder}
        isLoading={cancelOrder.isPending}
        orderCode={order.orderCode}
        totalPrice={order.totalAmount}
        paymentMethod={order.paymentMethod}
        paymentStatus={order.paymentStatus}
      />

      <CancelOrderDialog
        open={showRefundDialog}
        onOpenChange={setShowRefundDialog}
        onConfirm={handleRefundOrder}
        isLoading={createRefund.isPending}
        orderCode={order.orderCode}
        totalPrice={order.totalAmount}
        paymentMethod={order.paymentMethod}
        paymentStatus={order.paymentStatus}
        isRefundOnly={true}
      />

      <AssignShippingStaffDialog
        isOpen={showAssignDialog}
        onClose={() => setShowAssignDialog(false)}
        orderId={order.id}
      />

      <ConfirmStatusDialog
        open={showConfirmStatusDialog}
        onOpenChange={setShowConfirmStatusDialog}
        onConfirm={() => pendingStatus && handleUpdateStatus(pendingStatus)}
        isLoading={updateStatus.isPending || updatePayment.isPending}
        title={`Confirm ${pendingStatus || 'Update'}`}
        description={`Are you sure you want to transition this order to ${pendingStatus}? This action will trigger associated workflow updates.`}
        variant={pendingStatus === 'Confirmed' ? 'success' : 'primary'}
        confirmText="Confirm Update"
      />

      <ProcessReturnDialog
        isOpen={showProcessReturnDialog}
        onClose={() => setShowProcessReturnDialog(false)}
        orderId={order.id}
        taskId={activeTask?.shippingTaskId || ''}
        items={order.items}
        totalAmount={order.totalAmount}
        paymentMethod={paymentResponse?.items?.[0]?.paymentMethod || order.paymentMethod}
        paymentStatus={paymentResponse?.items?.[0]?.status || order.paymentStatus}
      />

      <ProcessExchangeDialog
        isOpen={showProcessExchangeDialog}
        onClose={() => setShowProcessExchangeDialog(false)}
        orderId={order.id}
        taskId={activeTask?.shippingTaskId || ''}
        items={order.items}
      />
    </div>
  );
}

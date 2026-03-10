import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Printer, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { useOrderDetail, useUpdateOrderStatus, useCancelOrder } from '@/hooks/queries';
import { STATUS_THEME } from '@/pages/profile/components/order-constants';
import { formatPrice } from '@/pages/profile/utils';
import { toast } from 'sonner';
import {
  OrderItemsList,
  OrderSummary,
  OrderTimeline,
  CustomerInfoCard,
  ShippingAddressCard,
  PaymentInfoCard,
  QuickActionsCard,
  OrderNotFound,
} from './components';


export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading, isError } = useOrderDetail(id!);
  const updateStatus = useUpdateOrderStatus();
  const cancelOrder = useCancelOrder();

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

  const handlePrint = () => {
    window.print();
  };

  const handleMarkDelivered = () => {
    updateStatus.mutate({ id: order.id, status: 'Delivered' }, {
      onSuccess: () => toast.success('Order marked as delivered'),
      onError: (err) => {
        const message = err instanceof Error ? err.message : 'Failed to update status';
        toast.error(message);
      }
    });
  };

  const handleUpdateStatus = (newStatus: string) => {
    updateStatus.mutate({ id: order.id, status: newStatus }, {
      onSuccess: () => toast.success(`Order status updated to ${newStatus}`),
    });
  };

  const handleCancelOrder = () => {
    cancelOrder.mutate(order.id, {
      onSuccess: () => toast.success('Order cancelled successfully'),
    });
  };

  const theme = STATUS_THEME[order.status] || STATUS_THEME["Pending"];

  return (
    <div className="flex flex-col h-full">
      <AdminPageHeader
        title={`Order #${order.orderCode}`}
        description={`Customer ID: ${order.id.substring(0, 8)}...`}
        actions={
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="font-bold border-none shadow-sm capitalize px-3 py-1 text-sm"
              style={{ backgroundColor: `${theme.color}15`, color: theme.color }}
            >
              {theme.label}
            </Badge>
            <Button
              variant="outline"
              onClick={handlePrint}
              size="sm"
              className="gap-2 hover:bg-gray-50 border-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        }
        stats={[
          {
            label: 'Order Date',
            value: new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          },
          { label: 'Total Amount', value: formatPrice(order.totalAmount) },
          { label: 'Items', value: order.items.length },
        ]}
      />

      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <OrderItemsList items={order.items} />
                <div className="mt-4">
                  <OrderSummary
                    subTotal={order.subTotal}
                    discountAmount={order.discountAmount}
                    totalAmount={order.totalAmount}
                  />
                </div>
              </motion.div>

              {/* Timeline (Hidden if not available in API yet) */}
              <OrderTimeline timeline={[]} />
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <CustomerInfoCard
                name={order.receiverName}
                email="N/A"
                phone={order.phoneNumber}
                delay={0.1}
              />

              <ShippingAddressCard
                fullName={order.receiverName}
                phone={order.phoneNumber}
                street={order.street}
                ward={order.ward}
                district={order.district}
                city={order.city}
                delay={0.15}
              />

              <PaymentInfoCard
                paymentMethod={order.paymentMethod || 'COD'}
                total={order.totalAmount}
                delay={0.2}
              />

              <QuickActionsCard
                onMarkDelivered={handleMarkDelivered}
                onUpdateTracking={() => handleUpdateStatus('Shipping')}
                onCancelOrder={handleCancelOrder}
                delay={0.25}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

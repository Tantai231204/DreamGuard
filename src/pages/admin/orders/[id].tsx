import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { mockOrderDetails } from '../data';
import type { OrderDetail } from '../types';
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

const statusColors = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();

  // In a real app, fetch order by ID
  const order: OrderDetail | undefined = mockOrderDetails;

  if (!order || order.id !== id) {
    return <OrderNotFound orderId={id} />;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleMarkDelivered = () => {
    console.log('Mark as delivered');
  };

  const handleUpdateTracking = () => {
    console.log('Update tracking');
  };

  const handleCancelOrder = () => {
    console.log('Cancel order');
  };

  return (
    <div className="flex flex-col h-full">
      <AdminPageHeader
        title={`Order #${order.id}`}
        description={order.customerName}
        actions={
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${statusColors[order.status]} text-sm px-3 py-1 font-semibold`}
            >
              {statusLabels[order.status]}
            </Badge>
            <Button
              variant="outline"
              onClick={handlePrint}
              size="sm"
              className="gap-2 hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        }
        stats={[
          {
            label: 'Order Date',
            value: new Date(order.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          },
          { label: 'Total Amount', value: `₫${order.total.toLocaleString('vi-VN')}` },
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
                    subtotal={order.subtotal}
                    shipping={order.shipping}
                    tax={order.tax}
                    total={order.total}
                  />
                </div>
              </motion.div>

              {/* Timeline */}
              <OrderTimeline timeline={order.timeline} />
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <CustomerInfoCard
                name={order.customerName}
                email={order.email}
                phone={order.phone}
                delay={0.1}
              />

              <ShippingAddressCard address={order.shippingAddress} delay={0.15} />

              <PaymentInfoCard
                paymentMethod={order.paymentMethod}
                total={order.total}
                delay={0.2}
              />

              <QuickActionsCard
                onMarkDelivered={handleMarkDelivered}
                onUpdateTracking={handleUpdateTracking}
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

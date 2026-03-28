import { memo } from 'react';
import type { ServiceOrderResponse } from '@/api/types/serviceOrder';
import { EmptyState } from './EmptyState';
import { ServiceOrderCard } from './ServiceOrderCard';

interface ServiceOrderListProps {
  orders: ServiceOrderResponse[];
  isFilterActive: boolean;
}

export const ServiceOrderList = memo(({ orders, isFilterActive }: ServiceOrderListProps) => {
  if (orders.length === 0) return <EmptyState isFilter={isFilterActive} orderType="service" />;

  return (
    <div className="space-y-4">
      {orders.map((order, index) => (
        <ServiceOrderCard key={order.soId || order.id || `${order.orderCode || 'service'}-${index}`} order={order} />
      ))}
    </div>
  );
});

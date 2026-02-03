import { useMemo } from 'react';
import { mockOrders } from '../../data';
import type { Order } from '../../types';

export const useOrderStats = () => {
  return useMemo(() => {
    const total = mockOrders.length;
    const revenue = mockOrders.reduce((sum: number, order: Order) => sum + order.total, 0);
    const pending = mockOrders.filter((o: Order) => o.status === 'pending').length;
    const delivered = mockOrders.filter((o: Order) => o.status === 'delivered').length;

    return { total, revenue, pending, delivered };
  }, []);
};

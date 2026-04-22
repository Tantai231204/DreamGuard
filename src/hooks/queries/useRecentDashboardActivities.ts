import { useQuery } from '@tanstack/react-query';
import { orderService, tradeInOrderService } from '@/api/services';
import type { Order } from '@/pages/admin/types';

export const dashboardKeys = {
    recentActivities: ['dashboard-recent-activities'] as const,
};

export const useRecentDashboardActivities = () => {
    return useQuery({
        queryKey: dashboardKeys.recentActivities,
        queryFn: async () => {
            const [ordersRes, tradeInRes] = await Promise.all([
                orderService.getAdminOrders({ pageNumber: 1, pageSize: 8 }),
                tradeInOrderService.getAdminTradeInOrders({ pageNumber: 1, pageSize: 8 }),
            ]);

            const regularOrders: (Order & { type: 'regular' })[] = (ordersRes.items || []).map(o => {
                const receiverName = (o as { receiverName?: string }).receiverName || 
                             (o as { userName?: string }).userName || 
                             "Guest Customer";
                return {
                    id: o.id,
                    customerName: `ORDER #${o.orderCode}`,
                    email: "",
                    products: `Customer: ${receiverName}`,
                    total: o.totalAmount,
                    status: String(o.status).toLowerCase() as Order['status'],
                    date: o.createdAt,
                    type: 'regular',
                };
            });

            const tradeInOrders: (Order & { type: 'trade-in' })[] = (tradeInRes.items || []).map(o => ({
                id: o.tradeInOrderId,
                customerName: `TRADE-IN #${o.orderCode}`,
                email: "",
                products: `Customer: ${o.receiverName || 'Guest'}`,
                total: o.amountToPay,
                status: o.status.toLowerCase() as Order['status'],
                date: o.createdAt,
                type: 'trade-in',
            }));

            // Merge and sort by date descending
            return [...regularOrders, ...tradeInOrders]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5);
        },
        staleTime: 30000,
    });
};

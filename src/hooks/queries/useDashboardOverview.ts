import { useQuery } from "@tanstack/react-query";
import { orderService, customerService, productService, tradeInOrderService } from "@/api/services";
import { format } from "date-fns";

export const dashboardKeys = {
    overview: ["dashboard-overview"] as const,
};

export const useDashboardOverview = () => {
    const toDate = format(new Date(), "yyyy-MM-dd");
    const fromDate = "2020-01-01"; // Fetch total historical data for main overview card

    return useQuery({
        queryKey: dashboardKeys.overview,
        queryFn: async () => {
            const [orderData, tradeInData, customerData, productData] = await Promise.all([
                orderService.getDashboardData(fromDate, toDate),
                tradeInOrderService.getTradeInDashboard({ fromDate, toDate }),
                customerService.getAllCustomers({ pageSize: 1, pageNumber: 1 }),
                productService.getAllAdmin({ pageSize: 1, pageNumber: 1 }),
            ]);

            return {
                totalRevenue: (orderData.totalAmount || 0) + (tradeInData.totalAmount || 0),
                totalOrders: (orderData.totalOrders || 0) + (tradeInData.totalTradeInOrders || 0),
                totalUsers: customerData.totalCount || 0,
                totalProducts: productData.totalCount || 0,
            };
        },
        staleTime: 60000,
        gcTime: 300000,
    });
};

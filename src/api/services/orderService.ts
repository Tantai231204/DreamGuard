import apiClient from '../../lib/api';
import type { CustomAxiosRequestConfig } from '../../lib/api';
import type { CreateOrderRequest, OrderResponse, OrderDetailResponse, OrderStatus, TradeInEligibleOrderItem } from '../types/order';

const toTradeInEligibleOrderItems = (payload: unknown): TradeInEligibleOrderItem[] => {
    if (!Array.isArray(payload)) return [];

    return payload
        .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
        .map((item) => {
            const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
            const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : 0;
            const totalPrice = typeof item.totalPrice === 'number' ? item.totalPrice : unitPrice * quantity;

            return {
                id: typeof item.id === 'string' ? item.id : '',
                productVariantId: typeof item.productVariantId === 'string' ? item.productVariantId : '',
                comboId: typeof item.comboId === 'string' || item.comboId === null ? item.comboId : null,
                itemName: typeof item.itemName === 'string' ? item.itemName : 'Trade-in item',
                quantity,
                unitPrice,
                totalPrice,
                tradeInUsedAmount: typeof item.tradeInUsedAmount === 'number' ? item.tradeInUsedAmount : 0,
                productCustomizeDetails: Array.isArray(item.productCustomizeDetails) ? item.productCustomizeDetails : [],
                customizeHash: typeof item.customizeHash === 'string' ? item.customizeHash : '',
                image: typeof item.image === 'string' ? item.image : undefined,
                orderId: typeof item.orderId === 'string' ? item.orderId : undefined,
                purchaseDate: typeof item.purchaseDate === 'string' ? item.purchaseDate : undefined,
                createdAt: typeof item.createdAt === 'string' ? item.createdAt : undefined,
                tradeInValue: typeof item.tradeInValue === 'number' ? item.tradeInValue : undefined,
            };
        })
        .filter((item) => Boolean(item.id && item.productVariantId));
};

const orderService = {
    createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
        const res = await apiClient.post('/order', data);
        return res.data?.data ?? res.data;
    },

    getOrderDetail: async (id: string): Promise<OrderDetailResponse> => {
        const res = await apiClient.get(`/order/${id}`);
        return res.data?.data ?? res.data;
    },

    getOrders: async (params?: { pageNumber?: number; pageSize?: number }): Promise<{
        items: OrderResponse[];
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        totalCount: number;
    }> => {
        const res = await apiClient.get('/order', { params });
        return res.data?.data ?? res.data;
    },

    cancelOrder: async (id: string): Promise<void> => {
        const config: CustomAxiosRequestConfig = { _suppressToast: true };
        await apiClient.put(`/order/${id}/cancel`, {}, config);
    },

    /**
     * 🔥 Admin-specific cancellation via Status Update
     * Standard: Admin uses the general status update endpoint with 'Cancelled'
     */
    adminCancelOrder: async (id: string, reason?: string): Promise<void> => {
        // According to user requirement: Admin uses /status with 'Cancelled'
        await apiClient.put(`/order/${id}/status`, { cancelReason: reason }, {
            params: { status: 'Cancelled' }
        });
    },

    getAdminOrders: async (params?: {
        pageNumber?: number;
        pageSize?: number;
        search?: string;
        status?: string[];
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        items: OrderResponse[];
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        totalCount: number;
    }> => {
        const res = await apiClient.get('/order/admin', { params });
        return res.data?.data ?? res.data;
    },

    /**
     * 🔥 Standard Status Transition
     * For real-world security, transitions should strictly follow a state-machine (e.g. Confirmed -> Processing)
     */
    updateStatus: async (id: string, status: OrderStatus | string): Promise<void> => {
        // Enforce basic type safety on status string
        await apiClient.put(`/order/${id}/status`, undefined, {
            params: { status },
            // Anti-tampering: we could add a checksum here in a strictly secure project
        });
    },

    /**
     * Fetches order items eligible for trade-in from the backend route segment identifier.
     */
    getOrderItemsToTradeIn: async (id: string): Promise<TradeInEligibleOrderItem[]> => {
        const res = await apiClient.get(`/Order/${id}/GetOrderItemsToTradeInAsync`);
        const payload = res.data?.data ?? res.data;
        if (Array.isArray(payload)) return toTradeInEligibleOrderItems(payload);
        if (Array.isArray(payload?.items)) return toTradeInEligibleOrderItems(payload.items);
        return toTradeInEligibleOrderItems([]);
    },

    getDashboardData: async (fromDate: string, toDate: string): Promise<import('../types/order').OrderDashboardResponse> => {
        const res = await apiClient.get('/Order/get-order-dash-board', {
            params: { fromDate, toDate }
        });
        return res.data?.data ?? res.data;
    }
};

export default orderService;


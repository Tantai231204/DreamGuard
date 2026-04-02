import apiClient from '../../lib/api';
import type { CustomAxiosRequestConfig } from '../../lib/api';
import type { CreateOrderRequest, OrderResponse, OrderDetailResponse, OrderStatus } from '../types/order';

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
    }
};

export default orderService;

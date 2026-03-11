import apiClient from '../../lib/api';
import type { CustomAxiosRequestConfig } from '../../lib/api';
import type { CreateOrderRequest, OrderResponse, OrderDetailResponse } from '../types/order';

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

    updateStatus: async (id: string, status: string): Promise<void> => {
        await apiClient.put(`/order/${id}/status`, undefined, { params: { status } });
    }
};

export default orderService;

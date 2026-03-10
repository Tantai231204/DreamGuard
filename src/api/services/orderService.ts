import apiClient from '../../lib/api';
import type { CreateOrderRequest, OrderResponse } from '../types/order';

const orderService = {
    createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
        const res = await apiClient.post('/order', data);
        return res.data?.data ?? res.data;
    },

    getOrderDetail: async (id: string): Promise<OrderResponse> => {
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
    }
};

export default orderService;

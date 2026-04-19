import apiClient from '../../lib/api';
import type { PaymentResponse, PaymentDetailResponse } from '../types/payment';

const paymentService = {
    getAdminPayments: async (params?: {
        pageNumber?: number;
        pageSize?: number;
        status?: string;
        method?: string;
        orderCode?: string;
        key?: string;
    }): Promise<{
        items: PaymentResponse[];
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        totalCount: number;
    }> => {
        const res = await apiClient.get('/payment/admin', { params });
        return res.data?.data ?? res.data;
    },

    getPaymentDetail: async (id: string): Promise<PaymentDetailResponse> => {
        const res = await apiClient.get(`/payment/admin/${id}`);
        return res.data?.data ?? res.data;
    },

    updatePaymentStatus: async (id: string, status: string): Promise<void> => {
        console.log(`[PaymentService] Updating payment ${id} to ${status}`);
        await apiClient.put(`/payment/admin/${id}/status`, null, {
            params: { status }
        });
    },

    getPaymentByOrderId: async (orderId: string): Promise<PaymentDetailResponse> => {
        const res = await apiClient.get(`/payment/order/${orderId}`);
        return res.data?.data ?? res.data;
    }
};

export default paymentService;

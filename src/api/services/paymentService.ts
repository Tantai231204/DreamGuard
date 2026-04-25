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

    getPayments: async (params?: {
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
        const res = await apiClient.get('/payment', { params });
        return res.data?.data ?? res.data;
    },

    getPaymentDetail: async (id: string): Promise<PaymentDetailResponse> => {
        const res = await apiClient.get(`/payment/admin/${id}`);
        return res.data?.data ?? res.data;
    },

    updatePaymentStatus: async (id: string, status: string, evidenceUrl?: string): Promise<void> => {
        console.log(`[PaymentService] Updating payment ${id} to ${status}`);
        await apiClient.put(`/payment/admin/${id}/status`, null, {
            params: {
                status,
                ...(evidenceUrl && { evidenceUrl })
            }
        });
    },

    getPaymentByOrderId: async (orderId: string): Promise<PaymentDetailResponse> => {
        const res = await apiClient.get(`/payment/order/${orderId}`);
        return res.data?.data ?? res.data;
    },

    createAdminRefund: async (payload: {
        orderId?: string;
        tradeInOrderId?: string;
        soId?: string;
        reason: string;
        amount: number;
    }): Promise<{ id: string } & Record<string, unknown>> => {
        const res = await apiClient.post('/payment/admin/refund', payload);
        return res.data?.data ?? res.data;
    },

    updateRefundStatus: async (id: string, status: string, evidence?: File, evidenceUrl?: string): Promise<void> => {
        const formData = new FormData();
        formData.append('status', status);
        if (evidence) {
            formData.append('evidence', evidence);
        }
        if (evidenceUrl) {
            formData.append('evidenceUrl', evidenceUrl);
        }

        await apiClient.patch(`/payment/admin/refund/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }
};

export default paymentService;

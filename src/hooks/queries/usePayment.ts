import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import paymentService from '@/api/services/paymentService';

export const paymentKeys = {
    all: ['payments'] as const,
    list: (params?: Record<string, unknown>) => [...paymentKeys.all, 'list', params] as const,
    detail: (id: string) => [...paymentKeys.all, 'detail', id] as const,
    byOrder: (orderId: string) => [...paymentKeys.all, 'byOrder', orderId] as const,
};

export const useAdminPayments = (params?: {
    pageNumber?: number;
    pageSize?: number;
    status?: string;
    method?: string;
    orderCode?: string;
    key?: string;
}) => {
    return useQuery({
        queryKey: paymentKeys.list(params),
        queryFn: () => paymentService.getAdminPayments(params),
        staleTime: 0,
    });
};

export const usePayments = (params?: {
    pageNumber?: number;
    pageSize?: number;
    status?: string;
    method?: string;
    orderCode?: string;
    key?: string;
}) => {
    return useQuery({
        queryKey: paymentKeys.list(params),
        queryFn: () => paymentService.getPayments(params),
        placeholderData: keepPreviousData,
        staleTime: 0,
        enabled: !!params?.orderCode,
    });
};

export const usePaymentDetail = (id: string) => {
    return useQuery({
        queryKey: paymentKeys.detail(id),
        queryFn: () => paymentService.getPaymentDetail(id),
        enabled: !!id,
    });
};

export const usePaymentByOrderId = (orderId: string) => {
    return useQuery({
        queryKey: paymentKeys.byOrder(orderId),
        queryFn: () => paymentService.getPaymentByOrderId(orderId),
        enabled: !!orderId,
    });
};

export const useUpdatePaymentStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status, evidenceUrl }: { id: string; status: string; evidenceUrl?: string }) =>
            paymentService.updatePaymentStatus(id, status, evidenceUrl),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
        },
    });
};

export const useAdminCreateRefund = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: { soId?: string; orderId?: string; reason: string; amount: number }) =>
            paymentService.createAdminRefund(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
        }
    });
};

export const useUpdateRefundStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status, evidence, evidenceUrl }: { id: string; status: string; evidence?: File; evidenceUrl?: string }) =>
            paymentService.updateRefundStatus(id, status, evidence, evidenceUrl),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
        }
    });
};

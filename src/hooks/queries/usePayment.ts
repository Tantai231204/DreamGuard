import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import paymentService from '@/api/services/paymentService';

export const paymentKeys = {
    all: ['payments'] as const,
    list: (params?: Record<string, unknown>) => [...paymentKeys.all, 'list', params] as const,
    detail: (id: string) => [...paymentKeys.all, 'detail', id] as const,
};

export const useAdminPayments = (params?: { pageNumber?: number; pageSize?: number }) => {
    return useQuery({
        queryKey: paymentKeys.list(params),
        queryFn: () => paymentService.getAdminPayments(params),
        placeholderData: keepPreviousData,
    });
};

export const usePaymentDetail = (id: string) => {
    return useQuery({
        queryKey: paymentKeys.detail(id),
        queryFn: () => paymentService.getPaymentDetail(id),
        enabled: !!id,
    });
};

export const useUpdatePaymentStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            paymentService.updatePaymentStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
        },
    });
};

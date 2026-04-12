import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/api/services';
import { useAuthStore } from '@/store/authStore';
import type { CreateOrderRequest } from '@/api/types/order';
import { cartKeys } from './useCart';

export interface AdminOrdersQueryParams {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    status?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const orderKeys = {
    all: ['orders'] as const,
    detail: (id: string) => [...orderKeys.all, id] as const,
};

export const adminOrdersQueryOptions = (params?: AdminOrdersQueryParams) => ({
    queryKey: [...orderKeys.all, 'admin', params] as const,
    queryFn: () => orderService.getAdminOrders(params),
    staleTime: 0,
});

export const useOrders = (params?: { pageNumber?: number; pageSize?: number }) => {
    return useQuery({
        queryKey: params ? [...orderKeys.all, params] : orderKeys.all,
        queryFn: () => orderService.getOrders(params),
        staleTime: 30000,
        gcTime: 60000,
    });
};

export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOrderRequest) => orderService.createOrder(data),
        onSuccess: (data) => {
            // If it's COD, we should invalidate cart
            if (!data.paymentUrl) {
                queryClient.invalidateQueries({ queryKey: cartKeys.all });
            }
        },
        onError: (error: unknown) => {
            // Fallback error messaging if interceptor is bypassed or for specific UX
            console.error('[useCreateOrder] error:', error);
        }
    });
};
export const useOrderDetail = (id: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: orderKeys.detail(id),
        queryFn: () => orderService.getOrderDetail(id),
        enabled: options?.enabled !== undefined ? (options.enabled && !!id) : !!id,
    });
};

export const useCancelOrder = (options?: { meta?: Record<string, unknown> }) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => orderService.cancelOrder(id),
        meta: options?.meta,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
        }
    });
};
export const useAdminOrders = (params?: AdminOrdersQueryParams) => {
    return useQuery(adminOrdersQueryOptions(params));
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string, status: string }) =>
            orderService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
        }
    });
};

/**
 * 🔥 Reinforced Admin-only Cancel Order
 * Checks permissions before making the request.
 */
export const useAdminCancelOrder = () => {
    const queryClient = useQueryClient();
    const { role } = useAuthStore.getState();

    return useMutation({
        mutationFn: async ({ id, reason }: { id: string, reason: string }) => {
            const isAdmin = ['Admin', 'Staff'].includes(role || '');
            if (!isAdmin) {
                throw new Error('Forbidden: Insufficient privileges to cancel orders.');
            }
            return orderService.adminCancelOrder(id, reason);
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
        }
    });
};

export const useUserOrderItemsForTradeIn = (productId: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: [...orderKeys.all, 'trade-in-eligible', productId],
        queryFn: () => orderService.getOrderItemsToTradeIn(productId),
        enabled: options?.enabled !== undefined ? (options.enabled && !!productId) : !!productId,
        staleTime: 60000,
    });
};

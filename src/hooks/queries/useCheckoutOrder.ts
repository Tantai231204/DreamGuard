import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import checkoutOrderService from '@/api/services/checkoutOrderService';
import { orderKeys } from './useOrder';

export const checkoutOrderKeys = {
    all: ['checkoutOrders'] as const,
    list: (params?: Record<string, unknown>) => [...checkoutOrderKeys.all, 'list', params] as const,
    detail: (id: string) => [...checkoutOrderKeys.all, 'detail', id] as const,
};

/**
 * Fetch paginated checkout orders for the current user.
 */
export const useCheckoutOrders = (params?: import('@/api/types/checkoutOrder').CheckoutOrderQueryParams) => {
    return useQuery({
        queryKey: checkoutOrderKeys.list(params as Record<string, unknown>),
        queryFn: () => checkoutOrderService.getCheckoutOrders(params),
        staleTime: 30000,
        gcTime: 60000,
    });
};

/**
 * Fetch paginated checkout orders for admin.
 */
export const useAdminCheckoutOrders = (params?: import('@/api/types/checkoutOrder').CheckoutOrderQueryParams) => {
    return useQuery({
        queryKey: [...checkoutOrderKeys.list(params as Record<string, unknown>), 'admin'],
        queryFn: () => checkoutOrderService.getAdminCheckoutOrders(params),
        staleTime: 30000,
        gcTime: 60000,
    });
};

/**
 * Cancel an entire checkout order (COD or VnPay unpaid).
 */
export const useCancelCheckoutOrder = (options?: { meta?: Record<string, unknown> }) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => checkoutOrderService.cancelCheckoutOrder(id),
        meta: options?.meta,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: checkoutOrderKeys.all });
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
        },
    });
};

/**
 * Cancel a single child order (VnPay paid → triggers auto-refund).
 */
export const useCancelChildOrder = (options?: { meta?: Record<string, unknown> }) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (childOrderId: string) => checkoutOrderService.cancelChildOrder(childOrderId),
        meta: options?.meta,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: checkoutOrderKeys.all });
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
        },
    });
};

/**
 * Confirm an entire checkout order.
 */
export const useConfirmCheckoutOrder = (options?: { meta?: Record<string, unknown> }) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => checkoutOrderService.confirmCheckoutOrder(id),
        meta: options?.meta,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: checkoutOrderKeys.all });
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
        },
    });
};

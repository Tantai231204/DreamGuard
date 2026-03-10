import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/api/services';
import type { CreateOrderRequest } from '@/api/types/order';
import { cartKeys } from './useCart';

export const orderKeys = {
    all: ['orders'] as const,
    detail: (id: string) => [...orderKeys.all, id] as const,
};

export const useOrders = (params?: { pageNumber?: number; pageSize?: number }) => {
    return useQuery({
        queryKey: params ? [...orderKeys.all, params] : orderKeys.all,
        queryFn: () => orderService.getOrders(params),
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

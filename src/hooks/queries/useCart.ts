import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartService, type AddCartItemRequest } from '@/api';

export const cartKeys = {
    all: ['cart'] as const,
};

export const useCart = () => {
    return useQuery({
        queryKey: cartKeys.all,
        queryFn: cartService.getCart,
    });
};

export const useAddToCart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddCartItemRequest) => cartService.addItem(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
};

export const useUpdateCartItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
            cartService.updateItem(itemId, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
};

export const useRemoveFromCart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (itemId: string) => cartService.removeItem(itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
};

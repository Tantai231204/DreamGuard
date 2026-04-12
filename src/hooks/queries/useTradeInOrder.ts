import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import tradeInOrderService from '@/api/services/tradeInOrderService';
import type { AdminTradeInOrderSearchParams } from '@/api/types/tradeInOrder';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export const tradeInOrderKeys = {
  all: ['trade-in-orders'] as const,
  list: (params?: AdminTradeInOrderSearchParams) => [...tradeInOrderKeys.all, 'list', params] as const,
};

export const adminTradeInOrdersQueryOptions = (params?: AdminTradeInOrderSearchParams) => ({
  queryKey: tradeInOrderKeys.list(params),
  queryFn: () => tradeInOrderService.getAdminTradeInOrders(params),
  placeholderData: keepPreviousData,
  staleTime: 0,
});

export const useAdminTradeInOrders = (params?: AdminTradeInOrderSearchParams, options?: { enabled?: boolean }) => {
  const role = useAuthStore(state => state.role);
  const isAdminOrManager = role === 'Admin' || role === 'Manager';

  return useQuery({
    ...adminTradeInOrdersQueryOptions(params),
    enabled: (options?.enabled ?? true) && isAdminOrManager,
  });
};

export const adminTradeInOrderDetailQueryOptions = (id: string) => ({
  queryKey: [...tradeInOrderKeys.all, 'detail', id] as const,
  queryFn: () => tradeInOrderService.getTradeInOrderById(id),
  enabled: !!id,
});

export const useAdminTradeInOrderDetail = (id: string, options?: { enabled?: boolean }) => {
  const role = useAuthStore(state => state.role);
  const isAdminOrManager = role === 'Admin' || role === 'Manager';

  return useQuery({
    ...adminTradeInOrderDetailQueryOptions(id),
    enabled: (options?.enabled ?? true) && !!id && isAdminOrManager,
  });
};

export const useAdminCancelTradeInOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      tradeInOrderService.adminCancel(id, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.all });
      toast.success('Trade-in order terminated successfully.');
    },
  });
};

export const useCustomerTradeInOrders = (params?: { pageNumber?: number; pageSize?: number }, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...tradeInOrderKeys.all, 'customer', params],
    queryFn: () => tradeInOrderService.getCustomerTradeInOrders(params),
    ...options
  });
};

export const useWaitingTradeInOrders = (params?: { pageNumber?: number; pageSize?: number }, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...tradeInOrderKeys.all, 'waiting', params],
    queryFn: () => tradeInOrderService.getWaitingOrders(params),
    placeholderData: keepPreviousData,
    ...options
  });
};

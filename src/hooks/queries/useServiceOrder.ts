import { useQuery } from '@tanstack/react-query';
import serviceOrderService from '@/api/services/serviceOrderService';

export const serviceOrderKeys = {
  all: ['service-orders'] as const,
  byCustomer: (customerId: string) => [...serviceOrderKeys.all, 'customer', customerId] as const,
  detail: (id: string) => [...serviceOrderKeys.all, id] as const,
};

export const useServiceOrders = (
  params?: { pageNumber?: number; pageSize?: number; customerId?: string },
  enabled = true
) => {
  return useQuery({
    queryKey: params ? [...serviceOrderKeys.all, params] : serviceOrderKeys.all,
    queryFn: () => serviceOrderService.getServiceOrders(params),
    enabled,
    staleTime: 30000,
    gcTime: 60000,
  });
};

export const useServiceOrdersByCustomer = (
  customerId: string,
  params?: { pageNumber?: number; pageSize?: number },
  enabled = true
) => {
  return useQuery({
    queryKey: [...serviceOrderKeys.byCustomer(customerId), params],
    queryFn: () => serviceOrderService.getServiceOrdersByCustomerId(customerId, params),
    enabled: enabled && !!customerId,
    staleTime: 30000,
    gcTime: 60000,
  });
};

export const useServiceOrderDetail = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: serviceOrderKeys.detail(id),
    queryFn: () => serviceOrderService.getServiceOrderById(id),
    enabled: options?.enabled !== undefined ? (options.enabled && !!id) : !!id,
    staleTime: 30000,
  });
};

import { useQuery } from "@tanstack/react-query";
import customerService from "@/api/services/customerService";
import type { CustomerParams } from "@/api/types/customer.types";

export const customerKeys = {
  all: ["customers"] as const,
  list: (params: CustomerParams) => [...customerKeys.all, "list", params] as const,
  detail: (id: string) => [...customerKeys.all, "detail", id] as const,
};

export const useCustomers = (params: CustomerParams = {}) => {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customerService.getAllCustomers(params),
    staleTime: 0,
  });
};

export const useCustomerDetail = (id: string, enabled = true) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customerService.getCustomerById(id),
    enabled: enabled && !!id,
  });
};

import api from "@/lib/api";
import type { PaginatedAdminSearchOrderServiceResponse } from "@/pages/admin/services/types";
import type { OrderResponse } from "@/api/types/order";

export interface UnifiedOrder {
  id: string;
  orderCode: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  orderType: 'service' | 'product';
}

export const useCustomerServiceOrders = (customerId: string, enabled = true) => {
  return useQuery({
    queryKey: [...customerKeys.all, "service-orders", customerId],
    queryFn: async () => {
      const res = await api.post('/ServiceOrders/AdminSearchOrderService', { pageSize: 100 });
      const data = (res.data?.data ?? res.data) as PaginatedAdminSearchOrderServiceResponse;
      return (data.items || [])
        .filter(item => item.customerId === customerId)
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    },
    enabled: enabled && !!customerId,
    staleTime: 60000,
  });
};

export const useCustomerProductOrders = (searchQuery: string, enabled = true) => {
  return useQuery({
    queryKey: [...customerKeys.all, "product-orders", searchQuery],
    queryFn: async () => {
      const res = await api.get('/order/admin', { params: { pageSize: 50, search: searchQuery } });
      const data = (res.data?.data ?? res.data) as { items: OrderResponse[] };
      return (data.items || [])
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    },
    enabled: enabled && !!searchQuery,
    staleTime: 60000,
  });
};

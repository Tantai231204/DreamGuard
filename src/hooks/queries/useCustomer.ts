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
  });
};

export const useCustomerDetail = (id: string, enabled = true) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customerService.getCustomerById(id),
    enabled: enabled && !!id,
  });
};

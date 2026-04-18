import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import tradeInOrderService from '@/api/services/tradeInOrderService';
import type {
  AdminTradeInOrderListResponse,
  AdminTradeInOrderSearchParams,
  TradeInActionResponse,
  TradeInOrderDetailResponse,
} from '@/api/types/tradeInOrder';
import { paymentKeys } from './usePayment';
import { useAuthStore } from '@/store/authStore';
import { isAdminOrManager, isAnyStaff } from '@/lib/role';
import {
  normalizeTradeInStatus,
} from '@/utils/tradeInWorkflow';

// ── Shared Query Keys ──

export const tradeInOrderKeys = {
  all: ['trade-in-orders'] as const,
  lists: () => [...tradeInOrderKeys.all, 'list'] as const,
  list: (params?: AdminTradeInOrderSearchParams) => [...tradeInOrderKeys.lists(), params] as const,
  details: () => [...tradeInOrderKeys.all, 'detail'] as const,
  detail: (id: string) => [...tradeInOrderKeys.details(), id] as const,
  customerDetails: () => [...tradeInOrderKeys.all, 'customer-detail'] as const,
  customerDetail: (id: string) => [...tradeInOrderKeys.customerDetails(), id] as const,
  waitingLists: () => [...tradeInOrderKeys.all, 'waiting'] as const,
  waitingList: (params?: { pageNumber?: number; pageSize?: number }) => [...tradeInOrderKeys.waitingLists(), params] as const,
  customerLists: () => [...tradeInOrderKeys.all, 'customer-list'] as const,
  customerList: (params?: { pageNumber?: number; pageSize?: number }) => [...tradeInOrderKeys.customerLists(), params] as const,
};

// ── Types ──

interface TransitionPayload {
  fromStatus?: string;
  toStatus: string;
}

interface ConfirmDealPayload {
  fromStatus?: string;
  tradeInPrice: number;
}

interface CacheSnapshot {
  previousAdminDetail?: TradeInOrderDetailResponse;
  previousCustomerDetail?: TradeInOrderDetailResponse;
  previousAdminLists: Array<[QueryKey, AdminTradeInOrderListResponse | undefined]>;
}

// ── Shared Cache Utilities ─────────────────────────────────────

const calculateAmountToPay = (params: {
  salePrice?: number;
  currentAmountToPay: number;
  currentTradeInPrice: number;
  depositAmount: number;
  nextTradeInPrice: number;
}) => {
  const { salePrice, currentAmountToPay, currentTradeInPrice, depositAmount, nextTradeInPrice } = params;
  const basePrice = (salePrice && salePrice > 0) 
    ? salePrice 
    : (currentAmountToPay + currentTradeInPrice + depositAmount);
    
  return Math.max(0, basePrice - nextTradeInPrice - depositAmount);
};

const updateOrderInList = (
  list: AdminTradeInOrderListResponse | undefined,
  orderId: string,
  updater: (item: AdminTradeInOrderListResponse['items'][0]) => AdminTradeInOrderListResponse['items'][0] | null
): AdminTradeInOrderListResponse | undefined => {
  if (!list?.items) return list;

  let changed = false;
  const nextItems = list.items.reduce<AdminTradeInOrderListResponse['items']>((acc, item) => {
    if (item.tradeInOrderId !== orderId) {
      acc.push(item);
      return acc;
    }

    const updated = updater(item);
    if (updated) {
      acc.push(updated);
      if (updated !== item) changed = true;
    } else {
      changed = true;
    }
    return acc;
  }, []);

  if (!changed) return list;
  return { ...list, items: nextItems, totalCount: list.totalCount - (list.items.length - nextItems.length) };
};

// ── Queries Options (Restored for Admin Orders page) ───────────

export const adminTradeInOrdersQueryOptions = (params?: AdminTradeInOrderSearchParams) => ({
  queryKey: tradeInOrderKeys.list(params),
  queryFn: () => tradeInOrderService.getAdminTradeInOrders(params),
  placeholderData: keepPreviousData,
  staleTime: 30000,
});

export const waitingTradeInOrdersQueryOptions = (params?: { pageNumber?: number; pageSize?: number }) => ({
  queryKey: tradeInOrderKeys.waitingList(params),
  queryFn: () => tradeInOrderService.getWaitingOrders(params),
  placeholderData: keepPreviousData,
  staleTime: 30000,
});

// ── Hooks ───────────────────────────────────────────────────────

export const useAdminTradeInOrders = (params?: AdminTradeInOrderSearchParams, options?: { enabled?: boolean }) => {
  const role = useAuthStore(s => s.role);
  return useQuery({
    ...adminTradeInOrdersQueryOptions(params),
    enabled: (options?.enabled ?? true) && isAdminOrManager(role),
  });
};

export const useAdminTradeInOrderDetail = (id: string, options?: { enabled?: boolean }) => {
  const role = useAuthStore(s => s.role);
  return useQuery({
    queryKey: tradeInOrderKeys.detail(id),
    queryFn: () => tradeInOrderService.getTradeInOrderById(id),
    enabled: (options?.enabled ?? true) && !!id && isAnyStaff(role),
    staleTime: 10000,
  });
};

export const useCustomerTradeInOrderDetail = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: tradeInOrderKeys.customerDetail(id),
    queryFn: () => tradeInOrderService.getTradeInOrderById(id),
    enabled: (options?.enabled ?? true) && !!id,
    staleTime: 10000,
  });
};

export const useTransitionTradeInStatus = (orderId: string) => {
  const queryClient = useQueryClient();

  return useMutation<TradeInActionResponse, Error, TransitionPayload, CacheSnapshot>({
    mutationFn: ({ toStatus }) => tradeInOrderService.updateStatus(orderId, toStatus),
    onMutate: async ({ toStatus }) => {
      const nextStatus = normalizeTradeInStatus(toStatus);
      await queryClient.cancelQueries({ queryKey: tradeInOrderKeys.all });

      const snapshot: CacheSnapshot = {
        previousAdminDetail: queryClient.getQueryData(tradeInOrderKeys.detail(orderId)),
        previousCustomerDetail: queryClient.getQueryData(tradeInOrderKeys.customerDetail(orderId)),
        previousAdminLists: queryClient.getQueriesData({ queryKey: tradeInOrderKeys.lists() }),
      };

      // Apply Optimistic Update
      const updateStatus = (prev?: TradeInOrderDetailResponse) => prev ? { ...prev, status: nextStatus } : prev;
      queryClient.setQueryData(tradeInOrderKeys.detail(orderId), updateStatus);
      queryClient.setQueryData(tradeInOrderKeys.customerDetail(orderId), updateStatus);

      queryClient.setQueriesData<AdminTradeInOrderListResponse>({ queryKey: tradeInOrderKeys.lists() }, (prev) => 
        updateOrderInList(prev, orderId, (item) => ({ ...item, status: nextStatus }))
      );

      return snapshot;
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(tradeInOrderKeys.detail(orderId), context.previousAdminDetail);
        queryClient.setQueryData(tradeInOrderKeys.customerDetail(orderId), context.previousCustomerDetail);
        context.previousAdminLists.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
      toast.error('Failed to update status');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.all });
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    }
  });
};

export const useConfirmTradeInDeal = (orderId: string) => {
  const queryClient = useQueryClient();

  return useMutation<TradeInActionResponse, Error, ConfirmDealPayload, CacheSnapshot>({
    mutationFn: ({ tradeInPrice }) => tradeInOrderService.confirmDeal(orderId, tradeInPrice),
    onMutate: async ({ tradeInPrice }) => {
      const confirmedStatus = 'CONFIRMED';
      await queryClient.cancelQueries({ queryKey: tradeInOrderKeys.all });

      const snapshot: CacheSnapshot = {
        previousAdminDetail: queryClient.getQueryData(tradeInOrderKeys.detail(orderId)),
        previousAdminLists: queryClient.getQueriesData({ queryKey: tradeInOrderKeys.lists() }),
      };

      const updateDeal = (item: TradeInOrderDetailResponse) => {
        const nextAmountToPay = calculateAmountToPay({
          salePrice: item.productVariant?.salePrice,
          currentAmountToPay: item.amountToPay,
          currentTradeInPrice: item.tradeInPrice,
          depositAmount: item.depositAmount,
          nextTradeInPrice: tradeInPrice,
        });
        return { ...item, tradeInPrice, amountToPay: nextAmountToPay, status: confirmedStatus };
      };

      queryClient.setQueryData<TradeInOrderDetailResponse>(tradeInOrderKeys.detail(orderId), (prev) => prev ? updateDeal(prev) : prev);
      queryClient.setQueriesData<AdminTradeInOrderListResponse>({ queryKey: tradeInOrderKeys.lists() }, (prev) => 
        updateOrderInList(prev, orderId, (item) => {
          const nextAmountToPay = calculateAmountToPay({
            currentAmountToPay: item.amountToPay,
            currentTradeInPrice: item.tradeInPrice,
            depositAmount: item.depositAmount,
            nextTradeInPrice: tradeInPrice,
          });
          return { ...item, tradeInPrice, amountToPay: nextAmountToPay, status: confirmedStatus };
        })
      );

      return snapshot;
    },
    onSuccess: () => {
      toast.success('Trade-in deal confirmed');
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(tradeInOrderKeys.detail(orderId), context.previousAdminDetail);
        context.previousAdminLists.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
      toast.error('Failed to confirm deal');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.all });
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    }
  });
};

export const useAdminCancelTradeInOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      tradeInOrderService.adminCancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.all });
      toast.success('Order cancelled');
    },
  });
};

export const useCustomerTradeInOrders = (params?: { pageNumber?: number; pageSize?: number }) => {
  return useQuery({
    queryKey: tradeInOrderKeys.customerList(params),
    queryFn: () => tradeInOrderService.getCustomerTradeInOrders(params),
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });
};

export const useWaitingTradeInOrders = (params?: { pageNumber?: number; pageSize?: number }, options?: { enabled?: boolean }) => {
  return useQuery({
    ...waitingTradeInOrdersQueryOptions(params),
    enabled: options?.enabled ?? true,
  });
};

export const useReOrderFailedTradeInOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tradeInOrderService.reOrderFailedTradeInOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.all });
      toast.success('Re-payment initiated');
    },
  });
};

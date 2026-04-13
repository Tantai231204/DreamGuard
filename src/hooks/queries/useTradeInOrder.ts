import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import tradeInOrderService from '@/api/services/tradeInOrderService';
import type {
  AdminTradeInOrderListResponse,
  AdminTradeInOrderSearchParams,
  TradeInActionResponse,
  TradeInOrderDetailResponse,
} from '@/api/types/tradeInOrder';
import { useAuthStore } from '@/store/authStore';
import {
  canTransitionTradeInStatus,
  isTradeInTransitionTarget,
  isTradeInWaitingStatus,
  normalizeTradeInStatus,
  toTradeInStatus,
} from '@/utils/tradeInWorkflow';

export const tradeInOrderKeys = {
  all: ['trade-in-orders'] as const,
  list: (params?: AdminTradeInOrderSearchParams) => [...tradeInOrderKeys.all, 'list', params] as const,
  listPrefix: () => [...tradeInOrderKeys.all, 'list'] as const,
  detail: (id: string) => [...tradeInOrderKeys.all, 'detail', id] as const,
  customerDetail: (id: string) => [...tradeInOrderKeys.all, 'customer-detail', id] as const,
  customerList: (params?: { pageNumber?: number; pageSize?: number }) => [...tradeInOrderKeys.all, 'customer', params] as const,
  customerListPrefix: () => [...tradeInOrderKeys.all, 'customer'] as const,
  waiting: (params?: { pageNumber?: number; pageSize?: number }) => [...tradeInOrderKeys.all, 'waiting', params] as const,
  waitingPrefix: () => [...tradeInOrderKeys.all, 'waiting'] as const,
};

interface TradeInCacheSnapshot {
  previousAdminDetail: TradeInOrderDetailResponse | undefined;
  previousCustomerDetail: TradeInOrderDetailResponse | undefined;
  previousAdminLists: Array<[QueryKey, AdminTradeInOrderListResponse | undefined]>;
  previousWaitingLists: Array<[QueryKey, AdminTradeInOrderListResponse | undefined]>;
  previousCustomerLists: Array<[QueryKey, AdminTradeInOrderListResponse | undefined]>;
}

interface TransitionTradeInStatusPayload {
  fromStatus?: string;
  toStatus: string;
}

interface TransitionTradeInStatusContext extends TradeInCacheSnapshot {
  nextStatus: string;
}

interface ConfirmTradeInDealPayload {
  fromStatus?: string;
  tradeInPrice: number;
}

interface ConfirmTradeInDealContext extends TradeInCacheSnapshot {
  nextStatus: string;
  tradeInPrice: number;
}

const resolveAmountToPayAfterConfirm = (params: {
  salePrice?: number;
  currentAmountToPay: number;
  currentTradeInPrice: number;
  depositAmount: number;
  nextTradeInPrice: number;
}) => {
  const {
    salePrice,
    currentAmountToPay,
    currentTradeInPrice,
    depositAmount,
    nextTradeInPrice,
  } = params;

  const hasSalePrice = typeof salePrice === 'number' && Number.isFinite(salePrice) && salePrice > 0;
  const estimatedBasePrice = hasSalePrice
    ? salePrice
    : currentAmountToPay + currentTradeInPrice + depositAmount;

  return Math.max(0, estimatedBasePrice - nextTradeInPrice - depositAmount);
};

const captureTradeInCacheSnapshot = (queryClient: QueryClient, orderId: string): TradeInCacheSnapshot => ({
  previousAdminDetail: queryClient.getQueryData<TradeInOrderDetailResponse>(tradeInOrderKeys.detail(orderId)),
  previousCustomerDetail: queryClient.getQueryData<TradeInOrderDetailResponse>(tradeInOrderKeys.customerDetail(orderId)),
  previousAdminLists: queryClient.getQueriesData<AdminTradeInOrderListResponse>({ queryKey: tradeInOrderKeys.listPrefix() }),
  previousWaitingLists: queryClient.getQueriesData<AdminTradeInOrderListResponse>({ queryKey: tradeInOrderKeys.waitingPrefix() }),
  previousCustomerLists: queryClient.getQueriesData<AdminTradeInOrderListResponse>({ queryKey: tradeInOrderKeys.customerListPrefix() }),
});

const restoreTradeInCacheSnapshot = (
  queryClient: QueryClient,
  orderId: string,
  snapshot: TradeInCacheSnapshot,
) => {
  queryClient.setQueryData(tradeInOrderKeys.detail(orderId), snapshot.previousAdminDetail);
  queryClient.setQueryData(tradeInOrderKeys.customerDetail(orderId), snapshot.previousCustomerDetail);

  snapshot.previousAdminLists.forEach(([queryKey, previous]) => {
    queryClient.setQueryData(queryKey, previous);
  });
  snapshot.previousWaitingLists.forEach(([queryKey, previous]) => {
    queryClient.setQueryData(queryKey, previous);
  });
  snapshot.previousCustomerLists.forEach(([queryKey, previous]) => {
    queryClient.setQueryData(queryKey, previous);
  });
};

const invalidateTradeInCaches = (queryClient: QueryClient, orderId: string) => {
  void queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.detail(orderId) });
  void queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.customerDetail(orderId) });
  void queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.listPrefix() });
  void queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.waitingPrefix() });
  void queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.customerListPrefix() });
};

const updateDetailStatus = (
  detail: TradeInOrderDetailResponse | undefined,
  orderId: string,
  nextStatus: string,
) => {
  if (!detail || detail.tradeInOrderId !== orderId || detail.status === nextStatus) {
    return detail;
  }

  return {
    ...detail,
    status: nextStatus,
  };
};

const updateListStatus = (
  list: AdminTradeInOrderListResponse | undefined,
  orderId: string,
  nextStatus: string,
  options?: { removeIfNotWaiting?: boolean },
) => {
  if (!list || !Array.isArray(list.items) || list.items.length === 0) {
    return list;
  }

  let changed = false;
  let removedCount = 0;

  const items = list.items.reduce<AdminTradeInOrderListResponse['items']>((acc, item) => {
    if (item.tradeInOrderId !== orderId) {
      acc.push(item);
      return acc;
    }

    if (options?.removeIfNotWaiting && !isTradeInWaitingStatus(nextStatus)) {
      changed = true;
      removedCount += 1;
      return acc;
    }

    if (item.status !== nextStatus) {
      changed = true;
      acc.push({
        ...item,
        status: nextStatus,
      });
      return acc;
    }

    acc.push(item);
    return acc;
  }, []);

  if (!changed) {
    return list;
  }

  return {
    ...list,
    items,
    totalCount:
      typeof list.totalCount === 'number'
        ? Math.max(0, list.totalCount - removedCount)
        : list.totalCount,
  };
};

const updateDetailAfterConfirm = (
  detail: TradeInOrderDetailResponse | undefined,
  orderId: string,
  nextTradeInPrice: number,
  nextStatus: string,
) => {
  if (!detail || detail.tradeInOrderId !== orderId) {
    return detail;
  }

  const nextAmountToPay = resolveAmountToPayAfterConfirm({
    salePrice: detail.productVariant?.salePrice,
    currentAmountToPay: detail.amountToPay,
    currentTradeInPrice: detail.tradeInPrice,
    depositAmount: detail.depositAmount,
    nextTradeInPrice,
  });

  if (
    detail.tradeInPrice === nextTradeInPrice
    && detail.amountToPay === nextAmountToPay
    && detail.status === nextStatus
  ) {
    return detail;
  }

  return {
    ...detail,
    tradeInPrice: nextTradeInPrice,
    amountToPay: nextAmountToPay,
    status: nextStatus,
  };
};

const updateListAfterConfirm = (
  list: AdminTradeInOrderListResponse | undefined,
  orderId: string,
  nextTradeInPrice: number,
  nextStatus: string,
  options?: { removeIfNotWaiting?: boolean },
) => {
  if (!list || !Array.isArray(list.items) || list.items.length === 0) {
    return list;
  }

  let changed = false;
  let removedCount = 0;

  const items = list.items.reduce<AdminTradeInOrderListResponse['items']>((acc, item) => {
    if (item.tradeInOrderId !== orderId) {
      acc.push(item);
      return acc;
    }

    if (options?.removeIfNotWaiting && !isTradeInWaitingStatus(nextStatus)) {
      changed = true;
      removedCount += 1;
      return acc;
    }

    const nextAmountToPay = resolveAmountToPayAfterConfirm({
      currentAmountToPay: item.amountToPay,
      currentTradeInPrice: item.tradeInPrice,
      depositAmount: item.depositAmount,
      nextTradeInPrice,
    });

    if (
      item.tradeInPrice !== nextTradeInPrice
      || item.amountToPay !== nextAmountToPay
      || item.status !== nextStatus
    ) {
      changed = true;
      acc.push({
        ...item,
        tradeInPrice: nextTradeInPrice,
        amountToPay: nextAmountToPay,
        status: nextStatus,
      });
      return acc;
    }

    acc.push(item);
    return acc;
  }, []);

  if (!changed) {
    return list;
  }

  return {
    ...list,
    items,
    totalCount:
      typeof list.totalCount === 'number'
        ? Math.max(0, list.totalCount - removedCount)
        : list.totalCount,
  };
};

const syncTransitionStatusCaches = (
  queryClient: QueryClient,
  orderId: string,
  nextStatus: string,
) => {
  queryClient.setQueryData<TradeInOrderDetailResponse>(
    tradeInOrderKeys.detail(orderId),
    (previous) => updateDetailStatus(previous, orderId, nextStatus),
  );

  queryClient.setQueryData<TradeInOrderDetailResponse>(
    tradeInOrderKeys.customerDetail(orderId),
    (previous) => updateDetailStatus(previous, orderId, nextStatus),
  );

  queryClient.setQueriesData<AdminTradeInOrderListResponse>(
    { queryKey: tradeInOrderKeys.listPrefix() },
    (previous) => updateListStatus(previous, orderId, nextStatus),
  );

  queryClient.setQueriesData<AdminTradeInOrderListResponse>(
    { queryKey: tradeInOrderKeys.waitingPrefix() },
    (previous) => updateListStatus(previous, orderId, nextStatus, { removeIfNotWaiting: true }),
  );

  queryClient.setQueriesData<AdminTradeInOrderListResponse>(
    { queryKey: tradeInOrderKeys.customerListPrefix() },
    (previous) => updateListStatus(previous, orderId, nextStatus),
  );
};

const syncConfirmDealCaches = (
  queryClient: QueryClient,
  orderId: string,
  tradeInPrice: number,
  nextStatus: string,
) => {
  queryClient.setQueryData<TradeInOrderDetailResponse>(
    tradeInOrderKeys.detail(orderId),
    (previous) => updateDetailAfterConfirm(previous, orderId, tradeInPrice, nextStatus),
  );

  queryClient.setQueryData<TradeInOrderDetailResponse>(
    tradeInOrderKeys.customerDetail(orderId),
    (previous) => updateDetailAfterConfirm(previous, orderId, tradeInPrice, nextStatus),
  );

  queryClient.setQueriesData<AdminTradeInOrderListResponse>(
    { queryKey: tradeInOrderKeys.listPrefix() },
    (previous) => updateListAfterConfirm(previous, orderId, tradeInPrice, nextStatus),
  );

  queryClient.setQueriesData<AdminTradeInOrderListResponse>(
    { queryKey: tradeInOrderKeys.waitingPrefix() },
    (previous) => updateListAfterConfirm(previous, orderId, tradeInPrice, nextStatus, { removeIfNotWaiting: true }),
  );

  queryClient.setQueriesData<AdminTradeInOrderListResponse>(
    { queryKey: tradeInOrderKeys.customerListPrefix() },
    (previous) => updateListAfterConfirm(previous, orderId, tradeInPrice, nextStatus),
  );
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
  queryKey: tradeInOrderKeys.detail(id),
  queryFn: () => tradeInOrderService.getTradeInOrderById(id),
  enabled: !!id,
});

export const useAdminTradeInOrderDetail = (id: string, options?: { enabled?: boolean }) => {
  const role = useAuthStore(state => state.role);
  const canAccessTradeInDetail = role === 'Admin' || role === 'Manager' || role === 'Seller';

  return useQuery({
    ...adminTradeInOrderDetailQueryOptions(id),
    enabled: (options?.enabled ?? true) && !!id && canAccessTradeInDetail,
  });
};

export const customerTradeInOrderDetailQueryOptions = (id: string) => ({
  queryKey: tradeInOrderKeys.customerDetail(id),
  queryFn: () => tradeInOrderService.getTradeInOrderById(id),
  enabled: !!id,
});

export const useCustomerTradeInOrderDetail = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    ...customerTradeInOrderDetailQueryOptions(id),
    enabled: (options?.enabled ?? true) && !!id,
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
    queryKey: tradeInOrderKeys.customerList(params),
    queryFn: () => tradeInOrderService.getCustomerTradeInOrders(params),
    placeholderData: keepPreviousData,
    ...options,
  });
};

export const useReOrderFailedTradeInOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tradeInOrderId: string) => tradeInOrderService.reOrderFailedTradeInOrder(tradeInOrderId),
    onSuccess: (_response, tradeInOrderId) => {
      invalidateTradeInCaches(queryClient, tradeInOrderId);
    },
  });
};

export const useWaitingTradeInOrders = (params?: { pageNumber?: number; pageSize?: number }, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: tradeInOrderKeys.waiting(params),
    queryFn: () => tradeInOrderService.getWaitingOrders(params),
    placeholderData: keepPreviousData,
    ...options,
  });
};

export const waitingTradeInOrdersQueryOptions = (params?: { pageNumber?: number; pageSize?: number }) => ({
  queryKey: tradeInOrderKeys.waiting(params),
  queryFn: () => tradeInOrderService.getWaitingOrders(params),
  placeholderData: keepPreviousData,
  staleTime: 0,
});

export const useTransitionTradeInStatus = (orderId: string) => {
  const queryClient = useQueryClient();

  return useMutation<TradeInActionResponse, Error, TransitionTradeInStatusPayload, TransitionTradeInStatusContext>({
    mutationFn: ({ toStatus }) => {
      const nextStatus = normalizeTradeInStatus(toStatus);

      if (!isTradeInTransitionTarget(nextStatus)) {
        throw new Error(`Unsupported status update: ${toStatus}`);
      }

      return tradeInOrderService.updateStatus(orderId, nextStatus);
    },
    onMutate: async ({ fromStatus, toStatus }) => {
      const nextStatus = normalizeTradeInStatus(toStatus);
      if (!isTradeInTransitionTarget(nextStatus)) {
        throw new Error(`Unsupported status update: ${toStatus}`);
      }

      const normalizedFromStatus = toTradeInStatus(fromStatus);
      if (normalizedFromStatus && !canTransitionTradeInStatus(normalizedFromStatus, nextStatus)) {
        throw new Error(`Invalid trade-in transition: ${fromStatus} -> ${nextStatus}`);
      }

      await Promise.all([
        queryClient.cancelQueries({ queryKey: tradeInOrderKeys.detail(orderId) }),
        queryClient.cancelQueries({ queryKey: tradeInOrderKeys.customerDetail(orderId) }),
        queryClient.cancelQueries({ queryKey: tradeInOrderKeys.listPrefix() }),
        queryClient.cancelQueries({ queryKey: tradeInOrderKeys.waitingPrefix() }),
        queryClient.cancelQueries({ queryKey: tradeInOrderKeys.customerListPrefix() }),
      ]);

      const snapshot = captureTradeInCacheSnapshot(queryClient, orderId);

      syncTransitionStatusCaches(queryClient, orderId, nextStatus);

      return {
        ...snapshot,
        nextStatus,
      };
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      restoreTradeInCacheSnapshot(queryClient, orderId, context);
    },
    onSuccess: (response, _variables, context) => {
      const confirmedStatus = normalizeTradeInStatus(response.data?.status || context?.nextStatus);
      if (!confirmedStatus) {
        return;
      }

      syncTransitionStatusCaches(queryClient, orderId, confirmedStatus);
    },
    onSettled: () => {
      invalidateTradeInCaches(queryClient, orderId);
    },
  });
};

export const useConfirmTradeInDeal = (orderId: string) => {
  const queryClient = useQueryClient();
  const confirmedStatus = 'CONFIRMED';

  return useMutation<TradeInActionResponse, Error, ConfirmTradeInDealPayload, ConfirmTradeInDealContext>({
    mutationFn: ({ tradeInPrice }) => {
      if (!Number.isFinite(tradeInPrice) || tradeInPrice < 0) {
        throw new Error('Trade-in price is invalid.');
      }
      return tradeInOrderService.confirmDeal(orderId, tradeInPrice);
    },
    onMutate: async ({ fromStatus, tradeInPrice }) => {
      if (!Number.isFinite(tradeInPrice) || tradeInPrice < 0) {
        throw new Error('Trade-in price is invalid.');
      }

      await Promise.all([
        queryClient.cancelQueries({ queryKey: tradeInOrderKeys.detail(orderId) }),
        queryClient.cancelQueries({ queryKey: tradeInOrderKeys.customerDetail(orderId) }),
        queryClient.cancelQueries({ queryKey: tradeInOrderKeys.listPrefix() }),
        queryClient.cancelQueries({ queryKey: tradeInOrderKeys.waitingPrefix() }),
        queryClient.cancelQueries({ queryKey: tradeInOrderKeys.customerListPrefix() }),
      ]);

      const snapshot = captureTradeInCacheSnapshot(queryClient, orderId);
      const resolvedFromStatus =
        fromStatus
        || snapshot.previousAdminDetail?.status
        || snapshot.previousCustomerDetail?.status;
      const normalizedFromStatus = toTradeInStatus(resolvedFromStatus);

      if (normalizedFromStatus && !canTransitionTradeInStatus(normalizedFromStatus, confirmedStatus)) {
        throw new Error(`Invalid trade-in transition: ${resolvedFromStatus} -> ${confirmedStatus}`);
      }

      syncConfirmDealCaches(queryClient, orderId, tradeInPrice, confirmedStatus);

      return {
        ...snapshot,
        nextStatus: confirmedStatus,
        tradeInPrice,
      };
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      restoreTradeInCacheSnapshot(queryClient, orderId, context);
    },
    onSuccess: (response, _variables, context) => {
      const nextStatus = normalizeTradeInStatus(response.data?.status || context?.nextStatus || confirmedStatus);
      const nextTradeInPrice =
        typeof response.data?.tradeInPrice === 'number'
          ? response.data.tradeInPrice
          : context?.tradeInPrice;

      if (typeof nextTradeInPrice === 'number') {
        syncConfirmDealCaches(queryClient, orderId, nextTradeInPrice, nextStatus || confirmedStatus);
      } else {
        syncTransitionStatusCaches(queryClient, orderId, nextStatus || confirmedStatus);
      }
    },
    onSettled: () => {
      invalidateTradeInCaches(queryClient, orderId);
    },
  });
};


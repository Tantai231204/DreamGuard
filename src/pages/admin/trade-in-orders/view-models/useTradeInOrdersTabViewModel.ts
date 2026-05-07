import { useCallback, useMemo, useState } from 'react';
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';

import {
  useAdminTradeInOrders,
  useWaitingTradeInOrders,
  paymentKeys,
  tradeInOrderKeys,
} from '@/hooks/queries';
import { useAdminTableSync } from '@/hooks/admin/useAdminTableSync';
import { usePermission } from '@/hooks/usePermission';
import { toApiStatus, isTradeInAdminCancelableStatus, isTradeInFinalStatus } from '@/utils/tradeInWorkflow';

import { tradeInOrderService, paymentService } from '@/api/services';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { buildTradeInStatusOptions } from '../utils/tradeInStatus';
import { useTradeInOrderColumns } from '../hooks/useTradeInOrderColumns';
import type { TradeInOrderListItem } from '@/api/types/tradeInOrder';

export const TRADE_IN_ORDERS_DEFAULT_PAGE_SIZE = 40;
export const TRADE_IN_ORDERS_VIRTUALIZE_THRESHOLD = 30;

export const useTradeInOrdersTabViewModel = () => {
  const queryClient = useQueryClient();
  const { isSeller } = usePermission();
  const {
    pagination,
    setPagination,
    globalFilter,
    setGlobalFilter,
    debouncedFilter,
    setFieldFilter,
    getFieldFilter,
  } = useAdminTableSync(TRADE_IN_ORDERS_DEFAULT_PAGE_SIZE);

  const [sorting, setSorting] = useState<SortingState>([]);
  const statusFilter = getFieldFilter('status', 'all');

  // Cancel Dialog State
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isRefundOnly, setIsRefundOnly] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<TradeInOrderListItem | null>(null);

  const queryParams = useMemo(
    () => ({
      pageNumber: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      key: debouncedFilter || undefined,
      search: debouncedFilter || undefined,
      status: statusFilter !== 'all' ? toApiStatus(statusFilter) : undefined,
    }),
    [debouncedFilter, pagination.pageIndex, pagination.pageSize, statusFilter],
  );

  const adminQuery = useAdminTradeInOrders(queryParams, { enabled: !isSeller });
  const waitingQuery = useWaitingTradeInOrders(
    {
      pageNumber: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
      key: queryParams.key,
    },
    { enabled: isSeller }
  );

  const activeQuery = isSeller ? waitingQuery : adminQuery;

  const {
    data,
    isPending,
    isRefetching,
    refetch,
  } = activeQuery;

  const rows = useMemo(() => data?.items ?? [], [data]);
  const pageCount = data?.totalPages ?? -1;
  const statusOptions = useMemo(() => buildTradeInStatusOptions(rows), [rows]);

  // Comprehensive logic for identifying orders requiring financial settlement
  const pendingRefundCount = useMemo(() => {
    if (!adminQuery.data?.items) return 0;
    return adminQuery.data.items.filter(r => {
      const s = r.status.toUpperCase();
      const ps = r.paymentStatus?.toUpperCase() || '';
      
      // Match any termination state that involves a paid deposit not yet settled
      const isTerminated = s.includes('CANCEL') || s.includes('REJECTED');
      const hasValueToReturn = (r.depositAmount || 0) > 0;
      const isSettled = ps.includes('REFUND') || s.includes('REFUND');
      
      return isTerminated && hasValueToReturn && !isSettled;
    }).length;
  }, [adminQuery.data?.items]);

  const { mutate: cancelMutation, isPending: isCancelling } = useMutation({
    mutationFn: async ({
      id,
      reason,
      refundAmount,
      evidenceUrls,
      type
    }: {
      id: string;
      reason: string;
      refundAmount?: number;
      evidenceUrls?: string[];
      type: 'cancel' | 'refund';
    }) => {
      // 1. Order Termination
      if (type === 'cancel') {
        await tradeInOrderService.adminCancel(id, reason);
      }

      // 2. Financial Settlement
      let refundId: string | undefined;
      if (typeof refundAmount === 'number' && refundAmount > 0) {
        const refundObj = await paymentService.createAdminRefund({
          tradeInOrderId: id,
          amount: refundAmount,
          reason: "Return",
        });
        refundId = refundObj?.id;
      }

      // 3. Post-Settlement Linking
      if (evidenceUrls && evidenceUrls.length > 0 && refundId) {
        await paymentService.updateRefundStatus(refundId, "Refunding", undefined, evidenceUrls[0]);
      }
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.all });
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      toast.success(variables.type === 'refund' ? 'Financial settlement finalized.' : 'Trade-in request has been terminated and settled.');
      setIsCancelOpen(false);
      setOrderToCancel(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Workflow termination encountered a failure.');
    }
  });

  const handleCancelClick = useCallback((order: TradeInOrderListItem, refundOnly: boolean = false) => {
    if (!refundOnly && !isTradeInAdminCancelableStatus(order.status) && !isTradeInFinalStatus(order.status)) {
      return;
    }

    setOrderToCancel(order);
    setIsRefundOnly(refundOnly);
    setIsCancelOpen(true);
  }, []);

  const handleConfirmCancel = useCallback(
    async (payload: {
      reason: string;
      refundAmount?: number;
      evidenceUrls?: string[];
      shouldCreateReturn?: boolean;
      type: 'cancel' | 'refund';
    }) => {
      if (orderToCancel && (payload.type === 'refund' || isTradeInAdminCancelableStatus(orderToCancel.status) || isTradeInFinalStatus(orderToCancel.status))) {
        cancelMutation({
          id: orderToCancel.tradeInOrderId,
          reason: payload.reason,
          refundAmount: payload.refundAmount,
          evidenceUrls: payload.evidenceUrls,
          type: payload.type
        });
      }
    },
    [cancelMutation, orderToCancel],
  );

  const columns = useTradeInOrderColumns(handleCancelClick);

  const table = useReactTable({
    data: rows,
    columns,
    pageCount,
    state: {
      sorting,
      pagination,
      globalFilter,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    manualPagination: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleSearchChange = useCallback((value: string) => {
    setGlobalFilter(value);
  }, [setGlobalFilter]);

  const handleStatusChange = useCallback((value: string) => {
    setFieldFilter('status', value);
  }, [setFieldFilter]);

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  return {
    table,
    rows,
    isPending,
    isRefetching,
    globalFilter,
    statusFilter,
    statusOptions,
    handleSearchChange,
    handleStatusChange,
    handleRefresh,
    resultCount: data?.totalCount ?? 0,
    shouldVirtualize: rows.length >= TRADE_IN_ORDERS_VIRTUALIZE_THRESHOLD,

    // Cancel logic 
    isCancelOpen,
    setIsCancelOpen,
    isRefundOnly,
    orderToCancel,
    isCancelling,
    handleConfirmCancel,
    totalPriceToRefund: orderToCancel?.depositAmount || orderToCancel?.amountToPay || 0,
    paymentMethod: orderToCancel?.paymentMethod,
    paymentStatus: orderToCancel?.paymentStatus,
    pendingRefundCount,
  };
};

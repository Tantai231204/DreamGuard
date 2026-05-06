import { useCallback, useMemo, useState } from 'react';
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';

import {
  useAdminTradeInOrders,
  useWaitingTradeInOrders,
  paymentKeys,
  tradeInOrderKeys,
} from '@/hooks/queries';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermission } from '@/hooks/usePermission';
import { isTradeInAdminCancelableStatus, isTradeInFinalStatus } from '@/utils/tradeInWorkflow';

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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: TRADE_IN_ORDERS_DEFAULT_PAGE_SIZE,
  });

  // Cancel Dialog State
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isRefundOnly, setIsRefundOnly] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<TradeInOrderListItem | null>(null);

  const debouncedFilter = useDebounce(globalFilter, 500);

  const queryParams = useMemo(
    () => ({
      pageNumber: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      key: debouncedFilter || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    }),
    [debouncedFilter, pagination.pageIndex, pagination.pageSize, statusFilter],
  );

  const adminQuery = useAdminTradeInOrders(queryParams, { enabled: !isSeller });
  const waitingQuery = useWaitingTradeInOrders(
    {
      pageNumber: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
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
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleSearchChange = useCallback((value: string) => {
    setGlobalFilter(value);
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, []);

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
    pendingRefundCount: adminQuery.data?.items?.filter(r => {
      const s = r.status.toUpperCase();
      const ps = r.paymentStatus?.toUpperCase() || '';
      return s === 'CANCELLED' && 
             r.depositAmount > 0 &&
             !ps.includes('REFUND') &&
             !s.includes('REFUND');
    }).length || 0,
  };
};

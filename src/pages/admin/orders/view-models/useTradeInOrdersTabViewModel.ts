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
  useAdminCancelTradeInOrder,
  useWaitingTradeInOrders,
} from '@/hooks/queries';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermission } from '@/hooks/usePermission';

import { buildTradeInStatusOptions } from '../components/tradeInStatus';
import { useTradeInOrderColumns } from '../components/useTradeInOrderColumns';
import type { TradeInOrderListItem } from '@/api/types/tradeInOrder';

export const TRADE_IN_ORDERS_DEFAULT_PAGE_SIZE = 40;
export const TRADE_IN_ORDERS_VIRTUALIZE_THRESHOLD = 30;

export const useTradeInOrdersTabViewModel = () => {
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
    refetch,
    isRefetching,
  } = activeQuery;

  const rows = useMemo(() => data?.items ?? [], [data]);
  const pageCount = data?.totalPages ?? -1;
  const statusOptions = useMemo(() => buildTradeInStatusOptions(rows), [rows]);

  const { mutate: cancelMutation, isPending: isCancelling } = useAdminCancelTradeInOrder();

  const handleCancelClick = useCallback((order: TradeInOrderListItem) => {
    setOrderToCancel(order);
    setIsCancelOpen(true);
  }, []);

  const handleConfirmCancel = useCallback((reason: string) => {
    if (orderToCancel) {
      cancelMutation(
        { id: orderToCancel.tradeInOrderId, reason },
        {
          onSuccess: () => {
            setIsCancelOpen(false);
            setOrderToCancel(null);
          },
        }
      );
    }
  }, [cancelMutation, orderToCancel]);

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
    orderToCancel,
    isCancelling,
    handleConfirmCancel,
  };
};

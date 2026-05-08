import { useCallback, useMemo, useState } from 'react';
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';
import { toast } from 'sonner';

import type { CheckoutOrderResponse } from '@/api/types/checkoutOrder';
import { useAdminTableSync } from '@/hooks/admin/useAdminTableSync';
import { useAdminCheckoutOrders, useCancelCheckoutOrder } from '@/hooks/queries/useCheckoutOrder';
import { downloadCSV } from '@/lib/export';

import { useOrderColumns } from '../components/useOrderColumns';

export const PRODUCT_ORDERS_DEFAULT_PAGE_SIZE = 10;

export const useProductOrdersTabViewModel = () => {
  const {
    pagination,
    setPagination,
    globalFilter,
    setGlobalFilter,
    debouncedFilter,
    setFieldFilter,
    getFieldFilter,
  } = useAdminTableSync(PRODUCT_ORDERS_DEFAULT_PAGE_SIZE);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<CheckoutOrderResponse | null>(null);
  const cancelOrderMutation = useCancelCheckoutOrder();

  const rawStatus = getFieldFilter('status', 'all');
  const statusFilter = useMemo(() => {
    if (!rawStatus || rawStatus === 'all') return 'all';
    // Normalize to Title Case to match UI tab options
    return rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
  }, [rawStatus]);

  const onCancelRequested = useCallback((order: CheckoutOrderResponse) => {
    setOrderToCancel(order);
    setIsCancelOpen(true);
  }, []);

  const columns = useOrderColumns(onCancelRequested);

  const queryParams = useMemo(
    () => ({
      pageNumber: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      search: debouncedFilter || undefined,
      sortBy: sorting[0]?.id,
      sortOrder: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
    }),
    [debouncedFilter, pagination.pageIndex, pagination.pageSize, sorting],
  );

  const { data: orderData, isPending } = useAdminCheckoutOrders(queryParams as import('@/api/types/checkoutOrder').CheckoutOrderQueryParams);

  const rows = useMemo(() => {
    const rawItems = orderData?.items ?? [];
    if (statusFilter === 'all') return rawItems;

    // Perform client-side filtering since BE doesn't support it
    return rawItems.filter(order => {
      const status = order.status?.toString().toLowerCase();
      return status === statusFilter.toLowerCase();
    });
  }, [orderData, statusFilter]);

  const resultCount = useMemo(() => {
    if (statusFilter === 'all') return orderData?.totalCount ?? 0;
    return rows.length;
  }, [rows.length, statusFilter, orderData?.totalCount]);

  const pageCount = useMemo(() => {
    if (statusFilter === 'all') return orderData?.totalPages ?? -1;
    return Math.ceil(rows.length / pagination.pageSize);
  }, [rows.length, statusFilter, orderData?.totalPages, pagination.pageSize]);

  // Identify orders needing attention (Cancelled but not fully refunded)
  const pendingRefundCount = useMemo(() => {
    if (!orderData?.items) return 0;
    return orderData.items.filter(order =>
      order.status === 'Cancelled' &&
      order.refundingAmount > 0
    ).length;
  }, [orderData?.items]);

  const handleExport = useCallback(() => {
    const exportData = rows.map((order) => ({
      Code: order.checkoutOrderCode,
      Total: order.totalAmount,
      Status: order.status,
      Date: order.createdAt,
    }));
    downloadCSV(exportData, 'Orders_Export');
  }, [rows]);

  const handleStatusChange = useCallback((status: string) => {
    setFieldFilter('status', status);
  }, [setFieldFilter]);

  const table = useReactTable({
    data: rows,
    columns,
    pageCount,
    state: { sorting, columnFilters, globalFilter, rowSelection, pagination },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    manualPagination: true,
    manualFiltering: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleConfirmCancel = useCallback(
    async () => {
      if (!orderToCancel) {
        return;
      }

      try {
        await cancelOrderMutation.mutateAsync(orderToCancel.id);
        toast.success(`Order ${orderToCancel.checkoutOrderCode} cancelled successfully`);
        setIsCancelOpen(false);
        setOrderToCancel(null);
      } catch {
        // Error toast is handled centrally by mutation meta/interceptor.
      }
    },
    [cancelOrderMutation, orderToCancel],
  );

  return {
    table,
    globalFilter,
    setGlobalFilter,
    statusFilter,
    handleStatusChange,
    isPending,
    resultCount,
    pendingRefundCount,
    handleExport,
    isCancelOpen,
    setIsCancelOpen,
    orderToCancel,
    handleConfirmCancel,
    isCancelling: cancelOrderMutation.isPending,
  };
};

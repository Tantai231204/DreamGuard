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
import { useCheckoutOrders, useCancelCheckoutOrder } from '@/hooks/queries/useCheckoutOrder';
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
  } = useAdminTableSync(PRODUCT_ORDERS_DEFAULT_PAGE_SIZE);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<CheckoutOrderResponse | null>(null);
  const cancelOrderMutation = useCancelCheckoutOrder();

  const statusFilter = useMemo(() => {
    const filter = columnFilters.find((item) => item.id === 'status');
    if (!filter) {
      return undefined;
    }

    if (Array.isArray(filter.value)) {
      return filter.value as string[];
    }

    if (typeof filter.value === 'string' && filter.value.trim()) {
      return [filter.value];
    }

    return undefined;
  }, [columnFilters]);

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
      status: statusFilter,
      sortBy: sorting[0]?.id,
      sortOrder: sorting[0] ? (sorting[0].desc ? 'desc' : 'asc') : undefined,
    }),
    [debouncedFilter, pagination.pageIndex, pagination.pageSize, sorting, statusFilter],
  );

  const { data: orderData, isPending } = useCheckoutOrders(queryParams as import('@/api/types/checkoutOrder').CheckoutOrderQueryParams);

  const rows = useMemo(() => orderData?.items ?? [], [orderData]);
  const pageCount = orderData?.totalPages ?? -1;

  const handleExport = useCallback(() => {
    const exportData = rows.map((order) => ({
      Code: order.checkoutOrderCode,
      Total: order.totalAmount,
      Status: order.status,
      Date: order.createdAt,
    }));
    downloadCSV(exportData, 'Orders_Export');
  }, [rows]);

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
    isPending,
    resultCount: orderData?.totalCount ?? 0,
    handleExport,
    isCancelOpen,
    setIsCancelOpen,
    orderToCancel,
    handleConfirmCancel,
    isCancelling: cancelOrderMutation.isPending,
  };
};

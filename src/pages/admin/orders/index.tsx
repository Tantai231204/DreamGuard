import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    type SortingState,
    type ColumnFiltersState,
    type RowSelectionState,
} from '@tanstack/react-table'
import { ShoppingCart } from 'lucide-react'

import AdminPageHeader from '@/components/layout/AdminPageHeader'
import { AdminTableSearch, AdminTableContent, AdminTablePagination, AdminActions } from '@/components/admin'

import { useOrderColumns, CancelOrderDialog } from './components'
import { useAdminOrders, useAdminCancelOrder } from '@/hooks/queries'
import { downloadCSV } from '@/lib/export'
import { toast } from 'sonner'
import type { OrderResponse } from '@/api/types/order'
import { useAdminTableSync } from '@/hooks/admin/useAdminTableSync'

/**
 * High-Performance Order Management
 * Optimized with useAdminTableSync for atomic URL synchronization
 * Features unified loading skeletons and streamlined state logic
 */
export default function OrderManagement() {
    const {
        pagination,
        setPagination,
        globalFilter,
        setGlobalFilter,
        debouncedFilter
    } = useAdminTableSync(10);

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

    // Cancellation State
    const [isCancelOpen, setIsCancelOpen] = useState(false)
    const [orderToCancel, setOrderToCancel] = useState<OrderResponse | null>(null)
    const cancelOrderMutation = useAdminCancelOrder()

    const statusFilter = useMemo(() => {
        const filter = columnFilters.find(f => f.id === 'status')
        return filter ? (filter.value as string[]) : undefined
    }, [columnFilters])

    const onCancelRequested = useCallback((order: OrderResponse) => {
        setOrderToCancel(order);
        setIsCancelOpen(true);
    }, []);

    const columns = useOrderColumns(onCancelRequested)

    const { data: orderData, isPending } = useAdminOrders({
        pageNumber: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        search: debouncedFilter,
        status: statusFilter,
        sortBy: sorting[0]?.id,
        sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
    })

    const handleConfirmCancel = async (reason: string) => {
        if (!orderToCancel) return;
        cancelOrderMutation.mutate({ id: orderToCancel.id, reason }, {
            onSuccess: () => {
                toast.success(`Order ${orderToCancel.orderCode} cancelled successfully`);
                setIsCancelOpen(false);
                setOrderToCancel(null);
            }
        });
    };

    const data = useMemo(() => orderData?.items ?? [], [orderData])
    const pageCount = orderData?.totalPages ?? -1

    const handleExport = useCallback(() => {
        const exportData = data.map(order => ({
            Code: order.orderCode,
            Total: order.totalAmount,
            Status: order.status,
            Date: order.createdAt
        }))
        downloadCSV(exportData, 'Orders_Export')
    }, [data])

    const table = useReactTable({
        data,
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
    })

    return (
        <div className="flex flex-col h-full">
            <AdminPageHeader
                title="Order Management"
                description="Monitor and process customer orders in real-time"
                icon={ShoppingCart}
                stats={[
                    { label: 'Today', value: orderData?.totalCount || 0 },
                    { label: 'Pending', value: data.filter(o => o.status === 0).length }
                ]}
            />

            <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex-1 bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-xl m-6 flex flex-col">
                    <AdminTableSearch
                        table={table}
                        value={globalFilter}
                        onChange={setGlobalFilter}
                        placeholder="Search orders, customers..."
                        resultCount={orderData?.totalCount || 0}
                        resultLabel="orders"
                        actions={<AdminActions onExport={handleExport} />}
                    />

                    <div className="flex-1 overflow-auto bg-white border-y border-gray-100">
                        <AdminTableContent
                            table={table}
                            emptyMessage="No results match your current inquiry."
                            isLoading={isPending}
                        />
                    </div>

                    <div className="p-4 bg-white border-t border-gray-100">
                        <AdminTablePagination table={table} itemLabel="orders" />
                    </div>
                </motion.div>
            </div>

            <CancelOrderDialog
                open={isCancelOpen}
                onOpenChange={setIsCancelOpen}
                orderCode={orderToCancel?.orderCode || ''}
                onConfirm={handleConfirmCancel}
                isLoading={cancelOrderMutation.isPending}
            />
        </div>
    )
}

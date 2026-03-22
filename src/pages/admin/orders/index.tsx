import { useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    type SortingState,
    type ColumnFiltersState,
    type RowSelectionState,
    type Updater,
    type PaginationState,
} from '@tanstack/react-table'
import { ShoppingCart } from 'lucide-react'

import AdminPageHeader from '@/components/layout/AdminPageHeader'
import { AdminTableSearch, AdminTableContent, AdminTablePagination, AdminActions, AdminBulkActions } from '@/components/admin'

import { useOrderColumns } from './components'
import { useAdminOrders } from '@/hooks/queries'
import { useDebounce } from '@/hooks/useDebounce'
import { downloadCSV } from '@/lib/export'

export default function OrderManagement() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    
    const pagination = useMemo(() => ({
        pageIndex: parseInt(searchParams.get('page') || '1') - 1,
        pageSize: parseInt(searchParams.get('pageSize') || '10'),
    }), [searchParams])

    const globalFilter = searchParams.get('search') || ''

    const setPagination = useCallback((updaterOrValue: Updater<PaginationState>) => {
        const next = typeof updaterOrValue === 'function' ? updaterOrValue(pagination) : updaterOrValue;
        setSearchParams((prev) => {
            prev.set('page', String(next.pageIndex + 1));
            prev.set('pageSize', String(next.pageSize));
            return prev;
        });
    }, [pagination, setSearchParams]);

    const setGlobalFilter = useCallback((value: string) => {
        setSearchParams((prev) => {
            if (value) prev.set('search', value);
            else prev.delete('search');
            prev.set('page', '1');
            return prev;
        });
    }, [setSearchParams]);

    const debouncedSearch = useDebounce(globalFilter, 500)

    const statusFilter = useMemo(() => {
        const filter = columnFilters.find(f => f.id === 'status')
        return filter ? (filter.value as string[]) : undefined
    }, [columnFilters])

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

    const columns = useOrderColumns()

    const { data: orderData, isPending } = useAdminOrders({
        pageNumber: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        search: debouncedSearch,
        status: statusFilter,
        sortBy: sorting[0]?.id,
        sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
    })

    const data = useMemo(() => orderData?.items ?? [], [orderData])
    const pageCount = orderData?.totalPages ?? -1

    const handleExport = useCallback(() => {
        const exportData = data.map(order => ({
            ID: order.id || '',
            Code: order.orderCode || '',
            ItemCount: order.itemCount || 0,
            Total: order.totalAmount || 0,
            Status: order.status || '',
            Date: order.createdAt || ''
        }));
        downloadCSV(exportData, 'Orders');
    }, [data]);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            rowSelection,
            pagination,
        },

        onPaginationChange: setPagination,
        manualPagination: true,
        pageCount: pageCount,

        onSortingChange: setSorting,
        manualSorting: true,
        enableSorting: true,

        onColumnFiltersChange: setColumnFilters,
        manualFiltering: true,

        onGlobalFilterChange: setGlobalFilter,
        enableGlobalFilter: true,

        onRowSelectionChange: setRowSelection,
        enableRowSelection: true,

        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <div className="flex flex-col h-full">
            <AdminPageHeader
                title="Order Management"
                description="Track and manage all customer orders"
                icon={ShoppingCart}
                stats={[
                    { label: 'Total Orders', value: orderData?.totalCount || 0 },
                    { label: 'Total Pages', value: orderData?.totalPages || 0 },
                    { label: 'Current Page', value: orderData?.pageNumber || 0 },
                ]}
            />

            <div className="flex-1 overflow-hidden bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="m-6 bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-xl flex flex-col h-[calc(100%-3rem)]"
                >
                    <AdminBulkActions
                        table={table}
                        itemLabel="order"
                        accentColor="blue"
                        onDelete={() => console.log('Delete selected')}
                    />

                    <AdminActions
                        onFilter={() => console.log('Filter')}
                        onExport={handleExport}
                        onImport={() => console.log('Import')}
                    />

                    <AdminTableSearch
                        value={globalFilter}
                        onChange={setGlobalFilter}
                        placeholder="Search orders by order ID or code..."
                        table={table}
                    />
                    <div className="flex-1 overflow-auto">
                        <AdminTableContent
                            table={table}
                            emptyMessage="No orders found"
                            isLoading={isPending}
                        />
                    </div>
                    <AdminTablePagination
                        table={table}
                        itemLabel="orders"
                    />
                </motion.div>
            </div>
        </div>
    )
}

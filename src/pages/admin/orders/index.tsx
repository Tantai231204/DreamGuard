import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    type ColumnFiltersState,
    type RowSelectionState,
    type Row,
} from '@tanstack/react-table'
import { ShoppingCart } from 'lucide-react'

import AdminPageHeader from '@/components/layout/AdminPageHeader'
import { AdminTableSearch, AdminTableContent, AdminTablePagination, AdminActions, AdminBulkActions } from '@/components/admin'

import { useOrderColumns } from './components'
import { useAdminOrders } from '@/hooks/queries'
import type { OrderResponse } from '@/api/types/order'

/* =======================
   Global Search Function
======================= */
const globalFilterFn = (
    row: Row<OrderResponse>,
    _columnId: string,
    filterValue: string
): boolean => {
    if (!filterValue?.trim()) return true

    const search = filterValue.toLowerCase().trim()
    const { id, orderCode } = row.original

    return (
        id.toLowerCase().includes(search) ||
        orderCode?.toLowerCase().includes(search)
    )
}

export default function OrderManagement() {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    const columns = useOrderColumns()

    const { data: orderData, isPending } = useAdminOrders({
        pageNumber: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
    })

    const data = useMemo(() => orderData?.items ?? [], [orderData])
    const pageCount = orderData?.totalPages ?? -1

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

        /* Pagination */
        onPaginationChange: setPagination,
        manualPagination: true,
        pageCount: pageCount,

        /* Sorting */
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        enableSorting: true,

        /* Column filter */
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),

        /* Global search */
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: globalFilterFn,
        enableGlobalFilter: true,

        /* Row selection */
        onRowSelectionChange: setRowSelection,
        enableRowSelection: true,

        /* Core + pagination */
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),

        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
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
                    {/* Bulk Actions */}
                    <AdminBulkActions
                        table={table}
                        itemLabel="order"
                        accentColor="blue"
                        onDelete={() => console.log('Delete selected')}
                    />

                    {/* Actions Toolbar */}
                    <AdminActions
                        onFilter={() => console.log('Filter')}
                        onExport={() => console.log('Export')}
                        onImport={() => console.log('Import')}
                        onAdd={() => console.log('Add order')}
                        addLabel="Add Order"
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
                            emptyMessage={isPending ? "Loading orders..." : "No orders found"}
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

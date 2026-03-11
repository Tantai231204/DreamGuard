import { useState, useMemo } from 'react'
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
import { AdminTableSearch, AdminTableContent, AdminTablePagination, AdminActions, AdminBulkActions } from '@/components/admin'

import { useOrderColumns } from './components'
import { useAdminOrders } from '@/hooks/queries'
import { useDebounce } from '@/hooks/useDebounce'

export default function OrderManagement() {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const debouncedSearch = useDebounce(globalFilter, 500)

    // Extract status filters for API
    const statusFilter = useMemo(() => {
        const filter = columnFilters.find(f => f.id === 'status')
        return filter ? (filter.value as string[]) : undefined
    }, [columnFilters])

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

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
        manualSorting: true, // Server-side sorting
        enableSorting: true,

        /* Column filter */
        onColumnFiltersChange: setColumnFilters,
        manualFiltering: true, // Server-side filtering

        /* Global search */
        onGlobalFilterChange: setGlobalFilter,
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

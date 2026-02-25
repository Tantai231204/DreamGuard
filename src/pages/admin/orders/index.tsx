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

import { mockOrders } from '../data'
import type { Order } from '../types'
import { useOrderStats } from './hooks/useOrderStats'
import { useOrderColumns } from './components'

/* =======================
   Global Search Function
======================= */
const globalFilterFn = (
    row: Row<Order>,
    _columnId: string,
    filterValue: string
): boolean => {
    if (!filterValue?.trim()) return true

    const search = filterValue.toLowerCase().trim()
    const { id, customerName, email, products } = row.original

    return (
        id.toLowerCase().includes(search) ||
        customerName.toLowerCase().includes(search) ||
        email.toLowerCase().includes(search) ||
        products.toLowerCase().includes(search)
    )
}

export default function OrderManagement() {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

    const columns = useOrderColumns()
    const stats = useOrderStats()

    const data = useMemo(() => mockOrders, [])

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            rowSelection,
        },

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
                    { label: 'Total', value: stats.total },
                    { label: 'Revenue', value: `₫${stats.revenue.toLocaleString('vi-VN')}` },
                    { label: 'Pending', value: stats.pending },
                    { label: 'Delivered', value: stats.delivered },
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
                        onEdit={() => console.log('Edit selected')}
                        onDuplicate={() => console.log('Duplicate selected')}
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
                        placeholder="Search orders by name, email, or order ID..."
                        table={table}
                    />
                    <div className="flex-1 overflow-auto">
                        <AdminTableContent 
                            table={table}
                            emptyMessage="No orders found"
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

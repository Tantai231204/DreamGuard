import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    type ColumnFiltersState,
} from '@tanstack/react-table';
import { ShoppingCart, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { mockOrders } from '../data';
import type { Order } from '../types';
import { useOrderStats } from './hooks/useOrderStats';
import {
    OrderTableSearch,
    OrderTableContent,
    OrderTablePagination,
    useOrderColumns,
} from './components';

// Custom global filter function - searches across multiple fields
const globalFilterFn = (
    row: { original: Order },
    _columnId: string,
    filterValue: string
): boolean => {
    if (!filterValue || filterValue.trim() === '') return true;
    
    const searchValue = filterValue.toLowerCase().trim();
    const { id, customerName, email, products } = row.original;

    return (
        id.toLowerCase().includes(searchValue) ||
        customerName.toLowerCase().includes(searchValue) ||
        email.toLowerCase().includes(searchValue) ||
        products.toLowerCase().includes(searchValue)
    );
};

export default function OrderManagement() {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const columns = useOrderColumns();
    const stats = useOrderStats();

    // Memoize table data to prevent unnecessary re-renders
    const data = useMemo(() => mockOrders, []);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        // Core row models
        getCoreRowModel: getCoreRowModel(),
        // Sorting
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        enableSorting: true,
        // Column Filters  
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        // Global Filter
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: globalFilterFn,
        // Pagination
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
        // Debug mode (remove in production)
        // debugTable: true,
    });

    return (
        <div className="p-8 space-y-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
            {/* Header */}
            <AdminPageHeader
                title="Order Management"
                description="Track and manage all customer orders"
                icon={ShoppingCart}
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'Orders' },
                ]}
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                }
                stats={[
                    { label: 'Total', value: stats.total },
                    { label: 'Revenue', value: `$${stats.revenue.toFixed(2)}` },
                    { label: 'Pending', value: stats.pending },
                    { label: 'Delivered', value: stats.delivered },
                ]}
            />

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-xl"
            >
                <OrderTableSearch 
                    value={globalFilter} 
                    onChange={setGlobalFilter} 
                    table={table} 
                />
                <OrderTableContent table={table} />
                <OrderTablePagination table={table} />
            </motion.div>
        </div>
    );
}

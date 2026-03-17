import { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    type SortingState,
    type ColumnFiltersState,
    type RowSelectionState,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';
import {
    AdminTableSearch,
    AdminTableContent,
    AdminTablePagination,
    AdminBulkActions,
} from '@/components/admin';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common';
import { useAdminServicePackages, useUpdateServicePackageStatus } from '@/hooks/queries/useServicePackage';
import { useServicePackageColumns } from '@/pages/admin/service-packages/components/useServicePackageColumns';
import { useToast } from '@/hooks/useToast';
import type { ServicePackage } from '@/api/services/servicePackageService';
import { Plus } from 'lucide-react';

export function ServicePackagesTab() {
    const toast = useToast();
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    // Fetch API Data
    const { data, isLoading, isError, error } = useAdminServicePackages({
        pageNumber: 1,
        pageSize: 10
    });

    const packages = useMemo(() => data?.items ?? [], [data]);

    // Status mutation
    const updateStatusMutation = useUpdateServicePackageStatus();

    const handleEdit = useMemo(() => (pkg: ServicePackage) => {
        console.log('Edit in tab currently logged', pkg.id);
    }, []);

    const handleToggleStatus = useMemo(() => (pkg: ServicePackage) => {
        const newStatus = pkg.status === 'Active' ? 'Inactive' : 'Active';
        updateStatusMutation.mutate({ id: pkg.id, status: newStatus }, {
            onSuccess: () => toast.success('Status updated', `Package is now ${newStatus}`)
        });
    }, [updateStatusMutation, toast]);

    const columns = useServicePackageColumns({ onEdit: handleEdit, onToggleStatus: handleToggleStatus });

    const table = useReactTable({
        data: packages,
        columns,
        state: { sorting, globalFilter, columnFilters, rowSelection },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col"
            >
                <div className="flex flex-col h-full overflow-hidden">
                    <AdminBulkActions table={table} itemLabel="package" accentColor="blue" />

                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <AdminTableSearch
                            table={table}
                            value={globalFilter}
                            onChange={setGlobalFilter}
                            placeholder="Search description or name..."
                            resultCount={table.getFilteredRowModel().rows.length}
                            resultLabel="packages"
                        />
                        <Button onClick={() => console.log('Create novel package')} className="gap-2 bg-gradient-to-r from-[var(--color-primary)] to-blue-600">
                            <Plus className="w-4 h-4" /> Add Package
                        </Button>
                    </div>

                    <div className="flex-1 overflow-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-48"><LoadingSpinner /></div>
                        ) : (
                            <AdminTableContent table={table} emptyMessage={isError ? `Failed to load: ${error?.message}` : "No service packages found"} />
                        )}
                    </div>

                    <AdminTablePagination table={table} itemLabel="packages" />
                </div>
            </motion.div>
        </div>
    );
}

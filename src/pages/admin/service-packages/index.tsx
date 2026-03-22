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
import { Package } from 'lucide-react';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import {
    AdminTableSearch,
    AdminTableContent,
    AdminTablePagination,
    AdminBulkActions,
    AdminActions,
} from '@/components/admin';

import { LoadingSpinner } from '@/components/common';
import { useToast } from '@/hooks/useToast';
import ServicePackageDialog, { type PackageFormData } from './components/ServicePackageDialog';
import { useServicePackageColumns } from './components/useServicePackageColumns';
import {
    useAdminServicePackages,
    useCreateServicePackage,
    useUpdateServicePackage,
    useUpdateServicePackageStatus,
    useReplacePackageImage
} from '@/hooks/queries/useServicePackage';
import type { ServicePackage } from '@/api/services/servicePackageService';

export default function ServicePackagesPage() {
    const toast = useToast();
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    
    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);

    // Fetch API Data with pagination/filters if needed
    const { data, isLoading, isError, error } = useAdminServicePackages({
        pageNumber: 1, // Add pagination state if scaling upwards
        pageSize: 10
    });
    
    const packages = useMemo(() => data?.items ?? [], [data]);

    // Mutations
    const createMutation = useCreateServicePackage();
    const updateMutation = useUpdateServicePackage();
    const updateStatusMutation = useUpdateServicePackageStatus();
    const replaceImageMutation = useReplacePackageImage();

    const handleAdd = useMemo(() => () => {
        setEditingPackage(null);
        setDialogOpen(true);
    }, []);

    const handleEdit = useMemo(() => (pkg: ServicePackage) => {
        setEditingPackage(pkg);
        setDialogOpen(true);
    }, []);

    const handleToggleStatus = useMemo(() => (pkg: ServicePackage) => {
        const newStatus = pkg.status === 'Active' ? 'Inactive' : 'Active';
        updateStatusMutation.mutate({ id: pkg.id, status: newStatus }, {
            onSuccess: () => toast.success('Status updated', `Package is now ${newStatus}`)
        });
    }, [updateStatusMutation, toast]);

    const handleSubmit = async (formData: PackageFormData) => {
        const body = new FormData();
        body.append('PackageName', formData.packageName);
        body.append('Description', formData.description || '');
        body.append('ServiceContent', formData.serviceContent || '');
        body.append('SuitableFor', formData.suitableFor || '');
        body.append('Benefits', formData.benefits || '');
        body.append('Price', String(formData.price));
        body.append('Duration', String(formData.duration));
        body.append('Status', formData.status);

        if (editingPackage) {
            // 1. Update text data via PUT
            updateMutation.mutate({ id: editingPackage.id, data: body }, {
                onSuccess: () => {
                    // 2. Separate Image API calls
                    if (formData.file) {
                        replaceImageMutation.mutate({ id: editingPackage.id, file: formData.file });
                    }
                    setDialogOpen(false);
                    toast.success('Package updated', 'Details have been updated successfully.');
                }
            });
        } else {
            // For Create: construct body with file together
            if (formData.file) body.append('File', formData.file);
            createMutation.mutate(body, {
                onSuccess: () => {
                    setDialogOpen(false);
                    toast.success('Package created', 'A new service package was created.');
                }
            });
        }
    };

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

    const headerStats = [
        { label: 'Total Packages', value: data?.totalCount ?? 0 },
        { label: 'Active', value: packages.filter(p => p.status === 'Active').length },
        { label: 'Inactive', value: packages.filter(p => p.status === 'Inactive').length },
    ];

    return (
        <div className="flex flex-col h-full">
            <AdminPageHeader
                title="Service Packages"
                description="Configure comprehensive cleaning combos for blankets & bedding"
                icon={Package}
                stats={headerStats}
            />

            <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-xl m-6 flex flex-col"
                >
                    <div className="flex flex-col h-full overflow-hidden">
                        <AdminBulkActions table={table} itemLabel="package" accentColor="blue" />

                        {/* Actions Toolbar */}
                        <AdminActions
                            onAdd={handleAdd}
                            onFilter={() => console.log('Filter')}
                            onExport={() => console.log('Export')}
                            onImport={() => console.log('Import')}
                            addLabel="Add Package"
                        />

                        {/* Search */}
                        <div className="px-4">
                            <AdminTableSearch
                                table={table}
                                value={globalFilter}
                                onChange={setGlobalFilter}
                                placeholder="Search by description or name..."
                                resultCount={table.getFilteredRowModel().rows.length}
                                resultLabel="packages"
                            />
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

            <ServicePackageDialog 
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                pkg={editingPackage}
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}

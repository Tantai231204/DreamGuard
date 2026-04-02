// src/pages/admin/customize-types/index.tsx
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
} from '@tanstack/react-table';
import type {
    SortingState,
    ColumnFiltersState,
    RowSelectionState,
    Updater,
    PaginationState
} from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

// Admin Components
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import {
    AdminTableSearch,
    AdminTableContent,
    AdminTablePagination,
    AdminBulkActions,
} from '@/components/admin';
import { LoadingSpinner } from '@/components/common';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

// Local Components
import CustomizeTypeActions from './components/CustomizeTypeActions';
import { useCustomizeTypeColumns } from './components/useCustomizeTypeColumns';
import CustomizeTypeDialog from './components/CustomizeTypeDialog';
import type { CustomizeTypeFormValues } from './components/CustomizeTypeDialog';


// API Hooks
import {
    useCustomizeTypes,
    useCreateCustomizeType,
    useUpdateCustomizeType,
    useDeleteCustomizeType
} from '@/hooks/queries/useCustomizeType';

import { downloadCSV } from '@/lib/export';
import type { CustomizeType } from './types';
import CustomizeTypeDetails from './components/CustomizeTypeDetails';

/**
 * CustomizeTypesPage - Admin Management for Product Customization Options
 * Optimized with server-side searching, debouncing, and structured logic.
 */
export default function CustomizeTypesPage() {
    const toast = useToast();
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. Table State (Sync with URL Params)
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'category', desc: false },
        { id: 'applicableProductType', desc: false }
    ]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const pagination = useMemo(() => ({
        pageIndex: Math.max(0, parseInt(searchParams.get('page') || '1') - 1),
        pageSize: parseInt(searchParams.get('pageSize') || '10'),
    }), [searchParams]);

    const urlSearch = searchParams.get('search') || '';

    // 2. Search Optimization (Local state + Debounce)
    const [localSearch, setLocalSearch] = useState(urlSearch);
    const debouncedSearch = useDebounce(localSearch, 400);

    // Sync local search with URL if URL changes (e.g., manual URL edit)
    useEffect(() => {
        setLocalSearch(urlSearch);
    }, [urlSearch]);

    // Sync URL with Debounced Search
    useEffect(() => {
        setSearchParams((prev) => {
            if (debouncedSearch) prev.set('search', debouncedSearch);
            else prev.delete('search');
            prev.set('page', '1'); // Reset to page 1 on search
            return prev;
        }, { replace: true });
    }, [debouncedSearch, setSearchParams]);

    // 3. Data Fetching (Server-Side Paginated & Filtered)
    const { data: pagedData, isLoading } = useCustomizeTypes({
        pageNumber: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        name: debouncedSearch || undefined,
    });

    const items = useMemo(() => pagedData?.items || [], [pagedData]);
    const totalCount = pagedData?.totalCount || 0;

    // 4. Mutation Hooks
    const createMutation = useCreateCustomizeType();
    const updateMutation = useUpdateCustomizeType();
    const deleteMutation = useDeleteCustomizeType();

    // 5. Handlers & Actions
    const [dialogOpen, setDialogOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

    const [editingType, setEditingType] = useState<CustomizeType | null>(null);
    const [viewingType, setViewingType] = useState<CustomizeType | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    
    // Fetch all for unique validation in the dialog
    const { data: allTypesData } = useCustomizeTypes({ pageSize: 120 });
    const allTypes = useMemo(() => allTypesData?.items || [], [allTypesData]);

    const handleAdd = useCallback(() => {
        setEditingType(null);
        setDialogOpen(true);
    }, []);

    const handleEdit = useCallback((type: CustomizeType) => {
        setEditingType(type);
        setDialogOpen(true);
    }, []);

    const handleView = useCallback((type: CustomizeType) => {
        setViewingType(type);
        setDetailsOpen(true);
    }, []);

    const handleDeleteClick = useCallback((id: string) => {
        setDeletingId(id);
        setConfirmOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (!deletingId) return;

        deleteMutation.mutate(deletingId, {
            onSuccess: () => {
                toast.success('Deleted', 'Entry removed successfully.');
                setConfirmOpen(false);
                setDeletingId(null);
            },
            onError: (err) => toast.error('Error', err.message || 'Deletion failed.')
        });
    }, [deletingId, deleteMutation, toast]);

    // Use a function-scoped reference because table is declared later
    const getSelectedIds = () => table.getFilteredSelectedRowModel().rows.map(r => r.original.id);

    const handleBulkDeleteClick = useCallback(() => {
        setBulkConfirmOpen(true);
    }, []);

    const handleConfirmBulkDelete = useCallback(() => {
        const selectedIds = getSelectedIds();
        if (selectedIds.length === 0) return;

        Promise.all(selectedIds.map(id => deleteMutation.mutateAsync(id)))
            .then(() => {
                toast.success('Batch Success', `${selectedIds.length} items removed.`);
                setRowSelection({});
                setBulkConfirmOpen(false);
            })
            .catch(() => toast.error('Batch Partial Failure', 'Some items could not be deleted.'));
    }, [deleteMutation, toast]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleExport = useCallback(() => {
        downloadCSV(
            items.map(({ id, name, summary, defaultPrice, status, category, calculationMode, defaultMultiplier, applicableProductType }) => ({
                ID: id,
                Name: name,
                Summary: summary,
                Price: defaultPrice,
                Status: status,
                Category: category,
                Mode: calculationMode,
                Multiplier: defaultMultiplier,
                TargetType: applicableProductType,
            })),
            'CustomizeTypes_Export'
        );
    }, [items]);

    const handleSubmit = useCallback(
        (data: CustomizeTypeFormValues) => {
            if (editingType) {
                updateMutation.mutate(
                    { id: editingType.id, data: data as CustomizeTypeFormValues },
                    {
                        onSuccess: () => {
                            setDialogOpen(false);
                            toast.success('Updated', 'Changes saved successfully.');
                        },
                    }
                );
            } else {
                createMutation.mutate(data, {
                    onSuccess: () => {
                        setDialogOpen(false);
                        toast.success('Created', 'New classification created.');
                    },
                });
            }
        },
        [editingType, createMutation, updateMutation, toast]
    );

    // 6. Table Configuration
    const columns = useCustomizeTypeColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDeleteClick
    });

    const setPagination = useCallback((updaterOrValue: Updater<PaginationState>) => {
        const next = typeof updaterOrValue === 'function' ? updaterOrValue(pagination) : updaterOrValue;
        setSearchParams((prev) => {
            prev.set('page', String(next.pageIndex + 1));
            prev.set('pageSize', String(next.pageSize));
            return prev;
        }, { replace: true });
    }, [pagination, setSearchParams]);

    const table = useReactTable({
        data: items,
        columns,
        state: { sorting, globalFilter: debouncedSearch, columnFilters, rowSelection, pagination },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,

        // Settings
        manualPagination: true,
        manualFiltering: true,
        pageCount: pagedData?.totalPages || 0,
        enableRowSelection: true,

        // Engines
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    // 7. Stats for Header
    const headerStats = useMemo(() => [
        { label: 'Total Items', value: totalCount },
        { label: 'Live', value: items.filter(i => i.status === 'Active').length },
        { label: 'Archived', value: items.filter(i => i.status !== 'Active').length },
    ], [totalCount, items]);

    // 8. Error/Loading States
    if (isLoading) {
        return (
            <div className="flex flex-col h-full bg-gray-50/10">
                <AdminPageHeader title="Customize Types" icon={Sparkles} stats={[]} />
                <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
            </div>
        );
    }

    const selectedCount = table.getFilteredSelectedRowModel().rows.length;

    return (
        <div className="flex flex-col h-full">
            <AdminPageHeader
                title="Customize Types"
                description="Advanced classification and pricing for product customization"
                icon={Sparkles}
                stats={headerStats}
            />

            <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-gray-50/50 via-white to-blue-50/20">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-xl m-6 flex flex-col"
                >
                    <div className="flex flex-col h-full">
                        {/* Bulk Actions Menu */}
                        <AdminBulkActions
                            table={table}
                            itemLabel="classification"
                            accentColor="blue"
                            onDelete={handleBulkDeleteClick}
                        />

                        {/* Standard Toolbar */}
                        <CustomizeTypeActions
                            onAdd={handleAdd}
                            onExport={handleExport}
                            onImport={() => toast.info('Beta', 'Import feature coming soon')}
                            onFilter={() => { }}
                        />

                        {/* Search (Responsive + Debounced) */}
                        <AdminTableSearch
                            table={table}
                            value={localSearch}
                            onChange={setLocalSearch}
                            placeholder="Type to search name or summary..."
                            resultCount={totalCount}
                            resultLabel="matching records"
                        />

                        {/* Main Data View */}
                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <AdminTableContent
                                table={table}
                                emptyMessage={debouncedSearch ? "No records match your search" : "No customization types found"}
                            />
                        </div>

                        {/* Footer Controls */}
                        <AdminTablePagination table={table} itemLabel="customize types" />
                    </div>
                </motion.div>
            </div>

            {/* Dialogs */}
            <CustomizeTypeDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                customizeType={editingType}
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
                existingTypes={allTypes}
            />

            <CustomizeTypeDetails
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                data={viewingType}
            />

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Classification"
                description={
                    deletingId
                        ? `Are you sure you want to delete **${items.find(i => i.id === deletingId)?.name}**? This action cannot be undone.`
                        : ""
                }
                variant="danger"
                onConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
                confirmText="Delete Now"
            />

            <ConfirmDialog
                open={bulkConfirmOpen}
                onOpenChange={setBulkConfirmOpen}
                title="Batch Deletion"
                description={`You are about to delete **${selectedCount}** classifications. This will affect all connected products. Continue?`}
                variant="danger"
                onConfirm={handleConfirmBulkDelete}
                isLoading={deleteMutation.isPending}
                confirmText={`Delete ${selectedCount} items`}
            />
        </div>
    );
}

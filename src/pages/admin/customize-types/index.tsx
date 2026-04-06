// src/pages/admin/customize-types/index.tsx
import { useState, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/useToast';
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
import { Sparkles } from 'lucide-react';

// Admin Components
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import {
    AdminTableSearch,
    AdminTableContent,
    AdminTablePagination,
    AdminBulkActions,
} from '@/components/admin';
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
import { useAdminTableSync } from '@/hooks/admin/useAdminTableSync';

export default function CustomizeTypesPage() {
    const toast = useToast();
    const {
        pagination,
        setPagination,
        globalFilter,
        debouncedFilter,
        setGlobalFilter,
    } = useAdminTableSync(10);

    const [sorting, setSorting] = useState<SortingState>([
        { id: 'applicableProductType', desc: false },
        { id: 'category', desc: false }
    ]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const { data: pagedData, isLoading } = useCustomizeTypes({
        pageNumber: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        name: debouncedFilter || undefined,
    });

    const items = useMemo(() => pagedData?.items || [], [pagedData]);
    const totalCount = pagedData?.totalCount || 0;

    const createMutation = useCreateCustomizeType();
    const updateMutation = useUpdateCustomizeType();
    const deleteMutation = useDeleteCustomizeType();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

    const [editingType, setEditingType] = useState<CustomizeType | null>(null);
    const [viewingType, setViewingType] = useState<CustomizeType | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

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

    const handleBulkDeleteClick = useCallback(() => setBulkConfirmOpen(true), []);

    const columns = useCustomizeTypeColumns({ onView: handleView, onEdit: handleEdit, onDelete: handleDeleteClick });

    const table = useReactTable({
        data: items,
        columns,
        state: { sorting, globalFilter, columnFilters, rowSelection, pagination },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        manualPagination: true,
        manualFiltering: true,
        pageCount: pagedData?.totalPages || 0,
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const handleConfirmBulkDelete = useCallback(() => {
        const selectedIds = table.getFilteredSelectedRowModel().rows.map(r => (r.original as CustomizeType).id);
        if (selectedIds.length === 0) return;

        Promise.all(selectedIds.map(id => deleteMutation.mutateAsync(id)))
            .then(() => {
                toast.success('Batch Success', `${selectedIds.length} items removed.`);
                setRowSelection({});
                setBulkConfirmOpen(false);
            })
            .catch(() => toast.error('Batch Partial Failure', 'Some items could not be deleted.'));
    }, [deleteMutation, toast, table]);

    const handleExport = useCallback(() => {
        downloadCSV(
            items.map(({ id, name, summary, defaultPrice, status, category, calculationMode, defaultMultiplier, applicableProductType }) => ({
                ID: id, Name: name, Summary: summary, Price: defaultPrice, Status: status, Category: category, Mode: calculationMode, Multiplier: defaultMultiplier, TargetType: applicableProductType,
            })),
            'CustomizeTypes_Export'
        );
    }, [items]);

    const handleSubmit = useCallback(
        (data: CustomizeTypeFormValues) => {
            if (editingType) {
                updateMutation.mutate({ id: editingType.id, data: data as CustomizeTypeFormValues }, {
                    onSuccess: () => {
                        setDialogOpen(false);
                        toast.success('Updated', 'Changes saved successfully.');
                    },
                });
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


    const headerStats = useMemo(() => [
        { label: 'Total Items', value: totalCount },
        { label: 'Live', value: items.filter(i => i.status === 'Active').length },
        { label: 'Archived', value: items.filter(i => i.status !== 'Active').length },
    ], [totalCount, items]);

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
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-xl m-6 flex flex-col"
                >
                    <div className="flex flex-col h-full">
                        <AdminBulkActions table={table} itemLabel="classification" accentColor="blue" onDelete={handleBulkDeleteClick} />
                        <CustomizeTypeActions onAdd={handleAdd} onExport={handleExport} onImport={() => { }} onFilter={() => { }} />

                        <AdminTableSearch
                            table={table}
                            value={globalFilter}
                            onChange={setGlobalFilter}
                            placeholder="Type to search name or summary..."
                            resultCount={totalCount}
                            resultLabel="matching records"
                        />

                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <AdminTableContent table={table} emptyMessage={debouncedFilter ? "No records match your search" : "No customization types found"} isLoading={isLoading} />
                        </div>

                        <AdminTablePagination table={table} itemLabel="customize types" />
                    </div>
                </motion.div>
            </div>

            <CustomizeTypeDialog open={dialogOpen} onOpenChange={setDialogOpen} customizeType={editingType} onSubmit={handleSubmit} isLoading={createMutation.isPending || updateMutation.isPending} existingTypes={allTypes} />
            <CustomizeTypeDetails open={detailsOpen} onOpenChange={setDetailsOpen} data={viewingType} />
            <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} title="Delete Classification" description={deletingId ? `Are you sure you want to delete **${items.find(i => i.id === deletingId)?.name}**? This action cannot be undone.` : ""} variant="danger" onConfirm={handleConfirmDelete} isLoading={deleteMutation.isPending} confirmText="Delete Now" />
            <ConfirmDialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen} title="Batch Deletion" description={`You are about to delete **${table.getFilteredSelectedRowModel().rows.length}** classifications. Continue?`} variant="danger" onConfirm={handleConfirmBulkDelete} isLoading={deleteMutation.isPending} confirmText={`Delete items`} />
        </div>
    );
}

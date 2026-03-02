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
import { Ticket } from 'lucide-react';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import {
    AdminTableSearch,
    AdminTableContent,
    AdminTablePagination,
    AdminBulkActions,
} from '@/components/admin';
import { LoadingSpinner } from '@/components/common';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import VoucherActions from './components/VoucherActions';
import VoucherDialog from './components/VoucherDialog';
import { useVoucherColumns } from './components/useVoucherColumns';
import { useVouchers, useCreateVoucher, useUpdateVoucher, useDeleteVoucher } from '@/hooks/queries/useVoucher';
import type { Voucher } from './types';

export default function VouchersPage() {
    const toast = useToast();
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

    // Delete confirmation state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [voucherToDelete, setVoucherToDelete] = useState<string | null>(null);

    // Gọi API lấy danh sách vouchers qua TanStack Query (trang 1)
    const { data: vouchersData, isLoading, isError, error } = useVouchers(1);

    // Mutations
    const createMutation = useCreateVoucher();
    const updateMutation = useUpdateVoucher();
    const deleteMutation = useDeleteVoucher();

    const vouchers = useMemo(() => vouchersData?.items ?? [], [vouchersData?.items]);

    // Mở dialog tạo mới
    const handleAdd = useCallback(() => {
        setEditingVoucher(null);
        setDialogOpen(true);
    }, []);

    // Mở dialog chỉnh sửa
    const handleEdit = useCallback((voucher: Voucher) => {
        setEditingVoucher(voucher);
        setDialogOpen(true);
    }, []);

    // Xóa voucher
    const handleDelete = useCallback(
        (voucherId: string) => {
            setVoucherToDelete(voucherId);
            setDeleteConfirmOpen(true);
        },
        []
    );

    const confirmDelete = useCallback(() => {
        if (voucherToDelete) {
            deleteMutation.mutate(voucherToDelete, {
                onSuccess: () => {
                    toast.success('Voucher deleted', 'The voucher has been successfully deleted.');
                    setDeleteConfirmOpen(false);
                },
            });
            setVoucherToDelete(null);
        }
    }, [voucherToDelete, deleteMutation, toast]);

    // Submit form (create hoặc update)
    const handleSubmit = useCallback(
        (data: {
            code: string;
            name: string;
            description: string;
            discountType: 'percent' | 'fixed';
            discountValue: number;
            minDiscountAmount: number;
            maxDiscountAmount: number;
            startDate: string;
            endDate: string;
            isActive: boolean;
        }) => {
            // Convert dates to ISO datetime format for API
            const formattedData = {
                ...data,
                startDate: `${data.startDate}T00:00:00Z`,
                endDate: `${data.endDate}T23:59:59Z`,
            };

            if (editingVoucher) {
                updateMutation.mutate(
                    { id: editingVoucher.voucherId, data: formattedData },
                    {
                        onSuccess: () => {
                            setDialogOpen(false);
                            toast.success('Voucher updated', 'The voucher has been successfully updated.');
                        },
                    }
                );
            } else {
                createMutation.mutate(formattedData, {
                    onSuccess: () => {
                        setDialogOpen(false);
                        toast.success('Voucher created', 'The new voucher has been successfully created.');
                    },
                });
            }
        },
        [editingVoucher, createMutation, updateMutation, toast]
    );

    const columns = useVoucherColumns({ onEdit: handleEdit, onDelete: handleDelete });

    // Stats
    const stats = useMemo(() => {
        const total = vouchersData?.totalCount ?? 0;
        const active = vouchers.filter((v) => v.isActive).length;
        const inactive = vouchers.filter((v) => !v.isActive).length;
        const expired = vouchers.filter((v) => new Date(v.endDate) < new Date()).length;
        return { total, active, inactive, expired };
    }, [vouchers, vouchersData]);

    const table = useReactTable({
        data: vouchers,
        columns,
        state: {
            sorting,
            globalFilter,
            columnFilters,
            rowSelection,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        globalFilterFn: (row, _columnId, filterValue) => {
            const search = filterValue.toLowerCase();
            const item = row.original as Voucher;
            return (
                item.code.toLowerCase().includes(search) ||
                item.name.toLowerCase().includes(search) ||
                item.description.toLowerCase().includes(search)
            );
        },
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col h-full">
                <AdminPageHeader
                    title="Vouchers"
                    description="Manage discount vouchers and promotional codes"
                    icon={Ticket}
                    stats={[]}
                />
                <div className="flex-1 flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="flex flex-col h-full">
                <AdminPageHeader
                    title="Vouchers"
                    description="Manage discount vouchers and promotional codes"
                    icon={Ticket}
                    stats={[]}
                />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-500 font-semibold text-lg">Failed to load vouchers</p>
                        <p className="text-gray-500 mt-2">{error?.message || 'An unexpected error occurred'}</p>
                    </div>
                </div>
            </div>
        );
    }

    const headerStats = [
        { label: 'Total', value: stats.total },
        { label: 'Active', value: stats.active },
        { label: 'Inactive', value: stats.inactive },
        { label: 'Expired', value: stats.expired },
    ];

    return (
        <div className="flex flex-col h-full">
            <AdminPageHeader
                title="Vouchers"
                description="Manage discount vouchers and promotional codes"
                icon={Ticket}
                stats={headerStats}
            />

            <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-gray-50/50 via-white to-purple-50/30">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-xl m-6 flex flex-col"
                >
                    <div className="flex flex-col h-full overflow-hidden">
                        {/* Bulk Actions */}
                        <AdminBulkActions
                            table={table}
                            itemLabel="voucher"
                            accentColor="purple"
                            onEdit={() => console.log('Edit selected')}
                            onDuplicate={() => console.log('Duplicate selected')}
                            onDelete={() => console.log('Delete selected')}
                        />

                        {/* Actions Toolbar */}
                        <VoucherActions
                            onAdd={handleAdd}
                            onExport={() => console.log('Export')}
                            onImport={() => console.log('Import')}
                            onFilter={() => console.log('Filter')}
                        />

                        {/* Search */}
                        <AdminTableSearch
                            table={table}
                            value={globalFilter}
                            onChange={setGlobalFilter}
                            placeholder="Search vouchers by code, name, or description..."
                            resultCount={table.getFilteredRowModel().rows.length}
                            resultLabel="vouchers"
                        />

                        {/* Table */}
                        <div className="flex-1 overflow-auto">
                            <AdminTableContent
                                table={table}
                                emptyMessage="No vouchers found"
                            />
                        </div>

                        {/* Pagination */}
                        <AdminTablePagination table={table} itemLabel="vouchers" />
                    </div>
                </motion.div>
            </div>

            {/* Create / Edit Dialog */}
            <VoucherDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                voucher={editingVoucher}
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                title="Delete Voucher?"
                description="Are you sure you want to delete this voucher? This action cannot be undone and customers will no longer be able to use this voucher code."
                confirmText="Delete Voucher"
                cancelText="Keep Voucher"
                onConfirm={confirmDelete}
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}

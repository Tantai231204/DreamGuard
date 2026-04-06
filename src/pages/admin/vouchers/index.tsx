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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import VoucherActions from './components/VoucherActions';
import VoucherDialog from './components/VoucherDialog';
import { useVoucherColumns } from './components/useVoucherColumns';
import { useVouchers, useCreateVoucher, useUpdateVoucher, useDeleteVoucher } from '@/hooks/queries/useVoucher';
import type { Voucher } from './types';
import { useAdminTableSync } from '@/hooks/admin/useAdminTableSync';

export default function VouchersPage() {
    const toast = useToast();
    const {
        pagination,
        setPagination,
        globalFilter,
        setGlobalFilter,
    } = useAdminTableSync(10);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [voucherToDelete, setVoucherToDelete] = useState<string | string[] | null>(null);

    const { data: vouchersData, isLoading } = useVouchers(pagination.pageIndex + 1);

    const createMutation = useCreateVoucher();
    const updateMutation = useUpdateVoucher();
    const deleteMutation = useDeleteVoucher();

    const vouchers = useMemo(() => vouchersData?.items ?? [], [vouchersData?.items]);

    const handleAdd = useCallback(() => {
        setEditingVoucher(null);
        setDialogOpen(true);
    }, []);

    const handleEdit = useCallback((voucher: Voucher) => {
        setEditingVoucher(voucher);
        setDialogOpen(true);
    }, []);

    const handleDelete = useCallback((voucherId: string) => {
        setVoucherToDelete(voucherId);
        setDeleteConfirmOpen(true);
    }, []);

    const columns = useVoucherColumns({ onEdit: handleEdit, onDelete: handleDelete });

    const table = useReactTable({
        data: vouchers,
        columns,
        state: { sorting, globalFilter, columnFilters, rowSelection, pagination },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const handleBulkDelete = useCallback(() => {
        const selectedIds = table.getFilteredSelectedRowModel().rows.map((row) => (row.original as Voucher).voucherId);
        setVoucherToDelete(selectedIds);
        setDeleteConfirmOpen(true);
    }, [table]);

    const stats = useMemo(() => {
        const total = vouchers.length;
        const active = vouchers.filter((v) => v.isActive).length;
        return { total, active };
    }, [vouchers]);

    const handleConfirmDelete = useCallback(() => {
        if (!voucherToDelete) return;
        if (Array.isArray(voucherToDelete)) {
            Promise.all(voucherToDelete.map((id) => deleteMutation.mutateAsync(id)))
                .then(() => {
                    toast.success('Vouchers deleted', `${voucherToDelete.length} vouchers have been deleted.`);
                    setDeleteConfirmOpen(false);
                    setVoucherToDelete(null);
                    setRowSelection({});
                })
                .catch(() => toast.error('Deletion failed', 'Some vouchers could not be deleted.'));
        } else {
            deleteMutation.mutate(voucherToDelete, {
                onSuccess: () => {
                    setDeleteConfirmOpen(false);
                    setVoucherToDelete(null);
                    toast.success('Voucher deleted', 'The voucher has been deleted successfully.');
                },
            });
        }
    }, [voucherToDelete, deleteMutation, toast]);

    const handleSubmit = useCallback(
        (data: { code: string; name: string; description: string; discountType: 'percent' | 'fixed'; discountValue: number; minDiscountAmount: number; maxDiscountAmount: number; startDate: string; endDate: string; isActive: boolean; }) => {
            const formattedData = { ...data, startDate: `${data.startDate}T00:00:00Z`, endDate: `${data.endDate}T23:59:59Z`, };
            if (editingVoucher) {
                updateMutation.mutate({ id: editingVoucher.voucherId, data: formattedData }, {
                    onSuccess: () => {
                        setDialogOpen(false);
                        toast.success('Voucher updated', 'The voucher was updated successfully.');
                    },
                });
            } else {
                createMutation.mutate(formattedData, {
                    onSuccess: () => {
                        setDialogOpen(false);
                        toast.success('Voucher created', 'A new voucher has been successfully created.');
                    },
                });
            }
        },
        [editingVoucher, createMutation, updateMutation, toast]
    );

    const headerStats = [
        { label: 'Active', value: stats.active },
        { label: 'Total', value: stats.total },
    ];

    return (
        <div className="flex flex-col h-full bg-white">
            <AdminPageHeader title="Vouchers" description="Manage promotion codes and discounts" icon={Ticket} stats={headerStats} />

            <div className="flex-1 overflow-hidden flex flex-col px-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col min-h-0 bg-white">
                    <AdminBulkActions table={table} itemLabel="voucher" accentColor="black" onDelete={handleBulkDelete} />
                    <VoucherActions onAdd={handleAdd} onExport={() => { }} onImport={() => { }} onFilter={() => { }} />

                    <AdminTableSearch table={table} value={globalFilter} onChange={setGlobalFilter} placeholder="Search by code or name..." />

                    <div className="flex-1 overflow-auto border rounded-xl mt-4">
                        <AdminTableContent table={table} emptyMessage="No vouchers found" isLoading={isLoading} />
                    </div>

                    <AdminTablePagination table={table} itemLabel="vouchers" />
                </motion.div>
            </div>

            <VoucherDialog open={dialogOpen} onOpenChange={setDialogOpen} voucher={editingVoucher} onSubmit={handleSubmit} isLoading={createMutation.isPending || updateMutation.isPending} />
            <ConfirmDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen} title="Delete Voucher" description={Array.isArray(voucherToDelete) ? `Are you sure you want to delete ${voucherToDelete.length} vouchers?` : "Are you sure you want to delete this voucher?"} confirmText="Delete" onConfirm={handleConfirmDelete} variant="danger" isLoading={deleteMutation.isPending} />
        </div>
    );
}

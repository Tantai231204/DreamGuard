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
import { Coins, Flame, RotateCcw, ShieldCheck, Ticket } from 'lucide-react';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import {
    AdminTableSearch,
    AdminTableContent,
    AdminTablePagination,
    AdminBulkActions,
} from '@/components/admin';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import VoucherActions from './components/VoucherActions';
import VoucherDialog from './components/VoucherDialog';
import VoucherDetailDialog from './components/VoucherDetailDialog';
import { useVoucherColumns } from './components/useVoucherColumns';
import { useVouchers, useCreateVoucher, useUpdateVoucher, useDeleteVoucher } from '@/hooks/queries/useVoucher';
import type { Voucher, VoucherFormValues } from './types';
import { useAdminTableSync } from '@/hooks/admin/useAdminTableSync';

type VoucherTypeFilter = 'all' | Voucher['voucherType'];
type VoucherStatusFilter = 'all' | 'active' | 'inactive';

function validateVoucherForm(data: VoucherFormValues): string | null {
    const code = data.code.trim();
    const name = data.name.trim();
    const discountValue = Number(data.discountValue);
    const maxDiscountAmount = Number(data.maxDiscountAmount);
    const requiredCoin = Number(data.requiredCoin);

    if (!code) return 'Voucher code is required';
    if (!name) return 'Voucher name is required';
    if (!Number.isFinite(discountValue) || discountValue <= 0) return 'Discount value must be greater than 0';
    if (discountValue > 1) return 'Discount ratio cannot exceed 1 (100%)';
    if (!Number.isFinite(maxDiscountAmount) || maxDiscountAmount <= 0) return 'Max discount amount must be greater than 0';
    if (!Number.isFinite(requiredCoin) || requiredCoin <= 0) return 'Required coin must be greater than 0';
    if (!Number.isInteger(requiredCoin)) return 'Required coin must be a whole number';
    if (!data.startDate || !data.endDate) return 'Start date and end date are required';
    if (data.endDate < data.startDate) return 'End date must be on or after start date';

    return null;
}

export default function VouchersPage() {
    const toast = useToast();
    const {
        pagination,
        setPagination,
        globalFilter,
        setGlobalFilter,
        setFieldFilter,
        getFieldFilter,
    } = useAdminTableSync(10);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [viewingVoucher, setViewingVoucher] = useState<Voucher | null>(null);

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [voucherToDelete, setVoucherToDelete] = useState<string | string[] | null>(null);

    const { data: vouchersData, isLoading } = useVouchers();

    const createMutation = useCreateVoucher();
    const updateMutation = useUpdateVoucher();
    const deleteMutation = useDeleteVoucher();

    const allVouchers = useMemo(() => vouchersData?.items ?? [], [vouchersData?.items]);

    const voucherTypeParam = getFieldFilter('voucherType', 'all');
    const voucherTypeFilter: VoucherTypeFilter =
        voucherTypeParam === 'Both' || voucherTypeParam === 'Product' || voucherTypeParam === 'Service'
            ? voucherTypeParam
            : 'all';

    const statusParam = getFieldFilter('isActive', 'all');
    const statusFilter: VoucherStatusFilter =
        statusParam === 'active' || statusParam === 'inactive'
            ? statusParam
            : 'all';

    const vouchers = useMemo(() => {
        return allVouchers.filter((voucher) => {
            const matchType = voucherTypeFilter === 'all' || voucher.voucherType === voucherTypeFilter;
            const matchStatus =
                statusFilter === 'all' ||
                (statusFilter === 'active' && voucher.isActive) ||
                (statusFilter === 'inactive' && !voucher.isActive);

            return matchType && matchStatus;
        });
    }, [allVouchers, voucherTypeFilter, statusFilter]);

    const hasQuickFilters = voucherTypeFilter !== 'all' || statusFilter !== 'all';

    const handleVoucherTypeFilterChange = useCallback((value: string) => {
        setFieldFilter('voucherType', value === 'all' ? null : value);
        setRowSelection({});
    }, [setFieldFilter]);

    const handleStatusFilterChange = useCallback((value: string) => {
        setFieldFilter('isActive', value === 'all' ? null : value);
        setRowSelection({});
    }, [setFieldFilter]);

    const resetQuickFilters = useCallback(() => {
        setFieldFilter('voucherType', null);
        setFieldFilter('isActive', null);
        setRowSelection({});
    }, [setFieldFilter]);

    const handleAdd = useCallback(() => {
        setEditingVoucher(null);
        setDialogOpen(true);
    }, []);

    const handleEdit = useCallback((voucher: Voucher) => {
        setEditingVoucher(voucher);
        setDialogOpen(true);
    }, []);

    const handleView = useCallback((voucher: Voucher) => {
        setViewingVoucher(voucher);
        setDetailOpen(true);
    }, []);

    const handleDelete = useCallback((voucherId: string) => {
        setVoucherToDelete(voucherId);
        setDeleteConfirmOpen(true);
    }, []);

    const columns = useVoucherColumns({ onView: handleView, onEdit: handleEdit, onDelete: handleDelete });

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
        const total = allVouchers.length;
        const active = allVouchers.filter((v) => v.isActive).length;
        const inactive = Math.max(0, total - active);
        const now = Date.now();
        const inSevenDays = now + 7 * 24 * 60 * 60 * 1000;

        const expiringSoon = allVouchers.filter((voucher) => {
            if (!voucher.isActive) return false;
            const expiry = new Date(voucher.endDate).getTime();
            return Number.isFinite(expiry) && expiry >= now && expiry <= inSevenDays;
        }).length;

        const averageDiscount =
            total > 0
                ? Math.round(
                    allVouchers.reduce((sum, voucher) => sum + Math.max(0, voucher.discountValue || 0) * 100, 0) / total
                )
                : 0;

        const totalRequiredCoin = allVouchers.reduce(
            (sum, voucher) => sum + Math.max(0, Number(voucher.requiredCoin || 0)),
            0
        );

        return { total, active, inactive, expiringSoon, averageDiscount, totalRequiredCoin };
    }, [allVouchers]);

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
                .catch(() => {
                    // Global mutation error handler already displays API error toast.
                });
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
        (data: VoucherFormValues) => {
            const businessError = validateVoucherForm(data);
            if (businessError) {
                toast.error('Invalid voucher rules', businessError);
                return;
            }

            const formattedData = {
                ...data,
                code: data.code.trim().toUpperCase(),
                name: data.name.trim(),
                description: data.description.trim(),
                discountValue: Number(data.discountValue),
                maxDiscountAmount: Number(data.maxDiscountAmount),
                requiredCoin: Math.floor(Number(data.requiredCoin)),
                startDate: `${data.startDate}T00:00:00Z`,
                endDate: `${data.endDate}T23:59:59Z`,
            };

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
        <div className="flex h-full flex-col bg-slate-50">
            <AdminPageHeader title="Vouchers" description="Manage coin-based voucher campaigns" icon={Ticket} stats={headerStats} />

            <div className="flex flex-1 flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-primary-50/35 to-sky-50/30 p-6">
                <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-[#4988c4]/20 bg-gradient-to-br from-[#4988c4]/5 to-white p-4 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#4988c4]">Active Campaigns</p>
                        <p className="mt-2 text-2xl font-black leading-none text-[#4988c4]">{stats.active}</p>
                        <p className="mt-2 text-[11px] font-semibold text-[#4988c4]/70">Running vouchers on storefront</p>
                    </div>

                    <div className="rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary-700">Expiring Soon</p>
                                <p className="mt-2 text-2xl font-black leading-none text-primary-700">{stats.expiringSoon}</p>
                            </div>
                            <Flame className="h-5 w-5 text-primary-600" />
                        </div>
                        <p className="mt-2 text-[11px] font-semibold text-primary-600">Within next 7 days</p>
                    </div>

                    <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">Avg Discount</p>
                                <p className="mt-2 text-2xl font-black leading-none text-sky-700">{stats.averageDiscount}%</p>
                            </div>
                            <ShieldCheck className="h-5 w-5 text-sky-600" />
                        </div>
                        <p className="mt-2 text-[11px] font-semibold text-sky-600">Across all campaigns</p>
                    </div>

                    <div className="rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary-700">Coin Demand</p>
                                <p className="mt-2 text-2xl font-black leading-none text-primary-700">{stats.totalRequiredCoin.toLocaleString('vi-VN')}</p>
                            </div>
                            <Coins className="h-5 w-5 text-primary-600" />
                        </div>
                        <p className="mt-2 text-[11px] font-semibold text-primary-600">Total claim requirement</p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                >
                    <AdminBulkActions table={table} itemLabel="voucher" accentColor="black" onDelete={handleBulkDelete} />

                    <div className="border-b border-primary-100 bg-gradient-to-r from-primary-50 via-primary-100/50 to-sky-50 px-6 py-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary-700">Campaign Control Center</p>
                        <p className="mt-1 text-sm font-semibold text-slate-600">
                            Create, filter, and monitor voucher campaigns from one place.
                        </p>
                    </div>

                    <VoucherActions onAdd={handleAdd} onExport={() => { }} onImport={() => { }} />

                    <AdminTableSearch
                        table={table}
                        value={globalFilter}
                        onChange={setGlobalFilter}
                        placeholder="Search campaign code, name or type..."
                        actions={
                            <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
                                <div className="w-full sm:w-[154px]">
                                    <Select value={voucherTypeFilter} onValueChange={handleVoucherTypeFilterChange}>
                                        <SelectTrigger className="h-10 rounded-xl border-2 border-slate-200 bg-white px-3 font-semibold text-slate-700 shadow-sm hover:border-slate-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-100">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All types</SelectItem>
                                            <SelectItem value="Both">Both</SelectItem>
                                            <SelectItem value="Product">Product</SelectItem>
                                            <SelectItem value="Service">Service</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="w-full sm:w-[154px]">
                                    <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                                        <SelectTrigger className="h-10 rounded-xl border-2 border-slate-200 bg-white px-3 font-semibold text-slate-700 shadow-sm hover:border-slate-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-100">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All statuses</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={resetQuickFilters}
                                    disabled={!hasQuickFilters}
                                    className="h-10 w-full rounded-xl border-2 border-slate-200 bg-white px-4 font-bold text-slate-500 shadow-sm hover:border-[#4988c4] hover:text-[#4988c4] hover:bg-[#4988c4]/5 disabled:opacity-50 sm:w-auto transition-all"
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Reset
                                </Button>
                            </div>
                        }
                    />

                    <div className="flex-1 overflow-auto bg-white">
                        <AdminTableContent table={table} emptyMessage="No vouchers found" isLoading={isLoading} />
                    </div>

                    <AdminTablePagination table={table} itemLabel="vouchers" />
                </motion.div>
            </div>

            <VoucherDialog open={dialogOpen} onOpenChange={setDialogOpen} voucher={editingVoucher} onSubmit={handleSubmit} isLoading={createMutation.isPending || updateMutation.isPending} />
            <VoucherDetailDialog
                open={detailOpen}
                onOpenChange={(open) => {
                    setDetailOpen(open);
                    if (!open) {
                        setViewingVoucher(null);
                    }
                }}
                voucher={viewingVoucher}
                onEdit={(voucher) => {
                    setDetailOpen(false);
                    setViewingVoucher(null);
                    setEditingVoucher(voucher);
                    setDialogOpen(true);
                }}
            />
            <ConfirmDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen} title="Delete Voucher" description={Array.isArray(voucherToDelete) ? `Are you sure you want to delete ${voucherToDelete.length} vouchers?` : "Are you sure you want to delete this voucher?"} confirmText="Delete" onConfirm={handleConfirmDelete} variant="danger" isLoading={deleteMutation.isPending} />
        </div>
    );
}

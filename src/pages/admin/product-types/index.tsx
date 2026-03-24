import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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
    PaginationState,
    Updater,
} from '@tanstack/react-table';
import { CheckCircle2, Filter, Check } from 'lucide-react';
import { ProductAssetIcons } from '@/components/common/icons';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import {
    AdminTableSearch,
    AdminTablePagination,
    AdminTableContent,
    AdminBulkActions,
    AdminActions
} from '@/components/admin';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { useProductTypeColumns } from './components/useProductTypeColumns';
import { ProductTypeDialog, type ProductTypeFormValues } from './components/ProductTypeDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
    useProductTypes,
    useCreateProductType,
    useUpdateProductType,
    useDeleteProductType
} from '@/hooks/queries/useProductType';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';
import { downloadCSV } from '@/lib/export';
import { cn } from '@/lib/utils';
import type { ProductType } from '@/api/services/productTypeService';

export default function ProductTypePage() {
    const toast = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const pagination = useMemo(() => ({
        pageIndex: parseInt(searchParams.get('page') || '1') - 1,
        pageSize: parseInt(searchParams.get('pageSize') || '10'),
    }), [searchParams]);

    const globalFilter = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || 'all';

    // Standard ColumnFilters for TanStack Table
    const columnFilters = useMemo<ColumnFiltersState>(() => {
        const filters: ColumnFiltersState = [];
        if (statusFilter !== 'all') {
            filters.push({ id: 'isActive', value: statusFilter === 'active' });
        }
        return filters;
    }, [statusFilter]);

    const setPagination = useCallback((updaterOrValue: Updater<PaginationState>) => {
        const next = typeof updaterOrValue === 'function' ? updaterOrValue(pagination) : updaterOrValue;
        setSearchParams((prev) => {
            prev.set('page', String(next.pageIndex + 1));
            prev.set('pageSize', String(next.pageSize));
            return prev;
        }, { replace: true });
    }, [pagination, setSearchParams]);

    const setGlobalFilter = useCallback((value: string) => {
        setSearchParams((prev) => {
            if (value) prev.set('search', value);
            else prev.delete('search');
            prev.set('page', '1');
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    const handleStatusFilterChange = useCallback((value: string) => {
        setSearchParams((prev) => {
            if (value === 'all') prev.delete('status');
            else prev.set('status', value);
            prev.set('page', '1');
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProductType, setEditingProductType] = useState<ProductType | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState<ProductType | null>(null);

    const debouncedSearch = useDebounce(globalFilter, 500);

    const { data, isLoading } = useProductTypes({
        pageNumber: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        Key: debouncedSearch || undefined,
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
    });

    const productTypeList = useMemo(() => data?.items || [], [data]);

    const createMutation = useCreateProductType();
    const updateMutation = useUpdateProductType();
    const deleteMutation = useDeleteProductType();

    const handleAdd = useCallback(() => {
        setEditingProductType(null);
        setDialogOpen(true);
    }, []);

    const handleEdit = useCallback((pt: ProductType) => {
        setEditingProductType(pt);
        setDialogOpen(true);
    }, []);

    const handleToggleStatus = useCallback((pt: ProductType) => {
        setConfirmTarget(pt);
        setConfirmOpen(true);
    }, []);

    const executeToggleStatus = useCallback(async () => {
        if (!confirmTarget) return;

        const pt = confirmTarget;
        const action = pt.isActive ? 'deactivate' : 'activate';

        try {
            if (pt.isActive) {
                await deleteMutation.mutateAsync(pt.productTypeId);
                toast.success('Deactivated', `"${pt.productTypeName}" has been hidden.`);
            } else {
                await updateMutation.mutateAsync({
                    id: pt.productTypeId,
                    data: { ProductTypeName: pt.productTypeName, IsActive: true }
                });
                toast.success('Activated', `"${pt.productTypeName}" is now visible.`);
            }
            setConfirmOpen(false);
        } catch (error) {
            console.error(`Error ${action}ing:`, error);
            toast.error('Action failed', `Could not ${action} the entry.`);
        }
    }, [confirmTarget, deleteMutation, updateMutation, toast]);

    const handleExport = useCallback(() => {
        const exportData = productTypeList.map(pt => ({
            ID: pt.productTypeId || '',
            Name: pt.productTypeName || '',
            Status: pt.isActive ? 'Active' : 'Inactive'
        }));
        downloadCSV(exportData, 'ProductTypes');
        toast.success('Export completed', 'Product types data exported to CSV.');
    }, [productTypeList, toast]);

    const handleSubmit = useCallback(
        async (values: ProductTypeFormValues) => {
            try {
                if (editingProductType) {
                    await updateMutation.mutateAsync({
                        id: editingProductType.productTypeId,
                        data: {
                            ProductTypeName: values.productTypeName,
                            IsActive: values.isActive
                        }
                    });
                    toast.success('Entry updated', `"${values.productTypeName}" updated successfully.`);
                } else {
                    await createMutation.mutateAsync({
                        ProductTypeName: values.productTypeName,
                        IsActive: values.isActive
                    });
                    toast.success('Entry created', `"${values.productTypeName}" added successfully.`);
                }
                setDialogOpen(false);
            } catch (error) {
                console.error('Error saving product type:', error);
                toast.error('Save failed', 'Something went wrong while saving.');
            }
        },
        [editingProductType, createMutation, updateMutation, toast]
    );

    const columns = useProductTypeColumns({
        onEdit: handleEdit,
        onToggleStatus: handleToggleStatus
    });

    const table = useReactTable({
        data: productTypeList,
        columns,
        pageCount: data?.totalPages ?? -1,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            rowSelection,
            pagination,
        },
        manualPagination: true,
        enableRowSelection: true,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const handleBulkDelete = useCallback(async () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        const ids = selectedRows.map(row => (row.original as ProductType).productTypeId);
        
        if (!confirm(`Are you sure you want to deactivate ${ids.length} classification(s)?`)) return;

        try {
            await Promise.all(ids.map(id => deleteMutation.mutateAsync(id)));
            toast.success('Deactivated', `Selected classifications have been hidden.`);
            table.resetRowSelection();
        } catch {
            toast.error('Action failed', 'Some items could not be deactivated.');
        }
    }, [table, deleteMutation, toast]);

    const headerStats = [
        { label: 'Total Types', value: data?.totalCount ?? 0, icon: ProductAssetIcons.PRODUCT_CATEGORIES },
        { label: 'Active Targets', value: productTypeList.filter(p => p.isActive).length, icon: CheckCircle2 }
    ];

    const FilterMenu = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "gap-2 rounded-xl border-2 font-medium shadow-sm transition-all",
                        statusFilter !== 'all'
                            ? "border-[#4988c4] text-[#4988c4] bg-blue-50"
                            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    )}
                >
                    <Filter className="h-4 w-4" />
                    Filters {statusFilter !== 'all' && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#4988c4] text-[10px] text-white">1</span>}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] rounded-xl shadow-xl border-slate-200">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusFilterChange('all')} className="flex items-center justify-between">
                    Show All
                    {statusFilter === 'all' && <Check className="h-4 w-4 text-[#4988c4]" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilterChange('active')} className="flex items-center justify-between text-emerald-600 font-medium">
                    Active Only
                    {statusFilter === 'active' && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilterChange('inactive')} className="flex items-center justify-between text-rose-600 font-medium">
                    Inactive Only
                    {statusFilter === 'inactive' && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <AdminPageHeader
                icon={ProductAssetIcons.PRODUCT_CATEGORIES}
                title="Product Classifications"
                description="Manage cleaning targets and service categories"
                stats={headerStats}
            />

            <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50/20">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xl m-6 flex flex-col"
                >
                    <div className="flex flex-col h-full overflow-hidden">
                        <AdminTableSearch
                            table={table}
                            value={globalFilter}
                            onChange={setGlobalFilter}
                            placeholder="Search by classification name..."
                            resultCount={data?.totalCount ?? 0}
                            resultLabel="classifications"
                            actions={
                                <div className="flex items-center gap-3">
                                    {FilterMenu}
                                    <AdminActions
                                        onAdd={handleAdd}
                                        onExport={handleExport}
                                        showFilter={false}
                                        addLabel="Add Classification"
                                    />
                                </div>
                            }
                        />

                        <AnimatePresence>
                            {(table.getIsSomePageRowsSelected() || table.getIsAllPageRowsSelected()) && (
                                <div className="px-6 py-2 border-b border-gray-100 bg-slate-50/50">
                                    <AdminBulkActions
                                        table={table}
                                        itemLabel="classification"
                                        accentColor="black"
                                        onDelete={handleBulkDelete}
                                        deleteLabel="Deactivate"
                                    />
                                </div>
                            )}
                        </AnimatePresence>

                        <div className="flex-1 overflow-auto bg-white">
                            <AdminTableContent
                                table={table}
                                emptyMessage="No classifications found matching your criteria"
                                isLoading={isLoading}
                            />
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                            <AdminTablePagination table={table} itemLabel="classifications" />
                        </div>
                    </div>
                </motion.div>
            </div>

            <ProductTypeDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                productType={editingProductType}
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={confirmTarget?.isActive ? 'Deactivate Classification?' : 'Activate Classification?'}
                description={`Are you sure you want to ${confirmTarget?.isActive ? 'hide' : 'show'} "${confirmTarget?.productTypeName}"? This will affect its visibility in the booking system.`}
                confirmText={confirmTarget?.isActive ? 'Deactivate' : 'Activate'}
                onConfirm={executeToggleStatus}
                variant={confirmTarget?.isActive ? 'danger' : 'success'}
                isLoading={deleteMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}

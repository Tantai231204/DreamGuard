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
import { FolderTree } from 'lucide-react';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import {
    AdminTableSearch,
    AdminTableContent,
    AdminTablePagination,
    AdminBulkActions,
} from '@/components/admin';
import { LoadingSpinner } from '@/components/common';
import CategoryActions from './components/CategoryActions';
import CategoryDialog from './components/CategoryDialog';
import { useCategoryColumns } from './components/useCategoryColumns';
import { useCategories, useCreateCategory, useUpdateCategory } from '@/hooks/queries/useCategory';
import type { Category } from './types';

export default function CategoriesPage() {
    const toast = useToast();
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Gọi API lấy danh sách categories qua TanStack Query
    const { data: categoriesData = [], isLoading, isError, error } = useCategories();
    
    // Ensure categories is always an array
    const categories = useMemo(() => {
        return Array.isArray(categoriesData) ? categoriesData : [];
    }, [categoriesData]);

    // Mutations
    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();

    // Mở dialog tạo mới
    const handleAdd = useCallback(() => {
        setEditingCategory(null);
        setDialogOpen(true);
    }, []);

    // Mở dialog chỉnh sửa
    const handleEdit = useCallback((category: Category) => {
        setEditingCategory(category);
        setDialogOpen(true);
    }, []);

    // Submit form (create hoặc update)
    const handleSubmit = useCallback(
        (data: { name: string; slug: string; isActive: boolean }) => {
            if (editingCategory) {
                updateMutation.mutate(
                    { id: editingCategory.cateId, data },
                    {
                        onSuccess: () => {
                            setDialogOpen(false);
                            toast.success('Category updated', 'The category has been successfully updated.');
                        },
                    }
                );
            } else {
                createMutation.mutate(data, {
                    onSuccess: () => {
                        setDialogOpen(false);
                        toast.success('Category created', 'The new category has been successfully created.');
                    },
                });
            }
        },
        [editingCategory, createMutation, updateMutation, toast]
    );

    const columns = useCategoryColumns({ onEdit: handleEdit });

    // Stats
    const stats = useMemo(() => {
        const total = categories.length;
        const active = categories.filter((c) => c.isActive).length;
        const inactive = categories.filter((c) => !c.isActive).length;
        const withChildren = categories.filter((c) => c.childCategoryList?.length > 0).length;
        return { total, active, inactive, withChildren };
    }, [categories]);

    const table = useReactTable({
        data: categories,
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
            const item = row.original as Category;
            return (
                item.name.toLowerCase().includes(search) ||
                item.slug.toLowerCase().includes(search)
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
                    title="Categories"
                    description="Manage your product categories and subcategories"
                    icon={FolderTree}
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
                    title="Categories"
                    description="Manage your product categories and subcategories"
                    icon={FolderTree}
                    stats={[]}
                />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-500 font-semibold text-lg">Failed to load categories</p>
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
        { label: 'With Subs', value: stats.withChildren },
    ];

    return (
        <div className="flex flex-col h-full">
            <AdminPageHeader
                title="Categories"
                description="Manage your product categories and subcategories"
                icon={FolderTree}
                stats={headerStats}
            />

            <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-xl m-6 flex flex-col"
                >
                    <div className="flex flex-col h-full overflow-hidden">
                        {/* Bulk Actions */}
                        <AdminBulkActions
                            table={table}
                            itemLabel="category"
                            accentColor="blue"
                            onEdit={() => console.log('Edit selected')}
                            onDuplicate={() => console.log('Duplicate selected')}
                            onDelete={() => console.log('Delete selected')}
                        />

                        {/* Actions Toolbar */}
                        <CategoryActions
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
                            placeholder="Search categories by name, slug, or description..."
                            resultCount={table.getFilteredRowModel().rows.length}
                            resultLabel="categories"
                        />

                        {/* Table */}
                        <div className="flex-1 overflow-auto">
                            <AdminTableContent
                                table={table}
                                emptyMessage="No categories found"
                            />
                        </div>

                        {/* Pagination */}
                        <AdminTablePagination table={table} itemLabel="categories" />
                    </div>
                </motion.div>
            </div>

            {/* Create / Edit Dialog */}
            <CategoryDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                category={editingCategory}
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
    type Updater,
    type PaginationState,
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
import { downloadCSV } from '@/lib/export';
import type { Category } from './types';

export default function CategoriesPage() {
    const toast = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

    const pagination = useMemo(() => ({
        pageIndex: parseInt(searchParams.get('page') || '1') - 1,
        pageSize: parseInt(searchParams.get('pageSize') || '10'),
    }), [searchParams]);

    const globalFilter = searchParams.get('search') || '';

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

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Gọi API lấy danh sách categories qua TanStack Query
    const { data: categoriesData = [], isLoading, isError, error } = useCategories();
    
    // Ensure categories is always an array
    const categories = useMemo(() => {
        return Array.isArray(categoriesData) ? categoriesData : [];
    }, [categoriesData]);

    // Toggle expand/collapse
    const handleToggleExpand = useCallback((id: number) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    // Flatten categories for table display (including expanded children)
    const flattenedCategories = useMemo(() => {
        const result: (Category & { level: number; parentId?: number })[] = [];
        
        const flatten = (cats: Category[], level = 0, parentId?: number) => {
            cats.forEach((cat) => {
                result.push({ ...cat, level, parentId });
                
                if (expandedIds.has(cat.cateId) && cat.childCategoryList?.length > 0) {
                    flatten(cat.childCategoryList, level + 1, cat.cateId);
                }
            });
        };
        
        flatten(categories);
        return result;
    }, [categories, expandedIds]);

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

    const handleExport = useCallback(() => {
        const exportData = categories.map(cat => ({
            ID: cat.cateId || '',
            Name: cat.name || '',
            Slug: cat.slug || '',
            Active: cat.isActive ? 'Yes' : 'No',
            ChildrenCount: cat.childCategoryList?.length || 0
        }));
        downloadCSV(exportData, 'Categories');
    }, [categories]);

    // Submit form (create hoặc update)
    const handleSubmit = useCallback(
        (data: { name: string; slug: string; isActive: boolean; cateParentId?: number }) => {
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

    const columns = useCategoryColumns({ 
        onEdit: handleEdit,
        expandedIds,
        onToggleExpand: handleToggleExpand
    });

    const stats = useMemo(() => {
        const total = categories.length;
        const active = categories.filter((c) => c.isActive).length;
        const inactive = categories.filter((c) => !c.isActive).length;
        const withChildren = categories.filter((c) => c.childCategoryList?.length > 0).length;
        return { total, active, inactive, withChildren };
    }, [categories]);

    const table = useReactTable({
        data: flattenedCategories,
        columns,
        state: {
            sorting,
            globalFilter,
            columnFilters,
            rowSelection,
            pagination,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
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
                        />

                        {/* Actions Toolbar */}
                        <CategoryActions
                            onAdd={handleAdd}
                            onExport={handleExport}
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
                allCategories={categories}
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}

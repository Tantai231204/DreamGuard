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
import CategoryActions from './components/CategoryActions';
import CategoryDialog from './components/CategoryDialog';
import { useCategoryColumns } from './components/useCategoryColumns';
import { useCategories, useCreateCategory, useUpdateCategory } from '@/hooks/queries/useCategory';
import { downloadCSV } from '@/lib/export';
import type { Category } from './types';
import { useAdminTableSync } from '@/hooks/admin/useAdminTableSync';

export default function CategoriesPage() {
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
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const { data: categoriesData = [], isLoading } = useCategories();
    
    const categories = useMemo(() => {
        return Array.isArray(categoriesData) ? categoriesData : [];
    }, [categoriesData]);

    const handleToggleExpand = useCallback((id: number) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

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

    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();

    const handleAdd = useCallback(() => {
        setEditingCategory(null);
        setDialogOpen(true);
    }, []);

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

    const handleSubmit = useCallback(
        (data: { name: string; slug: string; isActive: boolean; cateParentId?: number }) => {
            if (editingCategory) {
                updateMutation.mutate({ id: editingCategory.cateId, data }, {
                    onSuccess: () => {
                        setDialogOpen(false);
                        toast.success('Category updated', 'The category has been successfully updated.');
                    },
                });
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
        state: { sorting, globalFilter, columnFilters, rowSelection, pagination },
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
            return item.name.toLowerCase().includes(search) || item.slug.toLowerCase().includes(search);
        },
    });

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
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="flex-1 bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-xl m-6 flex flex-col"
                >
                    <div className="flex flex-col h-full overflow-hidden">
                        <AdminBulkActions table={table} itemLabel="category" accentColor="blue" />
                        <CategoryActions onAdd={handleAdd} onExport={handleExport} onImport={() => {}} onFilter={() => {}} />

                        <AdminTableSearch
                            table={table}
                            value={globalFilter}
                            onChange={setGlobalFilter}
                            placeholder="Search categories by name, slug, or description..."
                            resultCount={table.getFilteredRowModel().rows.length}
                            resultLabel="categories"
                        />

                        <div className="flex-1 overflow-auto">
                            <AdminTableContent table={table} emptyMessage="No categories found" isLoading={isLoading} />
                        </div>

                        <AdminTablePagination table={table} itemLabel="categories" />
                    </div>
                </motion.div>
            </div>

            <CategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} category={editingCategory} allCategories={categories} onSubmit={handleSubmit} isLoading={createMutation.isPending || updateMutation.isPending} />
        </div>
    );
}

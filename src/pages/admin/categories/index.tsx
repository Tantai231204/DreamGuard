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
import { FolderTree } from 'lucide-react';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import {
    AdminTableSearch,
    AdminTableContent,
    AdminTablePagination,
    AdminBulkActions,
} from '@/components/admin';
import CategoryActions from './components/CategoryActions';
import { useCategoryColumns } from './components/useCategoryColumns';
import { mockCategories } from './data';
import type { Category } from './types';

export default function CategoriesPage() {
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const columns = useCategoryColumns();

    // Stats
    const stats = useMemo(() => {
        const total = mockCategories.length;
        const active = mockCategories.filter((c) => c.status === 'active').length;
        const inactive = mockCategories.filter((c) => c.status === 'inactive').length;
        const rootCategories = mockCategories.filter((c) => c.parentId === null).length;
        return { total, active, inactive, rootCategories };
    }, []);

    const table = useReactTable({
        data: mockCategories,
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
                item.slug.toLowerCase().includes(search) ||
                item.description.toLowerCase().includes(search)
            );
        },
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    const headerStats = [
        { label: 'Total', value: stats.total },
        { label: 'Active', value: stats.active },
        { label: 'Inactive', value: stats.inactive },
        { label: 'Root', value: stats.rootCategories },
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
                            onAdd={() => console.log('Add category')}
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
        </div>
    );
}

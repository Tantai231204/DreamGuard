import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
  type ExpandedState,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { AdminTableSearch, AdminTableContent, AdminTablePagination } from '@/components/admin';
import ProductTabs from './components/ProductTabs';
import ProductActions from './components/ProductActions';
import BulkActionsToolbar from './components/BulkActionsToolbar';
import ProductTableContent from './components/ProductTableContent';
import { useProductColumns } from './components/useProductColumns';
import { useComboColumns } from './components/useComboColumns';
import { mockProducts, mockCombos } from './data';
import { useProductStats } from './hooks';
import type { Product, Combo } from './types';

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<'single' | 'combo'>('single');
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});

  // Split data
  const singleProducts = useMemo(
    () => mockProducts.filter((p) => p.type === 'single'),
    []
  );
  const comboProducts = useMemo(
    () => mockCombos.filter((c) => c.type === 'combo'),
    []
  );

  const currentData = activeTab === 'single' ? singleProducts : comboProducts;
  const productColumns = useProductColumns();
  const comboColumns = useComboColumns();
  const currentColumns = activeTab === 'single' ? productColumns : comboColumns;

  const stats = useProductStats(mockProducts);

  const table = useReactTable({
    data: currentData as any,
    columns: currentColumns as any,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      rowSelection,
      expanded,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    enableRowSelection: true,
    enableExpanding: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const item = row.original as Product | Combo;
      return (
        item.name.toLowerCase().includes(search) ||
        item.sku.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search)
      );
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const headerStats = [
    {
      label: 'Total Products',
      value: stats.total,
    },
    {
      label: 'Total Variants',
      value: stats.totalVariants,
    },
    {
      label: 'Out of Stock',
      value: stats.outOfStock,
    },
    { label: 'Low Stock Variants', value: stats.lowStockVariants },
  ];

  return (
    <div className="flex flex-col h-full">
      <AdminPageHeader
        title="Products & Combos"
        description="Manage your product catalog and combo packages"
        icon={Package}
        stats={headerStats}
      />

      <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-xl m-6 flex flex-col"
        >
          <ProductTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            singleCount={singleProducts.length}
            comboCount={comboProducts.length}
          >
            <div className="flex flex-col h-full overflow-hidden">
              {/* Bulk Actions Toolbar */}
              <BulkActionsToolbar 
                table={table}
                productType={activeTab}
              />

              {/* Actions Toolbar */}
              <ProductActions
                productType={activeTab}
                onAdd={() => console.log('Add', activeTab)}
                onExport={() => console.log('Export')}
                onImport={() => console.log('Import')}
                onFilter={() => console.log('Filter')}
              />

              {/* Search */}
              <AdminTableSearch
                table={table}
                value={globalFilter}
                onChange={setGlobalFilter}
                placeholder={`Search ${activeTab === 'single' ? 'products' : 'combos'} by name, SKU, or category...`}
                resultCount={table.getFilteredRowModel().rows.length}
                resultLabel={activeTab === 'single' ? 'products' : 'combos'}
              />

              {/* Table */}
              <div className="flex-1 overflow-auto">
                <ProductTableContent
                  table={table as any}
                  type={activeTab}
                  emptyMessage={activeTab === 'single' ? 'No products found' : 'No combos found'}
                />
              </div>

              {/* Pagination */}
              <AdminTablePagination 
                table={table}
                itemLabel={activeTab === 'single' ? 'products' : 'combos'}
              />
            </div>
          </ProductTabs>
        </motion.div>
      </div>
    </div>
  );
}

import { memo } from 'react';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getExpandedRowModel } from '@tanstack/react-table';
import type { SortingState, ColumnFiltersState, RowSelectionState, ExpandedState, PaginationState, Table, ColumnDef } from '@tanstack/react-table';
import { ProductTableContent } from './product-table';
import { AdminTableSearch, AdminTablePagination, AdminBulkActions } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { Product, AdminProductState } from '../types';

interface ProductTableSectionProps {
  products: Product[];
  columns: ColumnDef<Product, unknown>[];
  pageData: { totalPages: number; totalCount: number } | undefined;
  state: AdminProductState;
  onSortingChange: (s: SortingState | ((prev: SortingState) => SortingState)) => void;
  onGlobalFilterChange: (f: string) => void;
  onColumnFiltersChange: (c: ColumnFiltersState | ((prev: ColumnFiltersState) => ColumnFiltersState)) => void;
  onRowSelectionChange: (r: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => void;
  onExpandedChange: (e: ExpandedState | ((prev: ExpandedState) => ExpandedState)) => void;
  onPaginationChange: (p: PaginationState | ((prev: PaginationState) => PaginationState)) => void;
  onBulkDelete: (table: Table<Product>) => void;
  onExport: () => void;
  onUpdateStatus?: (id: string, status: string, name?: string, cur?: string) => void;
  hideHeaderActions?: boolean;
}

export const ProductTableSection = memo(({
  products, columns, pageData, state,
  onSortingChange, onGlobalFilterChange, onColumnFiltersChange, onRowSelectionChange, onExpandedChange, onPaginationChange,
  onBulkDelete, onExport, onUpdateStatus, hideHeaderActions
}: ProductTableSectionProps) => {
  const table = useReactTable({
    data: products,
    columns,
    pageCount: pageData?.totalPages ?? -1,
    state: {
      sorting: state.sorting,
      globalFilter: state.globalFilter,
      columnFilters: state.columnFilters,
      rowSelection: state.rowSelection,
      expanded: state.expanded,
      pagination: state.pagination,
    },
    onSortingChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
    onRowSelectionChange,
    onExpandedChange,
    onPaginationChange,
    manualPagination: true,
    manualFiltering: true,
    enableRowSelection: true,
    enableExpanding: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="flex flex-col h-full">
      <AdminTableSearch
        placeholder="Search product name or SKU..."
        value={state.globalFilter}
        onChange={onGlobalFilterChange}
        table={table}
        resultCount={pageData?.totalCount}
        resultLabel="products"
        actions={!hideHeaderActions && (
          <Button
            variant="outline"
            onClick={onExport}
            className="rounded-xl border-2 font-semibold shadow-sm hover:shadow-md transition-all h-12 px-6"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Catalog
          </Button>
        )}
      />

      <AdminBulkActions
        table={table}
        itemLabel="product"
        onDelete={() => onBulkDelete(table)}
      />

      <div className="flex-1 overflow-auto min-h-0 text-[13px]">
        <ProductTableContent
          table={table}
          onAddVariant={columns.find(c => c.id === 'variants_info')?.cell ? (productId, name, slug, count, productType) => {
            state.setEditingVariant(null);
            state.setVariantProductId(productId);
            state.setVariantProductName(name);
            state.setVariantProductSlug(slug);
            state.setVariantCount(count);
            state.setVariantProductType(productType);
            state.setVariantDialogOpen(true);
          } : undefined}
          onEditVariant={(v, name, slug, productType) => {
            state.setEditingVariant(v);
            state.setVariantProductId(v.productId);
            if (name) state.setVariantProductName(name);
            if (slug) state.setVariantProductSlug(slug);
            state.setVariantProductType(productType);
            state.setVariantDialogOpen(true);
          }}
          onDeleteVariant={(v) => state.setDeleteVariant(v)}
          onUpdateStatus={onUpdateStatus}
        />
      </div>

      <AdminTablePagination
        table={table}
        itemLabel="products"
      />
    </div>
  );
});

ProductTableSection.displayName = 'ProductTableSection';

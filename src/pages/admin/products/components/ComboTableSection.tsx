import { memo } from 'react';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getExpandedRowModel } from '@tanstack/react-table';
import type { SortingState, RowSelectionState, ExpandedState, PaginationState, Table, ColumnDef } from '@tanstack/react-table';
import { ProductTableContent as ComboTableContent } from './product-table';
import { AdminTableSearch, AdminTablePagination, AdminBulkActions } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { Combo, AdminProductState } from '../types';

interface ComboTableSectionProps {
  combos: Combo[];
  columns: ColumnDef<Combo, unknown>[];
  pageData: { totalPages: number; totalCount: number } | undefined;
  state: AdminProductState;
  onSortingChange: (s: SortingState | ((prev: SortingState) => SortingState)) => void;
  onGlobalFilterChange: (f: string) => void;
  onRowSelectionChange: (r: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => void;
  onExpandedChange: (e: ExpandedState | ((prev: ExpandedState) => ExpandedState)) => void;
  onPaginationChange: (p: PaginationState | ((prev: PaginationState) => PaginationState)) => void;
  onBulkDelete: (table: Table<Combo>) => void;
  onExport: () => void;
  hideHeaderActions?: boolean;
}

export const ComboTableSection = memo(({
  combos, columns, pageData, state,
  onSortingChange, onGlobalFilterChange, onRowSelectionChange, onExpandedChange, onPaginationChange,
  onBulkDelete, onExport, hideHeaderActions
}: ComboTableSectionProps) => {
  const table = useReactTable({
    data: combos,
    columns,
    pageCount: pageData?.totalPages ?? -1,
    state: {
      sorting: state.comboSorting,
      globalFilter: state.comboGlobalFilter,
      rowSelection: state.comboRowSelection,
      expanded: state.comboExpanded,
      pagination: state.comboPagination,
    },
    onSortingChange,
    onGlobalFilterChange,
    onRowSelectionChange,
    onExpandedChange,
    onPaginationChange,
    manualPagination: true,
    manualFiltering: true,
    enableRowSelection: true,
    enableExpanding: true,
    getRowCanExpand: () => true,
    getSubRows: (row) => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="flex flex-col h-full">
      <AdminTableSearch
        placeholder="Search combo title or SKU..."
        value={state.comboGlobalFilter}
        onChange={onGlobalFilterChange}
        table={table}
        resultCount={pageData?.totalCount}
        resultLabel="combos"
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
        itemLabel="combo"
        onDelete={() => onBulkDelete(table)}
      />

      <div className="flex-1 overflow-auto min-h-0">
        <ComboTableContent
          table={table}
          type="combo"
          onAddComboVariant={(parent: Combo) => {
            state.setEditingCombo(null);
            state.setComboDialogMode('variant');
            state.setComboDefaultParentId(parent.id);
            state.setComboDialogKey((k: number) => k + 1);
            state.setComboDialogOpen(true);
          }}
          onEditCombo={(combo: Combo) => {
            state.setEditingCombo(combo);
            state.setComboDialogMode(combo.comboParentId ? 'variant' : 'parent');
            state.setComboDialogKey((k: number) => k + 1);
            state.setComboDialogOpen(true);
          }}
          onDeleteCombo={(combo: Combo) => {
            state.setDeleteCombo(combo);
          }}
        />
      </div>

      <AdminTablePagination
        table={table}
        itemLabel="combos"
      />
    </div>
  );
});

ComboTableSection.displayName = 'ComboTableSection';

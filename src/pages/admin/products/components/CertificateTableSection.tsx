// src/pages/admin/products/components/CertificateTableSection.tsx

import { memo } from 'react';
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel } from '@tanstack/react-table';
import type { SortingState, PaginationState, ColumnDef, Table, RowSelectionState } from '@tanstack/react-table';
import { CertificateTableContent } from './certificate/CertificateTableContent';
import { AdminTableSearch, AdminTablePagination, AdminBulkActions } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Download, Plus } from 'lucide-react';
import type { Certificate, AdminProductState } from '../types';

interface CertificateTableSectionProps {
  certificates: Certificate[];
  columns: ColumnDef<Certificate, unknown>[];
  pageData: { totalPages: number; totalCount: number } | undefined;
  state: AdminProductState;
  onSortingChange: (s: SortingState | ((prev: SortingState) => SortingState)) => void;
  onGlobalFilterChange: (f: string) => void;
  onPaginationChange: (p: PaginationState | ((prev: PaginationState) => PaginationState)) => void;
  onRowSelectionChange: (r: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => void;
  onBulkDelete: (table: Table<Certificate>) => void;
  onExport: () => void;
  onCreate: () => void;
  hideHeaderActions?: boolean;
}

export const CertificateTableSection = memo(({
  certificates, columns, pageData, state,
  onSortingChange, onGlobalFilterChange, onPaginationChange, onRowSelectionChange,
  onBulkDelete, onExport, onCreate, hideHeaderActions
}: CertificateTableSectionProps) => {
  const table = useReactTable({
    data: certificates,
    columns,
    pageCount: pageData?.totalPages ?? -1,
    state: {
      sorting: state.certSorting,
      globalFilter: state.certGlobalFilter,
      pagination: state.certPagination,
      rowSelection: state.certRowSelection,
    },
    onSortingChange,
    onGlobalFilterChange,
    onPaginationChange,
    onRowSelectionChange,
    manualPagination: true,
    manualFiltering: true,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col h-full">
      <AdminTableSearch
        placeholder="Search certificate name..."
        value={state.certGlobalFilter}
        onChange={onGlobalFilterChange}
        table={table}
        resultCount={pageData?.totalCount}
        resultLabel="certificates"
        actions={!hideHeaderActions && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onExport}
              className="rounded-xl border-2 font-semibold shadow-sm hover:shadow-md transition-all h-12 px-6"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={onCreate}
              className="rounded-xl font-semibold shadow-sm hover:shadow-md transition-all h-12 px-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Certificate
            </Button>
          </div>
        )}
      />

      <AdminBulkActions
        table={table}
        itemLabel="certificate"
        onDelete={() => onBulkDelete(table)}
      />

      <div className="flex-1 overflow-auto min-h-0 text-[13px]">
        <CertificateTableContent table={table} />
      </div>

      <AdminTablePagination
        table={table}
        itemLabel="certificates"
      />
    </div>
  );
});

CertificateTableSection.displayName = 'CertificateTableSection';

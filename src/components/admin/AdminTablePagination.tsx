import { type Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminTablePaginationProps<T> {
  table: Table<T>;
  itemLabel?: string;
  totalItems?: number;
}

export function AdminTablePagination<T>({ 
  table,
  itemLabel = 'items',
  totalItems,
}: AdminTablePaginationProps<T>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = totalItems ?? table.getFilteredRowModel().rows.length;
  const currentRows = table.getRowModel().rows.length;
  const pageCount = table.getPageCount();
  const displayPageCount = pageCount > 0 ? pageCount : Math.max(1, Math.ceil(totalRows / Math.max(1, pageSize)));

  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = totalRows === 0 ? 0 : Math.min(pageIndex * pageSize + currentRows, totalRows);

  return (
    <div className="flex items-center justify-between px-6 py-5 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
      <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white border-2 border-gray-200 shadow-sm">
        <span className="text-sm font-medium text-gray-600">Showing</span>
        <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-white font-bold text-sm">{startRow}</span>
        <span className="text-sm font-medium text-gray-600">to</span>
        <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-white font-bold text-sm">{endRow}</span>
        <div className="h-4 w-px bg-gray-300"></div>
        <span className="text-sm font-medium text-gray-600">of</span>
        <span className="px-2 py-0.5 rounded-md bg-gray-800 text-white font-bold text-sm">{totalRows}</span>
        <span className="text-sm font-semibold text-gray-700">{itemLabel}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="gap-2 h-10 px-4 rounded-xl border-2 font-semibold shadow-sm hover:shadow-md border-gray-300 hover:border-[var(--color-primary)] hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-gray-200 shadow-sm">
          <span className="text-sm font-medium text-gray-600">Page</span>
          <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-blue-600 text-white font-bold">{pageIndex + 1}</span>
          <span className="text-sm font-medium text-gray-600">of</span>
          <span className="font-bold text-gray-900">{displayPageCount}</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="gap-2 h-10 px-4 rounded-xl border-2 font-semibold shadow-sm hover:shadow-md border-gray-300 hover:border-[var(--color-primary)] hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

import { type Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import type { Order } from '../../types';

interface OrderTablePaginationProps {
  table: Table<Order>;
}

export const OrderTablePagination = ({ table }: OrderTablePaginationProps) => {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;

  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200">
      <div className="text-sm text-gray-500">
        Showing {startRow} to {endRow} of {totalRows} orders
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

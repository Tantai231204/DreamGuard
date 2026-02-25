import { memo } from 'react';
import { flexRender, type Table } from '@tanstack/react-table';
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Order } from '../../types';

interface OrderTableContentProps {
  table: Table<Order>;
}

export const OrderTableContent = memo(({ table }: OrderTableContentProps) => {
  const rows = table.getRowModel().rows;
  const pageSize = table.getState().pagination.pageSize;
  const columnCount = table.getAllColumns().length;

  // Calculate empty rows needed to fill page
  const emptyRowsCount = Math.max(0, pageSize - rows.length);

  return (
    <div className="overflow-x-auto">
      <TableUI>
        <TableHeader className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-b-2 border-gray-200">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="font-semibold text-gray-700">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {/* Data rows */}
          {rows.map((row, idx) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && 'selected'}
              className="hover:bg-blue-50/50 transition-all duration-200 border-b border-gray-100 group"
              style={{
                animation: `slideInFromLeft 0.3s ease-out ${idx * 0.05}s both`,
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-4 group-hover:text-gray-900 transition-colors">
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {/* Empty rows to maintain consistent height */}
          {Array.from({ length: emptyRowsCount }).map((_, index) => (
            <TableRow key={`empty-${index}`} className="border-b border-gray-100">
              {Array.from({ length: columnCount }).map((_, cellIndex) => (
                <TableCell key={cellIndex} className="py-4">
                  <div className="h-6">&nbsp;</div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </TableUI>
      <style>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
});

OrderTableContent.displayName = 'OrderTableContent';

import { flexRender, type Table } from '@tanstack/react-table';
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AdminTableContentProps<T> {
  table: Table<T>;
  emptyMessage?: string;
}

export function AdminTableContent<T>({ 
  table,
  emptyMessage = "No data found"
}: AdminTableContentProps<T>) {
  const rows = table.getRowModel().rows;
  const pageSize = table.getState().pagination.pageSize;
  const columnCount = table.getAllColumns().length;

  // Calculate empty rows needed to fill page for consistent height
  const emptyRowsCount = Math.max(0, pageSize - rows.length);

  return (
    <div className="overflow-x-auto">
      <TableUI>
        <TableHeader className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-b-2 border-gray-200 hover:bg-gray-50">
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
          {rows.length > 0 ? (
            <>
              {/* Data rows */}
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="group hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-transparent transition-all duration-200 border-b border-gray-100 data-[state=selected]:bg-blue-50/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
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
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={columnCount} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <p className="text-lg font-medium">{emptyMessage}</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </TableUI>
    </div>
  );
}

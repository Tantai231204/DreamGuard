import { flexRender } from '@tanstack/react-table';
import type { Table as TanStackTable } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { User } from '../types';

interface UserTableContentProps {
  table: TanStackTable<User>;
}

export function UserTableContent({ table }: UserTableContentProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50/80 hover:bg-gray-50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="font-semibold text-gray-700"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="cursor-pointer transition-colors hover:bg-blue-50/30 border-b border-gray-100 h-[65px]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {/* Spacer Rows to prevent Layout Collapsing */}
                {Array.from({ length: Math.max(0, 10 - table.getRowModel().rows.length) }).map((_, i) => (
                  <TableRow key={`empty-${i}`} className="h-[65px] border-b border-gray-50/20 hover:bg-transparent">
                    <TableCell colSpan={table.getAllColumns().length} />
                  </TableRow>
                ))}
              </>
            ) : (
              <TableRow className="h-[650px] hover:bg-transparent">
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="text-center text-gray-500 font-medium"
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-gray-400">No customers found.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

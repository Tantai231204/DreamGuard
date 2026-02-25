import { flexRender, type Table } from '@tanstack/react-table';
import { AnimatePresence } from 'framer-motion';
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import VariantTable from './VariantTable';
import type { Product } from '../types';

interface ProductTableContentProps {
  table: Table<Product>;
  emptyMessage?: string;
}

export default function ProductTableContent({
  table,
  emptyMessage = 'No products found',
}: ProductTableContentProps) {
  const rows = table.getRowModel().rows;
  const pageSize = table.getState().pagination.pageSize;
  const columnCount = table.getAllColumns().length;

  // Adjust empty rows based on expanded state
  const expandedCount = rows.filter(r => r.getIsExpanded()).length;
  const emptyRowsCount = Math.max(0, pageSize - rows.length - expandedCount);

  return (
    <div className="overflow-x-auto">
      <TableUI>
        <TableHeader className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-b-2 border-gray-200 hover:bg-gray-50"
            >
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="font-semibold text-gray-700">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            <>
              {rows.map((row) => {
                const product = row.original;
                const isExpanded = row.getIsExpanded();

                return (
                  <AnimatePresence key={row.id}>
                    {/* Product row */}
                    <TableRow
                      data-state={row.getIsSelected() && 'selected'}
                      className={`group hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-transparent transition-all duration-200 border-b border-gray-100 data-[state=selected]:bg-blue-50/50 cursor-pointer ${
                        isExpanded ? 'bg-blue-50/20 border-b-0' : ''
                      }`}
                      onClick={(e) => {
                        // Don't toggle if clicking on checkbox, button, or dropdown
                        const target = e.target as HTMLElement;
                        if (
                          target.closest('button') ||
                          target.closest('[role="checkbox"]') ||
                          target.closest('[role="menuitem"]')
                        ) {
                          return;
                        }
                        row.toggleExpanded();
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Expanded variant sub-table */}
                    {isExpanded && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={columnCount} className="p-0">
                          <VariantTable
                            variants={product.variants}
                            productName={product.name}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                );
              })}
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

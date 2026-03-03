import React from 'react';
import { flexRender, type Table } from '@tanstack/react-table';
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import VariantTable from './VariantTable';
import ComboItemsTable from './ComboItemsTable';
import type { Product, Combo } from '../types';

interface ProductTableContentProps<T extends Product | Combo> {
  table: Table<T>;
  emptyMessage?: string;
  type: 'single' | 'combo';
}

export default function ProductTableContent<T extends Product | Combo>({
  table,
  emptyMessage = 'No products found',
  type,
}: ProductTableContentProps<T>) {
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
                const item = row.original;
                const isExpanded = row.getIsExpanded();
                const isCombo = type === 'combo';

                return (
                  <React.Fragment key={row.id}>
                    {/* Product/Combo row */}
                    <TableRow
                      data-state={row.getIsSelected() && 'selected'}
                      className={`hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer ${
                        isCombo 
                          ? 'data-[state=selected]:bg-purple-50'
                          : 'data-[state=selected]:bg-blue-50'
                      } ${
                        isExpanded 
                          ? isCombo ? 'bg-purple-50/20 border-b-0' : 'bg-blue-50/20 border-b-0'
                          : ''
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

                    {/* Expanded detail sub-table */}
                    {isExpanded && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={columnCount} className="p-0">
                          {type === 'combo' ? (
                            <ComboItemsTable
                              items={(item as Combo).items}
                              comboName={item.name}
                              discount={(item as Combo).discount}
                            />
                          ) : (
                            <VariantTable
                              variants={(item as Product).variants}
                              productName={item.name}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
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

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
import VariantTableWrapper from '../variant-table/VariantTableWrapper';
import type { Product, ProductVariant } from '../../types';

// Extended product type that includes combo items
interface ProductWithItems extends Product {
  items?: { id: string; name: string; quantity: number }[];
}

interface ProductTableContentProps<T = unknown> {
  table: Table<T>;
  emptyMessage?: string;
  type?: 'single' | 'combo';
  onAddVariant?: (productId: string, productName: string, productSlug: string, variantCount: number) => void;
  onEditVariant?: (variant: ProductVariant) => void;
  onDeleteVariant?: (variant: ProductVariant) => void;
}

export default function ProductTableContent<T = unknown>({
  table,
  emptyMessage = 'No products found',
  onAddVariant,
  onEditVariant,
  onDeleteVariant,
}: ProductTableContentProps<T>) {
  const rows = table.getRowModel().rows;
  const pageSize = table.getState().pagination.pageSize;
  const columnCount = table.getAllColumns().length;

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
                const item = row.original as ProductWithItems;
                const isExpanded = row.getIsExpanded();
                // Check both variants array and variantCount (API may return count without full array)
                const hasVariants = (item.variants?.length ?? 0) > 0 || (item.variantCount ?? 0) > 0 || (item.items?.length ?? 0) > 0;

                return (
                  <React.Fragment key={row.id}>
                    {/* Product row */}
                    <TableRow
                      data-state={row.getIsSelected() && 'selected'}
                      className={`hover:bg-gray-50 transition-colors border-b border-gray-100 data-[state=selected]:bg-blue-50 ${isExpanded ? 'bg-blue-50/20 border-b-0' : ''
                        } ${hasVariants ? 'cursor-pointer' : ''}`}
                      onClick={(e) => {
                        if (!hasVariants) return;
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

                    {/* Expanded variant sub-table (for products) or combo items (for combos) */}
                    {isExpanded && (
                      <>
                        {/* Show variant table - fetch from API */}
                        {((item.variants?.length ?? 0) > 0 || (item.variantCount ?? 0) > 0) && (
                          <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={columnCount} className="p-0">
                              <VariantTableWrapper
                                productId={item.id}
                                productName={item.name}
                                onAddVariant={() => onAddVariant?.(item.id, item.name, item.slug, item.variants?.length ?? item.variantCount ?? 0)}
                                onEditVariant={(variant) => onEditVariant?.(variant)}
                                onDeleteVariant={(variant) => onDeleteVariant?.(variant)}
                              />
                            </TableCell>
                          </TableRow>
                        )}
                        {(item.items?.length ?? 0) > 0 && (
                          <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={columnCount} className="p-0">
                              {/* Combo items will be rendered by ComboItemsTable in the column definition */}
                            </TableCell>
                          </TableRow>
                        )}
                      </>
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

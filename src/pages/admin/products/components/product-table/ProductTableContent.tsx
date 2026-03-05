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
import ComboItemsTable from '../combo/ComboItemsTable';
import type { Product, ProductVariant, Combo, ComboItem } from '../../types';

interface ExtendedRow extends Product {
  items?: ComboItem[];
  productItems?: unknown[];
  type?: string;
  discount?: number;
}

interface ProductTableContentProps<T = unknown> {
  table: Table<T>;
  emptyMessage?: string;
  type?: 'single' | 'combo';
  onAddVariant?: (productId: string, productName: string, productSlug: string, variantCount: number) => void;
  onEditVariant?: (variant: ProductVariant) => void;
  onDeleteVariant?: (variant: ProductVariant) => void;
  onAddComboVariant?: (parent: Combo) => void;
  onEditCombo?: (combo: Combo) => void;
  onDeleteCombo?: (combo: Combo) => void;
  onDuplicateCombo?: (combo: Combo) => void;
}

export default function ProductTableContent<T = unknown>({
  table,
  emptyMessage = 'No products found',
  type,
  onAddVariant,
  onEditVariant,
  onDeleteVariant,
  onAddComboVariant,
  onEditCombo,
  onDeleteCombo,
  onDuplicateCombo,
}: ProductTableContentProps<T>) {
  // Only iterate depth-0 rows; sub-rows are handled by expansion panels below each row
  const allRows = table.getRowModel().rows;
  const rootRows = type === 'combo'
    ? allRows.filter((r) => r.depth === 0)
    : allRows;

  const pageSize = table.getState().pagination.pageSize;
  const columnCount = table.getAllColumns().length;
  const emptyRowsCount = Math.max(0, pageSize - rootRows.length);

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
          {rootRows.length > 0 ? (
            <>
              {rootRows.map((row) => {
                const item = row.original as ExtendedRow;
                const isExpanded = row.getIsExpanded();
                const isCombo = type === 'combo' || item?.type === 'combo';

                const hasProductVariants =
                  !isCombo &&
                  ((item.variants?.length ?? 0) > 0 || (item.variantCount ?? 0) > 0);

                const hasComboItems =
                  isCombo &&
                  ((item.items?.length ?? 0) > 0 ||
                    (item.productItems?.length ?? 0) > 0 ||
                    row.getCanExpand());

                const isClickable = hasProductVariants || hasComboItems || (isCombo && row.getCanExpand());

                return (
                  <React.Fragment key={row.id}>
                    {/* ── Data row ── */}
                    <TableRow
                      data-state={row.getIsSelected() && 'selected'}
                      className={[
                        'hover:bg-gray-50 transition-colors border-b border-gray-100',
                        'data-[state=selected]:bg-blue-50',
                        isExpanded ? 'bg-blue-50/20 border-b-0' : '',
                        isClickable ? 'cursor-pointer' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={(e) => {
                        if (!isClickable) return;
                        const target = e.target as HTMLElement;
                        if (
                          target.closest('button') ||
                          target.closest('[role="checkbox"]') ||
                          target.closest('[role="menuitem"]')
                        )
                          return;
                        row.toggleExpanded();
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3.5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* ── Expanded panel ── */}
                    {isExpanded && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={columnCount} className="p-0">
                          {/* Single product → variant table */}
                          {!isCombo && hasProductVariants && (
                            <VariantTableWrapper
                              productId={item.id}
                              productName={item.name}
                              onAddVariant={() =>
                                onAddVariant?.(
                                  item.id,
                                  item.name,
                                  item.slug,
                                  item.variants?.length ?? item.variantCount ?? 0,
                                )
                              }
                              onEditVariant={(v) => onEditVariant?.(v)}
                              onDeleteVariant={(v) => onDeleteVariant?.(v)}
                            />
                          )}

                          {/* Combo → items table */}
                          {isCombo && (
                            <ComboItemsTable
                              comboId={item.id}
                              items={(item.items as ComboItem[]) ?? []}
                              childCombos={(item as any).childCombos}
                              comboName={item.name}
                              discount={(row.original as unknown as Combo).discount ?? 0}
                              onAddVariant={onAddComboVariant}
                              onEditVariant={onEditCombo}
                              onDeleteVariant={onDeleteCombo}
                              onDuplicateVariant={onDuplicateCombo}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Empty filler rows */}
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

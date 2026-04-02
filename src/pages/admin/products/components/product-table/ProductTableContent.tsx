import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { cn } from '@/lib/utils';
import type { Product, ProductVariant, Combo, ComboItem } from '../../types';
import type { ProductItemResponse } from '@/api/services/comboService';

interface ExtendedRow extends Product {
  items?: ComboItem[];
  productItems?: ProductItemResponse[];
  childCombos?: Combo[];
  type?: string;
  discount?: number;
}

interface ProductTableContentProps<T = unknown> {
  table: Table<T>;
  emptyMessage?: string;
  type?: 'single' | 'combo';
  onAddVariant?: (productId: string, productName: string, productSlug: string, variantCount: number, productType?: import("@/api/types/product.types").FullyCustomizedProductType) => void;
  onEditVariant?: (variant: ProductVariant, productName?: string, productSlug?: string, productType?: import("@/api/types/product.types").FullyCustomizedProductType) => void;
  onDeleteVariant?: (variant: ProductVariant) => void;
  onAddComboVariant?: (parent: Combo) => void;
  onEditCombo?: (combo: Combo) => void;
  onDeleteCombo?: (combo: Combo) => void;
  onUpdateStatus?: (id: string, status: string, name?: string, cur?: string) => void;
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
  onUpdateStatus,
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
                    className={cn(
                      'group transition-colors duration-200 border-b border-slate-100',
                      'hover:bg-slate-50/80',
                      'data-[state=selected]:bg-blue-50/40 data-[state=selected]:border-blue-100',
                      isExpanded && 'bg-slate-50/80 border-b-transparent relative z-20 shadow-md',
                      isClickable && 'cursor-pointer'
                    )}
                    onClick={(e) => {
                      if (!isClickable) return;
                      const target = e.target as HTMLElement;
                      if (
                        target.closest('button') ||
                        target.closest('[role="checkbox"]') ||
                        target.closest('[role="menuitem"]') ||
                        target.closest('.dropdown-trigger')
                      )
                        return;
                      row.toggleExpanded();
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4 first:pl-6 last:pr-6 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* ── Expanded panel ── */}
                  <AnimatePresence>
                    {isExpanded && (
                      <TableRow key={`expanded-${row.id}`} className="hover:bg-transparent border-none">
                        <TableCell colSpan={columnCount} className="p-0 border-none">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="relative pl-12 pb-6 pr-6">
                              {/* Visual Connector Line */}
                              <div className="absolute left-6 top-0 bottom-6 w-px bg-slate-200" />
                              <div className="absolute left-6 bottom-6 w-4 h-px bg-slate-200" />

                              <div className="bg-white rounded-xl border border-slate-200 mt-1 mx-2 overflow-hidden">
                                {/* Single product → variant table */}
                                {!isCombo && hasProductVariants && (
                                  <VariantTableWrapper
                                    productId={item.id}
                                    productName={item.name}
                                    isTemplate={!!item.fullyCustomizedProductType && item.fullyCustomizedProductType !== 'None'}
                                    onAddVariant={() =>
                                      onAddVariant?.(
                                        item.id,
                                        item.name,
                                        item.slug,
                                        item.variants?.length ?? item.variantCount ?? 0,
                                        item.fullyCustomizedProductType
                                      )
                                    }
                                    onEditVariant={(v) => onEditVariant?.(v, item.name, item.slug, item.fullyCustomizedProductType)}
                                    onDeleteVariant={(v) => onDeleteVariant?.(v)}
                                  />
                                )}

                                {/* Combo → items table */}
                                {isCombo && (
                                  <ComboItemsTable
                                    comboId={item.id}
                                    items={(item.items as ComboItem[]) ?? []}
                                    childCombos={item.childCombos}
                                    comboName={item.name}
                                    discount={item.discount ?? 0}
                                    onAddVariant={onAddComboVariant}
                                    onEditVariant={onEditCombo}
                                    onDeleteVariant={onDeleteCombo}
                                    onUpdateStatus={onUpdateStatus}
                                  />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
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
  );
}

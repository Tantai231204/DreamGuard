import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { flexRender, type Table } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { SearchX } from 'lucide-react';

import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface TradeInVirtualizedTableProps<T> {
  table: Table<T>;
  emptyMessage?: string;
  isLoading?: boolean;
  rowHeight?: number;
  virtualizeThreshold?: number;
}

export function TradeInVirtualizedTable<T>({
  table,
  emptyMessage = 'No data found',
  isLoading = false,
  rowHeight = 86,
  virtualizeThreshold = 30,
}: TradeInVirtualizedTableProps<T>) {
  const rows = table.getRowModel().rows;
  const pageSize = table.getState().pagination.pageSize;
  const columnCount = table.getAllColumns().length;
  const layoutRowTarget = Math.min(pageSize, 10);
  const navigate = useNavigate();

  const parentRef = useRef<HTMLDivElement>(null);
  const shouldVirtualize = !isLoading && rows.length >= virtualizeThreshold;
  const emptyRowsCount =
    !isLoading && !shouldVirtualize && rows.length > 0
      ? Math.max(0, layoutRowTarget - rows.length)
      : 0;

  const rowVirtualizer = useVirtualizer({
    count: shouldVirtualize ? rows.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 8,
  });

  const virtualRows = shouldVirtualize ? rowVirtualizer.getVirtualItems() : [];
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
      : 0;

  return (
    <div ref={parentRef} className="h-full overflow-auto custom-scrollbar">
      <TableUI>
        <TableHeader className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-200/80">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-b border-slate-200/80 hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="h-11">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: layoutRowTarget }).map((_, index) => (
              <TableRow key={`loading-${index}`} className="border-b border-slate-100">
                {Array.from({ length: columnCount }).map((__, cellIndex) => (
                  <TableCell key={cellIndex} className="py-4">
                    <Skeleton className="h-4 w-full bg-slate-100 rounded-md" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length > 0 ? (
            <>
              {shouldVirtualize && paddingTop > 0 ? (
               <TableRow className="border-0 hover:bg-transparent">
                 <TableCell colSpan={columnCount} style={{ height: `${paddingTop}px`, padding: 0 }} />
               </TableRow>
              ) : null}

              {(shouldVirtualize ? virtualRows : rows.map((_, index) => ({ index, key: index }))).map((virtualRow) => {
                const row = rows[virtualRow.index];

                if (!row) {
                  return null;
                }

                return (
                  <TableRow
                    key={row.id}
                    ref={shouldVirtualize ? (node) => rowVirtualizer.measureElement(node) : undefined}
                    data-index={virtualRow.index}
                    data-state={row.getIsSelected() && 'selected'}
                    onClick={() => navigate(`/admin/trade-in-orders/${(row.original as { tradeInOrderId: string }).tradeInOrderId}`)}
                    className="cursor-pointer group hover:bg-slate-50/80 transition-colors duration-200 border-b border-slate-100 data-[state=selected]:bg-slate-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4 px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}

              {!shouldVirtualize
                ? Array.from({ length: emptyRowsCount }).map((_, index) => (
                  <TableRow key={`empty-${index}`} className="border-b border-slate-100 hover:bg-transparent">
                    {Array.from({ length: columnCount }).map((__, cellIndex) => (
                      <TableCell key={cellIndex} className="py-3 px-4">
                        <div className="h-10">&nbsp;</div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
                : null}

              {shouldVirtualize && paddingBottom > 0 ? (
                <TableRow className="border-0 hover:bg-transparent">
                  <TableCell colSpan={columnCount} style={{ height: `${paddingBottom}px`, padding: 0 }} />
                </TableRow>
              ) : null}
            </>
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount} className="h-[400px]">
                <div className="flex flex-col items-center justify-center text-center p-8">
                  <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <SearchX className="h-10 w-10 text-slate-300" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{emptyMessage}</h3>
                  <p className="text-xs text-slate-500 max-w-sm mb-6">
                    We couldn't find any trade-in records matching your current filter criteria.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                        // Assuming you might want to reset filters in a perfect world, 
                        // but here we just encourage the user since this component doesn't own filters.
                    }}
                    className="h-8 text-[11px] font-bold uppercase tracking-wider text-slate-600 rounded-lg pointer-events-none"
                  >
                    Adjust your filters
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </TableUI>
    </div>
  );
}

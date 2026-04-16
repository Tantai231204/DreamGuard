// src/pages/admin/products/components/certificate/CertificateTableContent.tsx

import { flexRender } from '@tanstack/react-table';
import type { Table as TanstackTable } from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Certificate } from '../../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArchiveX } from 'lucide-react';

interface CertificateTableContentProps {
  table: TanstackTable<Certificate>;
}

export function CertificateTableContent({ table }: CertificateTableContentProps) {
  const { rows } = table.getRowModel();
  const columnCount = table.getAllColumns().length;

  return (
    <div className="relative h-full w-full overflow-x-auto">
      <Table>
        <TableHeader className="bg-slate-50/80 sticky top-0 z-20 backdrop-blur-md">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-b-2 border-slate-200 hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    "h-12 px-6 text-left align-middle text-xs font-bold uppercase tracking-wider text-slate-500 transition-colors whitespace-nowrap",
                    header.column.getIsSorted() && "text-primary-600 bg-primary-50/30"
                  )}
                  style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      {...{
                        className: header.column.getCanSort() ? 'cursor-pointer select-none flex items-center gap-1.5 hover:text-primary-600 transition-colors' : '',
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody className="bg-white">
          <AnimatePresence mode="popLayout">
            {rows.length > 0 ? (
              rows.map((row) => (
                <motion.tr
                  key={row.id}
                  layout="position"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "group transition-all duration-200 border-b border-slate-100/60 hover:bg-slate-50/80 hover:shadow-sm",
                    row.getIsSelected() && "bg-primary-50/40 border-primary-100"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-6 py-4 align-middle transition-colors whitespace-nowrap"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </motion.tr>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columnCount} className="h-[200px] text-center border-b border-slate-50">
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                      <ArchiveX className="w-6 h-6 text-slate-300" />
                    </div>
                    <div className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">No certificates found</div>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight opacity-60">Adjust your search or active filters</p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* 🔥 filler rows logic so the table doesn't shift height */}
            {Array.from({ length: Math.max(0, (table.getState().pagination.pageSize || 10) - (rows.length > 0 ? rows.length : 1)) }).map((_, index) => (
              <TableRow key={`fill-${index}`} className="border-b border-slate-50/50 hover:bg-transparent">
                {Array.from({ length: columnCount }).map((__, i) => (
                  <TableCell key={i} className="px-6 py-6">&nbsp;</TableCell>
                ))}
              </TableRow>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}

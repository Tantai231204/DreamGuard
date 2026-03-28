// src/pages/admin/products/components/certificate/CertificateTableContent.tsx

import { flexRender } from '@tanstack/react-table';
import type { Table } from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Certificate } from '../../types';

interface CertificateTableContentProps {
  table: Table<Certificate>;
}

export function CertificateTableContent({ table }: CertificateTableContentProps) {
  const { rows } = table.getRowModel();

  return (
    <div className="relative h-full w-full">
      <table className="w-full border-separate border-spacing-0">
        <thead className="sticky top-0 z-20 bg-white/90 backdrop-blur-md">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    "border-b border-slate-100 px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500 transition-colors",
                    header.column.getIsSorted() && "text-indigo-600 bg-indigo-50/20"
                  )}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      {...{
                        className: header.column.getCanSort() ? 'cursor-pointer select-none flex items-center gap-1.5' : '',
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
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className="bg-white">
          <AnimatePresence mode="popLayout">
            {rows.length > 0 ? (
              rows.map((row) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "group transition-all duration-200 hover:bg-slate-50 border-b border-transparent",
                    row.getIsSelected() && "bg-indigo-50/40 border-indigo-100"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        "px-6 py-4 transition-colors border-b border-slate-50",
                        row.getIsSelected() && "border-indigo-100/50"
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={table.getAllColumns().length} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm font-medium">No certificates found matching your search.</span>
                  </div>
                </td>
              </tr>
            )}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}

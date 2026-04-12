import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import type { Certificate } from '../../types';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Eye, ShieldCheck } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { CertificateStatusCell } from './CertificateStatusCell';
import { getCertificateStyle } from '@/shared/data/certificates';
import { cn } from '@/lib/utils';

const columnHelper = createColumnHelper<Certificate>();

interface UseCertificateColumnsProps {
  onEdit: (cert: Certificate) => void;
  onDelete: (cert: Certificate) => void;
  onView?: (cert: Certificate) => void;
}

export const useCertificateColumns = ({ onEdit, onDelete, onView }: UseCertificateColumnsProps) => {
  return useMemo(() => [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor('name', {
      header: 'Certificate',
      cell: (info) => {
        const name = info.getValue();
        const registry = getCertificateStyle(name);
        const Icon = registry.icon || ShieldCheck;

        return (
          <div className="flex items-center gap-4 py-1.5">
            <div className={cn(
                "w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 overflow-hidden",
                registry.bgColor
            )}>
              {registry.image ? (
                <img src={registry.image} alt={name} className="w-full h-full object-contain p-2" />
              ) : (
                <Icon className={cn("w-6 h-6", registry.iconColor)} />
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-black text-slate-900 text-[13px] tracking-tight">{name}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">#{info.row.original.id.slice(0, 8)}</span>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('summary', {
      header: 'Summary',
      cell: (info) => <div className="max-w-[300px] truncate font-medium text-slate-600">{info.getValue()}</div>,
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      cell: (info) => <div className="max-w-[400px] truncate text-slate-500">{info.getValue()}</div>,
    }),
    columnHelper.accessor('isActive', {
      header: 'Status',
      cell: ({ row }) => {
        const cert = row.original;
        return <CertificateStatusCell cert={cert} />;
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const cert = row.original;
        return (
          <div className="flex items-center justify-end gap-1 px-2">
            {onView && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onView(cert)}
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(cert)}
              className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(cert)}
              className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    }),
  ], [onEdit, onDelete, onView]);
};

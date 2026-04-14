// src/pages/admin/customize-types/components/useCustomizeTypeColumns.tsx
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2, Eye } from 'lucide-react';
import {
    AdminRowActions,
    AdminStatusBadge,
    SortableHeader
} from '@/components/admin';
import { Checkbox } from '@/components/ui/checkbox';
import { formatPrice } from '@/lib/utils';
import type { CustomizeType } from '../types';

interface UseCustomizeTypeColumnsProps {
  onView: (type: CustomizeType) => void;
  onEdit: (type: CustomizeType) => void;
  onDelete: (id: string) => void;
}

export function useCustomizeTypeColumns({ onView, onEdit, onDelete }: UseCustomizeTypeColumnsProps) {
  const columns = useMemo<ColumnDef<CustomizeType>[]>(() => [
    {
        id: 'select',
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
    },
    {
        accessorKey: 'id',
        header: ({ column }) => <SortableHeader column={column} label="ID" />,
        cell: ({ row }) => (
            <div className="font-mono text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded inline-block border border-slate-100">
                #{row.original.id?.slice(0, 8)}
            </div>
        ),
        size: 110,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => <SortableHeader column={column} label="Classification Name" />,
        cell: ({ row }) => (
            <div className="font-bold text-slate-900 text-sm tracking-tight">
                {row.original.name}
            </div>
        ),
    },
    {
        accessorKey: 'summary',
        header: ({ column }) => <SortableHeader column={column} label="Summary" />,
        cell: ({ row }) => (
            <div className="text-sm text-slate-500 line-clamp-1 max-w-[250px] font-medium">
                {row.original.summary || <span className="text-slate-300 italic">No summary provided</span>}
            </div>
        ),
    },
    {
        accessorKey: 'defaultPrice',
        header: ({ column }) => <SortableHeader column={column} label="Amount" />,
        cell: ({ row }) => (
            <div className="font-black text-slate-950 tabular-nums">
                {formatPrice(row.original.defaultPrice)}
            </div>
        ),
        size: 150,
    },
    {
        accessorKey: 'category',
        header: ({ column }) => <SortableHeader column={column} label="Category" />,
        cell: ({ row }) => (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 shadow-sm animate-in fade-in zoom-in duration-300">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4988c4] shadow-[0_0_5px_rgba(73,136,196,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                    {row.original.category}
                </span>
            </div>
        ),
        size: 130,
    },
    {
        accessorKey: 'applicableProductType',
        header: ({ column }) => <SortableHeader column={column} label="Target Type" />,
        cell: ({ row }) => (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 border border-primary-100 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-600">
                    {row.original.applicableProductType}
                </span>
            </div>
        ),
        size: 130,
    },
    {
        accessorKey: 'calculationMode',
        header: ({ column }) => <SortableHeader column={column} label="Logic" />,
        cell: ({ row }) => {
            const isMultiplier = row.original.calculationMode === 'Multiplier';
            return (
                <div className="flex items-center gap-2">
                    <div className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded border ${isMultiplier ? 'text-sky-600 bg-sky-50 border-sky-100' : 'text-slate-400 bg-slate-50 border-slate-100'}`}>
                        {isMultiplier ? 'Multiplier' : 'Fixed'}
                    </div>
                </div>
            );
        },
        size: 100,
    },
    {
        accessorKey: 'defaultMultiplier',
        header: ({ column }) => <SortableHeader column={column} label="Mult." />,
        cell: ({ row }) => {
            const isMultiplier = row.original.calculationMode === 'Multiplier';
            return (
                <div className={`font-mono font-black text-xs ${isMultiplier ? 'text-sky-700' : 'text-slate-300'}`}>
                    {isMultiplier ? `x${row.original.defaultMultiplier.toFixed(2)}` : '—'}
                </div>
            );
        },
        size: 80,
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <SortableHeader column={column} label="Status" />,
        cell: ({ row }) => <AdminStatusBadge status={row.original.status} />,
        size: 100,
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const type = row.original;
            return (
                <div className="flex justify-end">
                    <AdminRowActions
                        sections={[
                            [
                                {
                                    label: 'Quick View',
                                    icon: <Eye className="h-4 w-4" />,
                                    onClick: () => onView(type)
                                },
                                {
                                    label: 'Edit Details',
                                    icon: <Pencil className="h-4 w-4" />,
                                    onClick: () => onEdit(type)
                                },
                            ],
                            [
                                {
                                    label: 'Delete Entry',
                                    icon: <Trash2 className="h-4 w-4 text-red-500" />,
                                    variant: 'danger',
                                    onClick: () => onDelete(type.id)
                                },
                            ]
                        ]}
                    />
                </div>
            );
        },
        size: 60,
    },
  ], [onView, onEdit, onDelete]);

  return columns;
}

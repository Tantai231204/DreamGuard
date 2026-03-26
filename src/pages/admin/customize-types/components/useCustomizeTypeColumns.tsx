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
            <div className="font-mono text-[10px] text-slate-400 font-medium">
                #{row.original.id?.slice(0, 8)}
            </div>
        ),
        size: 100,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => <SortableHeader column={column} label="Classification Name" />,
        cell: ({ row }) => (
            <div className="font-bold text-slate-900 text-sm">
                {row.original.name}
            </div>
        ),
    },
    {
        accessorKey: 'summary',
        header: ({ column }) => <SortableHeader column={column} label="Summary" />,
        cell: ({ row }) => (
            <div className="text-sm text-slate-500 line-clamp-1 max-w-[250px]">
                {row.original.summary || <span className="text-slate-300 italic">No summary provided</span>}
            </div>
        ),
    },
    {
        accessorKey: 'defaultPrice',
        header: ({ column }) => <SortableHeader column={column} label="Amount" />,
        cell: ({ row }) => (
            <div className="font-bold text-slate-950 tabular-nums">
                {formatPrice(row.original.defaultPrice)}
            </div>
        ),
        size: 150,
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <SortableHeader column={column} label="Status" />,
        cell: ({ row }) => {
            const status = row.original.status;
            return <AdminStatusBadge status={status} />;
        },
        size: 120,
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

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Power } from 'lucide-react';
import {
    AdminRowActions,
    AdminStatusBadge,
    SortableHeader
} from '@/components/admin';
import { Checkbox } from '@/components/ui/checkbox';
import type { ProductType } from '@/api/services/productTypeService';

interface UseProductTypeColumnsProps {
    onEdit: (pt: ProductType) => void;
    onToggleStatus: (pt: ProductType) => void;
}

export function useProductTypeColumns({ onEdit, onToggleStatus }: UseProductTypeColumnsProps) {
    return useMemo<ColumnDef<ProductType>[]>(() => [
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
            accessorKey: 'productTypeId',
            header: ({ column }) => <SortableHeader column={column} label="ID" />,
            cell: ({ row }) => (
                <div className="font-mono text-xs text-slate-500 font-medium">
                    {row.original.productTypeId?.slice(0, 8)}...
                </div>
            ),
            size: 100,
        },
        {
            accessorKey: 'productTypeName',
            header: ({ column }) => <SortableHeader column={column} label="Classification Name" />,
            cell: ({ row }) => (
                <div className="font-bold text-slate-900 text-sm">
                    {row.original.productTypeName}
                </div>
            ),
        },
        {
            accessorKey: 'isActive',
            header: ({ column }) => <SortableHeader column={column} label="Status" />,
            cell: ({ row }) => {
                const isActive = row.original.isActive;
                return (
                    <AdminStatusBadge
                        status={isActive ? 'Active' : 'Inactive'}
                    />
                );
            },
            size: 120,
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const pt = row.original;
                return (
                    <div className="flex justify-end">
                        <AdminRowActions
                            sections={[
                                [
                                    {
                                        label: 'Edit Details',
                                        icon: <Pencil className="h-4 w-4" />,
                                        onClick: () => onEdit(pt)
                                    },
                                ],
                                [
                                    {
                                        label: pt.isActive ? 'Deactivate' : 'Activate',
                                        icon: <Power className="h-4 w-4" />,
                                        variant: pt.isActive ? 'warning' : 'success',
                                        onClick: () => onToggleStatus(pt)
                                    },
                                ]
                            ]}
                        />
                    </div>
                );
            },
            size: 60,
        },
    ], [onEdit, onToggleStatus]);
}

import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Eye, Copy, Trash2 } from 'lucide-react';
import { SortableHeader, AdminRowActions, AdminStatusBadge } from '@/components/admin';
import type { Voucher } from '../types';
import { formatDate, formatPrice } from '@/lib/utils';

const columnHelper = createColumnHelper<Voucher>();

export function useVoucherColumns(options?: {
    onEdit?: (voucher: Voucher) => void;
    onDelete?: (voucherId: string) => void;
}) {
    return useMemo(
        () => [
            columnHelper.display({
                id: 'select',
                header: ({ table }) => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={table.getIsAllPageRowsSelected()}
                            onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
                            aria-label="Select all"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={row.getIsSelected()}
                            onChange={(e) => row.toggleSelected(e.target.checked)}
                            aria-label="Select row"
                        />
                    </div>
                ),
                size: 40,
            }),

            columnHelper.accessor('code', {
                header: ({ column }) => <SortableHeader column={column} label="Code" />,
                cell: (info) => (
                    <span className="font-mono font-bold text-xs text-gray-900 border border-gray-100 px-2 py-1 rounded bg-gray-50 uppercase tracking-wider">
                        {info.getValue()}
                    </span>
                ),
            }),

            columnHelper.accessor('name', {
                header: ({ column }) => <SortableHeader column={column} label="Promotion Name" />,
                cell: (info) => <span className="font-medium text-gray-700">{info.getValue()}</span>,
            }),

            columnHelper.accessor('discountValue', {
                header: 'Discount',
                cell: (info) => {
                    const voucher = info.row.original;
                    const isPercent = voucher.discountType === 'percent';
                    return (
                        <span className="font-bold text-gray-900">
                             {isPercent ? `${info.getValue()}%` : formatPrice(info.getValue() as number)}
                        </span>
                    );
                },
            }),

            columnHelper.accessor('endDate', {
                header: ({ column }) => <SortableHeader column={column} label="Valid Until" />,
                cell: (info) => {
                    const isExpired = new Date(info.getValue()) < new Date();
                    return (
                        <span className={`text-xs ${isExpired ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                            {formatDate(info.getValue())}
                        </span>
                    );
                },
            }),

            columnHelper.accessor('isActive', {
                header: 'Status',
                cell: (info) => {
                    const isActive = info.getValue();
                    return (
                        <AdminStatusBadge
                            status={isActive ? 'Active' : 'Inactive'}
                        />
                    );
                },
            }),

            columnHelper.display({
                id: 'actions',
                header: () => <div className="text-right">Actions</div>,
                cell: ({ row }) => {
                    const voucher = row.original;
                    return (
                        <div className="flex justify-end">
                            <AdminRowActions
                                sections={[
                                    [
                                        { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: () => console.log('View', voucher.voucherId) },
                                        { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: () => options?.onEdit?.(voucher) },
                                        { label: 'Copy Code', icon: <Copy className="h-4 w-4" />, onClick: () => navigator.clipboard.writeText(voucher.code) },
                                    ],
                                    [
                                        { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, variant: 'danger', onClick: () => options?.onDelete?.(voucher.voucherId) }
                                    ]
                                ]}
                            />
                        </div>
                    );
                },
                size: 50,
            }),
        ],
        [options]
    );
}

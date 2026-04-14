import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Coins, Copy, Eye, Pencil, Trash2 } from 'lucide-react';
import { SortableHeader, AdminRowActions, AdminStatusBadge } from '@/components/admin';
import type { Voucher } from '../types';
import { formatDate, formatPrice } from '@/lib/utils';

const columnHelper = createColumnHelper<Voucher>();

export function useVoucherColumns(options?: {
    onView?: (voucher: Voucher) => void;
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
                    <div className="inline-flex items-center rounded-lg border border-primary-200 bg-primary-50 px-2.5 py-1">
                        <span className="font-mono text-[11px] font-black uppercase tracking-[0.14em] text-primary-700">
                            {info.getValue()}
                        </span>
                    </div>
                ),
            }),

            columnHelper.accessor('name', {
                header: ({ column }) => <SortableHeader column={column} label="Promotion Name" />,
                cell: (info) => (
                    <div className="max-w-[220px]">
                        <p className="truncate text-sm font-semibold text-slate-800">{info.getValue()}</p>
                    </div>
                ),
            }),

            columnHelper.accessor('voucherType', {
                header: ({ column }) => <SortableHeader column={column} label="Type" />,
                cell: (info) => {
                    const value = info.getValue();
                    const classes =
                        value === 'Product'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : value === 'Service'
                                ? 'border-sky-200 bg-sky-50 text-sky-700'
                                : 'border-primary-200 bg-primary-50 text-primary-700';

                    return (
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${classes}`}>
                            {value}
                        </span>
                    );
                },
            }),

            columnHelper.accessor('discountValue', {
                header: 'Discount',
                cell: (info) => {
                    const value = Number(info.getValue() || 0) * 100;
                    const display = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2);
                    return (
                        <span className="inline-flex rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-black text-white">
                            {display}%
                        </span>
                    );
                },
            }),

            columnHelper.accessor('maxDiscountAmount', {
                header: ({ column }) => <SortableHeader column={column} label="Max Cap" />,
                cell: (info) => (
                    <span className="font-semibold text-gray-700">{formatPrice(info.getValue())}</span>
                ),
            }),

            columnHelper.accessor('requiredCoin', {
                header: ({ column }) => <SortableHeader column={column} label="Required Coin" />,
                cell: (info) => (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-2.5 py-1 text-[11px] font-bold text-primary-700">
                        <Coins className="h-3.5 w-3.5" />
                        {info.getValue()}
                    </span>
                ),
            }),

            columnHelper.accessor('endDate', {
                header: ({ column }) => <SortableHeader column={column} label="Valid Until" />,
                cell: (info) => {
                    const now = new Date();
                    const expiryDate = new Date(info.getValue());
                    const isExpired = expiryDate < now;
                    const isExpiringSoon = !isExpired && expiryDate.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000;

                    return (
                        <span className={`text-xs font-semibold ${isExpired ? 'text-rose-600' : isExpiringSoon ? 'text-primary-600' : 'text-slate-500'}`}>
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
                                        { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: () => options?.onView?.(voucher) },
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

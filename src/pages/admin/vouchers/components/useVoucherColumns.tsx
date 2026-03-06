import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, Eye, Copy, Percent, DollarSign } from 'lucide-react';
import { SortableHeader } from '@/components/admin';
import type { Voucher } from '../types';

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
                            className="data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={row.getIsSelected()}
                            onChange={(e) => row.toggleSelected(e.target.checked)}
                            aria-label="Select row"
                            className="data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
                        />
                    </div>
                ),
                size: 40,
            }),

            columnHelper.accessor('code', {
                header: ({ column }) => <SortableHeader column={column} label="Code" />,
                cell: (info) => (
                    <span className="font-mono font-bold text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {info.getValue()}
                    </span>
                ),
            }),

            columnHelper.accessor('name', {
                header: ({ column }) => <SortableHeader column={column} label="Name" />,
                cell: (info) => {
                    const voucher = info.row.original;
                    return (
                        <div>
                            <p className="font-semibold text-gray-900">{info.getValue()}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                {voucher.description}
                            </p>
                        </div>
                    );
                },
            }),

            columnHelper.accessor('discountValue', {
                header: 'Discount',
                cell: (info) => {
                    const voucher = info.row.original;
                    const isPercent = voucher.discountType === 'percent';
                    return (
                        <div className="flex items-center gap-1.5">
                            {isPercent ? (
                                <Percent className="h-4 w-4 text-green-600" />
                            ) : (
                                <DollarSign className="h-4 w-4 text-green-600" />
                            )}
                            <span className="font-bold text-green-700">
                                {isPercent ? `${info.getValue()}%` : `$${info.getValue()}`}
                            </span>
                        </div>
                    );
                },
            }),

            columnHelper.accessor('minDiscountAmount', {
                header: 'Min Amount',
                cell: (info) => (
                    <span className="text-sm text-gray-600">${info.getValue()?.toFixed(2)}</span>
                ),
            }),

            columnHelper.accessor('maxDiscountAmount', {
                header: 'Max Amount',
                cell: (info) => (
                    <span className="text-sm text-gray-600">${info.getValue()?.toFixed(2)}</span>
                ),
            }),

            columnHelper.accessor('startDate', {
                header: ({ column }) => <SortableHeader column={column} label="Start Date" />,
                cell: (info) => (
                    <span className="text-sm text-gray-600">
                        {new Date(info.getValue()).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </span>
                ),
            }),

            columnHelper.accessor('endDate', {
                header: ({ column }) => <SortableHeader column={column} label="End Date" />,
                cell: (info) => {
                    const endDate = new Date(info.getValue());
                    const isExpired = endDate < new Date();
                    return (
                        <span className={`text-sm ${isExpired ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                            {endDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </span>
                    );
                },
            }),

            columnHelper.accessor('isActive', {
                header: 'Status',
                cell: (info) => {
                    const isActive = info.getValue();
                    return (
                        <Badge
                            variant="outline"
                            className={`font-semibold ${isActive
                                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-300 shadow-sm'
                                    : 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border-gray-300 shadow-sm'
                                }`}
                        >
                            {isActive ? 'Active' : 'Inactive'}
                        </Badge>
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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all"
                                    >
                                        <MoreVertical className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 shadow-xl border-2 rounded-xl">
                                    <DropdownMenuItem
                                        onClick={() => console.log('View', voucher.voucherId)}
                                        className="cursor-pointer py-2.5 font-medium"
                                    >
                                        <Eye className="h-4 w-4 mr-3 text-blue-600" />
                                        View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => options?.onEdit?.(voucher)}
                                        className="cursor-pointer py-2.5 font-medium"
                                    >
                                        <Pencil className="h-4 w-4 mr-3 text-gray-700" />
                                        Edit Voucher
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => console.log('Duplicate', voucher.voucherId)}
                                        className="cursor-pointer py-2.5 font-medium"
                                    >
                                        <Copy className="h-4 w-4 mr-3 text-gray-700" />
                                        Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="my-1" />
                                    <DropdownMenuItem
                                        onClick={() => options?.onDelete?.(voucher.voucherId)}
                                        className="cursor-pointer py-2.5 text-red-600 font-semibold focus:bg-red-50 focus:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4 mr-3" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
                size: 50,
            }),
        ],
        [options]
    );
}

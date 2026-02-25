import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Eye, Edit, Copy, Trash2 } from 'lucide-react';
import { SortableHeader } from '@/components/admin';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Order } from '../../types';
import { statusColors, statusLabels } from '../constants';

export const useOrderColumns = () => {
    const columns: ColumnDef<Order>[] = useMemo(
        () => [
            {
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
                enableSorting: false,
            },
            {
                accessorKey: 'id',
                enableSorting: true,
                sortingFn: 'alphanumeric',
                header: ({ column }) => <SortableHeader column={column} label="Order ID" />,
                cell: ({ row }) => (
                    <div className="font-mono text-sm font-bold text-[var(--color-primary)]">
                        #{row.getValue('id')}
                    </div>
                ),
            },
            {
                accessorKey: 'customerName',
                enableSorting: true,
                sortingFn: 'text',
                header: ({ column }) => <SortableHeader column={column} label="Customer" />,
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-gray-200">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold">
                                {row.original.customerName.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-semibold text-gray-900">{row.original.customerName}</div>
                            <div className="text-xs text-gray-500">{row.original.email}</div>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'products',
                enableSorting: false,
                header: () => <span className="font-semibold">Products</span>,
                cell: ({ row }) => (
                    <div className="max-w-xs truncate text-sm text-gray-700">
                        {row.getValue('products')}
                    </div>
                ),
            },
            {
                accessorKey: 'total',
                enableSorting: true,
                sortingFn: 'basic',
                header: ({ column }) => <SortableHeader column={column} label="Total" />,
                cell: ({ row }) => {
                    const amount = parseFloat(row.getValue('total'));
                    const formatted = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                    }).format(amount);
                    return <div className="font-bold text-gray-900">{formatted}</div>;
                },
            },
            {
                accessorKey: 'status',
                enableSorting: false,
                header: () => <span className="font-semibold">Status</span>,
                cell: ({ row }) => {
                    const status = row.getValue('status') as Order['status'];
                    return (
                        <Badge
                            variant="outline"
                            className={`${statusColors[status]} font-semibold`}
                        >
                            {statusLabels[status]}
                        </Badge>
                    );
                },
                filterFn: (row, id, value) => {
                    if (!value || !Array.isArray(value) || value.length === 0) {
                        return true;
                    }
                    return value.includes(row.getValue(id));
                },
            },
            {
                accessorKey: 'date',
                enableSorting: true,
                sortingFn: (rowA, rowB, columnId) => {
                    const dateA = new Date(rowA.getValue(columnId) as string);
                    const dateB = new Date(rowB.getValue(columnId) as string);
                    return dateA.getTime() - dateB.getTime();
                },
                sortDescFirst: true,
                header: ({ column }) => <SortableHeader column={column} label="Order Date" />,
                cell: ({ row }) => {
                    const date = new Date(row.getValue('date'));
                    return (
                        <div className="text-sm text-gray-600">
                            {date.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </div>
                    );
                },
            },
            {
                id: 'actions',
                enableSorting: false,
                header: () => <div className="text-right">Actions</div>,
                cell: ({ row }) => {
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
                                    <Link to={`/admin/orders/${row.original.id}`}>
                                        <DropdownMenuItem className="cursor-pointer py-2.5 font-medium">
                                            <Eye className="h-4 w-4 mr-3 text-blue-600" />
                                            View Details
                                        </DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuItem className="cursor-pointer py-2.5 font-medium">
                                        <Edit className="h-4 w-4 mr-3 text-gray-700" />
                                        Edit Order
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer py-2.5 font-medium">
                                        <Copy className="h-4 w-4 mr-3 text-gray-700" />
                                        Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="my-1" />
                                    <DropdownMenuItem className="cursor-pointer py-2.5 text-red-600 font-semibold focus:bg-red-50 focus:text-red-700">
                                        <Trash2 className="h-4 w-4 mr-3" />
                                        Cancel Order
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
            },
        ],
        []
    );

    return columns;
};

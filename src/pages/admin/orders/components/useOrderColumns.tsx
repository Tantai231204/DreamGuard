import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Eye, Trash2 } from 'lucide-react';
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
import type { OrderResponse } from '@/api/types/order';
import { STATUS_THEME } from '@/pages/profile/components/order-constants';
import { formatPrice } from '@/pages/profile/utils';

export const useOrderColumns = () => {
    const columns: ColumnDef<OrderResponse>[] = useMemo(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={table.getIsAllPageRowsSelected()}
                            onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
                            aria-label="Select all"
                            className="data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity"
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
                accessorKey: 'orderCode',
                enableSorting: true,
                header: ({ column }) => <SortableHeader column={column} label="Order ID" />,
                cell: ({ row }) => (
                    <div className="font-mono text-sm font-bold text-[var(--color-primary)]">
                        #{row.original.orderCode}
                    </div>
                ),
            },
            {
                accessorKey: 'id',
                header: ({ column }) => <SortableHeader column={column} label="Customer" />,
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-gray-200">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold">
                                {row.original.orderCode.charAt(row.original.orderCode.length - 1)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-semibold text-gray-900 truncate max-w-[150px]">Guest Customer</div>
                            <div className="text-xs text-gray-500">Order ID: {row.original.id.substring(0, 8)}...</div>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'itemCount',
                header: () => <span className="font-semibold">Items</span>,
                cell: ({ row }) => (
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">{row.original.itemCount || 0}</span>
                        <span>Products</span>
                    </div>
                ),
            },
            {
                accessorKey: 'totalAmount',
                enableSorting: true,
                header: ({ column }) => <SortableHeader column={column} label="Total" />,
                cell: ({ row }) => (
                    <div className="font-bold text-gray-900">{formatPrice(row.original.totalAmount)}</div>
                ),
            },
            {
                accessorKey: 'status',
                header: () => <span className="font-semibold">Status</span>,
                cell: ({ row }) => {
                    const status = row.original.status;
                    const theme = STATUS_THEME[status] || STATUS_THEME["Pending"];
                    return (
                        <Badge
                            variant="outline"
                            className="font-bold border-none shadow-sm capitalize"
                            style={{ backgroundColor: `${theme.color}15`, color: theme.color }}
                        >
                            {theme.label}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: 'createdAt',
                enableSorting: true,
                header: ({ column }) => <SortableHeader column={column} label="Date Created" />,
                cell: ({ row }) => {
                    const date = new Date(row.original.createdAt);
                    return (
                        <div className="text-sm text-gray-600 flex flex-col">
                            <span className="font-semibold text-gray-900">
                                {date.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                            <span className="text-[10px] text-gray-400">
                                {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
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

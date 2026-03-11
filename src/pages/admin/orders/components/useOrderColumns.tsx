import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Trash2 } from 'lucide-react';
import { SortableHeader, AdminRowActions } from '@/components/admin';
import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { OrderResponse } from '@/api/types/order';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/pages/profile/utils';
import { useCancelOrder } from '@/hooks/queries';
import { toast } from 'sonner';
import { OrderStatus, ORDER_STATUS_MAP, ADMIN_ORDER_STATUS_THEME } from '../constants';

export const useOrderColumns = () => {
    const cancelOrder = useCancelOrder();

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
                    const status = row.original.status.toString();
                    const theme = ADMIN_ORDER_STATUS_THEME[status] || ADMIN_ORDER_STATUS_THEME["1"];
                    return (
                        <Badge
                            variant="outline"
                            className={cn(
                                "px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider border",
                                theme.className
                            )}
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
                                {date.toLocaleDateString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}
                            </span>
                            <span className="text-[10px] text-gray-400">
                                {date.toLocaleTimeString('vi-VN', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    hour12: false 
                                })}
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
                    const currentStatusEnum = ORDER_STATUS_MAP[row.original.status.toString()];
                    const canCancel = currentStatusEnum === OrderStatus.Pending || currentStatusEnum === OrderStatus.Confirmed;

                    const handleCancel = () => {
                        if (confirm('Are you sure you want to cancel this order?')) {
                            cancelOrder.mutate(row.original.id, {
                                onSuccess: () => toast.success('Order cancelled successfully')
                            });
                        }
                    };

                    const actions: React.ComponentProps<typeof AdminRowActions>['actions'] = [
                        {
                            label: 'View Details',
                            icon: <Eye className="h-4 w-4" />,
                            component: (
                                <Link to={`/admin/orders/${row.original.id}`} className="flex items-center gap-2.5 w-full">
                                    <Eye className="h-4 w-4 opacity-70" />
                                    <span className="text-[13px]">View Details</span>
                                </Link>
                            )
                        }
                    ];

                    if (canCancel) {
                        actions.push({
                            label: 'Cancel Order',
                            icon: <Trash2 className="h-4 w-4" />,
                            variant: 'danger',
                            onClick: handleCancel
                        });
                    }

                    return (
                        <div className="flex justify-end">
                            <AdminRowActions actions={actions} />
                        </div>
                    );
                },
            },
        ],
        [cancelOrder]
    );

    return columns;
};

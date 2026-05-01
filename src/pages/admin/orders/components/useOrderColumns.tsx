import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Trash2 } from 'lucide-react';
import { SortableHeader, AdminRowActions, AdminStatusBadge } from '@/components/admin';
import { type ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import type { CheckoutOrderResponse } from '@/api/types/checkoutOrder';
import { formatPrice } from '@/pages/profile/utils';
import { OrderStatus, ORDER_STATUS_MAP } from '../constants';
import { formatDate, formatTime } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { CustomerCell } from './CustomerCell';


export const useOrderColumns = (onCancelRequested: (order: CheckoutOrderResponse) => void) => {
    const { role } = useAuthStore();
    const isAdmin = ['Admin', 'Staff'].includes(role || '');

    const columns: ColumnDef<CheckoutOrderResponse>[] = useMemo(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={table.getIsAllPageRowsSelected()}
                            onCheckedChange={(val) => table.toggleAllPageRowsSelected(!!val)}
                            aria-label="Select all"
                            className="data-[state=checked]:bg-[#4988c4] data-[state=checked]:border-[#4988c4] opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(val) => row.toggleSelected(!!val)}
                            aria-label="Select row"
                            className="data-[state=checked]:bg-[#4988c4] data-[state=checked]:border-[#4988c4]"
                        />
                    </div>
                ),
                size: 40,
                enableSorting: false,
            },
            {
                id: 'type',
                header: () => <span className="font-semibold">Type</span>,
                cell: () => <AdminStatusBadge status="order" />,
                size: 100,
            },
            {
                accessorKey: 'checkoutOrderCode',
                enableSorting: true,
                header: ({ column }) => <SortableHeader column={column} label="Order ID" />,
                cell: ({ row }) => (
                    <div className="font-mono text-sm font-bold text-[#4988c4]">
                        #{row.original.checkoutOrderCode}
                    </div>
                ),
            },
            {
                id: 'customer',
                header: ({ column }) => <SortableHeader column={column} label="Customer" />,
                cell: ({ row }) => <CustomerCell order={row.original} />,
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
                cell: ({ row }) => <AdminStatusBadge status={row.original.status.toString()} />,
            },
            {
                accessorKey: 'createdAt',
                enableSorting: true,
                header: ({ column }) => <SortableHeader column={column} label="Date Created" />,
                cell: ({ row }) => {
                    return (
                        <div className="text-sm text-gray-600 flex flex-col">
                            <span className="font-semibold text-gray-900">
                                {formatDate(row.original.createdAt)}
                            </span>
                            <span className="text-[10px] text-gray-400">
                                {formatTime(row.original.createdAt)}
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
                    const canCancel = currentStatusEnum === OrderStatus.Pending;

                    const actions: React.ComponentProps<typeof AdminRowActions>['actions'] = [
                        {
                            label: 'View Details',
                            icon: <Eye className="h-4 w-4" />,
                            component: (
                                <Link to={`/admin/checkout-orders/${row.original.id}`} className="flex items-center gap-2.5 w-full">
                                    <Eye className="h-4 w-4 opacity-70" />
                                    <span className="text-[13px]">View Details</span>
                                </Link>
                            )
                        }
                    ];

                    if (canCancel && isAdmin) {
                        actions.push({
                            label: 'Cancel Order',
                            icon: <Trash2 className="h-4 w-4 text-rose-500" />,
                            variant: 'danger',
                            onClick: () => onCancelRequested(row.original)
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
        [onCancelRequested, isAdmin]
    );

    return columns;
};

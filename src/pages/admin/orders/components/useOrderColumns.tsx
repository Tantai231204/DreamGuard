import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Order } from '../../types';
import { statusColors, statusLabels } from '../constants';

export const useOrderColumns = () => {
    const columns: ColumnDef<Order>[] = useMemo(
        () => [
            {
                accessorKey: 'id',
                enableSorting: true,
                sortingFn: 'alphanumeric',
                header: ({ column }) => {
                    const sorted = column.getIsSorted();
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(sorted === 'desc')}
                            className="hover:bg-gray-100 font-semibold -ml-4 gap-1"
                        >
                            Order ID
                            {sorted === 'asc' ? (
                                <ArrowUp className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                            ) : sorted === 'desc' ? (
                                <ArrowDown className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                            ) : (
                                <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                            )}
                        </Button>
                    );
                },
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
                header: ({ column }) => {
                    const sorted = column.getIsSorted();
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(sorted === 'desc')}
                            className="hover:bg-gray-100 font-semibold -ml-4 gap-1"
                        >
                            Customer
                            {sorted === 'asc' ? (
                                <ArrowUp className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                            ) : sorted === 'desc' ? (
                                <ArrowDown className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                            ) : (
                                <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                            )}
                        </Button>
                    );
                },
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
                header: ({ column }) => {
                    const sorted = column.getIsSorted();
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(sorted === 'desc')}
                            className="hover:bg-gray-100 font-semibold -ml-4 gap-1"
                        >
                            Total
                            {sorted === 'asc' ? (
                                <ArrowUp className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                            ) : sorted === 'desc' ? (
                                <ArrowDown className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                            ) : (
                                <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                            )}
                        </Button>
                    );
                },
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
                header: ({ column }) => {
                    const sorted = column.getIsSorted();
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(sorted === 'desc')}
                            className="hover:bg-gray-100 font-semibold -ml-4 gap-1"
                        >
                            Order Date
                            {sorted === 'asc' ? (
                                <ArrowUp className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                            ) : sorted === 'desc' ? (
                                <ArrowDown className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                            ) : (
                                <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                            )}
                        </Button>
                    );
                },
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
                header: () => <span className="font-semibold">Actions</span>,
                cell: ({ row }) => {
                    return (
                        <Link to={`/admin/orders/${row.original.id}`}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 px-4 hover:bg-[var(--color-primary)] hover:text-white transition-colors rounded-lg font-medium"
                            >
                                View Details
                            </Button>
                        </Link>
                    );
                },
            },
        ],
        []
    );

    return columns;
};

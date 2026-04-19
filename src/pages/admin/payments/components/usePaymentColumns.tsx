import { useMemo, useCallback } from 'react';
import {
    MoreVertical,
    Eye,
    FileText,
    ExternalLink
} from 'lucide-react';
import { SortableHeader, AdminStatusBadge } from '@/components/admin';
import { formatDate, formatTime } from '@/lib/utils';
import { type ColumnDef, type CellContext, type HeaderContext } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQueryClient } from '@tanstack/react-query';
import paymentService from '@/api/services/paymentService';
import { paymentKeys } from '@/hooks/queries/usePayment';
import type { PaymentResponse } from '@/api/types/payment';
import { formatPrice } from '@/pages/profile/utils';

interface usePaymentColumnsProps {
    onView: (id: string) => void;
}





export const usePaymentColumns = ({ onView }: usePaymentColumnsProps) => {
    const queryClient = useQueryClient();

    const prefetchPayment = useCallback((id: string) => {
        queryClient.prefetchQuery({
            queryKey: paymentKeys.detail(id),
            queryFn: () => paymentService.getPaymentDetail(id),
            staleTime: 5 * 60 * 1000,
        });
    }, [queryClient]);

    const columns = useMemo<ColumnDef<PaymentResponse>[]>(
        () => [
            {
                accessorKey: 'orderCode',
                header: ({ column }: HeaderContext<PaymentResponse, unknown>) => <SortableHeader column={column} label="Ref" />,
                cell: ({ row }: CellContext<PaymentResponse, unknown>) => (
                    <div
                        className="flex items-center gap-2 group/code cursor-pointer"
                        onClick={() => onView(row.original.id)}
                        onMouseEnter={() => prefetchPayment(row.original.id)}
                    >
                        <div className="font-mono text-[13px] font-black text-slate-900 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-all group-hover/code:border-blue-400 group-hover/code:bg-blue-50 group-hover/code:text-blue-700 shadow-sm">
                            {row.original.orderCode}
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-300 group-hover/code:text-blue-400 transition-colors" />
                    </div>
                ),
            },
            {
                accessorKey: 'paymentType',
                header: ({ column }: HeaderContext<PaymentResponse, unknown>) => <SortableHeader column={column} label="Type" />,
                cell: ({ row }: CellContext<PaymentResponse, unknown>) => {
                    const type = row.original.paymentType;
                    return (
                        <AdminStatusBadge
                            status={type}
                        />
                    );
                },
            },
            {
                accessorKey: 'amount',
                header: ({ column }: HeaderContext<PaymentResponse, unknown>) => <SortableHeader column={column} label="Amount" />,
                cell: ({ row }: CellContext<PaymentResponse, unknown>) => (
                    <div className="text-[15px] font-black text-slate-900 tracking-tight">
                        {formatPrice(row.original.amount)}
                    </div>
                ),
            },
            {
                accessorKey: 'paymentMethod',
                header: ({ column }: HeaderContext<PaymentResponse, unknown>) => <SortableHeader column={column} label="Method" />,
                cell: ({ row }: CellContext<PaymentResponse, unknown>) => {
                    const method = row.original.paymentMethod;
                    return (
                        <AdminStatusBadge
                            status={method}
                            mode="method"
                            type="neutral"
                            className="bg-slate-100/50 border-slate-200"
                        />
                    );
                },
            },
            {
                accessorKey: 'status',
                header: ({ column }: HeaderContext<PaymentResponse, unknown>) => <SortableHeader column={column} label="Status" />,
                cell: ({ row }: CellContext<PaymentResponse, unknown>) => {
                    const status = row.original.status;
                    return (
                        <AdminStatusBadge
                            status={status}
                            mode="payment"
                        />
                    );
                },
            },
            {
                accessorKey: 'createdAt',
                header: ({ column }: HeaderContext<PaymentResponse, unknown>) => <SortableHeader column={column} label="Date" />,
                cell: ({ row }: CellContext<PaymentResponse, unknown>) => {
                    return (
                        <div className="flex flex-col gap-0.5 min-w-[100px]">
                            <span className="text-[13px] font-bold text-slate-700">
                                {formatDate(row.original.createdAt)}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">
                                {formatTime(row.original.createdAt)}
                            </span>
                        </div>
                    );
                },
            },
            {
                id: 'actions',
                header: () => <div className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400 pr-4">Actions</div>,
                cell: ({ row }: CellContext<PaymentResponse, unknown>) => (
                    <div className="flex justify-end pr-2 text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded hover:bg-slate-100 dropdown-trigger transition-colors">
                                    <MoreVertical className="h-4 w-4 text-slate-400" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 shadow-xl border border-slate-200/60 rounded-xl p-1 animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-3 py-2 border-b border-slate-50 mb-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">General Audit</span>
                                </div>
                                <DropdownMenuItem
                                    className="rounded-lg cursor-pointer py-2 px-3 font-medium text-slate-600 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-700 transition-colors gap-2.5"
                                    onClick={() => onView(row.original.id)}
                                    onMouseEnter={() => prefetchPayment(row.original.id)}
                                >
                                    <Eye className="h-4 w-4 opacity-70" />
                                    <span className="text-[13px]">View Transaction</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg cursor-pointer py-2 px-3 font-medium text-slate-600 hover:text-slate-900 focus:bg-slate-50 transition-colors gap-2.5">
                                    <FileText className="h-4 w-4 opacity-70" />
                                    <span className="text-[13px]">Print Receipt</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
            },
        ],
        [onView, prefetchPayment]
    );

    return columns;
};

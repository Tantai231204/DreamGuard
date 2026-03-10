import { useMemo, useCallback } from 'react';
import {
    MoreVertical,
    Eye,
    FileText,
    ExternalLink,
    CheckCircle2,
    XCircle,
    RotateCcw
} from 'lucide-react';
import { SortableHeader } from '@/components/admin';
import { type ColumnDef, type CellContext, type HeaderContext } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useQueryClient } from '@tanstack/react-query';
import paymentService from '@/api/services/paymentService';
import { paymentKeys, useUpdatePaymentStatus } from '@/hooks/queries/usePayment';
import type { PaymentResponse } from '@/api/types/payment';
import { formatPrice } from '@/pages/profile/utils';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

interface usePaymentColumnsProps {
    onView: (id: string) => void;
}

const statusStyles: Record<string, string> = {
    Paid: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    Pending: 'bg-amber-50 text-amber-700 border-amber-300',
    Failed: 'bg-red-50 text-red-700 border-red-300',
    Refunded: 'bg-blue-50 text-blue-700 border-blue-300',
};

const METHOD_STYLES: Record<string, { bg: string; text: string; border: string }> = {
    VnPay: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    COD: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
};

export const usePaymentColumns = ({ onView }: usePaymentColumnsProps) => {
    const queryClient = useQueryClient();
    const { mutate: updateStatus } = useUpdatePaymentStatus();
    const { success, error } = useToast();

    const handleUpdateStatus = useCallback((id: string, status: string) => {
        updateStatus({ id, status }, {
            onSuccess: () => {
                success("Status Updated", `Transaction status has been changed to ${status}`);
            },
            onError: () => {
                error("Update Failed", "Could not update payment status. Please try again.");
            }
        });
    }, [updateStatus, success, error]);

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
                    const style = METHOD_STYLES[method] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
                    return (
                        <Badge variant="outline" className={cn("px-2 py-0.5 rounded-md font-bold text-[10px] uppercase border", style.bg, style.text, style.border)}>
                            {method}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: 'status',
                header: ({ column }: HeaderContext<PaymentResponse, unknown>) => <SortableHeader column={column} label="Status" />,
                cell: ({ row }: CellContext<PaymentResponse, unknown>) => {
                    const status = row.original.status;
                    const styles = statusStyles[status] || 'bg-slate-50 text-slate-600 border-slate-200';

                    return (
                        <Badge
                            variant="outline"
                            className={cn("px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider border transition-all hover:brightness-95 shadow-sm", styles)}
                        >
                            {status}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: 'createdAt',
                header: ({ column }: HeaderContext<PaymentResponse, unknown>) => <SortableHeader column={column} label="Date" />,
                cell: ({ row }: CellContext<PaymentResponse, unknown>) => {
                    const date = new Date(row.original.createdAt);
                    return (
                        <div className="flex flex-col gap-0.5 min-w-[100px]">
                            <span className="text-[13px] font-bold text-slate-700">
                                {date.toLocaleDateString('vi-VN')}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">
                                {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
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
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full text-slate-400 focus-visible:ring-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-60 shadow-2xl border-2 rounded-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">
                                    General Actions
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                    className="cursor-pointer py-2.5 rounded-xl font-bold text-slate-600 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-700 transition-all gap-3"
                                    onClick={() => onView(row.original.id)}
                                    onMouseEnter={() => prefetchPayment(row.original.id)}
                                >
                                    <Eye className="h-4 w-4 opacity-70" />
                                    <span>View Transaction</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer py-2.5 rounded-xl font-bold text-slate-400 hover:text-slate-900 focus:bg-slate-50 transition-all gap-3">
                                    <FileText className="h-4 w-4 opacity-70" />
                                    <span>Print Receipt</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="my-1.5" />

                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">
                                    Update Status
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                    className="cursor-pointer py-2.5 rounded-xl font-bold text-emerald-600 hover:text-emerald-700 focus:bg-emerald-50 transition-all gap-3"
                                    onClick={() => handleUpdateStatus(row.original.id, 'Paid')}
                                >
                                    <CheckCircle2 className="h-4 w-4 opacity-70" />
                                    <span>Set as Paid</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer py-2.5 rounded-xl font-bold text-rose-600 hover:text-rose-700 focus:bg-rose-50 transition-all gap-3"
                                    onClick={() => handleUpdateStatus(row.original.id, 'Failed')}
                                >
                                    <XCircle className="h-4 w-4 opacity-70" />
                                    <span>Set as Failed</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer py-2.5 rounded-xl font-bold text-blue-600 hover:text-blue-700 focus:bg-blue-50 transition-all gap-3"
                                    onClick={() => handleUpdateStatus(row.original.id, 'Refunded')}
                                >
                                    <RotateCcw className="h-4 w-4 opacity-70" />
                                    <span>Set as Refunded</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
            },
        ],
        [onView, prefetchPayment, handleUpdateStatus]
    );

    return columns;
};

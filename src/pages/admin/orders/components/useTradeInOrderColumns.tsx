import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createColumnHelper } from '@tanstack/react-table';
import { Eye, Hash, User, CreditCard, Calendar, XCircle } from 'lucide-react';

import { AdminStatusBadge, AdminRowActions } from '@/components/admin';
import type { TradeInOrderListItem } from '@/api/types/tradeInOrder';
import { formatDateTime, formatPrice } from '@/lib/utils';
import { tradeInStatusBadgeValue, tradeInStatusLabel } from './tradeInStatus';

const columnHelper = createColumnHelper<TradeInOrderListItem>();

export const useTradeInOrderColumns = (onCancel: (order: TradeInOrderListItem) => void) => {
  return useMemo(
    () => [
      columnHelper.display({
        id: 'type',
        header: () => <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 font-bold">Type</span>,
        cell: () => <AdminStatusBadge status="tradein" />,
      }),
      columnHelper.accessor('orderCode', {
        header: () => <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 font-bold">Identification</span>,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200/50">
              <Hash className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 leading-tight">{row.original.orderCode}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">ID: {row.original.tradeInOrderId.slice(0, 8)}</span>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('receiverName', {
        header: () => <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 font-bold">Customer</span>,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100/50">
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 leading-tight">{row.original.receiverName}</span>
              <span className="text-xs text-slate-500 font-medium">{row.original.phoneNumber}</span>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('status', {
        header: () => <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 font-bold">Processing</span>,
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <AdminStatusBadge 
              status={tradeInStatusBadgeValue(row.original.status)} 
            />
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">{tradeInStatusLabel(row.original.status)}</span>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'condition',
        header: () => <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 font-bold">Condition</span>,
        cell: ({ row }) => (
          <AdminStatusBadge 
            status={row.original.isGood ? 'good' : 'failed'} 
            type={row.original.isGood ? 'success' : 'rose'} 
          />
        ),
      }),
      columnHelper.display({
        id: 'pricing',
        header: () => <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 font-bold">Financials</span>,
        cell: ({ row }) => (
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/50">
              <CreditCard className="h-4 w-4" />
            </div>
            <div className="flex flex-col font-medium">
              <span className="text-sm font-bold text-slate-900">{formatPrice(row.original.tradeInPrice)} <span className="text-[10px] text-slate-400 font-normal">EST.</span></span>
              <span className="text-xs text-slate-500">Deposit: {formatPrice(row.original.depositAmount)}</span>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: () => <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 font-bold">Timeline</span>,
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="h-3.5 w-3.5 opacity-60" />
            <span className="text-sm font-medium">{formatDateTime(row.original.createdAt)}</span>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right text-[11px] font-black uppercase tracking-widest text-slate-400 font-bold">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <AdminRowActions 
              width="w-48"
              sections={[
                [
                  {
                    label: 'View Details',
                    icon: <Eye className="h-4 w-4" />,
                    component: (
                      <Link
                        to={`/admin/trade-in-orders/${row.original.tradeInOrderId}`}
                        className="flex items-center gap-2.5 w-full"
                      >
                        <Eye className="h-4 w-4 opacity-70" />
                        <span className="text-[13px] font-medium">View Details</span>
                      </Link>
                    )
                  }
                ],
                [
                  {
                    label: 'Cancel Order',
                    icon: <XCircle className="h-4 w-4" />,
                    variant: 'danger',
                    onClick: () => onCancel(row.original)
                  }
                ]
              ]}
            />
          </div>
        ),
      }),
    ],
    [onCancel],
  );
};

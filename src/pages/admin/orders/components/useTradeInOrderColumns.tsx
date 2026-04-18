import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createColumnHelper } from '@tanstack/react-table';
import { Eye, Trash2 } from 'lucide-react';

import { AdminStatusBadge, AdminRowActions } from '@/components/admin';
import type { TradeInOrderListItem } from '@/api/types/tradeInOrder';
import { formatPrice } from '@/pages/profile/utils';
import { formatDate, formatTime } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SortableHeader } from '@/components/admin';
import { tradeInStatusBadgeValue } from './tradeInStatus';
import { isTradeInAdminCancelableStatus } from '@/utils/tradeInWorkflow';

const columnHelper = createColumnHelper<TradeInOrderListItem>();

export const useTradeInOrderColumns = (onCancel: (order: TradeInOrderListItem) => void) => {
  return useMemo(
    () => [
      columnHelper.display({
        id: 'type',
        header: () => <span className="font-semibold">Type</span>,
        cell: () => <AdminStatusBadge status="tradein" />,
        size: 120,
      }),
      columnHelper.accessor('orderCode', {
        enableSorting: true,
        header: ({ column }) => <SortableHeader column={column} label="Order ID" />,
        cell: ({ row }) => (
          <div className="font-mono text-sm font-bold text-[#4988c4]">
            #{row.original.orderCode}
          </div>
        ),
      }),
      columnHelper.accessor('receiverName', {
        enableSorting: true,
        header: ({ column }) => <SortableHeader column={column} label="Customer" />,
        cell: ({ row }) => {
          const fallbackChar = (row.original.receiverName || row.original.phoneNumber || 'G').trim().charAt(0).toUpperCase();

          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-gray-200">
                <AvatarFallback className="bg-gradient-to-br from-[#4988c4] to-[#3a6da0] text-white text-xs font-semibold">
                  {fallbackChar || 'G'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-gray-900 truncate max-w-[180px]">{row.original.receiverName || 'Guest Customer'}</div>
                <div className="text-xs text-gray-500">{row.original.phoneNumber || 'No phone'}</div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'pricing',
        header: () => <span className="font-semibold">Total</span>,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{formatPrice(row.original.amountToPay)}</span>
            <span className="text-xs text-gray-500">Trade-In: {formatPrice(row.original.tradeInPrice)}</span>
          </div>
        ),
      }),
      columnHelper.accessor('status', {
        header: () => <span className="font-semibold">Status</span>,
        cell: ({ row }) => (
          <AdminStatusBadge
            status={tradeInStatusBadgeValue(row.original.status)}
          />
        ),
      }),
      columnHelper.display({
        id: 'condition',
        header: () => <span className="font-semibold">Condition</span>,
        cell: ({ row }) => (
          <AdminStatusBadge
            status={row.original.isGood ? 'good' : 'failed'}
            type={row.original.isGood ? 'success' : 'rose'}
          />
        ),
      }),
      columnHelper.accessor('createdAt', {
        enableSorting: true,
        header: ({ column }) => <SortableHeader column={column} label="Date Created" />,
        cell: ({ row }) => {
          return (
            <div className="text-sm text-gray-600 flex flex-col">
              <span className="font-semibold text-gray-900">{formatDate(row.original.createdAt)}</span>
              <span className="text-[10px] text-gray-400">{formatTime(row.original.createdAt)}</span>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const viewAction = {
            label: 'View Details',
            icon: <Eye className="h-4 w-4" />,
            component: (
              <Link
                to={`/admin/trade-in-orders/${row.original.tradeInOrderId}`}
                className="flex items-center gap-2.5 w-full"
              >
                <Eye className="h-4 w-4 opacity-70" />
                <span className="text-[13px]">View Details</span>
              </Link>
            ),
          };

          const cancelAction = {
            label: 'Cancel Order',
            icon: <Trash2 className="h-4 w-4 text-rose-500" />,
            variant: 'danger' as const,
            onClick: () => onCancel(row.original),
          };

          const actions = isTradeInAdminCancelableStatus(row.original.status)
            ? [viewAction, cancelAction]
            : [viewAction];

          return (
            <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
              <AdminRowActions actions={actions} />
            </div>
          );
        },
      }),
    ],
    [onCancel],
  );
};

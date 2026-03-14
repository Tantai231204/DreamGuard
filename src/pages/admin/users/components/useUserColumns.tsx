import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Edit,
  Trash2,
  Eye,
  Ban,
  CheckCircle,
  ShieldCheck,
  Mail,
  Phone,
} from 'lucide-react';
import { SortableHeader, AdminRowActions, AdminStatusBadge } from '@/components/admin';
import type { User } from '../types';
import { formatDate } from '@/lib/utils';

const columnHelper = createColumnHelper<User>();



export function useUserColumns() {
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onChange={(e) => row.toggleSelected(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              aria-label="Select row"
            />
          </div>
        ),
        size: 50,
      }),
      columnHelper.accessor('id', {
        header: ({ column }) => <SortableHeader column={column} label="ID" />,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-gray-600">
            {row.getValue('id')}
          </span>
        ),
        size: 100,
      }),
      columnHelper.accessor('name', {
        header: ({ column }) => <SortableHeader column={column} label="User" />,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-gray-200">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 text-sm truncate max-w-[180px]">
                  {user.name}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Mail className="h-3 w-3" />
                  <span className="truncate max-w-[160px]">{user.email}</span>
                </div>
              </div>
            </div>
          );
        },
        size: 250,
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Phone className="h-3.5 w-3.5" />
            <span>{row.getValue('phone')}</span>
          </div>
        ),
        size: 130,
      }),
      columnHelper.accessor('role', {
        header: ({ column }) => <SortableHeader column={column} label="Role" />,
        cell: ({ row }) => {
          const role = row.getValue('role') as string;
          return (
            <AdminStatusBadge 
              status={role} 
              type={role === 'admin' ? 'info' : role === 'moderator' ? 'warning' : 'neutral'} 
            />
          );
        },
        size: 120,
      }),
      columnHelper.accessor('status', {
        header: ({ column }) => <SortableHeader column={column} label="Status" />,
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          return (
            <AdminStatusBadge status={status} />
          );
        },
        size: 110,
      }),
      columnHelper.accessor('isVerified', {
        header: 'Verified',
        cell: ({ row }) => {
          const isVerified = row.getValue('isVerified');
          return isVerified ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Yes</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">No</span>
          );
        },
        size: 100,
      }),
      columnHelper.accessor('totalOrders', {
        header: ({ column }) => <SortableHeader column={column} label="Orders" />,
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-gray-700">
            {row.getValue('totalOrders')}
          </span>
        ),
        size: 90,
      }),
      columnHelper.accessor('totalSpent', {
        header: ({ column }) => <SortableHeader column={column} label="Total Spent" />,
        cell: ({ row }) => {
          const amount = row.getValue('totalSpent') as number;
          return (
            <span className="text-sm font-semibold text-emerald-600">
              {amount.toLocaleString('vi-VN')}₫
            </span>
          );
        },
        size: 130,
      }),
      columnHelper.accessor('lastLogin', {
        header: ({ column }) => <SortableHeader column={column} label="Last Login" />,
        cell: ({ row }) => {
          const lastLogin = row.getValue('lastLogin') as string | undefined;
          if (!lastLogin) return <span className="text-xs text-gray-400">Never</span>;
          return (
            <span className="text-xs text-gray-600">
              {formatDate(lastLogin)}
            </span>
          );
        },
        size: 110,
      }),
      columnHelper.accessor('createdAt', {
        header: ({ column }) => <SortableHeader column={column} label="Joined" />,
        cell: ({ row }) => {
          return (
            <span className="text-xs text-gray-600">
              {formatDate(row.getValue('createdAt'))}
            </span>
          );
        },
        size: 120,
      }),
      columnHelper.display({
        id: 'actions',
        header: () => null,
        cell: ({ row }) => {
          const user = row.original;
          const isBanned = user.status === 'banned';
          const isAdmin = user.role === 'admin';

          return (
            <div className="flex justify-end">
              <AdminRowActions
                sections={[
                  [
                    { label: 'View Details', icon: <Eye className="h-4 w-4" />, onClick: () => console.log('View', user.id) },
                    { label: 'Edit User', icon: <Edit className="h-4 w-4" />, onClick: () => console.log('Edit', user.id) },
                  ],
                  ...(!isAdmin ? [
                    [
                      isBanned 
                        ? { label: 'Unban User', icon: <CheckCircle className="h-4 w-4" />, variant: 'success' as const, onClick: () => console.log('Unban', user.id) }
                        : { label: 'Ban User', icon: <Ban className="h-4 w-4" />, variant: 'warning' as const, onClick: () => console.log('Ban', user.id) },
                      { label: 'Change Role', icon: <ShieldCheck className="h-4 w-4" />, variant: 'info' as const, onClick: () => console.log('Role', user.id) },
                    ],
                    [
                      { label: 'Delete User', icon: <Trash2 className="h-4 w-4" />, variant: 'danger' as const, onClick: () => console.log('Delete', user.id) }
                    ]
                  ] : [])
                ]}
              />
            </div>
          );
        },
        size: 60,
      }),
    ],
    []
  );

  return columns;
}

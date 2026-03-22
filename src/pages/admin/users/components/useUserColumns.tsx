import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Eye,
  Mail,
  Phone,
  ShoppingBag,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { SortableHeader, AdminRowActions } from '@/components/admin';
import type { User } from '../types';
import { formatDate } from '@/lib/utils';

const columnHelper = createColumnHelper<User>();

interface UserColumnsProps {
  onView?: (customer: User) => void;
}

export function useUserColumns({ onView }: UserColumnsProps = {}) {
  const columns = useMemo(
    () => [
      columnHelper.accessor('fullName', {
        header: ({ column }) => <SortableHeader column={column} label="Customer" />,
        cell: ({ row }) => {
          const user = row.original;
          const randomAvatarUrl = `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(user.email || user.fullName || row.id)}`;

          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-slate-100 shadow-sm">
                <AvatarImage src={user.avatarUrl || randomAvatarUrl} />
                <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
                  {user.fullName?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 text-sm truncate max-w-[180px]">
                  {user.fullName}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Mail className="h-3 w-3 text-slate-400" />
                  <span className="truncate max-w-[160px]">{user.email}</span>
                </div>
              </div>
            </div>
          );
        },
        size: 250,
      }),
      columnHelper.accessor('phoneNumber', {
        header: 'Phone',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            <span>{row.getValue('phoneNumber') || 'N/A'}</span>
          </div>
        ),
        size: 160,
      }),
      columnHelper.accessor('gender', {
        header: 'Gender',
        cell: ({ row }) => (
          <span className="text-sm font-medium text-slate-650">
            {row.getValue('gender') || 'N/A'}
          </span>
        ),
        size: 110,
      }),
      columnHelper.accessor('dateOfBirth', {
        header: 'Birthdate',
        cell: ({ row }) => {
          const dob = row.getValue('dateOfBirth') as string | undefined;
          return (
            <span className="text-sm text-slate-600 font-medium">
              {dob ? formatDate(dob) : 'N/A'}
            </span>
          );
        },
        size: 130,
      }),
      columnHelper.display({
        id: 'actions',
        header: () => null,
        cell: ({ row }) => {
          const user = row.original;

          return (
            <div className="flex justify-end">
              <AdminRowActions
                sections={[
                  [
                    { label: 'View Details', icon: <Eye className="h-4 w-4" />, onClick: () => onView && onView(user) },
                    { label: 'Order History', icon: <ShoppingBag className="h-4 w-4" />, onClick: () => console.log('Orders for', user.customerId) },
                  ],
                  [
                    { label: 'Reset Password', icon: <RefreshCw className="h-4 w-4" />, onClick: () => console.log('Reset Password', user.customerId) },
                    { label: 'Suspend Account', icon: <Lock className="h-4 w-4" />, variant: 'danger' as const, onClick: () => console.log('Suspend', user.customerId) },
                  ]
                ]}
              />
            </div>
          );
        },
        size: 60,
      }),
    ],
    [onView]
  );

  return columns;
}

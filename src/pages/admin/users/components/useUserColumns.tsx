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
import { formatDate, cn } from '@/lib/utils';
import { FaVenus, FaMars, FaVenusMars } from 'react-icons/fa';

const columnHelper = createColumnHelper<User>();

interface UserColumnsProps {
  onView?: (customer: User) => void;
  onViewOrders?: (customer: User) => void;
}

export function useUserColumns({ onView, onViewOrders }: UserColumnsProps = {}) {
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
                <AvatarFallback className="bg-slate-50 flex items-center justify-center">
                  <img src="/images/logo_no_name.svg" alt="DG" className="w-5 h-5 opacity-40 grayscale" />
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
        cell: ({ row }) => {
          const gender = row.getValue('gender') as string | undefined;
          if (!gender) return <span className="text-slate-400 font-medium text-xs ml-1">-</span>;

          const isMale = gender.toLowerCase() === 'male';
          const isFemale = gender.toLowerCase() === 'female';

          return (
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-black tracking-wider shadow-sm transition-all cursor-default",
              isMale && "bg-blue-50/50 text-blue-700 border-blue-100 hover:bg-blue-100/40",
              isFemale && "bg-rose-50/50 text-rose-700 border-rose-100 hover:bg-rose-100/40",
              !isMale && !isFemale && "bg-slate-50 text-slate-600 border-slate-200"
            )}>
              {isMale && <FaMars className="h-3 w-3 text-blue-500" />}
              {isFemale && <FaVenus className="h-3 w-3 text-rose-500" />}
              {!isMale && !isFemale && <FaVenusMars className="h-3 w-3 text-slate-400" />}
              <span className="capitalize">{gender}</span>
            </div>
          );
        },
        size: 125,
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
                    { label: 'Order History', icon: <ShoppingBag className="h-4 w-4" />, onClick: () => onViewOrders && onViewOrders(user) },
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
    [onView, onViewOrders]
  );

  return columns;
}

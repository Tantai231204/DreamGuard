import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Ban,
  CheckCircle,
  ShieldCheck,
  Mail,
  Phone,
} from 'lucide-react';
import { SortableHeader } from '@/components/admin';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '../types';

const columnHelper = createColumnHelper<User>();

const roleStyles = {
  admin: 'bg-purple-50 text-purple-700 border-purple-200',
  moderator: 'bg-blue-50 text-blue-700 border-blue-200',
  customer: 'bg-gray-50 text-gray-700 border-gray-200',
};

const roleLabels = {
  admin: 'Admin',
  moderator: 'Moderator',
  customer: 'Customer',
};

const statusStyles = {
  active: 'bg-green-50 text-green-700 border-green-200',
  inactive: 'bg-gray-50 text-gray-600 border-gray-300',
  banned: 'bg-red-50 text-red-700 border-red-200',
};

const statusLabels = {
  active: 'Active',
  inactive: 'Inactive',
  banned: 'Banned',
};

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
          const role = row.getValue('role') as User['role'];
          return (
            <Badge variant="outline" className={`text-xs ${roleStyles[role]}`}>
              {roleLabels[role]}
            </Badge>
          );
        },
        size: 120,
      }),
      columnHelper.accessor('status', {
        header: ({ column }) => <SortableHeader column={column} label="Status" />,
        cell: ({ row }) => {
          const status = row.getValue('status') as User['status'];
          return (
            <Badge variant="outline" className={`text-xs ${statusStyles[status]}`}>
              {statusLabels[status]}
            </Badge>
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
          const date = new Date(lastLogin);
          return (
            <span className="text-xs text-gray-600">
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          );
        },
        size: 110,
      }),
      columnHelper.accessor('createdAt', {
        header: ({ column }) => <SortableHeader column={column} label="Joined" />,
        cell: ({ row }) => {
          const date = new Date(row.getValue('createdAt'));
          return (
            <span className="text-xs text-gray-600">
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="gap-2 cursor-pointer text-sm">
                  <Eye className="h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-sm">
                  <Edit className="h-4 w-4" />
                  Edit User
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {!isAdmin && (
                  <>
                    {isBanned ? (
                      <DropdownMenuItem className="gap-2 cursor-pointer text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Unban User
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem className="gap-2 cursor-pointer text-sm text-orange-600">
                        <Ban className="h-4 w-4" />
                        Ban User
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="gap-2 cursor-pointer text-sm text-blue-600">
                      <ShieldCheck className="h-4 w-4" />
                      Change Role
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2 cursor-pointer text-sm text-red-600">
                      <Trash2 className="h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 60,
      }),
    ],
    []
  );

  return columns;
}

import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Edit,
  Power,
  Eye,
  ShieldCheck,
  Mail,
  Phone,
  Briefcase,
} from 'lucide-react';
import { SortableHeader, AdminRowActions, AdminStatusBadge, StaffRoleBadge } from '@/components/admin';
import type { Staff } from '../types';
// import { formatDate } from '@/lib/utils';

const columnHelper = createColumnHelper<Staff>();

interface StaffColumnsProps {
  onEdit?: (staff: Staff) => void;
  onChangeRole?: (staff: Staff) => void;
}

export function useStaffColumns({ onEdit, onChangeRole }: StaffColumnsProps = {}) {
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
      columnHelper.accessor('staffId', {
        header: ({ column }) => <SortableHeader column={column} label="ID" />,
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-gray-600">
            {row.getValue('staffId')}
          </span>
        ),
        size: 100,
      }),
      columnHelper.accessor('fullName', {
        header: ({ column }) => <SortableHeader column={column} label="Staff" />,
        cell: ({ row }) => {
          const staff = row.original;
          const randomAvatarUrl = `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(staff.email || staff.fullName || row.id)}`;

          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border-2 border-slate-100 shadow-sm">
                <AvatarImage src={staff.avatarUrl || randomAvatarUrl} />
                <AvatarFallback className="bg-indigo-600 text-white text-xs font-semibold">
                  {staff.fullName ? staff.fullName.charAt(0) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 text-sm truncate max-w-[180px]">
                  {staff.fullName}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Mail className="h-3 w-3" />
                  <span className="truncate max-w-[160px]">{staff.email}</span>
                </div>
              </div>
            </div>
          );
        },
        size: 230,
      }),
      columnHelper.accessor('phoneNumber', {
        header: 'Phone',
        cell: ({ row }) => {
          const phone = row.getValue('phoneNumber') as string | undefined;
          return (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Phone className="h-3.5 w-3.5" />
              <span>{phone || 'Not available'}</span>
            </div>
          );
        },
        size: 130,
      }),
      columnHelper.accessor('position', {
        header: ({ column }) => <SortableHeader column={column} label="Position" />,
        cell: ({ row }) => {
          const position = row.getValue('position') as string | undefined;
          // Split camelCase/PascalCase into words (e.g. DeliveryStaff -> Delivery Staff)
          const formattedPosition = position?.replace(/([A-Z])/g, ' $1').trim() || 'N/A';

          return (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Briefcase className="h-3.5 w-3.5 text-gray-400" />
              <span className="font-medium">{formattedPosition}</span>
            </div>
          );
        },
        size: 160,
      }),
      columnHelper.accessor('role', {
        header: ({ column }) => <SortableHeader column={column} label="Role" />,
        cell: ({ row }) => {
          const staff = row.original;
          const role = staff.role || staff.position || 'staff';
          return <StaffRoleBadge role={role} />;
        },
        size: 120,
      }),
      columnHelper.accessor('status', {
        header: ({ column }) => <SortableHeader column={column} label="Status" />,
        cell: ({ row }) => {
          const status = (row.getValue('status') as string) || 'active';
          return (
            <AdminStatusBadge status={status} />
          );
        },
        size: 110,
      }),

      columnHelper.display({
        id: 'actions',
        header: () => null,
        cell: ({ row }) => {
          const staff = row.original;
          const isAdmin = staff.role?.toLowerCase() === 'admin';

          return (
            <div className="flex justify-end">
              <AdminRowActions
                sections={[
                  [
                    { label: 'View Profile', icon: <Eye className="h-4 w-4" />, onClick: () => console.log('View', staff.staffId) },
                    { label: 'Edit Info', icon: <Edit className="h-4 w-4" />, onClick: () => onEdit && onEdit(staff) },
                  ],
                  ...(!isAdmin ? [
                    [
                      { label: 'Change Role', icon: <ShieldCheck className="h-4 w-4" />, variant: 'info' as const, onClick: () => onChangeRole && onChangeRole(staff) },
                    ],
                    [
                      { label: staff.status === 'active' ? 'Deactivate' : 'Activate', icon: <Power className="h-4 w-4" />, variant: (staff.status === 'active' ? 'warning' : 'success') as 'warning' | 'success', onClick: () => console.log('Toggle status', staff.staffId) }
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
    [onEdit, onChangeRole]
  );

  return columns;
}

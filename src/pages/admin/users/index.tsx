import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import type {
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
} from '@tanstack/react-table';
import { Users } from 'lucide-react';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { AdminTableSearch, AdminTablePagination } from '@/components/admin';
import { AdminBulkActions } from '@/components/admin/AdminBulkActions';
import { useUserColumns } from './components/useUserColumns';
import { UserTableContent } from './components/UserTableContent';
import { UserActions } from './components/UserActions';
import { mockUsers } from './data';

export default function UsersPage() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = useUserColumns();

  const table = useReactTable({
    data: mockUsers,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Users}
        title="User Management"
        description="Manage user accounts, roles, and permissions"
        actions={<UserActions />}
      />

      <div className="space-y-4">
        <AdminTableSearch
          value={globalFilter}
          onChange={setGlobalFilter}
          placeholder="Search users by name, email, or phone..."
          table={table}
        />

        <AdminBulkActions
          table={table}
          itemLabel="user"
          accentColor="black"
          onDelete={() => {
            console.log('Bulk delete');
            table.resetRowSelection();
          }}
        />
      </div>

      <UserTableContent table={table} />

      <AdminTablePagination table={table} />
    </div>
  );
}

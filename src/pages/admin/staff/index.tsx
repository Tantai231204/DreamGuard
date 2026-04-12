import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import type {
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
  PaginationState,
  Updater,
} from '@tanstack/react-table';
import { Briefcase, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { AdminTableSearch, AdminTablePagination, AdminTableContent } from '@/components/admin';

import { useStaffColumns } from './components/useStaffColumns';
import { StaffActions } from './components/StaffActions';
import { StaffDialog, type StaffFormValues } from './components/StaffDialog';
import { ChangeRoleDialog } from './components/ChangeRoleDialog';
import { motion } from 'framer-motion';
import { useStaffs, useCreateStaff, useUpdateStaff, useUpdateStaffRole, useUpdateStaffAccount } from '@/hooks/queries/useStaff';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';
import { downloadCSV } from '@/lib/export';
import type { Staff } from './types';
import type { CreateStaffRequest, UpdateStaffRequest } from '@/api/types/staff.types';

export default function StaffPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const pagination = useMemo(() => ({
    pageIndex: parseInt(searchParams.get('page') || '1') - 1,
    pageSize: parseInt(searchParams.get('pageSize') || '10'),
  }), [searchParams]);

  const globalFilter = searchParams.get('search') || '';
  const roleFilter = searchParams.get('role') || 'all';

  const setRoleFilter = useCallback((value: string) => {
    setSearchParams((prev) => {
      if (value === 'all') prev.delete('role');
      else prev.set('role', value);
      prev.set('page', '1'); // Reset to first page
      return prev;
    });
  }, [setSearchParams]);

  const setPagination = useCallback((updaterOrValue: Updater<PaginationState>) => {
    const next = typeof updaterOrValue === 'function' ? updaterOrValue(pagination) : updaterOrValue;
    setSearchParams((prev) => {
      prev.set('page', String(next.pageIndex + 1));
      prev.set('pageSize', String(next.pageSize));
      return prev;
    });
  }, [pagination, setSearchParams]);

  const setGlobalFilter = useCallback((value: string) => {
    setSearchParams((prev) => {
      if (value) prev.set('search', value);
      else prev.delete('search');
      prev.set('page', '1'); // Reset
      return prev;
    });
  }, [setSearchParams]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleStaff, setRoleStaff] = useState<{ id: string; role: string } | null>(null);

  const debouncedSearch = useDebounce(globalFilter, 500);

  const { data, isLoading } = useStaffs({
    pageNumber: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    key: debouncedSearch || undefined,
    Role: roleFilter !== 'all' ? roleFilter : undefined,
  });

  const staffList = useMemo(() => {
    const list = data?.items || [];
    if (roleFilter !== 'all') {
      const targetRole = roleFilter.toLowerCase();
      return list.filter(staff => {
        // Robust case-insensitive check against both role and position
        const staffRole = (staff.role || '').toLowerCase();
        const staffPosition = (staff.position || '').toLowerCase();
        
        return staffRole === targetRole || 
               staffPosition === targetRole ||
               // Handle "Cleaning Staff" vs "CleaningStaff"
               (targetRole === 'cleaningstaff' && 
                (staffRole.includes('clean') || staffPosition.includes('clean') || staffRole.includes('technician'))) ||
               (targetRole === 'manager' && staffRole.includes('manager')) ||
               (targetRole === 'seller' && (staffRole.includes('seller') || staffRole.includes('sale')));
      });
    }
    return list;
  }, [data, roleFilter]);

  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const updateRoleMutation = useUpdateStaffRole();
  const updateAccountMutation = useUpdateStaffAccount();

  const handleAdd = useCallback(() => {
    setEditingStaff(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((staff: Staff) => {
    setEditingStaff(staff);
    setDialogOpen(true);
  }, []);

  const handleChangeRole = useCallback((staff: Staff) => {
    setRoleStaff({ id: staff.staffId, role: staff.role || staff.position || 'Seller' });
    setRoleDialogOpen(true);
  }, []);

  const handleExport = useCallback(() => {
    const exportData = staffList.map(staff => ({
      ID: staff.staffId || '',
      FullName: staff.fullName || '',
      Email: staff.email || '',
      Phone: staff.phoneNumber || '',
      Role: staff.role || '',
      Position: staff.position || '',
      Status: staff.status || 'active'
    }));
    downloadCSV(exportData, 'Staffs');
  }, [staffList]);

  const handleSubmit = useCallback(
    async (data: StaffFormValues) => {
      try {
        if (editingStaff) {
          // Edit mode
          const updatePayload: UpdateStaffRequest = {
            fullName: data.fullName,
            address: data.address || "",
            gender: data.gender,
            dateOfBirth: data.dateOfBirth || null,
            avatarUrl: editingStaff.avatarUrl || "",
          };
          await updateMutation.mutateAsync({ id: editingStaff.staffId, data: updatePayload });

          // Update Account details if Phone changed
          if (data.phoneNumber && data.phoneNumber !== editingStaff.phoneNumber) {
            await updateAccountMutation.mutateAsync({
              id: editingStaff.staffId,
              data: { phoneNumber: data.phoneNumber }
            });
          }

          // Check if role changed (Disabled in Dialog, so skips safely)
          const newRole = data.role;
          if (newRole && newRole !== editingStaff.role) {
            await updateRoleMutation.mutateAsync({ id: editingStaff.staffId, newRole });
          }

          toast.success('Staff updated', 'Staff details have been updated successfully.');
        } else {
          // Create mode
          const createPayload: CreateStaffRequest = {
            email: data.email,
            phoneNumber: data.phoneNumber,
            fullName: data.fullName,
            gender: data.gender,
            dateOfBirth: data.dateOfBirth || null,
            address: data.address || "",
            position: data.position || "",
            role: data.role,
          };

          if (data.password) {
            createPayload.password = data.password;
          }

          await createMutation.mutateAsync(createPayload);
          toast.success('Staff created', 'A new staff member has been added.');
        }
        setDialogOpen(false);
      } catch (error) {
        console.error('Error saving staff:', error);
      }
    },
    [editingStaff, createMutation, updateMutation, updateRoleMutation, updateAccountMutation, toast]
  );

  const columns = useStaffColumns({ onEdit: handleEdit, onChangeRole: handleChangeRole });

  const table = useReactTable({
    data: staffList,
    columns,
    pageCount: data?.totalPages ?? -1,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },
    manualPagination: true,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: undefined, // manual pagination
  });

  return (
    <div className="flex flex-col h-full">
      <AdminPageHeader
        icon={Briefcase}
        title="Staff Management"
        description="Manage employee accounts, roles, and department permissions"
        stats={[]}
      />

      <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-xl m-6 flex flex-col"
        >
          <div className="flex flex-col h-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <Tabs value={roleFilter} onValueChange={setRoleFilter} className="w-full">
                <TabsList className="bg-white/80 border border-gray-200 p-1 rounded-xl h-11 shadow-sm">
                  <TabsTrigger value="all" className="rounded-lg px-6 text-xs font-bold data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-white transition-all">
                    Show All
                  </TabsTrigger>
                  <TabsTrigger value="Manager" className="rounded-lg px-6 text-xs font-bold data-[state=active]:bg-primary-600 data-[state=active]:text-white transition-all flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> Managers
                  </TabsTrigger>
                  <TabsTrigger value="Seller" className="rounded-lg px-6 text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all flex items-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5" /> Sellers
                  </TabsTrigger>
                  <TabsTrigger value="CleaningStaff" className="rounded-lg px-6 text-xs font-bold data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" /> Cleaning Staff
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <AdminTableSearch
              value={globalFilter}
              onChange={setGlobalFilter}
              placeholder="Search staff by name, email, or position..."
              table={table}
              resultCount={roleFilter === 'all' ? (data?.totalCount ?? 0) : staffList.length}
              resultLabel={roleFilter === 'all' ? "staff" : `matching ${roleFilter}s`}
              actions={<StaffActions onAdd={handleAdd} onExport={handleExport} />}
            />



            <div className="flex-1 overflow-auto">
              <AdminTableContent
                table={table}
                emptyMessage="No staff members found."
                isLoading={isLoading}
              />
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <AdminTablePagination table={table} itemLabel="staff" />
            </div>
          </div>
        </motion.div>
      </div>

      <StaffDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        staff={editingStaff}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending || updateRoleMutation.isPending}
      />

      <ChangeRoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        staffId={roleStaff?.id || ''}
        currentRole={roleStaff?.role || ''}
        key={roleStaff?.id} // Forces fresh mount when switching users
      />
    </div>
  );
}

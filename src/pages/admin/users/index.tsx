import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
} from '@tanstack/react-table';
import type {
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
  PaginationState,
  Updater,
} from '@tanstack/react-table';
import { Users } from 'lucide-react';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { AdminTableSearch, AdminTablePagination, AdminTableContent, AdminActions } from '@/components/admin';
import { useUserColumns } from './components/useUserColumns';
import { useCustomers } from '@/hooks/queries/useCustomer';
import { CustomerDetailDialog } from './components/CustomerDetailDialog';
import { CustomerOrdersDialog } from './components/CustomerOrdersDialog';
import { useDebounce } from '@/hooks/useDebounce';
import { downloadCSV } from '@/lib/export';
import type { User } from './types';

export default function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const pagination = useMemo(() => ({
    pageIndex: parseInt(searchParams.get('page') || '1') - 1,
    pageSize: parseInt(searchParams.get('pageSize') || '10'),
  }), [searchParams]);

  const globalFilter = searchParams.get('search') || '';

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
      prev.set('page', '1'); // Reset to first page on search
      return prev;
    });
  }, [setSearchParams]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

  const handleViewDetails = useCallback((customer: User) => {
    setSelectedCustomer(customer);
    setDetailOpen(true);
  }, []);

  const [ordersOpen, setOrdersOpen] = useState(false);
  const [selectedCustomerForOrders, setSelectedCustomerForOrders] = useState<User | null>(null);

  const handleViewOrders = useCallback((customer: User) => {
    setSelectedCustomerForOrders(customer);
    setOrdersOpen(true);
  }, []);

  const debouncedSearch = useDebounce(globalFilter, 500);

  const { data: customersData, isLoading } = useCustomers({
    pageNumber: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    key: debouncedSearch || undefined,
  });

  const handleExport = useCallback(() => {
    const exportData = (customersData?.items ?? []).map(customer => ({
      ID: customer.customerId || '',
      FullName: customer.fullName || '',
      Email: customer.email || '',
      Phone: customer.phoneNumber || '',
      Gender: customer.gender || '',
      BirthDate: customer.dateOfBirth?.split('T')[0] || ''
    }));
    downloadCSV(exportData, 'Customers');
  }, [customersData]);

  const columns = useUserColumns({ onView: handleViewDetails, onViewOrders: handleViewOrders });

  const table = useReactTable({
    data: customersData?.items ?? [],
    columns,
    pageCount: customersData?.totalPages ?? -1,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="flex flex-col h-full">
      <AdminPageHeader
        icon={Users}
        title="Customer Management"
        description="Manage customer accounts and viewing general metrics"
        stats={[]}
      />

      <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
        <div className="flex-1 bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-xl m-6 flex flex-col">
          <div className="flex flex-col h-full overflow-hidden">
            <AdminTableSearch
              value={globalFilter}
              onChange={setGlobalFilter}
              placeholder="Search customers by name, email, or phone..."
              table={table}
              resultCount={customersData?.totalCount ?? 0}
              resultLabel="results"
              actions={
                <AdminActions 
                  onFilter={() => console.log('Filter')} 
                  onExport={handleExport} 
                />
              }
            />

            <div className="flex-1 overflow-auto">
              <AdminTableContent
                table={table}
                emptyMessage="No customers found."
                isLoading={isLoading}
              />
            </div>

            <div className="p-4 border-t border-slate-100 bg-white">
              <AdminTablePagination table={table} />
            </div>
          </div>
        </div>
      </div>

      <CustomerDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        customer={selectedCustomer}
      />

      <CustomerOrdersDialog
        open={ordersOpen}
        onOpenChange={setOrdersOpen}
        customer={selectedCustomerForOrders}
      />
    </div>
  );
}

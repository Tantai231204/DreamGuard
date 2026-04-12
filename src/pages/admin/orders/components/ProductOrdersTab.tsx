import { memo } from 'react';

import { AdminActions, AdminTableContent, AdminTablePagination, AdminTableSearch } from '@/components/admin';
import { useProductOrdersTabViewModel } from '../view-models';

import { CancelOrderDialog } from './CancelOrderDialog';

export const ProductOrdersTab = memo(function ProductOrdersTab() {
  const viewModel = useProductOrdersTabViewModel();

  return (
    <>
      <AdminTableSearch
        table={viewModel.table}
        value={viewModel.globalFilter}
        onChange={viewModel.setGlobalFilter}
        placeholder="Search orders, customers..."
        resultCount={viewModel.resultCount}
        resultLabel="orders"
        actions={<AdminActions onExport={viewModel.handleExport} />}
      />

      <div className="flex-1 overflow-auto bg-white border-y border-gray-100">
        <AdminTableContent
          table={viewModel.table}
          emptyMessage="No results match your current inquiry."
          isLoading={viewModel.isPending}
        />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <AdminTablePagination
          table={viewModel.table}
          itemLabel="orders"
          totalItems={viewModel.resultCount}
        />
      </div>

      <CancelOrderDialog
        open={viewModel.isCancelOpen}
        onOpenChange={viewModel.setIsCancelOpen}
        orderCode={viewModel.orderToCancel?.orderCode || ''}
        onConfirm={viewModel.handleConfirmCancel}
        isLoading={viewModel.isCancelling}
      />
    </>
  );
});

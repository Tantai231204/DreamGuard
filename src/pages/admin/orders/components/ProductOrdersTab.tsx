import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { AdminActions, AdminTableContent, AdminTablePagination, AdminTableSearch } from '@/components/admin';
import { useProductOrdersTabViewModel } from '../view-models';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

import { CancelOrderDialog } from './CancelOrderDialog';

const PRODUCT_STATUS_OPTIONS = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipping',
  'Completed',
  'Cancelled',
];

export const ProductOrdersTab = memo(function ProductOrdersTab() {
  const navigate = useNavigate();
  const viewModel = useProductOrdersTabViewModel();

  return (
    <>
      {/* ── Status Filter Bar ── */}
      <div className="px-6 py-2.5 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto scrollbar-hide flex-shrink-0">
        <FilterChip
          label="All"
          count={viewModel.resultCount}
          isActive={viewModel.statusFilter === 'all'}
          onClick={() => viewModel.handleStatusChange('all')}
        />
        {PRODUCT_STATUS_OPTIONS.map((status) => (
          <FilterChip
            key={status}
            label={status}
            isActive={viewModel.statusFilter === status}
            onClick={() => viewModel.handleStatusChange(status)}
            attentionCount={status === 'Cancelled' ? viewModel.pendingRefundCount : 0}
          />
        ))}
      </div>

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
          onRowClick={(row) => navigate(`/admin/checkout-orders/${row.id}`)}
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
        orderCode={viewModel.orderToCancel?.checkoutOrderCode || ''}
        onConfirm={viewModel.handleConfirmCancel}
        isLoading={viewModel.isCancelling}
      />
    </>
  );
});

/* ────────────────────────────────────────────────────────────── */
/*  FilterChip – Shared UI component                             */
/* ────────────────────────────────────────────────────────────── */

interface FilterChipProps {
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
  attentionCount?: number;
}

function FilterChip({ label, count, isActive, onClick, attentionCount }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2",
        isActive
          ? "text-white"
          : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="active-product-order-filter"
          className="absolute inset-0 rounded-lg bg-[#4988c4] shadow-sm"
          transition={{ type: "tween", duration: 0.25, ease: "circOut" }}
        />
      )}
      <div className="relative z-10 flex items-center gap-2">
        <span className="text-xs font-semibold">{label}</span>
        {typeof count === 'number' && (
          <Badge
            className={cn(
              "h-4 min-w-[16px] px-1 flex items-center justify-center text-[9px] font-bold rounded-full transition-all duration-200 border-none",
              isActive
                ? "bg-white/20 text-white"
                : "bg-slate-200/50 text-slate-600"
            )}
          >
            {count}
          </Badge>
        )}
        {typeof attentionCount === 'number' && attentionCount > 0 && (
          <Badge
            className="h-4 min-w-[16px] px-1 flex items-center justify-center text-[9px] font-black rounded-full bg-rose-500 text-white border-2 border-white shadow-sm -mt-3 -mr-1"
          >
            {attentionCount}
          </Badge>
        )}
      </div>
    </button>
  );
}

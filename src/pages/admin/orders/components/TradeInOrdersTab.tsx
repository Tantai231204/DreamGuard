import { memo } from 'react';
import { RefreshCw } from 'lucide-react';

import { AdminTablePagination, AdminTableSearch } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

import {
  TRADE_IN_ORDERS_VIRTUALIZE_THRESHOLD,
  useTradeInOrdersTabViewModel,
} from '../view-models';

import { tradeInStatusLabel } from './tradeInStatus';
import { TradeInVirtualizedTable } from './TradeInVirtualizedTable';
import { CancelTradeInOrderDialog } from './CancelTradeInOrderDialog';
import { motion } from 'framer-motion';

export const TradeInOrdersTab = memo(function TradeInOrdersTab() {
  const viewModel = useTradeInOrdersTabViewModel();

  return (
    <div className="flex h-full flex-col">
      {/* ── Status Filter Bar ── */}
      <div className="px-6 py-2.5 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto scrollbar-hide flex-shrink-0">
        <FilterChip
          label="All"
          count={viewModel.resultCount}
          isActive={viewModel.statusFilter === 'all'}
          onClick={() => viewModel.handleStatusChange('all')}
        />
        {viewModel.statusOptions.map((status) => (
          <FilterChip
            key={status}
            label={tradeInStatusLabel(status)}
            isActive={viewModel.statusFilter === status}
            onClick={() => viewModel.handleStatusChange(status)}
          />
        ))}
      </div>

      {/* ── Search + Actions Bar ── */}
      <AdminTableSearch
        table={viewModel.table}
        value={viewModel.globalFilter}
        onChange={viewModel.handleSearchChange}
        placeholder="Search trade-in orders..."
        resultCount={viewModel.resultCount}
        resultLabel="orders"
        actions={
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2.5 h-10 px-5 rounded-xl border-2 border-slate-200 font-bold text-[11px] uppercase tracking-wider text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700 transition-all shadow-sm"
            disabled={viewModel.isRefetching}
            onClick={viewModel.handleRefresh}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", viewModel.isRefetching && "animate-spin")} />
            Sync Dashboard
          </Button>
        }
      />

      {/* ── Virtualized Table ── */}
      <div className="flex-1 overflow-auto bg-white border-y border-gray-100">
        <TradeInVirtualizedTable
          table={viewModel.table}
          emptyMessage="No results match your current inquiry."
          isLoading={viewModel.isPending}
          virtualizeThreshold={TRADE_IN_ORDERS_VIRTUALIZE_THRESHOLD}
        />
      </div>

      {/* ── Pagination Footer ── */}
      <div className="bg-white flex-shrink-0">
        <AdminTablePagination
          table={viewModel.table}
          itemLabel="trades"
          totalItems={viewModel.resultCount}
        />
      </div>

      {/* ── Cancellation Dialog ── */}
      <CancelTradeInOrderDialog
        open={viewModel.isCancelOpen}
        onOpenChange={viewModel.setIsCancelOpen}
        orderCode={viewModel.orderToCancel?.orderCode}
        onConfirm={viewModel.handleConfirmCancel}
        isLoading={viewModel.isCancelling}
      />
    </div>
  );
});

/* ────────────────────────────────────────────────────────────── */
/*  FilterChip – Compact, animated status filter pill            */
/* ────────────────────────────────────────────────────────────── */

interface FilterChipProps {
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
}

function FilterChip({ label, count, isActive, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2",
        isActive
          ? "text-white"
          : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="active-trade-in-filter"
          className="absolute inset-0 rounded-lg bg-emerald-600 shadow-sm"
          transition={{ type: "tween", duration: 0.25, ease: "circOut" }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
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
      </span>
    </button>
  );
}

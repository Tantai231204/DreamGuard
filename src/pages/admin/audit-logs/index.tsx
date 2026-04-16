import React, { useState, useEffect, memo } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { auditLogService } from '@/api/services';
import type { AuditLogResponse } from '@/api/services/auditLogService';
import { format } from 'date-fns';
import {
  History as HistoryIcon, User, Clock, Search, ShieldCheck, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminStatusBadge } from '@/components/admin';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';

const PAGE_SIZE = 20;

export default function GlobalAuditLogs() {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const entityId = searchParams.get('entityId');

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);

  const { data: logs, isLoading, isPlaceholderData, isFetching } = useQuery({
    queryKey: ['auditLogs', { page, search: debouncedSearch, entityId }],
    queryFn: () => auditLogService.getLogs({
      pageNumber: page,
      pageSize: PAGE_SIZE,
      key: debouncedSearch,
      entityId: entityId || undefined
    }),
    placeholderData: keepPreviousData,
    staleTime: 10000,
  });

  useEffect(() => {
    if (!isPlaceholderData && logs?.hasNextPage) {
      queryClient.prefetchQuery({
        queryKey: ['auditLogs', { page: page + 1, search: debouncedSearch, entityId }],
        queryFn: () => auditLogService.getLogs({
          pageNumber: page + 1,
          pageSize: PAGE_SIZE,
          key: debouncedSearch,
          entityId: entityId || undefined
        }),
      });
    }
  }, [logs, page, debouncedSearch, entityId, queryClient, isPlaceholderData]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    document.getElementById('audit-main-content')?.scrollTo(0, 0);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* ─── Simplified Header ─────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[9px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Infrastructure Audit
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              Audit Logs
              {isFetching && <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />}
            </h1>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="Quick search..."
              className="pl-9 h-9 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors text-sm"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </header>

      {/* ─── Content ───────────────────────────────────────────── */}
      <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden" id="audit-main-content">
        <div className="max-w-7xl mx-auto space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl bg-white border border-slate-100" />)}
            </div>
          ) : !logs?.items.length ? (
            <EmptyState />
          ) : (
            <>
              <div className={cn("grid gap-2.5", isPlaceholderData && "opacity-60")}>
                {logs.items.map((log) => (
                  <AuditLogCard key={log.auditLogId} log={log} />
                ))}
              </div>

              {/* ─── Simple Pagination ────────────────────────────── */}
              <div className="flex items-center justify-between py-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                  Showing {logs.items.length} of {logs.totalCount} entries
                </p>

                <div className="flex items-center gap-1.5">
                  <PaginationButton disabled={page === 1} onClick={() => handlePageChange(page - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </PaginationButton>

                  <div className="hidden sm:flex gap-1">
                    {generatePaginationRange(page, logs.totalPages).map((p, i) => (
                      <button
                        key={i}
                        disabled={p === '...'}
                        onClick={() => typeof p === 'number' && handlePageChange(p)}
                        className={cn(
                          "h-8 min-w-[32px] px-2 rounded-lg font-black text-[10px] transition-colors",
                          page === p ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <PaginationButton disabled={!logs.hasNextPage} onClick={() => handlePageChange(page + 1)}>
                    <ChevronRight className="w-4 h-4" />
                  </PaginationButton>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Sub-Components (Memoized for Performance) ───────────────────

const AuditLogCard = memo(({ log }: { log: AuditLogResponse }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-slate-200 transition-colors flex items-start gap-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="shrink-0 min-w-[120px]">
        <AdminStatusBadge status={log.actionType} dot={false} className="w-full py-1.5 font-black text-[9px] uppercase tracking-tighter" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 tracking-widest uppercase">
              <Clock className="w-3 h-3" />
              {format(new Date(log.createdAt), 'MMM dd, HH:mm:ss')}
            </span>
            {log.entityId && (
              <span className="text-[9px] font-mono text-slate-300">
                #{log.entityId.slice(-8).toUpperCase()}
              </span>
            )}
          </div>
          <div className="text-[10px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 flex items-center gap-1.5">
            <User className="w-3 h-3 opacity-40" />
            {log.userName || 'SYSTEM'}
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-600 truncate-2-lines leading-snug">
          {log.message}
        </p>
      </div>
    </div>
  );
});

AuditLogCard.displayName = 'AuditLogCard';

function PaginationButton({ disabled, onClick, children }: { disabled: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <Button
      variant="outline" size="icon"
      className="h-8 w-8 rounded-lg border-slate-200 disabled:opacity-20"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function EmptyState() {
  return (
    <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
      <HistoryIcon className="w-10 h-10 text-slate-200 mx-auto mb-4" />
      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">No matching records</h3>
    </div>
  );
}

function generatePaginationRange(current: number, total: number) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 2) return [1, 2, 3, '...', total];
  if (current >= total - 1) return [1, '...', total - 2, total - 1, total];
  return [1, '...', current, '...', total];
}

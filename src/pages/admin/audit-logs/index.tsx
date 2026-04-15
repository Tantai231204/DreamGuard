import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogService } from '@/api/services';
import { format } from 'date-fns';
import { 
  History as HistoryIcon, 
  User, 
  Clock, 
  Search, 
  Filter, 
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminStatusBadge } from '@/components/admin';
import { useSearchParams } from 'react-router-dom';

export default function GlobalAuditLogs() {
  const [searchParams] = useSearchParams();
  const entityId = searchParams.get('entityId');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 15;

  const { data: logs, isLoading } = useQuery({
    queryKey: ['auditLogs', 'global', page, searchTerm, entityId],
    queryFn: () => auditLogService.getLogs({ 
      pageNumber: page, 
      pageSize, 
      key: searchTerm,
      entityId: entityId || undefined
    }),
  });

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
              <ShieldCheck className="w-4 h-4" />
              System Governance
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Audit Trail Ledger</h1>
            <p className="text-xs text-slate-400 font-medium italic">Immutable record of all system-wide administrative and automated actions.</p>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search actions, messages or IDs..." 
                  className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                />
             </div>
             <Button variant="outline" className="h-10 rounded-xl border-slate-200 text-slate-600 gap-2">
                <Filter className="w-4 h-4" />
                Filter
             </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl bg-white border border-slate-100 shadow-sm" />
              ))}
            </div>
          ) : !logs?.items.length ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-200 mb-4">
                <HistoryIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No logs captured yet</h3>
              <p className="text-sm text-slate-400 mt-1">Refine your search parameters or check back later.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-3">
                {logs.items.map((log) => (
                  <div 
                    key={log.auditLogId} 
                    className="group bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex items-start gap-6 relative overflow-hidden"
                  >
                    {/* Status Badge using AdminStatusBadge */}
                    <div className="shrink-0 pt-0.5 min-w-[140px]">
                       <AdminStatusBadge 
                         status={log.actionType} 
                         dot={false}
                         className="px-4 py-1.5 w-full justify-center"
                       />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                <Clock className="w-3.5 h-3.5" />
                                {format(new Date(log.createdAt), 'MMM dd, yyyy • HH:mm:ss')}
                             </div>
                             {log.entityId && (
                                <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                                   E-ID: {log.entityId.substring(0, 8).toUpperCase()}
                                </span>
                             )}
                          </div>
                          
                          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-xl border border-slate-100 text-slate-500 group-hover:bg-primary/5 group-hover:border-primary/20 group-hover:text-primary transition-all">
                             <User className="w-3.5 h-3.5" />
                             <span className="text-[11px] font-black uppercase tracking-tight">
                                {log.userName || (log.userRole === 'User' ? 'Customer' : 'System Account')}
                             </span>
                          </div>
                       </div>

                       <div className="flex items-start gap-3">
                         <div className="w-1 h-10 bg-slate-100 rounded-full shrink-0 group-hover:bg-primary/30 transition-colors" />
                         <p className="text-[13px] font-medium text-slate-600 leading-relaxed max-w-4xl">
                            {log.message}
                         </p>
                       </div>
                    </div>

                    <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                       <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary hover:bg-primary/10">
                          <ArrowRight className="w-4 h-4" />
                       </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 pb-8">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Showing {logs.items.length} of {logs.totalCount} entries
                </p>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-10 w-10 rounded-xl"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, logs.totalPages))].map((_, i) => {
                      const p = i + 1;
                      return (
                        <Button
                          key={p}
                          variant={page === p ? 'default' : 'ghost'}
                          className={cn(
                            "h-10 w-10 rounded-xl font-bold text-xs",
                            page === p && "shadow-md shadow-primary/20"
                          )}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </Button>
                      );
                    })}
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-10 w-10 rounded-xl"
                    disabled={page === logs.totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

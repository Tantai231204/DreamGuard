import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogService } from '@/api/services';
import { format } from 'date-fns';
import { History as HistoryIcon, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AdminStatusBadge } from '@/components/admin';
import { usePermission } from '@/hooks/usePermission';

interface TradeInAuditLogsProps {
  tradeInOrderId: string;
}

export const TradeInAuditLogs: React.FC<TradeInAuditLogsProps> = ({ tradeInOrderId }) => {
  const navigate = useNavigate();
  const { isAdmin, isManager } = usePermission();
  const canViewLogs = isAdmin || isManager;

  const { data: logs, isLoading } = useQuery({
    queryKey: ['auditLogs', 'tradeIn', tradeInOrderId],
    queryFn: () => auditLogService.getLogs({ entityId: tradeInOrderId, pageSize: 50 }),
    enabled: !!tradeInOrderId && canViewLogs,
  });

  if (!canViewLogs) return null;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const allItems = logs?.items || [];
  const items = allItems.slice(0, 3);
  const hasMore = allItems.length > 3;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <HistoryIcon className="w-3.5 h-3.5 text-slate-400" />
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Audit Trail</h3>
        </div>
        
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[9px] font-black uppercase text-primary hover:bg-primary/5 tracking-widest px-2"
            onClick={() => navigate(`/admin/audit-logs?entityId=${tradeInOrderId}`)}
          >
            All Logs
          </Button>
        )}
      </div>

      <div className="space-y-2.5">
        {items.length === 0 ? (
          <div className="py-4 text-center border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">No history</p>
          </div>
        ) : (
          items.map((log) => (
            <div key={log.auditLogId} className="group bg-white rounded-xl border border-slate-100 p-3 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <AdminStatusBadge 
                      status={log.actionType} 
                      dot={false} 
                      className="scale-90 origin-left pr-2 py-0"
                    />
                    <span className="text-[10px] font-bold text-slate-300">•</span>
                    <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                      {format(new Date(log.createdAt), 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed truncate group-hover:whitespace-normal transition-all">
                    {log.message}
                  </p>
                </div>

                <div className="shrink-0 pt-0.5">
                  <div className="p-1 rounded bg-slate-50 border border-slate-100 text-slate-400 group-hover:text-primary transition-colors">
                    <User className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

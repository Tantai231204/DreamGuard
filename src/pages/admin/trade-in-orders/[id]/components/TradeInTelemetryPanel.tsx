import { memo, useEffect, useState } from 'react';

import {
  TRADE_IN_TELEMETRY_EVENT_NAME,
  TRADE_IN_TELEMETRY_STORAGE_KEY,
  readTradeInMutationTelemetry,
  type TradeInMutationOperation,
  type TradeInMutationTelemetryState,
} from '@/hooks/telemetry/useTradeInMutationTelemetry';

const OPERATION_LABELS: Record<TradeInMutationOperation, string> = {
  'transition-status': 'Transition',
  'confirm-deal': 'Confirm Deal',
};

const OPERATION_ORDER: TradeInMutationOperation[] = ['transition-status', 'confirm-deal'];

const formatRollbackRate = (rate: number) => `${(rate * 100).toFixed(1)}%`;

const createEmptyTelemetryState = (): TradeInMutationTelemetryState => ({
  'transition-status': {
    total: 0,
    success: 0,
    rollback: 0,
    avgLatencyMs: 0,
    maxLatencyMs: 0,
    lastLatencyMs: 0,
    rollbackRate: 0,
    updatedAt: '',
  },
  'confirm-deal': {
    total: 0,
    success: 0,
    rollback: 0,
    avgLatencyMs: 0,
    maxLatencyMs: 0,
    lastLatencyMs: 0,
    rollbackRate: 0,
    updatedAt: '',
  },
});

export const TradeInTelemetryPanel = memo(function TradeInTelemetryPanel() {
  const [metrics, setMetrics] = useState<TradeInMutationTelemetryState>(() => readTradeInMutationTelemetry());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const refresh = () => {
      const latest = readTradeInMutationTelemetry();
      setMetrics(latest);
    };

    const onTelemetryEvent = () => {
      refresh();
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === TRADE_IN_TELEMETRY_STORAGE_KEY) {
        refresh();
      }
    };

    window.addEventListener(TRADE_IN_TELEMETRY_EVENT_NAME, onTelemetryEvent as EventListener);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(TRADE_IN_TELEMETRY_EVENT_NAME, onTelemetryEvent as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const hasAnyMetric = OPERATION_ORDER.some((operation) => (metrics[operation]?.total ?? 0) > 0);
  const safeMetrics = metrics || createEmptyTelemetryState();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Trade-in Telemetry</p>
        <span className="text-[9px] font-bold text-slate-500">Live</span>
      </div>

      {!hasAnyMetric ? (
        <p className="text-[10px] text-slate-500">No telemetry yet.</p>
      ) : (
        <div className="space-y-2">
          {OPERATION_ORDER.map((operation) => {
            const metric = safeMetrics[operation];
            return (
              <div key={operation} className="rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-wide">{OPERATION_LABELS[operation]}</span>
                  <span className="text-[10px] font-bold text-rose-600">Rollback {formatRollbackRate(metric.rollbackRate)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Total {metric.total}</span>
                  <span>Avg {metric.avgLatencyMs}ms</span>
                  <span>Last {metric.lastLatencyMs}ms</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

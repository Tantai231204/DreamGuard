import { useCallback, useRef } from 'react';

export type TradeInMutationOperation = 'transition-status' | 'confirm-deal';
export type TradeInMutationOutcome = 'success' | 'rollback';

export interface TradeInMutationMetric {
  total: number;
  success: number;
  rollback: number;
  avgLatencyMs: number;
  maxLatencyMs: number;
  lastLatencyMs: number;
  rollbackRate: number;
  updatedAt: string;
}

export type TradeInMutationTelemetryState = Record<TradeInMutationOperation, TradeInMutationMetric>;

interface BeginTelemetryInput {
  operation: TradeInMutationOperation;
  orderId: string;
  targetStatus?: string;
}

interface EndTelemetryInput extends BeginTelemetryInput {
  token?: string;
  outcome: TradeInMutationOutcome;
  reason?: string;
}

export interface TradeInTelemetryEventDetail {
  operation: TradeInMutationOperation;
  orderId: string;
  outcome: TradeInMutationOutcome;
  targetStatus?: string;
  latencyMs: number;
  rollbackRate: number;
  total: number;
  reason?: string;
  at: string;
}

interface TradeInTelemetryBatchPayload {
  source: 'dreamguard-web';
  sentAt: string;
  events: TradeInTelemetryEventDetail[];
}

export const TRADE_IN_TELEMETRY_EVENT_NAME = 'dreamguard:tradein-mutation-telemetry';
export const TRADE_IN_TELEMETRY_STORAGE_KEY = 'dreamguard:tradein:mutation-telemetry:v1';

const TRADE_IN_TELEMETRY_QUEUE_STORAGE_KEY = 'dreamguard:tradein:mutation-telemetry:queue:v1';
const TRADE_IN_TELEMETRY_BATCH_ENDPOINT =
  (import.meta.env.VITE_TRADE_IN_TELEMETRY_ENDPOINT as string | undefined)
  || '/api/telemetry/trade-in-mutations/batch';
const TRADE_IN_TELEMETRY_BATCH_SIZE = 20;
const TRADE_IN_TELEMETRY_MAX_QUEUE = 200;
const TRADE_IN_TELEMETRY_FLUSH_INTERVAL_MS = 15000;

const EMPTY_METRIC: TradeInMutationMetric = {
  total: 0,
  success: 0,
  rollback: 0,
  avgLatencyMs: 0,
  maxLatencyMs: 0,
  lastLatencyMs: 0,
  rollbackRate: 0,
  updatedAt: '',
};

let isFlushingQueue = false;
let flushQueueTimer: number | null = null;

const createInitialState = (): TradeInMutationTelemetryState => ({
  'transition-status': { ...EMPTY_METRIC },
  'confirm-deal': { ...EMPTY_METRIC },
});

export const readTradeInMutationTelemetry = (): TradeInMutationTelemetryState => {
  if (typeof window === 'undefined') {
    return createInitialState();
  }

  try {
    const rawState = window.localStorage.getItem(TRADE_IN_TELEMETRY_STORAGE_KEY);
    if (!rawState) {
      return createInitialState();
    }

    const parsed = JSON.parse(rawState) as Partial<TradeInMutationTelemetryState>;
    return {
      'transition-status': { ...EMPTY_METRIC, ...(parsed['transition-status'] || {}) },
      'confirm-deal': { ...EMPTY_METRIC, ...(parsed['confirm-deal'] || {}) },
    };
  } catch {
    return createInitialState();
  }
};

const writeTradeInMutationTelemetry = (state: TradeInMutationTelemetryState) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(TRADE_IN_TELEMETRY_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Telemetry must not block business actions.
  }
};

const dispatchTelemetryEvent = (detail: TradeInTelemetryEventDetail) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent<TradeInTelemetryEventDetail>(TRADE_IN_TELEMETRY_EVENT_NAME, {
    detail,
  }));
};

const readTelemetryQueue = (): TradeInTelemetryEventDetail[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(TRADE_IN_TELEMETRY_QUEUE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TradeInTelemetryEventDetail[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeTelemetryQueue = (events: TradeInTelemetryEventDetail[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(TRADE_IN_TELEMETRY_QUEUE_STORAGE_KEY, JSON.stringify(events));
  } catch {
    // Ignore telemetry persistence failures.
  }
};

const scheduleQueueFlush = () => {
  if (typeof window === 'undefined') {
    return;
  }

  if (flushQueueTimer !== null) {
    return;
  }

  flushQueueTimer = window.setTimeout(() => {
    flushQueueTimer = null;
    void flushTelemetryQueue();
  }, TRADE_IN_TELEMETRY_FLUSH_INTERVAL_MS);
};

const flushTelemetryQueue = async () => {
  if (typeof window === 'undefined' || isFlushingQueue) {
    return;
  }

  const queue = readTelemetryQueue();
  if (queue.length === 0) {
    return;
  }

  if (flushQueueTimer !== null) {
    window.clearTimeout(flushQueueTimer);
    flushQueueTimer = null;
  }

  isFlushingQueue = true;
  const batch = queue.slice(0, TRADE_IN_TELEMETRY_BATCH_SIZE);

  try {
    const payload: TradeInTelemetryBatchPayload = {
      source: 'dreamguard-web',
      sentAt: new Date().toISOString(),
      events: batch,
    };

    const response = await fetch(TRADE_IN_TELEMETRY_BATCH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Telemetry batch failed: ${response.status}`);
    }

    const latestQueue = readTelemetryQueue();
    writeTelemetryQueue(latestQueue.slice(batch.length));
  } catch {
    scheduleQueueFlush();
  } finally {
    isFlushingQueue = false;

    const remainingQueue = readTelemetryQueue();
    if (remainingQueue.length >= TRADE_IN_TELEMETRY_BATCH_SIZE) {
      void flushTelemetryQueue();
    } else if (remainingQueue.length > 0) {
      scheduleQueueFlush();
    }
  }
};

const enqueueTelemetryEvent = (event: TradeInTelemetryEventDetail) => {
  const queue = readTelemetryQueue();
  queue.push(event);

  const trimmedQueue = queue.slice(-TRADE_IN_TELEMETRY_MAX_QUEUE);
  writeTelemetryQueue(trimmedQueue);

  if (trimmedQueue.length >= TRADE_IN_TELEMETRY_BATCH_SIZE) {
    void flushTelemetryQueue();
    return;
  }

  scheduleQueueFlush();
};

export const useTradeInMutationTelemetry = () => {
  const startTimesRef = useRef<Map<string, number>>(new Map());

  const begin = useCallback(({ operation, orderId, targetStatus }: BeginTelemetryInput): string => {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const token = `${operation}:${orderId}:${targetStatus || 'na'}:${Date.now()}:${Math.random().toString(36).slice(2, 9)}`;
    startTimesRef.current.set(token, now);
    return token;
  }, []);

  const end = useCallback(({ token, operation, orderId, targetStatus, outcome, reason }: EndTelemetryInput) => {
    const finishAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const startedAt = token ? startTimesRef.current.get(token) : undefined;

    if (token) {
      startTimesRef.current.delete(token);
    }

    const latencyMs = Math.max(0, Math.round(finishAt - (startedAt ?? finishAt)));

    const state = readTradeInMutationTelemetry();
    const previousMetric = state[operation] ?? { ...EMPTY_METRIC };

    const total = previousMetric.total + 1;
    const success = previousMetric.success + (outcome === 'success' ? 1 : 0);
    const rollback = previousMetric.rollback + (outcome === 'rollback' ? 1 : 0);
    const avgLatencyMs =
      previousMetric.total > 0
        ? Math.round(((previousMetric.avgLatencyMs * previousMetric.total) + latencyMs) / total)
        : latencyMs;
    const maxLatencyMs = Math.max(previousMetric.maxLatencyMs, latencyMs);
    const rollbackRate = total > 0 ? Number((rollback / total).toFixed(4)) : 0;
    const updatedAt = new Date().toISOString();

    const nextMetric: TradeInMutationMetric = {
      total,
      success,
      rollback,
      avgLatencyMs,
      maxLatencyMs,
      lastLatencyMs: latencyMs,
      rollbackRate,
      updatedAt,
    };

    const nextState: TradeInMutationTelemetryState = {
      ...state,
      [operation]: nextMetric,
    };

    writeTradeInMutationTelemetry(nextState);

    const telemetryEvent: TradeInTelemetryEventDetail = {
      operation,
      orderId,
      outcome,
      targetStatus,
      latencyMs,
      rollbackRate,
      total,
      reason,
      at: updatedAt,
    };

    dispatchTelemetryEvent(telemetryEvent);
    enqueueTelemetryEvent(telemetryEvent);

    if (import.meta.env.DEV) {
      console.info('[tradein-telemetry]', {
        operation,
        orderId,
        targetStatus,
        outcome,
        latencyMs,
        rollbackRate,
        total,
        reason,
      });
    }
  }, []);

  return {
    begin,
    end,
  };
};

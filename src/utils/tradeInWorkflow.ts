export const TRADE_IN_STATUS = {
  WAITING_FOR_STAFF: 'WAITING_FOR_STAFF',
  PENDING: 'PENDING',
  NEGOTIATING: 'NEGOTIATING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type TradeInStatus = (typeof TRADE_IN_STATUS)[keyof typeof TRADE_IN_STATUS];
export type TradeInBadgeStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

interface TradeInStatusDefinition {
  label: string;
  badgeStatus: TradeInBadgeStatus;
  step: number;
  description: string;
}

export interface TradeInStatusMeta extends TradeInStatusDefinition {
  normalizedStatus: string;
}

const TRADE_IN_STATUS_DEFINITION_MAP: Record<TradeInStatus, TradeInStatusDefinition> = {
  WAITING_FOR_STAFF: {
    label: 'Waiting For Staff',
    badgeStatus: 'pending',
    step: 0,
    description: 'Waiting for staff to receive and review your trade-in request',
  },
  PENDING: {
    label: 'Pending',
    badgeStatus: 'pending',
    step: 0,
    description: 'Your trade-in request is pending review',
  },
  NEGOTIATING: {
    label: 'Negotiating',
    badgeStatus: 'processing',
    step: 1,
    description: 'You and staff can discuss and negotiate trade-in valuation',
  },
  CONFIRMED: {
    label: 'Confirmed',
    badgeStatus: 'processing',
    step: 2,
    description: 'Your trade-in valuation has been confirmed',
  },
  PROCESSING: {
    label: 'Processing',
    badgeStatus: 'processing',
    step: 3,
    description: 'Your trade-in order is being processed',
  },
  DELIVERED: {
    label: 'Delivered',
    badgeStatus: 'processing',
    step: 4,
    description: 'Your upgrade package has been delivered',
  },
  COMPLETED: {
    label: 'Completed',
    badgeStatus: 'completed',
    step: 5,
    description: 'Trade-in process completed successfully',
  },
  CANCELLED: {
    label: 'Cancelled',
    badgeStatus: 'cancelled',
    step: -1,
    description: 'Trade-in request was cancelled',
  },
};

export const TRADE_IN_FILTER_BASE_STATUSES: TradeInStatus[] = [
  TRADE_IN_STATUS.WAITING_FOR_STAFF,
  TRADE_IN_STATUS.NEGOTIATING,
  TRADE_IN_STATUS.CONFIRMED,
  TRADE_IN_STATUS.PROCESSING,
  TRADE_IN_STATUS.DELIVERED,
  TRADE_IN_STATUS.COMPLETED,
  TRADE_IN_STATUS.CANCELLED,
];

const TRADE_IN_STATUS_SET = new Set<TradeInStatus>(Object.values(TRADE_IN_STATUS));
const WAITING_STATUS_SET = new Set<TradeInStatus>([
  TRADE_IN_STATUS.WAITING_FOR_STAFF,
  TRADE_IN_STATUS.PENDING,
]);
const ACTIVE_PROGRESS_STATUS_SET = new Set<TradeInStatus>([
  TRADE_IN_STATUS.CONFIRMED,
  TRADE_IN_STATUS.PROCESSING,
  TRADE_IN_STATUS.DELIVERED,
]);
const FINAL_STATUS_SET = new Set<TradeInStatus>([
  TRADE_IN_STATUS.COMPLETED,
  TRADE_IN_STATUS.CANCELLED,
]);

const TRANSITION_TARGETS: Record<TradeInStatus, TradeInStatus[]> = {
  [TRADE_IN_STATUS.WAITING_FOR_STAFF]: [TRADE_IN_STATUS.NEGOTIATING, TRADE_IN_STATUS.CANCELLED],
  [TRADE_IN_STATUS.PENDING]: [TRADE_IN_STATUS.NEGOTIATING, TRADE_IN_STATUS.CANCELLED],
  [TRADE_IN_STATUS.NEGOTIATING]: [TRADE_IN_STATUS.CONFIRMED, TRADE_IN_STATUS.CANCELLED],
  [TRADE_IN_STATUS.CONFIRMED]: [TRADE_IN_STATUS.PROCESSING, TRADE_IN_STATUS.CANCELLED],
  [TRADE_IN_STATUS.PROCESSING]: [TRADE_IN_STATUS.DELIVERED, TRADE_IN_STATUS.CANCELLED],
  [TRADE_IN_STATUS.DELIVERED]: [TRADE_IN_STATUS.COMPLETED, TRADE_IN_STATUS.CANCELLED],
  [TRADE_IN_STATUS.COMPLETED]: [],
  [TRADE_IN_STATUS.CANCELLED]: [],
};

const API_TRANSITION_TARGET_SET = new Set<TradeInStatus>([
  TRADE_IN_STATUS.PROCESSING,
  TRADE_IN_STATUS.DELIVERED,
  TRADE_IN_STATUS.COMPLETED,
]);

export const normalizeTradeInStatus = (status: string | null | undefined): string => {
  if (!status) return '';

  const normalized = String(status)
    .trim()
    // waitingForStaff -> waiting_For_Staff
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    // waiting-for-staff -> waiting_for_staff
    .replace(/[-\s]+/g, '_')
    .replace(/_+/g, '_')
    .toUpperCase();

  return normalized;
};

export const toTradeInStatus = (status: string | null | undefined): TradeInStatus | null => {
  const normalized = normalizeTradeInStatus(status);
  return TRADE_IN_STATUS_SET.has(normalized as TradeInStatus) ? (normalized as TradeInStatus) : null;
};

export const canTransitionTradeInStatus = (fromStatus: string, toStatus: string): boolean => {
  const from = toTradeInStatus(fromStatus);
  const to = toTradeInStatus(toStatus);

  if (!from || !to) return false;
  return TRANSITION_TARGETS[from].includes(to);
};

export const isTradeInTransitionTarget = (status: string): boolean => {
  const normalized = toTradeInStatus(status);
  return normalized ? API_TRANSITION_TARGET_SET.has(normalized) : false;
};

export const isTradeInWaitingStatus = (status: string): boolean => {
  const normalized = toTradeInStatus(status);
  return normalized ? WAITING_STATUS_SET.has(normalized) : false;
};

export const isTradeInActiveProgressStatus = (status: string): boolean => {
  const normalized = toTradeInStatus(status);
  return normalized ? ACTIVE_PROGRESS_STATUS_SET.has(normalized) : false;
};

export const isTradeInFinalStatus = (status: string): boolean => {
  const normalized = toTradeInStatus(status);
  return normalized ? FINAL_STATUS_SET.has(normalized) : false;
};

export const formatTradeInStatusLabel = (status: string): string => {
  return normalizeTradeInStatus(status)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (text) => text.toUpperCase());
};

export const getTradeInStatusMeta = (status: string | null | undefined): TradeInStatusMeta => {
  const normalizedStatus = normalizeTradeInStatus(status);
  const knownStatus = toTradeInStatus(normalizedStatus);

  if (knownStatus) {
    return {
      normalizedStatus,
      ...TRADE_IN_STATUS_DEFINITION_MAP[knownStatus],
    };
  }

  return {
    normalizedStatus,
    label: normalizedStatus ? formatTradeInStatusLabel(normalizedStatus) : 'Pending',
    badgeStatus: 'pending',
    step: 0,
    description: 'Trade-in request is being updated',
  };
};

export const getTradeInStatusBadgeStatus = (status: string | null | undefined): TradeInBadgeStatus => {
  return getTradeInStatusMeta(status).badgeStatus;
};

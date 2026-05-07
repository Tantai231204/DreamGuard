export const TRADE_IN_STATUS = {
  WAITING_FOR_STAFF: "WAITING_FOR_STAFF",
  PENDING: "PENDING",
  NEGOTIATING: "NEGOTIATING",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  DELIVERING: "DELIVERING",
  ARRIVED: "ARRIVED",
  DELIVERED: "DELIVERED",
  RETURNING: "RETURNING",
  EXCHANGE_REQUESTED: "EXCHANGE_REQUESTED",
  SHIPPING_REPLACEMENT: "SHIPPING_REPLACEMENT",
  REFUNDED_AND_RESTOCKED: "REFUNDED_AND_RESTOCKED",
  REFUNDED_AND_DAMAGED: "REFUNDED_AND_DAMAGED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  FORCED_CANCELLED: "FORCED_CANCELLED",
  ADMIN_CANCELLED: "ADMIN_CANCELLED",
  RETURNED: "RETURNED",
} as const;

export type TradeInStatus =
  (typeof TRADE_IN_STATUS)[keyof typeof TRADE_IN_STATUS];
export type TradeInBadgeStatus =
  | "pending"
  | "processing"
  | "completed"
  | "cancelled";

interface TradeInStatusDefinition {
  label: string;
  badgeStatus: TradeInBadgeStatus;
  step: number;
  description: string;
}

export interface TradeInStatusMeta extends TradeInStatusDefinition {
  normalizedStatus: string;
}

const TRADE_IN_STATUS_DEFINITION_MAP: Record<
  TradeInStatus,
  TradeInStatusDefinition
> = {
  WAITING_FOR_STAFF: {
    label: "Waiting For Staff",
    badgeStatus: "pending",
    step: 0,
    description:
      "Waiting for staff to receive and review your trade-in request",
  },
  PENDING: {
    label: "Pending",
    badgeStatus: "pending",
    step: 0,
    description: "Your trade-in request is pending review",
  },
  NEGOTIATING: {
    label: "Negotiating",
    badgeStatus: "processing",
    step: 1,
    description: "You and staff can discuss and negotiate trade-in valuation",
  },
  CONFIRMED: {
    label: "Confirmed",
    badgeStatus: "processing",
    step: 1,
    description: "Your trade-in valuation has been confirmed",
  },
  PROCESSING: {
    label: "Processing",
    badgeStatus: "processing",
    step: 2,
    description: "Your trade-in order is being processed",
  },
  DELIVERING: {
    label: "Delivering",
    badgeStatus: "processing",
    step: 3,
    description: "Trade-in parcel is in transit",
  },
  ARRIVED: {
    label: "Arrived",
    badgeStatus: "processing",
    step: 4,
    description: "Delivery staff has arrived at destination",
  },
  DELIVERED: {
    label: "Delivered",
    badgeStatus: "processing",
    step: 4,
    description: "Your upgrade package has been delivered",
  },
  RETURNING: {
    label: "Returning",
    badgeStatus: "processing",
    step: 8,
    description: "Return workflow is being handled",
  },
  EXCHANGE_REQUESTED: {
    label: "Exchange Requested",
    badgeStatus: "processing",
    step: 11,
    description: "Replacement request has been created",
  },
  SHIPPING_REPLACEMENT: {
    label: "Shipping Replacement",
    badgeStatus: "processing",
    step: 12,
    description: "Replacement shipment is in transit",
  },
  REFUNDED_AND_RESTOCKED: {
    label: "Returned & Restocked",
    badgeStatus: "completed",
    step: 9,
    description: "Refund settled and item restocked successfully",
  },
  REFUNDED_AND_DAMAGED: {
    label: "Returned (Damaged)",
    badgeStatus: "cancelled",
    step: 10,
    description: "Refund settled and item recorded as damaged",
  },
  COMPLETED: {
    label: "Completed",
    badgeStatus: "completed",
    step: 5,
    description: "Trade-in process completed successfully",
  },
  CANCELLED: {
    label: "Cancelled",
    badgeStatus: "cancelled",
    step: 6,
    description: "Trade-in request was cancelled",
  },
  FORCED_CANCELLED: {
    label: "Forced Cancelled",
    badgeStatus: "cancelled",
    step: 6,
    description: "Trade-in request was force-cancelled by administration",
  },
  ADMIN_CANCELLED: {
    label: "Admin Cancelled",
    badgeStatus: "cancelled",
    step: 6,
    description: "Trade-in request was cancelled by administration",
  },
  RETURNED: {
    label: "Returned",
    badgeStatus: "processing",
    step: 7,
    description: "The item has been successfully returned to the hub",
  },
};

export const TRADE_IN_FILTER_BASE_STATUSES: TradeInStatus[] = [
  TRADE_IN_STATUS.WAITING_FOR_STAFF,
  TRADE_IN_STATUS.NEGOTIATING,
  TRADE_IN_STATUS.CONFIRMED,
  TRADE_IN_STATUS.PROCESSING,
  TRADE_IN_STATUS.DELIVERING,
  TRADE_IN_STATUS.RETURNING,
  TRADE_IN_STATUS.COMPLETED,
  TRADE_IN_STATUS.CANCELLED,
];

const TRADE_IN_STATUS_SET = new Set<TradeInStatus>(
  Object.values(TRADE_IN_STATUS),
);
const TRADE_IN_STATUS_ALIAS_MAP: Record<string, TradeInStatus> = {
  "0": TRADE_IN_STATUS.PENDING,
  "1": TRADE_IN_STATUS.CONFIRMED,
  "2": TRADE_IN_STATUS.PROCESSING,
  "3": TRADE_IN_STATUS.DELIVERING,
  "4": TRADE_IN_STATUS.DELIVERED,
  "5": TRADE_IN_STATUS.COMPLETED,
  "6": TRADE_IN_STATUS.CANCELLED,
  "7": TRADE_IN_STATUS.RETURNED,
  "8": TRADE_IN_STATUS.RETURNING,
  "9": TRADE_IN_STATUS.REFUNDED_AND_RESTOCKED,
  "10": TRADE_IN_STATUS.REFUNDED_AND_DAMAGED,
  "11": TRADE_IN_STATUS.EXCHANGE_REQUESTED,
  "12": TRADE_IN_STATUS.SHIPPING_REPLACEMENT,
  SHIPPING: TRADE_IN_STATUS.DELIVERING,
  SHIPPING_REPLACEMENT: TRADE_IN_STATUS.SHIPPING_REPLACEMENT,
  SHIPPINGREPLACEMENT: TRADE_IN_STATUS.SHIPPING_REPLACEMENT,
  RETURNED: TRADE_IN_STATUS.RETURNED,
  FORCECANCELLED: TRADE_IN_STATUS.FORCED_CANCELLED,
  ADMINCANCELLED: TRADE_IN_STATUS.ADMIN_CANCELLED,
  ADMIN_CANCELLED: TRADE_IN_STATUS.ADMIN_CANCELLED,
};

const WAITING_STATUS_SET = new Set<TradeInStatus>([
  TRADE_IN_STATUS.WAITING_FOR_STAFF,
  TRADE_IN_STATUS.PENDING,
]);
const CUSTOMER_CANCELABLE_STATUS_SET = new Set<TradeInStatus>([
  TRADE_IN_STATUS.WAITING_FOR_STAFF,
  TRADE_IN_STATUS.PENDING,
  TRADE_IN_STATUS.NEGOTIATING,
]);
const ADMIN_CANCELABLE_STATUS_SET = new Set<TradeInStatus>([
  TRADE_IN_STATUS.WAITING_FOR_STAFF,
  TRADE_IN_STATUS.PENDING,
  TRADE_IN_STATUS.NEGOTIATING,
  TRADE_IN_STATUS.CONFIRMED,
]);
const ACTIVE_PROGRESS_STATUS_SET = new Set<TradeInStatus>([
  TRADE_IN_STATUS.NEGOTIATING,
  TRADE_IN_STATUS.CONFIRMED,
  TRADE_IN_STATUS.PROCESSING,
  TRADE_IN_STATUS.DELIVERING,
  TRADE_IN_STATUS.ARRIVED,
  TRADE_IN_STATUS.DELIVERED,
  TRADE_IN_STATUS.RETURNING,
  TRADE_IN_STATUS.RETURNED,
  TRADE_IN_STATUS.EXCHANGE_REQUESTED,
  TRADE_IN_STATUS.SHIPPING_REPLACEMENT,
]);
const FINAL_STATUS_SET = new Set<TradeInStatus>([
  TRADE_IN_STATUS.COMPLETED,
  TRADE_IN_STATUS.CANCELLED,
  TRADE_IN_STATUS.FORCED_CANCELLED,
  TRADE_IN_STATUS.ADMIN_CANCELLED,
  TRADE_IN_STATUS.REFUNDED_AND_RESTOCKED,
  TRADE_IN_STATUS.REFUNDED_AND_DAMAGED,
]);

const TRANSITION_TARGETS: Record<TradeInStatus, TradeInStatus[]> = {
  [TRADE_IN_STATUS.WAITING_FOR_STAFF]: [
    TRADE_IN_STATUS.NEGOTIATING,
    TRADE_IN_STATUS.CANCELLED,
    TRADE_IN_STATUS.FORCED_CANCELLED,
    TRADE_IN_STATUS.ADMIN_CANCELLED,
  ],
  [TRADE_IN_STATUS.PENDING]: [
    TRADE_IN_STATUS.NEGOTIATING,
    TRADE_IN_STATUS.CANCELLED,
    TRADE_IN_STATUS.FORCED_CANCELLED,
    TRADE_IN_STATUS.ADMIN_CANCELLED,
  ],
  [TRADE_IN_STATUS.NEGOTIATING]: [
    TRADE_IN_STATUS.CONFIRMED,
    TRADE_IN_STATUS.CANCELLED,
    TRADE_IN_STATUS.FORCED_CANCELLED,
    TRADE_IN_STATUS.ADMIN_CANCELLED,
  ],
  [TRADE_IN_STATUS.CONFIRMED]: [],
  [TRADE_IN_STATUS.PROCESSING]: [],
  [TRADE_IN_STATUS.DELIVERING]: [],
  [TRADE_IN_STATUS.ARRIVED]: [],
  [TRADE_IN_STATUS.DELIVERED]: [TRADE_IN_STATUS.COMPLETED],
  [TRADE_IN_STATUS.RETURNING]: [],
  [TRADE_IN_STATUS.EXCHANGE_REQUESTED]: [],
  [TRADE_IN_STATUS.SHIPPING_REPLACEMENT]: [],
  [TRADE_IN_STATUS.REFUNDED_AND_RESTOCKED]: [],
  [TRADE_IN_STATUS.REFUNDED_AND_DAMAGED]: [],
  [TRADE_IN_STATUS.COMPLETED]: [],
  [TRADE_IN_STATUS.CANCELLED]: [],
  [TRADE_IN_STATUS.FORCED_CANCELLED]: [],
  [TRADE_IN_STATUS.ADMIN_CANCELLED]: [],
  [TRADE_IN_STATUS.RETURNED]: [],
};

const API_TRANSITION_TARGET_SET = new Set<TradeInStatus>([
  TRADE_IN_STATUS.COMPLETED,
]);

export const normalizeTradeInStatus = (
  status: string | null | undefined,
): string => {
  if (!status) return "";

  const normalized = String(status)
    .trim()
    // waitingForStaff -> waiting_For_Staff
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    // waiting-for-staff -> waiting_for_staff
    .replace(/[-\s]+/g, "_")
    .replace(/_+/g, "_")
    .toUpperCase();

  return normalized;
};

export const toTradeInStatus = (
  status: string | null | undefined,
): TradeInStatus | null => {
  const normalized = normalizeTradeInStatus(status);
  if (TRADE_IN_STATUS_SET.has(normalized as TradeInStatus)) {
    return normalized as TradeInStatus;
  }

  return TRADE_IN_STATUS_ALIAS_MAP[normalized] ?? null;
};

export const canTransitionTradeInStatus = (
  fromStatus: string,
  toStatus: string,
): boolean => {
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

export const isTradeInCustomerCancelableStatus = (status: string): boolean => {
  const normalized = toTradeInStatus(status);
  return normalized ? CUSTOMER_CANCELABLE_STATUS_SET.has(normalized) : false;
};

export const isTradeInAdminCancelableStatus = (status: string): boolean => {
  const normalized = toTradeInStatus(status);
  return normalized ? ADMIN_CANCELABLE_STATUS_SET.has(normalized) : false;
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
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (text) => text.toUpperCase());
};

export const getTradeInStatusMeta = (
  status: string | null | undefined,
): TradeInStatusMeta => {
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
    label: normalizedStatus
      ? formatTradeInStatusLabel(normalizedStatus)
      : "Pending",
    badgeStatus: "pending",
    step: 0,
    description: "Trade-in request is being updated",
  };
};

export const getTradeInStatusBadgeStatus = (
  status: string | null | undefined,
): TradeInBadgeStatus => {
  return getTradeInStatusMeta(status).badgeStatus;
};

/**
 * Maps a frontend status constant back to its API-friendly representation (e.g., numeric string).
 */
export const toApiStatus = (status: string): string => {
  const normalized = normalizeTradeInStatus(status);
  // Find the numeric key in the alias map if it exists
  const entry = Object.entries(TRADE_IN_STATUS_ALIAS_MAP).find(([key, value]) => 
    value === normalized && !isNaN(Number(key))
  );
  return entry ? entry[0] : normalized;
};

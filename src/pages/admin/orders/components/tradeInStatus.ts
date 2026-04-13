import type { TradeInOrderListItem } from '@/api/types/tradeInOrder';
import {
  TRADE_IN_FILTER_BASE_STATUSES,
  getTradeInStatusMeta,
  isTradeInWaitingStatus,
  normalizeTradeInStatus,
} from '@/utils/tradeInWorkflow';

export const tradeInStatusBadgeValue = (status: string) => {
  return normalizeTradeInStatus(status);
};

export const tradeInStatusLabel = (status: string) => {
  return getTradeInStatusMeta(status).label;
};

export const buildTradeInStatusOptions = (items: TradeInOrderListItem[]) => {
  const dynamic = Array.from(new Set(items.map((item) => normalizeTradeInStatus(item.status)).filter(Boolean)));
  return Array.from(new Set([...TRADE_IN_FILTER_BASE_STATUSES, ...dynamic]));
};

export const getTradeInStats = (items: TradeInOrderListItem[], totalCount?: number) => {
  const waiting = items.filter((item) => {
    return isTradeInWaitingStatus(item.status);
  }).length;

  const completed = items.filter(
    (item) => normalizeTradeInStatus(item.status) === 'COMPLETED'
  ).length;

  return {
    total: totalCount ?? items.length,
    waiting,
    completed,
  };
};

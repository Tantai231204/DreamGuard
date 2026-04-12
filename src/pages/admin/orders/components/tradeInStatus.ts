import type { TradeInOrderListItem } from '@/api/types/tradeInOrder';

export const normalizeTradeInStatus = (status: string) => status.toUpperCase().replace(/\s+/g, '_');

export const tradeInStatusBadgeValue = (status: string) => {
  const normalized = normalizeTradeInStatus(status);

  if (normalized === 'WAITING_FOR_STAFF') return 'pending';
  if (normalized === 'PENDING') return 'pending';
  if (normalized === 'PROCESSING') return 'processing';
  if (normalized === 'COMPLETED') return 'completed';
  if (normalized === 'CANCELLED') return 'cancelled';

  return status;
};

export const tradeInStatusLabel = (status: string) => {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (text) => text.toUpperCase());
};

export const buildTradeInStatusOptions = (items: TradeInOrderListItem[]) => {
  const base = ['WAITING_FOR_STAFF', 'Pending', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
  const dynamic = Array.from(new Set(items.map((item) => item.status).filter(Boolean)));
  return Array.from(new Set([...base, ...dynamic]));
};

export const getTradeInStats = (items: TradeInOrderListItem[], totalCount?: number) => {
  const waiting = items.filter((item) => {
    const normalized = normalizeTradeInStatus(item.status);
    return normalized === 'WAITING_FOR_STAFF' || normalized === 'PENDING';
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

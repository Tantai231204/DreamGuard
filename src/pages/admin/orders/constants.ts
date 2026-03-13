export const OrderStatus = {
  Pending: 1,
  Confirmed: 2,
  Processing: 3,
  Shipping: 4,
  Delivered: 5,
  Completed: 6,
  Cancelled: 7,
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

// Map string state from API to the Enum
export const ORDER_STATUS_MAP: Record<string, OrderStatus> = {
  'Pending': OrderStatus.Pending,
  'Confirmed': OrderStatus.Confirmed,
  'Processing': OrderStatus.Processing,
  'Shipping': OrderStatus.Shipping,
  'Delivered': OrderStatus.Delivered,
  'Completed': OrderStatus.Completed,
  'Cancelled': OrderStatus.Cancelled,
  '1': OrderStatus.Pending,
  '2': OrderStatus.Confirmed,
  '3': OrderStatus.Processing,
  '4': OrderStatus.Shipping,
  '5': OrderStatus.Delivered,
  '6': OrderStatus.Completed,
  '7': OrderStatus.Cancelled
};

// Admin is only allowed to manually transition to these statuses before third party shipping takes over
export const ADMIN_ALLOWED_TRANSITION_STATUSES = ['Confirmed', 'Processing'];

export const ADMIN_ORDER_STATUS_THEME: Record<string, { label: string }> = {
  'Pending': { label: 'Pending' },
  'Confirmed': { label: 'Confirmed' },
  'Processing': { label: 'Processing' },
  'Shipping': { label: 'Shipping' },
  'Delivered': { label: 'Delivered' },
  'Completed': { label: 'Completed' },
  'Cancelled': { label: 'Cancelled' },

  '1': { label: 'Pending' },
  '2': { label: 'Confirmed' },
  '3': { label: 'Processing' },
  '4': { label: 'Shipping' },
  '5': { label: 'Delivered' },
  '6': { label: 'Completed' },
  '7': { label: 'Cancelled' }
};

export const OrderStatus = {
  Pending: 0,
  Confirmed: 1,
  Processing: 2,
  Shipping: 3,
  Delivered: 4,
  Completed: 5,
  Cancelled: 6,
  Returned: 7,
  Returning: 8,
  RefundedAndRestocked: 9,
  RefundedAndDamaged: 10,
  ExchangeRequested: 11,
  ShippingReplacement: 12,
  // Mapping Delivering/Arrived to existing numeric steps for UI flow
  Delivering: 3,
  Arrived: 4,
  Shipping_Replacement: 12,
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

// Map string state from API to the Enum
export const ORDER_STATUS_MAP: Record<string, OrderStatus> = {
  'Pending': OrderStatus.Pending,
  'Confirmed': OrderStatus.Confirmed,
  'Processing': OrderStatus.Processing,
  'Shipping': OrderStatus.Shipping,
  'Delivering': OrderStatus.Shipping, // Map label to numeric
  'Arrived': OrderStatus.Delivered,    // Map label to numeric
  'Delivered': OrderStatus.Delivered,
  'Completed': OrderStatus.Completed,
  'Cancelled': OrderStatus.Cancelled,
  'Returned': OrderStatus.Returned,
  'Returning': OrderStatus.Returning,
  'RefundedAndRestocked': OrderStatus.RefundedAndRestocked,
  'RefundedAndDamaged': OrderStatus.RefundedAndDamaged,
  'ExchangeRequested': OrderStatus.ExchangeRequested,
  'Shipping_Replacement': OrderStatus.ShippingReplacement,
  'ShippingReplacement': OrderStatus.ShippingReplacement,

  '0': OrderStatus.Pending,
  '1': OrderStatus.Confirmed,
  '2': OrderStatus.Processing,
  '3': OrderStatus.Shipping,
  '4': OrderStatus.Delivered,
  '5': OrderStatus.Completed,
  '6': OrderStatus.Cancelled,
  '7': OrderStatus.Returned,
  '8': OrderStatus.Returning,
  '9': OrderStatus.RefundedAndRestocked,
  '10': OrderStatus.RefundedAndDamaged,
  '11': OrderStatus.ExchangeRequested,
  '12': OrderStatus.ShippingReplacement,
};

// Admin allowed manual transitions
export const ADMIN_ALLOWED_TRANSITION_STATUSES = [
  'Processing',
  'Cancelled'
];

export const ADMIN_ORDER_STATUS_THEME: Record<string, { label: string }> = {
  '0': { label: 'Pending' },
  '1': { label: 'Confirmed' },
  '2': { label: 'Processing' },
  '3': { label: 'Delivering' },
  '4': { label: 'Delivered' },
  '5': { label: 'Completed' },
  '6': { label: 'Cancelled' },
  '7': { label: 'Returned' },
  '8': { label: 'Returning' },
  '9': { label: 'Refunded (Restocked)' },
  '10': { label: 'Refunded (Damaged)' },
  '11': { label: 'Exchange Requested' },
  '12': { label: 'Shipping Replacement' },

  'Pending': { label: 'Pending' },
  'Processing': { label: 'Processing' },
  'Shipping': { label: 'Delivering' },
  'Delivering': { label: 'Delivering' },
  'Arrived': { label: 'Arrived' },
  'Delivered': { label: 'Delivered' },
  'Returned': { label: 'Returned' },
  'Cancelled': { label: 'Cancelled' },
  'Completed': { label: 'Completed' },
  'Returning': { label: 'Returning' },
  'RefundedAndRestocked': { label: 'Refunded (Restocked)' },
  'RefundedAndDamaged': { label: 'Refunded (Damaged)' },
  'ExchangeRequested': { label: 'Exchange Requested' },
  'Shipping_Replacement': { label: 'Shipping Replacement' },
  'ShippingReplacement': { label: 'Shipping Replacement' }
};

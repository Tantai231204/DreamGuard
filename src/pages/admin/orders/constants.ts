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

export const ADMIN_ORDER_STATUS_THEME: Record<string, { label: string; className: string, dotClass: string }> = {
  'Pending': { label: 'Pending', className: 'bg-yellow-50 text-yellow-600 border-yellow-200', dotClass: 'bg-yellow-500' },
  'Confirmed': { label: 'Confirmed', className: 'bg-emerald-50 text-emerald-600 border-emerald-200', dotClass: 'bg-emerald-500' },
  'Processing': { label: 'Processing', className: 'bg-blue-50 text-blue-600 border-blue-200', dotClass: 'bg-blue-500' },
  'Shipping': { label: 'Shipping', className: 'bg-indigo-50 text-indigo-600 border-indigo-200', dotClass: 'bg-indigo-500' },
  'Delivered': { label: 'Delivered', className: 'bg-green-50 text-green-700 border-green-200', dotClass: 'bg-green-600' },
  'Completed': { label: 'Completed', className: 'bg-teal-50 text-teal-700 border-teal-200', dotClass: 'bg-teal-600' },
  'Cancelled': { label: 'Cancelled', className: 'bg-red-50 text-red-600 border-red-200', dotClass: 'bg-red-500' },

  '1': { label: 'Pending', className: 'bg-yellow-50 text-yellow-600 border-yellow-200', dotClass: 'bg-yellow-500' },
  '2': { label: 'Confirmed', className: 'bg-emerald-50 text-emerald-600 border-emerald-200', dotClass: 'bg-emerald-500' },
  '3': { label: 'Processing', className: 'bg-blue-50 text-blue-600 border-blue-200', dotClass: 'bg-blue-500' },
  '4': { label: 'Shipping', className: 'bg-indigo-50 text-indigo-600 border-indigo-200', dotClass: 'bg-indigo-500' },
  '5': { label: 'Delivered', className: 'bg-green-50 text-green-700 border-green-200', dotClass: 'bg-green-600' },
  '6': { label: 'Completed', className: 'bg-teal-50 text-teal-700 border-teal-200', dotClass: 'bg-teal-600' },
  '7': { label: 'Cancelled', className: 'bg-red-50 text-red-600 border-red-200', dotClass: 'bg-red-500' }
};

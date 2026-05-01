// ── CheckoutOrder Types ──
// Parent-child architecture: CheckoutOrder → ChildOrders (Normalize -N / Customize -C)

export type CheckoutOrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipping'
  | 'Completed'
  | 'Cancelled'
  | 'PartialRefunded'
  | 'Refunding'
  | 'Refunded';

export interface ChildOrderSummary {
  id: string;
  orderCode: string;       // e.g., DG-20260501-655A8A-N or DG-20260501-655A8A-C
  status: string;
  itemCount: number;
  totalAmount: number;
  createdAt: string;
  receiverName?: string;
  fullName?: string;
}

export interface CheckoutOrderResponse {
  id: string;
  checkoutOrderCode: string;
  status: CheckoutOrderStatus;
  totalAmount: number;
  refundingAmount: number;
  refundedAmount: number;
  createdAt: string;
  receiverName?: string;
  fullName?: string;
  customerName?: string;
  accountName?: string;
  userName?: string;
  user?: { fullName?: string; email?: string };
  customer?: { fullName?: string; phoneNumber?: string };
  childOrders: ChildOrderSummary[];
}

export interface PaginatedCheckoutOrders {
  items: CheckoutOrderResponse[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CheckoutOrderQueryParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: string | string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ── Helpers ──

export type ChildOrderType = 'normalize' | 'customize';

/**
 * Derives the child order type from its orderCode suffix.
 * -N → normalize, -C → customize
 */
export function getChildOrderType(orderCode: string): ChildOrderType {
  if (orderCode.endsWith('-C')) return 'customize';
  return 'normalize';
}

/**
 * Returns a user-friendly label for the child order type.
 */
export function getChildOrderLabel(orderCode: string): string {
  return getChildOrderType(orderCode) === 'customize'
    ? 'Custom Order'
    : 'Standard Order';
}

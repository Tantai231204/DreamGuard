export interface CreateOrderRequest {
    addressId: string;
    userVoucherId?: string | null;
    note?: string;
    paymentMethod: "VnPay" | "COD";
}

export type OrderStatus = number | string;

export const OrderStatusValue = {
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
    Shipping_Replacement: 12
} as const;

export interface OrderResponse {
    id: string;
    orderCode: string;
    status: OrderStatus | string;
    itemCount?: number;
    subTotal?: number;
    discountAmount?: number;
    totalAmount: number;
    paymentMethod?: string;
    paymentUrl?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface ProductCustomizeDetail {
    customizeTypeName: string;
    customizeContent: string;
    addOnPrice: number;
}

export interface OrderItem {
    id: string;
    productVariantId: string;
    comboId: string | null;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    image?: string;
    productCustomizeDetails?: ProductCustomizeDetail[];
    customizeHash?: string;
}

export interface TradeInEligibleOrderItem extends OrderItem {
    tradeInUsedAmount: number;
    productCustomizeDetails: ProductCustomizeDetail[];
    customizeHash: string;
    orderId?: string;
    purchaseDate?: string;
    createdAt?: string;
    tradeInValue?: number;
}

export interface OrderDetailResponse extends OrderResponse {
    receiverName: string;
    phoneNumber: string;
    street: string;
    ward: string;
    district: string;
    city: string;
    province: string;
    items: OrderItem[];
    totalAddonPrice?: number;
    voucherCode: string | null;
    voucherDiscountValue: number | null;
    note: string;
    updatedAt: string;
    shippingStaffName?: string;
    shippingStatus?: string;
    shippingStaffAvatarUrl?: string;
    paymentStatus?: string;
}

export interface OrderDashboardResponse {
    totalOrders: number;
    totalCompletedOrders: number;
    totalCancelledOrders: number;
    totalRefundedOrders: number;
    totalAmount: number;
    totalCODAmount: number;
    totalRefundAmount: number;
    totalVnPayAmount: number;
    fromDate: string;
    toDate: string;
}

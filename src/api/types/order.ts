export interface CreateOrderRequest {
    addressId: string;
    userVoucherId?: string | null;
    note?: string;
    paymentMethod: "VnPay" | "COD";
}

export type OrderStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | "Pending" | "Confirmed" | "Processing" | "Shipping" | "Delivered" | "Completed" | "Cancelled";

export const OrderStatusValue = {
    Pending: 0,
    Confirmed: 1,
    Processing: 2,
    Shipping: 3,
    Delivered: 4,
    Completed: 5,
    Cancelled: 6
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
}

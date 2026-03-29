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
    updatedAt?: string;
}

export interface OrderItem {
    id: string;
    productVariantId: string;
    comboId: string | null;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    image?: string; // Optional image URL if available later
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
    voucherCode: string | null;
    voucherDiscountValue: number | null;
    note: string;
    updatedAt: string;
}

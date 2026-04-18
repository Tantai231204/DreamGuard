export interface PaymentResponse {
    id: string;
    orderCode: string;
    paymentType: "Purchase" | "Refund" | string;
    status: "Pending" | "Paid" | "Failed" | "Refunded" | string;
    amount: number;
    paymentMethod: string;
    createdAt: string;
}

export interface PaymentDetailResponse extends PaymentResponse {
    pOrderId: string;
    tradeInOrderId: string | null;
    description: string;
    updatedAt: string;
    expiredAt?: string;
}

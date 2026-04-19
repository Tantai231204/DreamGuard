export interface PaymentResponse {
    id: string;
    orderCode: string;
    paymentType: "Purchase" | "Refund" | string;
    status: "Pending" | "Paid" | "Failed" | "Refunded" | string;
    description: string;
    amount: number;
    paymentMethod: string;
    createdAt: string;
    updatedAt?: string;
    evidenceUrl?: string | null;
}

export interface PaymentDetailResponse extends PaymentResponse {
    pOrderId: string;
    tradeInOrderId: string | null;
    expiredAt?: string;
}

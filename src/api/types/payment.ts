export interface PaymentResponse {
    id: string;
    orderCode: string;
    status: "Pending" | "Paid" | "Failed" | "Refunded" | string;
    amount: number;
    paymentMethod: string;
    createdAt: string;
}

export interface PaymentDetailResponse extends PaymentResponse {
    pOrderId: string;
    description: string;
    updatedAt: string;
}

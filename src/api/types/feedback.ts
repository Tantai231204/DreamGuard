export interface ProductFeedbackPayload {
    score: number;
    comment: string;
}

export interface ProductFeedbackResponse {
    id: string;
    score: number;
    comment: string;
    orderItemId: string;
    customerId: string;
    customerName?: string;
    customerAvatar?: string;
    status?: string;
    createdAt: string;
    updatedAt?: string;
}

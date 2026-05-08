export interface ShippingEvidence {
    evidenceId: string;
    evidenceUrl: string;
    evidenceType: string;
    createdAt: string;
}

export interface ShippingTask {
    shippingTaskId: string;
    staffId: string;
    orderId?: string | null;
    tradeInOrderId?: string | null;
    staffName: string;
    orderCode: string;
    status: string;
    shippingDate: string;
    completionDate?: string;
    staffNote?: string;
    damagedItems?: ProcessReturnedDamagedItem[];
    evidences?: ShippingEvidence[];
}

export interface CreateShippingTaskRequest {
    staffId: string;
    orderId?: string;
    tradeInOrderId?: string;
}

export interface ReassignShippingTaskRequest {
    newStaffId: string;
}

export interface ProcessReturnedDamagedItem {
    orderItemId: string;
    damagedQuantity: number;
}

export interface ProcessReturnedRequest {
    damageNote?: string;
    evidenceUrls?: string[];
    damagedItems: ProcessReturnedDamagedItem[];
    isRefund?: boolean;
    refundAmount?: number;
}

export interface ProcessExchangeRequest {
    newStaffId: string;
    exchangeNote?: string;
    evidenceUrls?: string[];
    damagedItems: ProcessReturnedDamagedItem[];
    isRefund?: boolean;
}

export interface ProcessReturnedForTradeInRequest {
    damageNote?: string;
    evidenceUrls?: string[];
    productVariantId?: string;
    isRefund?: boolean;
}

export interface ProcessExchangeForTradeInRequest {
    newStaffId: string;
    exchangeNote?: string;
    evidenceUrls?: string[];
    productVariantId?: string;
    isRefund?: boolean;
}

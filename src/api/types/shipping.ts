export interface ShippingEvidence {
    evidenceId: string;
    evidenceUrl: string;
    evidenceType: string;
    createdAt: string;
}

export interface ShippingTask {
    shippingTaskId: string;
    staffId: string;
    orderId: string;
    staffName: string;
    orderCode: string;
    status: string;
    shippingDate: string;
    completionDate?: string;
    staffNote?: string;
    evidences?: ShippingEvidence[];
}

export interface CreateShippingTaskRequest {
    staffId: string;
    orderId: string;
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
}

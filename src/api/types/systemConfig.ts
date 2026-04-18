export interface SystemConfig {
    configKey: string;
    configValue: string;
    description: string;
    createdAt: string;
    updatedAt: string | null;
}

export interface PaginatedSystemConfigResponse {
    items: SystemConfig[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface UpdateSystemConfigRequest {
    configValue: string;
    description: string;
}

export interface CreateSystemConfigRequest extends UpdateSystemConfigRequest {
    configKey: string;
}

import apiClient from "@/lib/api";

export interface AuditLogResponse {
  auditLogId: string;
  userId: string;
  actionType: string;
  message: string;
  createdAt: string;
  userRole: string;
  userName?: string;
  entityId?: string;
  entityName?: string;
}

export interface AuditLogListResponse {
  items: AuditLogResponse[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

const auditLogService = {
  getLogs: async (params: { 
    userId?: string; 
    action?: string; 
    entityName?: string; 
    entityId?: string;
    pageNumber?: number; 
    pageSize?: number;
    key?: string;
  }): Promise<AuditLogListResponse> => {
    const res = await apiClient.get("/AuditLogs", { params });
    return res.data?.data ?? res.data;
  }
};

export default auditLogService;

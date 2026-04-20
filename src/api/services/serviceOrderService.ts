import apiClient from '../../lib/api';
import type {
  ReOrderFailedServiceOrderResponse,
  ServiceOrderListResponse,
  ServiceOrderResponse,
  ServiceDashboardResponse,
  RescheduleServiceOrderRequest,
  ServiceEvidence,
} from '../types/serviceOrder';

function normalizeListPayload(payload: unknown): ServiceOrderListResponse {
  const data = payload as {
    items?: ServiceOrderResponse[];
    pageNumber?: number;
    pageSize?: number;
    totalPages?: number;
    totalCount?: number;
  };

  return {
    items: Array.isArray(data?.items) ? data.items : [],
    pageNumber: data?.pageNumber ?? 1,
    pageSize: data?.pageSize ?? (Array.isArray(data?.items) ? data.items.length : 0),
    totalPages: data?.totalPages ?? 1,
    totalCount: data?.totalCount ?? (Array.isArray(data?.items) ? data.items.length : 0),
  };
}

export interface AdminSearchServiceTaskItem {
  serviceTaskId: string;
  [key: string]: unknown; // Strict senior-level typing
}

export interface AdminSearchServiceTaskResponse {
  items: AdminSearchServiceTaskItem[];
  totalCount: number;
}

const serviceOrderService = {
  getServiceOrders: async (params?: { pageNumber?: number; pageSize?: number; customerId?: string }): Promise<ServiceOrderListResponse> => {
    const res = await apiClient.get('/ServiceOrders', { params });
    const payload = res.data?.data ?? res.data;

    if (Array.isArray(payload)) {
      return normalizeListPayload({ items: payload });
    }

    return normalizeListPayload(payload);
  },

  getServiceOrdersByCustomerId: async (
    customerId: string,
    params?: { pageNumber?: number; pageSize?: number }
  ): Promise<ServiceOrderListResponse> => {
    const result = await serviceOrderService.getServiceOrders({ ...params, customerId });

    // Keep fallback filtering in FE in case backend ignores the query param.
    const items = (result.items || []).filter((item) => item.customerId === customerId);

    return {
      ...result,
      items,
      totalCount: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / (result.pageSize || items.length || 1))),
    };
  },

  getServiceOrderById: async (id: string): Promise<ServiceOrderResponse> => {
    const res = await apiClient.get(`/ServiceOrders/${id}`);
    return (res.data?.data ?? res.data) as ServiceOrderResponse;
  },

  reOrderFailedServiceOrder: async (serviceOrderId: string): Promise<ReOrderFailedServiceOrderResponse> => {
    const res = await apiClient.post('/ServiceOrders/ReorderFailedService', null, {
      // Some BE environments use soId, some expose sold in Swagger/Hoppscotch.
      params: { soId: serviceOrderId, sold: serviceOrderId },
    });

    return (res.data?.data ?? res.data) as ReOrderFailedServiceOrderResponse;
  },

  managerCancelServiceOrder: async (serviceOrderId: string): Promise<void> => {
    await apiClient.patch(`/ServiceOrders/${serviceOrderId}/manager-cancel`);
  },

  cancelServiceOrder: async (serviceOrderId: string): Promise<void> => {
    await apiClient.patch(`/ServiceOrders/${serviceOrderId}/cancel`);
  },

  rejectServiceOrder: async (serviceOrderId: string): Promise<void> => {
    await apiClient.patch(`/ServiceOrders/${serviceOrderId}/reject`);
  },

  getServiceDashboard: async (params: { fromDate: string; toDate: string }): Promise<ServiceDashboardResponse> => {
    const res = await apiClient.get('/ServiceOrders/get-service-order-dash-board', { params });
    return (res.data?.data ?? res.data) as ServiceDashboardResponse;
  },

  rescheduleServiceOrder: async (data: RescheduleServiceOrderRequest): Promise<void> => {
    await apiClient.post('/ServiceOrders/reschedule-service-order', data);
  },

  searchServiceTasks: async (params: {
    soId?: string;
    sold?: string;
    staffId?: string;
    pageNumber?: number;
    pageSize?: number
  }): Promise<AdminSearchServiceTaskResponse> => {
    const res = await apiClient.get('/ServiceTasks/AdminSearchServiceTask', { params });
    return res.data?.data ?? res.data;
  },

  getEvidences: async (params: { serviceTaskId?: string; soId?: string; pageSize?: number }): Promise<ServiceEvidence[]> => {
    const res = await apiClient.get('/ServiceEvidences/AdminSearchSe', { params });
    const data = res.data?.data ?? res.data;
    return data?.items || data || [];
  },

  confirmServiceOrder: async (id: string): Promise<void> => {
    await apiClient.patch(`/ServiceOrders/${id}/confirm`);
  },

  updateTaskCompletedStatus: async (taskId: string): Promise<void> => {
    await apiClient.patch(`/ServiceTasks/${taskId}/updateCompletedStatus`);
  },

  completeServiceOrder: async (orderId: string): Promise<void> => {
    await apiClient.patch(`/ServiceOrders/${orderId}/completed`);
  },
};

export default serviceOrderService;

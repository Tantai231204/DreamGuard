import apiClient from "../../lib/api";
import type { CreateShippingTaskRequest, ReassignShippingTaskRequest, ShippingTask, ProcessReturnedRequest } from "../types/shipping";

const shippingService = {
    createTask: async (data: CreateShippingTaskRequest): Promise<ShippingTask> => {
        const res = await apiClient.post('/ShippingTasks', data);
        return res.data?.data ?? res.data;
    },

    reassignTask: async (taskId: string, data: ReassignShippingTaskRequest): Promise<ShippingTask> => {
        const res = await apiClient.put(`/ShippingTasks/${taskId}/reassign`, data);
        return res.data?.data ?? res.data;
    },

    getTasksByOrderId: async (orderId: string): Promise<ShippingTask[]> => {
        const res = await apiClient.get<Record<string, unknown>>(`/ShippingTasks?pageSize=100`);
        const responseData = (res.data?.data || res.data) as { items?: ShippingTask[] };
        const allTasks: ShippingTask[] = responseData?.items || (responseData as unknown as ShippingTask[]) || [];
        return allTasks.filter(task => task.orderId === orderId);
    },

    processReturned: async (taskId: string, data: Partial<ProcessReturnedRequest>): Promise<unknown> => {
        const res = await apiClient.post(`/ShippingTasks/${taskId}/process-returned`, data);
        return res.data?.data ?? res.data;
    },

    getTaskById: async (taskId: string): Promise<ShippingTask> => {
        const res = await apiClient.get(`/ShippingTasks/${taskId}`);
        return res.data?.data ?? res.data;
    }
};

export default shippingService;

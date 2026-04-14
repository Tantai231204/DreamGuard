import apiClient from "../../lib/api";
import type {
    CreateShippingTaskRequest,
    ReassignShippingTaskRequest,
    ShippingTask,
    ProcessReturnedRequest,
    ProcessExchangeRequest,
    ProcessReturnedForTradeInRequest,
    ProcessExchangeForTradeInRequest,
} from "../types/shipping";

const shippingService = {
    createTask: async (data: CreateShippingTaskRequest): Promise<ShippingTask> => {
        if (!data.orderId && !data.tradeInOrderId) {
            throw new Error('CreateShippingTaskRequest requires orderId or tradeInOrderId.');
        }
        const res = await apiClient.post('/ShippingTasks', data);
        return res.data?.data ?? res.data;
    },

    reassignTask: async (taskId: string, data: ReassignShippingTaskRequest): Promise<ShippingTask> => {
        const res = await apiClient.put(`/ShippingTasks/${taskId}/reassign`, data);
        return res.data?.data ?? res.data;
    },

    getTasksByOrderId: async (orderId: string): Promise<ShippingTask[]> => {
        const res = await apiClient.get(`/ShippingTasks?orderId=${orderId}&pageSize=100`);
        const responseData = (res.data?.data || res.data);
        return responseData?.items || (Array.isArray(responseData) ? responseData : []);
    },

    getTasksByTradeInOrderId: async (tradeInOrderId: string): Promise<ShippingTask[]> => {
        const res = await apiClient.get(`/ShippingTasks?tradeInOrderId=${tradeInOrderId}&pageSize=100`);
        const responseData = (res.data?.data || res.data);
        const items = responseData?.items || (Array.isArray(responseData) ? responseData : []);
        const normalizedTradeInOrderId = tradeInOrderId.trim().toLowerCase();
        return (items as ShippingTask[]).filter((task) =>
            typeof task.tradeInOrderId === 'string'
            && task.tradeInOrderId.trim().toLowerCase() === normalizedTradeInOrderId
        );
    },

    processReturned: async (taskId: string, data: Partial<ProcessReturnedRequest>): Promise<unknown> => {
        const res = await apiClient.post(`/ShippingTasks/${taskId}/process-returned`, data);
        return res.data?.data ?? res.data;
    },

    processExchange: async (taskId: string, data: ProcessExchangeRequest): Promise<unknown> => {
        const res = await apiClient.post(`/ShippingTasks/${taskId}/process-exchange`, data);
        return res.data?.data ?? res.data;
    },

    processReturnedForTradeIn: async (
        taskId: string,
        data: ProcessReturnedForTradeInRequest,
    ): Promise<unknown> => {
        const res = await apiClient.post(`/ShippingTasks/${taskId}/process-returned-for-tradeIn`, data);
        return res.data?.data ?? res.data;
    },

    processExchangeForTradeIn: async (
        taskId: string,
        data: ProcessExchangeForTradeInRequest,
    ): Promise<unknown> => {
        const res = await apiClient.post(`/ShippingTasks/${taskId}/process-exchange-for-tradeIn`, data);
        return res.data?.data ?? res.data;
    },

    getTaskById: async (taskId: string): Promise<ShippingTask> => {
        const res = await apiClient.get(`/ShippingTasks/${taskId}`);
        return res.data?.data ?? res.data;
    }
};

export default shippingService;

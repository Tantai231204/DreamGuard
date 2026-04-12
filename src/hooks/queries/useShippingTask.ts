import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import shippingService from "@/api/services/shippingService";
import type {
    CreateShippingTaskRequest,
    ReassignShippingTaskRequest,
    ProcessReturnedRequest,
    ProcessExchangeRequest,
} from "@/api/types/shipping";
import { orderKeys } from "./useOrder";

export const shippingKeys = {
    all: ["shippingTasks"] as const,
    byOrder: (orderId: string) => [...shippingKeys.all, "order", orderId] as const,
};

export const useShippingTasksByOrder = (orderId: string) => {
    return useQuery({
        queryKey: shippingKeys.byOrder(orderId),
        queryFn: () => shippingService.getTasksByOrderId(orderId),
        enabled: !!orderId,
    });
};

export const useShippingTaskDetail = (taskId: string) => {
    return useQuery({
        queryKey: [...shippingKeys.all, "detail", taskId],
        queryFn: () => shippingService.getTaskById(taskId),
        enabled: !!taskId,
    });
};

export const useCreateShippingTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateShippingTaskRequest) => shippingService.createTask(data),
        onSuccess: (_, { orderId }) => {
            queryClient.invalidateQueries({ queryKey: shippingKeys.byOrder(orderId) });
        },
    });
};

export const useReassignShippingTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, data }: { taskId: string; data: ReassignShippingTaskRequest; orderId: string }) => 
            shippingService.reassignTask(taskId, data),
        onSuccess: (_, { orderId }) => {
            queryClient.invalidateQueries({ queryKey: shippingKeys.byOrder(orderId) });
        },
    });
};

export const useProcessReturnedShippingTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, data }: { taskId: string; data: Partial<ProcessReturnedRequest>; orderId: string }) => 
            shippingService.processReturned(taskId, data),
        onSuccess: (_, { orderId }) => {
            queryClient.invalidateQueries({ queryKey: shippingKeys.byOrder(orderId) });
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
        },
    });
};

export const useProcessExchangeShippingTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, data }: { taskId: string; data: ProcessExchangeRequest; orderId: string }) =>
            shippingService.processExchange(taskId, data),
        onSuccess: (_, { orderId }) => {
            queryClient.invalidateQueries({ queryKey: shippingKeys.byOrder(orderId) });
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
        },
    });
};

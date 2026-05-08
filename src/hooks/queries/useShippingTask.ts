import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import shippingService from "@/api/services/shippingService";
import type {
    CreateShippingTaskRequest,
    ReassignShippingTaskRequest,
    ProcessReturnedRequest,
    ProcessExchangeRequest,
    ProcessReturnedForTradeInRequest,
    ProcessExchangeForTradeInRequest,
} from "@/api/types/shipping";
import { orderKeys } from "./useOrder";
import { tradeInOrderKeys } from "./useTradeInOrder";
import { checkoutOrderKeys } from "./useCheckoutOrder";

export const shippingKeys = {
    all: ["shippingTasks"] as const,
    byOrder: (orderId: string) => [...shippingKeys.all, "order", orderId] as const,
    byTradeInOrder: (tradeInOrderId: string) => [...shippingKeys.all, "trade-in-order", tradeInOrderId] as const,
};

export const useShippingTasksByOrder = (orderId: string) => {
    return useQuery({
        queryKey: shippingKeys.byOrder(orderId),
        queryFn: () => shippingService.getTasksByOrderId(orderId),
        enabled: !!orderId,
    });
};

export const useShippingTasksByTradeInOrder = (tradeInOrderId: string) => {
    return useQuery({
        queryKey: shippingKeys.byTradeInOrder(tradeInOrderId),
        queryFn: () => shippingService.getTasksByTradeInOrderId(tradeInOrderId),
        enabled: !!tradeInOrderId,
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
        onSuccess: (_, payload) => {
            if (payload.orderId) {
                queryClient.invalidateQueries({ queryKey: shippingKeys.byOrder(payload.orderId) });
                queryClient.invalidateQueries({ queryKey: orderKeys.detail(payload.orderId) });
                queryClient.invalidateQueries({ queryKey: checkoutOrderKeys.all });
            }
            if (payload.tradeInOrderId) {
                queryClient.invalidateQueries({ queryKey: shippingKeys.byTradeInOrder(payload.tradeInOrderId) });
                queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.detail(payload.tradeInOrderId) });
            }
        },
    });
};

export const useReassignShippingTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ taskId, data }: { taskId: string; data: ReassignShippingTaskRequest; orderId?: string; tradeInOrderId?: string }) =>
            shippingService.reassignTask(taskId, data),
        onSuccess: (_, payload) => {
            if (payload.orderId) {
                queryClient.invalidateQueries({ queryKey: shippingKeys.byOrder(payload.orderId) });
                queryClient.invalidateQueries({ queryKey: orderKeys.detail(payload.orderId) });
                queryClient.invalidateQueries({ queryKey: checkoutOrderKeys.all });
            }
            if (payload.tradeInOrderId) {
                queryClient.invalidateQueries({ queryKey: shippingKeys.byTradeInOrder(payload.tradeInOrderId) });
                queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.detail(payload.tradeInOrderId) });
            }
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
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            queryClient.invalidateQueries({ queryKey: ["checkoutOrders"] });
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
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            queryClient.invalidateQueries({ queryKey: ["checkoutOrders"] });
        },
    });
};

export const useProcessReturnedTradeInShippingTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            taskId,
            data,
        }: {
            taskId: string;
            data: ProcessReturnedForTradeInRequest;
            tradeInOrderId: string;
        }) => shippingService.processReturnedForTradeIn(taskId, data),
        onSuccess: (_, { tradeInOrderId }) => {
            queryClient.invalidateQueries({ queryKey: shippingKeys.byTradeInOrder(tradeInOrderId) });
            queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.detail(tradeInOrderId) });
            queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.customerDetail(tradeInOrderId) });
            queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.waitingLists() });
            queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.customerLists() });
        },
    });
};

export const useProcessExchangeTradeInShippingTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            taskId,
            data,
        }: {
            taskId: string;
            data: ProcessExchangeForTradeInRequest;
            tradeInOrderId: string;
        }) => shippingService.processExchangeForTradeIn(taskId, data),
        onSuccess: (_, { tradeInOrderId }) => {
            queryClient.invalidateQueries({ queryKey: shippingKeys.byTradeInOrder(tradeInOrderId) });
            queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.detail(tradeInOrderId) });
            queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.customerDetail(tradeInOrderId) });
            queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.waitingLists() });
            queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.customerLists() });
        },
    });
};

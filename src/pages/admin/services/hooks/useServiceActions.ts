import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import serviceOrderService from '@/api/services/serviceOrderService';
import type { RescheduleServiceOrderRequest } from '@/api/types/serviceOrder';

export const useServiceActions = () => {
    const queryClient = useQueryClient();

    const confirmMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.patch(`/ServiceOrders/${id}/confirm`);
        },
        onSuccess: (_, id) => {
            toast.success(`Confirmed booking ${id}`);
            queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
            queryClient.invalidateQueries({ queryKey: ['serviceOrder', 'detail', id] });
            queryClient.invalidateQueries({ queryKey: ['serviceTask', 'detail', id] });
        },
    });

    const cancelMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string; reason?: string }) => {
            const normalizedStatus = status.toLowerCase();
            if (normalizedStatus === 'processing') {
                await serviceOrderService.managerForceCancel(id);
            } else {
                await serviceOrderService.managerCancelConfirm(id);
            }
        },
        onSuccess: (_, { id }) => {
            toast.success(`Cancellation logic applied to booking ${id}`);
            queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
            queryClient.invalidateQueries({ queryKey: ['serviceOrder', 'detail', id] });
            queryClient.invalidateQueries({ queryKey: ['serviceTask', 'detail', id] });
        },
    });

    const rescheduleMutation = useMutation({
        mutationFn: async (data: RescheduleServiceOrderRequest) => {
            await serviceOrderService.rescheduleServiceOrder(data);
        },
        onSuccess: (_, { serviceOrderId }) => {
            toast.success(`Order rescheduled successfully`);
            queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
            queryClient.invalidateQueries({ queryKey: ['serviceOrder', 'detail', serviceOrderId] });
            queryClient.invalidateQueries({ queryKey: ['serviceTask', 'detail', serviceOrderId] });
        },
    });

    const completeMutation = useMutation({
        mutationFn: async ({ taskId }: { taskId: string; orderId: string }) => {
            await api.patch(`/ServiceTasks/${taskId}/updateCompletedStatus`);
        },
        onSuccess: (_, { orderId }) => {
            toast.success(`Service task completed successfully`);
            queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
            queryClient.invalidateQueries({ queryKey: ['serviceOrder', 'detail', orderId] });
            queryClient.invalidateQueries({ queryKey: ['serviceTask', 'detail', orderId] });
            queryClient.invalidateQueries({ queryKey: ['serviceEvidences', orderId] });
        },
    });

    return useMemo(() => ({
        confirmBooking: confirmMutation.mutate,
        isConfirming: confirmMutation.isPending,
        cancelBooking: cancelMutation.mutate,
        isCancelling: cancelMutation.isPending,
        completeBooking: completeMutation.mutate,
        isCompleting: completeMutation.isPending,
        rescheduleBooking: rescheduleMutation.mutate,
        isRescheduling: rescheduleMutation.isPending,
    }), [
        confirmMutation.mutate,
        confirmMutation.isPending,
        cancelMutation.mutate,
        cancelMutation.isPending,
        completeMutation.mutate,
        completeMutation.isPending,
        rescheduleMutation.mutate,
        rescheduleMutation.isPending,
    ]);
};

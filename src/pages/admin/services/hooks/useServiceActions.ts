import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import serviceOrderService from '@/api/services/serviceOrderService';
import paymentService from '@/api/services/paymentService';
import type { RescheduleServiceOrderRequest } from '@/api/types/serviceOrder';

export const useServiceActions = () => {
    const queryClient = useQueryClient();

    const confirmMutation = useMutation({
        mutationFn: (id: string) => serviceOrderService.confirmServiceOrder(id),
        onSuccess: (_, id) => {
            toast.success(`Confirmed booking ${id}`);
            queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
            queryClient.invalidateQueries({ queryKey: ['serviceOrder', 'detail', id] });
            queryClient.invalidateQueries({ queryKey: ['serviceTask', 'detail', id] });
        },
    });

    const cancelMutation = useMutation({
        mutationFn: async ({ id, status, reason, refundAmount }: {
            id: string;
            status: string;
            reason: string;
            refundAmount?: number;
        }) => {
            const normalizedStatus = status.toLowerCase();

            // 1. Perform cancellation/rejection
            // Branch strictly follows: Pending uses standard cancel to ensure refunding status.
            // Statuses like Confirmed (with tasks) must use manager-cancel.
            if (normalizedStatus === 'pending') {
                await serviceOrderService.cancelServiceOrder(id);
            } else {
                await serviceOrderService.managerCancelServiceOrder(id);
            }

            // 2. Integrated Refund Initialization
            if (refundAmount && refundAmount > 0) {
                await paymentService.createAdminRefund({
                    soId: id,
                    reason: reason || "Service Cancellation",
                    amount: refundAmount
                });
            }
        },
        onSuccess: (_, { id }) => {
            toast.success(`Action applied to booking ${id}`);
            queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
            queryClient.invalidateQueries({ queryKey: ['serviceOrder', 'detail', id] });
            queryClient.invalidateQueries({ queryKey: ['serviceTask', 'detail', id] });
            queryClient.invalidateQueries({ queryKey: ['payments'] });
        },
    });

    const createRefundMutation = useMutation({
        mutationFn: (payload: { soId: string; reason: string; amount: number }) =>
            paymentService.createAdminRefund(payload),
        onSuccess: (_, { soId }) => {
            toast.success("Refund request created successfully");
            queryClient.invalidateQueries({ queryKey: ['serviceOrder', 'detail', soId] });
            queryClient.invalidateQueries({ queryKey: ['payments'] });
        }
    });

    const updateRefundStatusMutation = useMutation({
        mutationFn: ({ id, status, evidence, evidenceUrl }: { id: string; status: string; evidence?: File, evidenceUrl?: string }) =>
            paymentService.updateRefundStatus(id, status, evidence, evidenceUrl),
        onSuccess: () => {
            toast.success("Refund status updated successfully");
            // Strategic Refetch Flow: Invalidate list and specific details
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['serviceOrder', 'detail'] });
            queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
        }
    });

    const updatePaymentStatusMutation = useMutation({
        mutationFn: ({ id, status, evidenceUrl }: { id: string; status: string; evidenceUrl?: string }) =>
            paymentService.updatePaymentStatus(id, status, evidenceUrl),
        onSuccess: () => {
            toast.success("Payment status updated successfully");
            // Strategic Refetch Flow: Invalidate list and specific details
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['serviceOrder', 'detail'] });
            queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
        }
    });

    const rescheduleMutation = useMutation({
        mutationFn: async (data: RescheduleServiceOrderRequest) => {
            await serviceOrderService.rescheduleServiceOrder(data);
        },
        onSuccess: (_, { serviceOrderId }) => {
            toast.success(`Order rescheduled successfully. Tasks can continue without re-confirmation.`);
            queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
            queryClient.invalidateQueries({ queryKey: ['serviceOrder', 'detail', serviceOrderId] });
            queryClient.invalidateQueries({ queryKey: ['serviceTask', 'detail', serviceOrderId] });
            queryClient.invalidateQueries({ queryKey: ['serviceTasks', 'list', serviceOrderId] });
        },
    });

    const completeMutation = useMutation({
        mutationFn: async ({ taskId, orderId }: { taskId: string; orderId: string }) => {
            await serviceOrderService.updateTaskCompletedStatus(taskId);
            await serviceOrderService.completeServiceOrder(orderId);
        },
        onSuccess: (_, { orderId }) => {
            toast.success(`Service task and order completed successfully`);
            queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
            queryClient.invalidateQueries({ queryKey: ['serviceOrder', 'detail', orderId] });
            queryClient.invalidateQueries({ queryKey: ['serviceTask', 'detail', orderId] });
            queryClient.invalidateQueries({ queryKey: ['serviceTasks', 'list', orderId] });
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
        createRefund: createRefundMutation.mutate,
        isCreatingRefund: createRefundMutation.isPending,
        updateRefundStatus: updateRefundStatusMutation.mutate,
        isUpdatingRefund: updateRefundStatusMutation.isPending,
        updatePaymentStatus: updatePaymentStatusMutation.mutate,
        isUpdatingPaymentStatus: updatePaymentStatusMutation.isPending,
    }), [
        confirmMutation.mutate,
        confirmMutation.isPending,
        cancelMutation.mutate,
        cancelMutation.isPending,
        completeMutation.mutate,
        completeMutation.isPending,
        rescheduleMutation.mutate,
        rescheduleMutation.isPending,
        createRefundMutation.mutate,
        createRefundMutation.isPending,
        updateRefundStatusMutation.mutate,
        updateRefundStatusMutation.isPending,
        updatePaymentStatusMutation.mutate,
        updatePaymentStatusMutation.isPending,
    ]);
};

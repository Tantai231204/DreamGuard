import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';

export const useServiceActions = () => {
    const queryClient = useQueryClient();

    const confirmMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.patch(`/ServiceOrders/${id}/confirm`);
        },
        onSuccess: (_, id) => {
            toast.success(`Confirmed booking ${id}`);
            queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
            queryClient.invalidateQueries({ queryKey: ['serviceOrder', id] });
        },
        onError: () => toast.error('Failed to confirm booking'),
    });

    const cancelMutation = useMutation({
        mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
            let endpoint = '';
            const normalizedStatus = status.toLowerCase();
            switch (normalizedStatus) {
                case 'pending':
                    endpoint = `/ServiceOrders/${id}/reject`;
                    break;
                case 'confirmed':
                    endpoint = `/ServiceOrders/${id}/manager-cancel`;
                    break;
                case 'processing':
                    endpoint = `/ServiceOrders/${id}/manager-force-cancel`;
                    break;
                default:
                    throw new Error('Invalid status for cancellation');
            }
            await api.patch(endpoint, { cancellationReason: reason });
        },
        onSuccess: (_, { id }) => {
            toast.success(`Action applied successfully to booking ${id}`);
            queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
            queryClient.invalidateQueries({ queryKey: ['serviceOrder', id] });
        },
        onError: () => toast.error('Failed to cancel/reject booking'),
    });

    const completeMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.patch(`/ServiceOrders/${id}/complete`);
        },
        onSuccess: (_, id) => {
            toast.success(`Service booking ${id} completed successfully`);
            queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
            queryClient.invalidateQueries({ queryKey: ['serviceOrder', id] });
        },
        onError: () => toast.error('Failed to complete service booking'),
    });

    return {
        confirmBooking: confirmMutation.mutate,
        isConfirming: confirmMutation.isPending,
        cancelBooking: cancelMutation.mutate,
        isCancelling: cancelMutation.isPending,
        completeBooking: completeMutation.mutate,
        isCompleting: completeMutation.isPending,
    };
};

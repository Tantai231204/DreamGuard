import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/lib/api';
import type {
  ServiceBooking,
  PaginatedAdminSearchOrderServiceResponse
} from '../types';
import { calculateServiceStats } from '../data';
import { mapApiItemToServiceOrder } from '../utils/mappers';

export const useServiceManagement = () => {
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // For the calendar, we fetch a large batch to show the month view
  const { data: bookingData, isLoading } = useQuery({
    queryKey: ['serviceOrders', 'calendar'],
    queryFn: async () => {
      const res = await api.post('/ServiceOrders/AdminSearchOrderService', {}, {
        params: {
          pageNumber: 1,
          pageSize: 200, // Large enough for multiple months or busy months
        }
      });
      const data = (res.data?.data ?? res.data) as PaginatedAdminSearchOrderServiceResponse;

      if (data?.items) {
        data.items.forEach(item => {
          const mapped = mapApiItemToServiceOrder(item);
          queryClient.setQueryData(['serviceOrder', item.soId], mapped);
        });
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const parsedBookings = useMemo<ServiceBooking[]>(() => {
    return (bookingData?.items || []).map(mapApiItemToServiceOrder);
  }, [bookingData]);

  const stats = useMemo(() => calculateServiceStats(parsedBookings), [parsedBookings]);

  const confirmMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/ServiceOrders/${id}/confirm`);
    },
    onSuccess: () => {
      toast.success(`Booking confirmed successfully`);
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
    },
    onError: () => toast.error('Failed to confirm booking'),
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      let endpoint = '';
      switch (status) {
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
      await api.patch(endpoint);
    },
    onSuccess: () => {
      toast.success(`Action applied successfully`);
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
    },
    onError: (err: unknown) => {
      let msg = 'Operation failed';
      if (err && typeof err === 'object' && 'response' in err) {
        const responseData = (err as { response?: { data?: { message?: string } } }).response?.data;
        msg = responseData?.message || msg;
      }
      toast.error(msg);
    },
  });

  const handleViewBooking = useCallback((id: string) => {
    navigate(`/admin/services/${id}`);
  }, [navigate]);

  const handleConfirmBooking = useCallback((id: string) => {
    confirmMutation.mutate(id);
  }, [confirmMutation]);

  const handleCancelBooking = useCallback((id: string, status: string) => {
    cancelMutation.mutate({ id, status });
  }, [cancelMutation]);

  const handleAssignTechnician = useCallback((id: string) => {
    setSelectedOrderId(id);
    setIsAssignOpen(true);
  }, []);

  const handleCreateNew = useCallback(() => {
    toast.info('Feature coming soon: New booking creation');
  }, []);

  return {
    stats,
    filteredBookings: parsedBookings,
    isLoading,
    isAssignOpen,
    setIsAssignOpen,
    selectedOrderId,
    handleViewBooking,
    handleConfirmBooking,
    handleCancelBooking,
    handleAssignTechnician,
    handleCreateNew,
  };
};

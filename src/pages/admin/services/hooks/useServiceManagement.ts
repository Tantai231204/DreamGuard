import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/lib/api';
import serviceOrderService from '@/api/services/serviceOrderService';
import type {
  ServiceBooking,
  PaginatedAdminSearchOrderServiceResponse
} from '../types';
import { calculateServiceStats } from '../data';
import { mapApiItemToServiceOrder } from '../utils/mappers';

export const useServiceManagement = () => {
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelOrderInfo, setCancelOrderInfo] = useState<{ id: string; status: string; orderCode?: string }>({
    id: '',
    status: '',
  });
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

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmOrderInfo, setConfirmOrderInfo] = useState<{ id: string; orderCode?: string }>({ id: '' });

  const confirmMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/ServiceOrders/${id}/confirm`);
    },
    onSuccess: () => {
      toast.success(`Booking confirmed successfully`);
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      setIsConfirmOpen(false);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const normalizedStatus = status.toLowerCase();
      // 1. Perform cancellation/rejection based on state
      if (normalizedStatus === 'pending' || normalizedStatus === 'waiting' || normalizedStatus === 'unconfirmed') {
        await serviceOrderService.rejectServiceOrder(id);
      } else {
        await serviceOrderService.cancelServiceOrder(id);
      }
    },
    onSuccess: () => {
      toast.success(`Action applied successfully`);
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] }); // Important for UI sync
      setIsCancelOpen(false);
    },
  });

  const handleViewBooking = useCallback((id: string) => {
    navigate(`/admin/services/${id}`);
  }, [navigate]);

  const handleConfirmBookingTrigger = useCallback((id: string) => {
    const booking = parsedBookings.find(b => b.id === id);
    setConfirmOrderInfo({ id, orderCode: booking?.orderCode });
    setIsConfirmOpen(true);
  }, [parsedBookings]);

  const handleConfirmBookingConfirm = useCallback(() => {
    confirmMutation.mutate(confirmOrderInfo.id);
  }, [confirmMutation, confirmOrderInfo]);

  const handleCancelBookingTrigger = useCallback((id: string, status: string) => {
    const booking = parsedBookings.find(b => b.id === id);
    setCancelOrderInfo({ id, status, orderCode: booking?.orderCode });
    setIsCancelOpen(true);
  }, [parsedBookings]);

  const handleCancelBookingConfirm = useCallback((reason: string) => {
    if (reason) {
      console.log(`Cancelling booking ${cancelOrderInfo.id} with reason: ${reason}`);
    }
    cancelMutation.mutate({ id: cancelOrderInfo.id, status: cancelOrderInfo.status });
  }, [cancelMutation, cancelOrderInfo]);

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
    isCancelOpen,
    setIsCancelOpen,
    isConfirmOpen,
    setIsConfirmOpen,
    confirmOrderInfo,
    cancelOrderInfo,
    selectedOrderId,
    handleViewBooking,
    handleConfirmBooking: handleConfirmBookingTrigger,
    handleConfirmBookingConfirm,
    handleCancelBookingTrigger,
    handleCancelBookingConfirm,
    handleAssignTechnician,
    handleCreateNew,
    isPendingCancel: cancelMutation.isPending,
    isPendingConfirm: confirmMutation.isPending,
  };
};

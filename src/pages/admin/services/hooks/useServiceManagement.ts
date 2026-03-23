import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/lib/api';
import type {
  ServiceStatus,
  ServiceType,
  ServiceBooking,
  PaginatedAdminSearchOrderServiceResponse
} from '../types';
import { calculateServiceStats } from '../data';
import { mapApiItemToServiceOrder } from '../utils/mappers';

export const useServiceManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | 'all'>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<ServiceType | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: bookingData, isLoading } = useQuery({
    queryKey: ['serviceOrders', searchQuery, statusFilter, dateFilter, currentPage],
    queryFn: async () => {
      const res = await api.post('/ServiceOrders/AdminSearchOrderService', {}, {
        params: {
          pageNumber: currentPage,
          pageSize: pageSize,
          orderCode: searchQuery || undefined,
          status: statusFilter !== 'all' ? (statusFilter === 'pending' ? 'Pending' : statusFilter) : undefined
        }
      });
      const data = (res.data?.data ?? res.data) as PaginatedAdminSearchOrderServiceResponse;
      
      // Senior Performance Optimization: 
      // Populate individual detail caches immediately to make navigation instant
      if (data?.items) {
        data.items.forEach(item => {
          const mapped = mapApiItemToServiceOrder(item);
          queryClient.setQueryData(['serviceOrder', item.soId], mapped);
        });
      }
      
      return data;
    }
  });

  const parsedBookings = useMemo<ServiceBooking[]>(() => {
    return (bookingData?.items || []).map(mapApiItemToServiceOrder);
  }, [bookingData]);

  const stats = useMemo(() => calculateServiceStats(parsedBookings), [parsedBookings]);

  const filteredBookings = useMemo(() => {
    return parsedBookings.filter((booking) => {
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        const matchesSearch =
          booking.orderCode?.toLowerCase().includes(search) ||
          booking.id.toLowerCase().includes(search) ||
          booking.customerName.toLowerCase().includes(search) ||
          booking.customerPhone.includes(search);
        if (!matchesSearch) return false;
      }

      if (statusFilter !== 'all' && booking.status !== statusFilter) return false;
      if (serviceTypeFilter !== 'all' && booking.serviceType !== serviceTypeFilter) return false;
      if (dateFilter && booking.scheduledDate !== dateFilter) return false;

      return true;
    });
  }, [searchQuery, statusFilter, serviceTypeFilter, dateFilter, parsedBookings]);

  const confirmMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/ServiceOrders/${id}/confirm`);
    },
    onSuccess: (_, id) => {
      toast.success(`Confirmed booking ${id}`);
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
    },
    onError: () => toast.error('Failed to confirm booking'),
  });

  const cancelMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      let endpoint = '';
      switch (status) {
        case 'pending':
          endpoint = `/ServiceOrders/${id}/reject`; // Reject
          break;
        case 'confirmed':
          endpoint = `/ServiceOrders/${id}/manager-cancel`; // ManagerCancel
          break;
        case 'processing':
          endpoint = `/ServiceOrders/${id}/manager-force-cancel`; // ManagerForceCancel
          break;
        default:
          throw new Error('Invalid status for cancellation');
      }
      await api.patch(endpoint);
    },
    onSuccess: (_, { id }) => {
      toast.success(`Action applied successfully to booking ${id}`);
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
    },
    onError: () => toast.error('Failed to cancel/reject booking'),
  });

  const handleViewBooking = useCallback((id: string) => {
    navigate(`/admin/services/${id}`);
  }, [navigate]);

  const handleEditBooking = useCallback((id: string) => {
    toast.info(`Edit booking ${id}`);
  }, []);

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
    toast.info('Creating new service booking');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    serviceTypeFilter,
    setServiceTypeFilter,
    dateFilter,
    setDateFilter,
    currentPage,
    setCurrentPage,
    totalPages: bookingData?.totalPages || 1,
    viewMode,
    setViewMode,
    isAssignOpen,
    setIsAssignOpen,
    isDetailOpen,
    setIsDetailOpen,
    selectedOrderId,
    stats,
    filteredBookings,
    isLoading,
    handleViewBooking,
    handleEditBooking,
    handleConfirmBooking,
    handleCancelBooking,
    handleAssignTechnician,
    handleCreateNew,
  };
};

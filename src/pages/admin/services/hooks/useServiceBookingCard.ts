import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ServiceBooking } from '../types';
import { statusConfig, serviceTypeConfig, paymentStatusConfig } from '../constants';


interface UseServiceBookingCardProps {
  booking: ServiceBooking;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string, status: string) => void;
  onAssignTechnician?: (id: string) => void;
}

import { mapApiDetailToOrder, mapApiTaskToServiceTask } from '../utils/mappers';
import serviceOrderService from '@/api/services/serviceOrderService';

export const useServiceBookingCard = ({
  booking,
  onView,
  onEdit,
  onConfirm,
  onCancel,
  onAssignTechnician,
}: UseServiceBookingCardProps) => {
  const statusCfg = useMemo(() => statusConfig[booking.status], [booking.status]);
  const serviceTypeCfg = useMemo(() => serviceTypeConfig[booking.serviceType], [booking.serviceType]);
  const paymentCfg = useMemo(() => paymentStatusConfig[booking.paymentStatus], [booking.paymentStatus]);

  const ServiceIcon = serviceTypeCfg.icon;
  const StatusIcon = statusCfg.icon;

  const { data: detailData, isFetching: isDetailFetching } = useQuery({
    queryKey: ['serviceOrder', booking.id],
    queryFn: () => api.get(`/ServiceOrders/${booking.id}`).then(mapApiDetailToOrder),
    enabled: !!booking.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
  });

  const { data: taskData } = useQuery({
    queryKey: ['serviceTask', 'detail', booking.id],
    queryFn: async () => {
      const res = await serviceOrderService.searchServiceTasks({
        soId: booking.id,
        sold: booking.id,
        pageSize: 1,
        pageNumber: 1
      });
      const items = res?.items || [];
      return mapApiTaskToServiceTask(items[0]);
    },
    enabled: !!booking.id && (booking.status === 'confirmed' || booking.status === 'processing' || booking.status === 'completed' || booking.status === 'rescheduled'),
    staleTime: 30000,
  });

  const processedDetail = detailData || booking; // Use full detail if available, fallback to list item
  const orderItems = processedDetail?.items || [];
  
  // Authority Principle: taskQuery.data is more authoritative for current state
  const task = taskData || processedDetail.serviceTask;
  const staff = processedDetail.staff || processedDetail.technician;

  const technician = useMemo(() => {
    if (!staff) return null;

    return {
      id: staff.staffId,
      name: staff.fullName,
      phone: staff.phoneNumber || "",
      avatar: staff.avatarUrl,
      rating: staff.averageRating ?? 5,
      completedJobs: staff.totalRating ?? 0,
    };
  }, [staff]);

  const fullAddress = processedDetail.address.street;

  const handleView = useCallback(() => onView?.(booking.id), [onView, booking.id]);
  const handleEdit = useCallback(() => onEdit?.(booking.id), [onEdit, booking.id]);
  const handleConfirm = useCallback(() => onConfirm?.(booking.id), [onConfirm, booking.id]);
  const handleCancel = useCallback(() => onCancel?.(booking.id, booking.status), [onCancel, booking.id, booking.status]);
  const handleAssign = useCallback(() => onAssignTechnician?.(booking.id), [onAssignTechnician, booking.id]);

  return {
    statusCfg,
    serviceTypeCfg,
    paymentCfg,
    ServiceIcon,
    StatusIcon,
    orderItems,
    fullAddress,
    handleView,
    handleEdit,
    handleConfirm,
    handleCancel,
    handleAssign,
    technician,
    task,
    isDetailFetching,
  };
};

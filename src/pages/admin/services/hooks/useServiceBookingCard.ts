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
  onCancel?: (id: string) => void;
  onAssignTechnician?: (id: string) => void;
}

import { mapApiDetailToOrder } from '../utils/mappers';

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

  const processedDetail = detailData || booking; // Use full detail if available, fallback to list item
  const orderItems = processedDetail?.items || [];
  
  const task = processedDetail.serviceTask;
  const staff = processedDetail.staff || processedDetail.technician;

  const technician = useMemo(() => {
    if (!staff) return null;

    return {
      id: staff.staffId,
      name: staff.fullName,
      phone: staff.phoneNumber || "",
      avatar: staff.avatarUrl,
      rating: 5, // Default for now
      completedJobs: 0,
    };
  }, [staff]);

  const fullAddress = processedDetail.address.street;

  const handleView = useCallback(() => onView?.(booking.id), [onView, booking.id]);
  const handleEdit = useCallback(() => onEdit?.(booking.id), [onEdit, booking.id]);
  const handleConfirm = useCallback(() => onConfirm?.(booking.id), [onConfirm, booking.id]);
  const handleCancel = useCallback(() => onCancel?.(booking.id), [onCancel, booking.id]);
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

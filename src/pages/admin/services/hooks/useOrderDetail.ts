import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueries } from '@tanstack/react-query';
import api from '@/lib/api';
import { statusConfig } from '../constants';
import { mapApiDetailToOrder, mapApiTaskToServiceTask } from '../utils/mappers';
import serviceOrderService from '@/api/services/serviceOrderService';
import type { ServiceBooking, ServiceStatus, ServiceTask } from '../types';
import type { ExtendedServiceItemDetail, ServicePackageMappingResponse } from '../components/OrderDetail/types';

/**
 * Senior Hook for Service Order Detail Management
 * Orchestrates multiple data sources and caching strategies
 */
export function useOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  // 1. Core Order Data Fetching
  const orderQuery = useQuery<ServiceBooking>({
    queryKey: ['serviceOrder', 'detail', id],
    queryFn: () => api.get(`/ServiceOrders/${id}`).then(mapApiDetailToOrder),
    enabled: !!id,
    staleTime: 30000,
  });

  // 1.5. Task List Data Fetching (Fetch multiple tasks for rescheduling history)
  const tasksQuery = useQuery({
    queryKey: ['serviceTasks', 'list', id],
    queryFn: async () => {
      const res = await serviceOrderService.searchServiceTasks({
        soId: id,
        sold: id,
        pageSize: 10,
        pageNumber: 1
      });
      return (res?.items || [])
        .map(mapApiTaskToServiceTask)
        .filter((t): t is ServiceTask => !!t)
        .sort((a, b) => {
          // 1. Status Priority: Active tasks (pending, processing, confirmed) come FIRST
          const activeStatuses = ['pending', 'processing', 'confirmed'];
          const aActive = activeStatuses.includes(a.status?.toLowerCase());
          const bActive = activeStatuses.includes(b.status?.toLowerCase());

          if (aActive && !bActive) return -1;
          if (!aActive && bActive) return 1;

          // 2. ID Heuristic: Sort by UUID/ID descending (Assuming newest ID has higher value)
          return (b.serviceTaskId || '').localeCompare(a.serviceTaskId || '');
        });
    },
    enabled: !!id,
    staleTime: 30000,
  });

  // 2. Multi-Task Evidence Fetching
  const tasks = useMemo(() => tasksQuery.data || [], [tasksQuery.data]);
  const evidenceQueries = useQueries({
    queries: tasks.map((t) => ({
      queryKey: ['serviceEvidences', id, t?.serviceTaskId],
      queryFn: async () => {
        const res = await api.get('/ServiceEvidences/AdminSearchSe', {
          params: { serviceTaskId: t?.serviceTaskId, soId: id, pageSize: 50 }
        });
        const data = res.data?.data ?? res.data;
        return data?.items || data || [];
      },
      enabled: !!id && !!t?.serviceTaskId,
      staleTime: 30000,
    }))
  });

  // 3. Parallel Package Mapping Fetching
  const orderItems = orderQuery.data?.items || [];
  const mappingQueries = useQueries({
    queries: (orderItems as ExtendedServiceItemDetail[]).map((item) => ({
      queryKey: ['servicePackageMapping', item.servicePackageMappingId],
      queryFn: () => api.get(`/ServicePackageMappings/${item.servicePackageMappingId}`).then(res => (res.data?.data ?? res.data) as ServicePackageMappingResponse),
      enabled: !!item.servicePackageMappingId && !!orderQuery.data,
      staleTime: 1000 * 60 * 60,
    }))
  });

  // 4. Data Derivations
  const mergedOrder = useMemo(() => {
    if (!orderQuery.data) return null;
    const order = { ...orderQuery.data };

    // Authority Principle: Use tasksQuery as source of truth for all tasks
    order.serviceTasks = tasks.map((t, idx) => ({
      ...t,
      evidences: evidenceQueries[idx]?.data || []
    }));

    // Backward compatibility & Selection: Set primary serviceTask to the one at currentTaskIndex
    order.serviceTask = (order.serviceTasks && order.serviceTasks.length > 0)
      ? order.serviceTasks[currentTaskIndex] || order.serviceTasks[0]
      : order.serviceTask;

    return order;
  }, [orderQuery.data, tasks, evidenceQueries, currentTaskIndex]);

  const statusCfg = useMemo(() => {
    if (!mergedOrder) return undefined;
    return statusConfig[mergedOrder.status as ServiceStatus] || statusConfig.pending;
  }, [mergedOrder]);

  const isInitialLoading = (orderQuery.isLoading && !orderQuery.data);

  const isAssigned = !!mergedOrder?.staff || !!mergedOrder?.technician || !!mergedOrder?.serviceTask;

  const canConfirm = useMemo(() => {
    if (!mergedOrder) return false;
    const status = mergedOrder.status?.toLowerCase();
    const isConfirmableStatus = status === 'pending' || status === 'rescheduled';
    return isConfirmableStatus &&
      (mergedOrder.paymentMethod === 'COD' || mergedOrder.paymentStatus?.toLowerCase() === 'paid');
  }, [mergedOrder]);

  const canCancel = useMemo(() => {
    if (!mergedOrder) return false;
    const status = mergedOrder.status?.toLowerCase();

    // Core terminal states – no further cancellation possible
    if (['cancelled', 'completed', 'refunded', 'forcedcancelled', 'rejected'].includes(status || '')) return false;

    // Manager cancel confirm: cancel ServiceOrder + cancel ServiceTask if pending/checked_in
    // If no ServiceTask exists, just cancel the ServiceOrder
    if (status === 'pending' || status === 'confirmed') return true;

    // Rescheduled is a transitional state – manager can still cancel before processing resumes
    if (status === 'rescheduled') return true;

    // Processing: Manager can ONLY cancel after staff has forced-cancelled the task first
    // (Bỏ cancel độc lập processing – staff phải forced cancel trước)
    if (status === 'processing') {
      const taskStatus = (mergedOrder.serviceTask?.status || '').toLowerCase();
      return taskStatus === 'forcedcancelled';
    }

    return false;
  }, [mergedOrder]);

  const canAssign = useMemo(() => {
    if (!mergedOrder) return false;
    const status = mergedOrder.status?.toLowerCase();
    return (status === 'confirmed' || status === 'processing') && !isAssigned;
  }, [mergedOrder, isAssigned]);

  const canComplete = useMemo(() => {
    if (!mergedOrder) return false;
    const orderStatus = mergedOrder.status?.toLowerCase();
    const taskStatus = mergedOrder.serviceTask?.status?.toLowerCase();
    return orderStatus === 'processing' &&
      (taskStatus === 'completed' || !!mergedOrder.serviceTask?.checkOut);
  }, [mergedOrder]);

  const canReschedule = useMemo(() => {
    if (!mergedOrder) return false;
    const orderStatus = mergedOrder.status?.toLowerCase();
    const taskStatus = (mergedOrder.serviceTask?.status || '').toLowerCase();
    // Backend strictly enforces "Only processing order can be rescheduled"
    return orderStatus === 'processing' && taskStatus === 'processing';
  }, [mergedOrder]);



  const handleAssignOpen = useCallback(() => {
    if (mergedOrder) {
      setSelectedOrderId(mergedOrder.soId || mergedOrder.id);
      setIsAssignOpen(true);
    }
  }, [mergedOrder]);

  const handleAssignClose = useCallback(() => {
    setIsAssignOpen(false);
  }, []);

  const handleRescheduleOpen = useCallback(() => {
    if (mergedOrder) {
      setSelectedOrderId(mergedOrder.soId || mergedOrder.id);
      setIsRescheduleOpen(true);
    }
  }, [mergedOrder, setIsRescheduleOpen]);

  const handleRescheduleClose = useCallback(() => {
    setIsRescheduleOpen(false);
  }, [setIsRescheduleOpen]);

  const handleBack = useCallback(() => {
    navigate('/admin/services');
  }, [navigate]);

  const permissions = useMemo(() => ({
    canConfirm,
    canAssign,
    canCancel,
    canComplete,
    canReschedule,
    isAssigned
  }), [canConfirm, canAssign, canCancel, canComplete, canReschedule, isAssigned]);

  const memoizedActions = useMemo(() => ({
    handleAssignOpen,
    handleAssignClose,
    handleRescheduleOpen,
    handleRescheduleClose,
    handleBack,
    setCurrentTaskIndex
  }), [handleAssignOpen, handleAssignClose, handleRescheduleOpen, handleRescheduleClose, handleBack, setCurrentTaskIndex]);

  return useMemo(() => ({
    order: mergedOrder,
    isLoading: isInitialLoading,
    isError: orderQuery.isError,
    mappingQueries,
    statusCfg,
    isAssignOpen,
    isRescheduleOpen,
    currentTaskIndex,
    selectedOrderId,
    permissions,
    actions: memoizedActions
  }), [
    mergedOrder,
    isInitialLoading,
    orderQuery.isError,
    mappingQueries,
    statusCfg,
    isAssignOpen,
    isRescheduleOpen,
    currentTaskIndex,
    selectedOrderId,
    permissions,
    memoizedActions
  ]);
}

import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueries } from '@tanstack/react-query';
import { statusConfig } from '../constants';
import { mapApiDetailToOrder, mapApiTaskToServiceTask } from '../utils/mappers';
import serviceOrderService from '@/api/services/serviceOrderService';
import paymentService from '@/api/services/paymentService';
import servicePackageMappingService from '@/api/services/servicePackageMappingService';
import type { ServiceBooking, ServiceStatus, ServiceTask } from '../types';
import type { ExtendedServiceItemDetail } from '../components/OrderDetail/types';

/**
 * Senior Hook for Service Order Detail Management
 * Orchestrates multiple data sources and caching strategies
 */
export function useOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  // 1. Core Order Data Fetching
  const orderQuery = useQuery<ServiceBooking>({
    queryKey: ['serviceOrder', 'detail', id],
    queryFn: () => serviceOrderService.getServiceOrderById(id!).then(mapApiDetailToOrder),
    enabled: !!id,
    staleTime: 30000,
  });

  // 1.2. Payment Data Fetching
  const paymentsQuery = useQuery({
    queryKey: ['payments', 'list', { orderCode: orderQuery.data?.orderCode || id }],
    queryFn: () => paymentService.getAdminPayments({
      orderCode: orderQuery.data?.orderCode || id,
      pageSize: 50
    }).then(res => res.items || []),
    enabled: !!orderQuery.data,
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
      queryFn: () => serviceOrderService.getEvidences({
        serviceTaskId: t?.serviceTaskId,
        soId: id,
        pageSize: 50
      }),
      enabled: !!id && !!t?.serviceTaskId,
      staleTime: 30000,
    }))
  });

  // 3. Parallel Package Mapping Fetching
  const orderItems = orderQuery.data?.items || [];
  const mappingQueries = useQueries({
    queries: (orderItems as ExtendedServiceItemDetail[]).map((item) => ({
      queryKey: ['servicePackageMapping', item.servicePackageMappingId],
      queryFn: () => servicePackageMappingService.getById(item.servicePackageMappingId!),
      enabled: !!item.servicePackageMappingId && !!orderQuery.data,
      staleTime: 1000 * 60 * 60,
    }))
  });

  // 4. Data Derivations
  const mergedOrder = useMemo(() => {
    if (!orderQuery.data) return null;

    // Efficiently merge task evidence
    const mappedTasks = tasks.map((t, idx) => ({
      ...t,
      evidences: evidenceQueries[idx]?.data || []
    }));

    const order = {
      ...orderQuery.data,
      serviceTasks: mappedTasks
    };

    // Primary serviceTask assignment
    order.serviceTask = (mappedTasks.length > 0)
      ? mappedTasks[currentTaskIndex] || mappedTasks[0]
      : order.serviceTask;

    return order;
  }, [orderQuery.data, tasks, evidenceQueries, currentTaskIndex]);

  const statusCfg = useMemo(() => {
    if (!mergedOrder?.status) return undefined;
    return statusConfig[mergedOrder.status as ServiceStatus] || statusConfig.pending;
  }, [mergedOrder]);

  const isInitialLoading = !orderQuery.data && orderQuery.isLoading;

  const isAssigned = useMemo(() =>
    !!mergedOrder?.staff || !!mergedOrder?.technician || !!mergedOrder?.serviceTask
    , [mergedOrder]);

  const canConfirm = useMemo(() => {
    if (!mergedOrder) return false;
    const status = mergedOrder.status?.toLowerCase();
    const isConfirmableStatus = status === 'pending';
    return isConfirmableStatus &&
      (mergedOrder.paymentMethod === 'COD' || mergedOrder.paymentStatus?.toLowerCase() === 'paid');
  }, [mergedOrder]);

  const canCancel = useMemo(() => {
    if (!mergedOrder) return false;
    const status = mergedOrder.status?.toLowerCase();

    // Core terminal states – no further cancellation possible
    if (['cancelled', 'completed', 'refunded', 'forcedcancelled', 'rejected'].includes(status || '')) return false;

    // Manager cancel/reject logic:
    // 1. Pending can always be Rejected
    if (status === 'pending') return true;

    // 2. Confirmed can only be Cancelled via manager-cancel IF it has a task AND that task is still pending/started
    if (status === 'confirmed') {
      const taskStatus = (mergedOrder.serviceTask?.status || '').toLowerCase();
      return isAssigned && (taskStatus === 'pending' || taskStatus === 'confirmed' || taskStatus === 'waiting');
    }

    // Rescheduled is a transitional state – manager can still cancel before processing resumes
    if (status === 'rescheduled') return true;

    // Processing: Manager can ONLY cancel after staff has forced-cancelled the task first
    // (Bỏ cancel độc lập processing – staff phải forced cancel trước)
    if (status === 'processing') {
      const taskStatus = (mergedOrder.serviceTask?.status || '').toLowerCase();
      return taskStatus === 'forcedcancelled';
    }

    return false;
  }, [mergedOrder, isAssigned]);

  const canAssign = useMemo(() => {
    if (!mergedOrder) return false;
    const status = mergedOrder.status?.toLowerCase();
    return (status === 'confirmed' || status === 'processing') && !isAssigned;
  }, [mergedOrder, isAssigned]);





  const handleAssignOpen = useCallback(() => {
    if (mergedOrder) {
      setSelectedOrderId(mergedOrder.soId || mergedOrder.id);
      setIsAssignOpen(true);
    }
  }, [mergedOrder]);

  const handleAssignClose = useCallback(() => {
    setIsAssignOpen(false);
  }, []);


  const handleBack = useCallback(() => {
    navigate('/admin/services');
  }, [navigate]);

  const canCreateRefund = useMemo(() => {
    if (!mergedOrder) return false;
    const orderStatus = mergedOrder.status?.toLowerCase();
    
    // Core Requirement: Only for VNPay or Other orders that have been paid
    const isRefundableMethod = (mergedOrder.paymentMethod?.toLowerCase() === 'vnpay' || mergedOrder.paymentMethod?.toLowerCase() === 'other') && 
                        (mergedOrder.paymentStatus?.toLowerCase() === 'paid' || mergedOrder.paymentStatus?.toLowerCase() === 'codpaid');
    
    if (!isRefundableMethod) return false;

    // Check if there's already a refund process active in the payments history
    // We prevent duplicate refund creations
    const hasRefundProcess = (paymentsQuery.data || []).some(p => 
        ['refunding', 'refunded'].includes(p.status?.toLowerCase())
    ) || ['refunding', 'refunded'].includes(mergedOrder.paymentStatus?.toLowerCase() || '');

    // Manager can create refund if order is in a terminal non-complete state
    // (Cancelled by user, Rejected by admin, or Forced Cancelled during processing)
    const isRefundableState = ['cancelled', 'rejected', 'forcedcancelled', 'managercancel'].includes(orderStatus || '');
    
    return isRefundableState && !hasRefundProcess;
  }, [mergedOrder, paymentsQuery.data]);

  const permissions = useMemo(() => ({
    canConfirm,
    canAssign,
    canCancel,
    canCreateRefund,
    isAssigned
  }), [canConfirm, canAssign, canCancel, canCreateRefund, isAssigned]);

  const memoizedActions = useMemo(() => ({
    handleAssignOpen,
    handleAssignClose,
    handleBack,
    setCurrentTaskIndex
  }), [handleAssignOpen, handleAssignClose, handleBack, setCurrentTaskIndex]);

  return useMemo(() => ({
    order: mergedOrder,
    isLoading: isInitialLoading,
    isError: orderQuery.isError,
    mappingQueries,
    statusCfg,
    isAssignOpen,
    currentTaskIndex,
    selectedOrderId,
    permissions,
    payments: paymentsQuery.data || [],
    isPaymentsLoading: paymentsQuery.isLoading,
    actions: memoizedActions
  }), [
    mergedOrder,
    isInitialLoading,
    orderQuery.isError,
    mappingQueries,
    statusCfg,
    isAssignOpen,
    currentTaskIndex,
    selectedOrderId,
    permissions,
    paymentsQuery.data,
    paymentsQuery.isLoading,
    memoizedActions
  ]);
}

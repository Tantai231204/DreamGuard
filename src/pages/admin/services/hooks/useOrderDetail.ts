import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { statusConfig } from '../constants';
import { mapApiDetailToOrder, mapApiItemToServiceOrder } from '../utils/mappers';
import type { ServiceBooking, ServiceStatus, AdminSearchOrderServiceItem } from '../types';
import type { ExtendedServiceItemDetail, ServicePackageMappingResponse } from '../components/OrderDetail/types';

/**
 * Senior Hook for Service Order Detail Management
 * Orchestrates multiple data sources and caching strategies
 */
export function useOrderDetail() {
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // 1. Core Order Data Fetching
  const orderQuery = useQuery<ServiceBooking>({
    queryKey: ['serviceOrder', id],
    queryFn: async () => {
      let freshData = await api.get(`/ServiceOrders/${id}`).then(mapApiDetailToOrder);

      // Strategy: Check cache for embedded data that list query might have provided (SearchOrderService)
      const cachedOrder = queryClient.getQueryData<ServiceBooking>(['serviceOrder', id]);

      if (cachedOrder && (!freshData.serviceTask || !freshData.staff)) {
        freshData = {
          ...freshData,
          serviceTask: freshData.serviceTask || cachedOrder.serviceTask,
          staff: freshData.staff || cachedOrder.staff,
          technician: freshData.technician || cachedOrder.technician,
        };
      }

      // Advanced Fallback: If detail is still missing task/staff, search manually
      if (!freshData.serviceTask || !freshData.staff) {
        try {
          const searchTerm = freshData.orderCode || id;
          const searchRes = await api.post('/ServiceOrders/AdminSearchOrderService', {}, {
            params: { orderCode: searchTerm, pageNumber: 1, pageSize: 1 }
          });
          const items = searchRes.data?.items || searchRes.data?.data?.items || [];
          const matchedItem = items.find((it: AdminSearchOrderServiceItem) => it.soId === id);

          if (matchedItem) {
            const listDataMap = mapApiItemToServiceOrder(matchedItem);
            freshData = {
              ...freshData,
              serviceTask: freshData.serviceTask || listDataMap.serviceTask,
              staff: freshData.staff || listDataMap.staff,
              technician: freshData.technician || listDataMap.technician,
            };
          }
        } catch (err) {
          console.error('[DETAIL] Advanced fallback failed:', err);
        }
      }

      return freshData;
    },
    placeholderData: () => queryClient.getQueryData<ServiceBooking>(['serviceOrder', id]),
    enabled: !!id,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // 2. Task Evidences Fetching
  const serviceTaskId = orderQuery.data?.serviceTask?.serviceTaskId || orderQuery.data?.serviceTask?.taskId;
  const evidenceQuery = useQuery({
    queryKey: ['serviceEvidences', serviceTaskId, id],
    queryFn: async () => {
      const res = await api.get('/ServiceEvidences/AdminSearchSe', {
        params: { serviceTaskId, soId: id, pageSize: 50 }
      });
      const data = res.data?.data ?? res.data;
      return data?.items || data || [];
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
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
    if (order.serviceTask && evidenceQuery.data) {
      order.serviceTask = {
        ...order.serviceTask,
        evidences: evidenceQuery.data
      };
    }
    return order;
  }, [orderQuery.data, evidenceQuery.data]);

  const statusCfg = useMemo(() => {
    if (!mergedOrder) return undefined;
    return statusConfig[mergedOrder.status as ServiceStatus] || statusConfig.pending;
  }, [mergedOrder]);

  const isInitialLoading = (orderQuery.isLoading && !orderQuery.data);

  const isAssigned = !!mergedOrder?.staff || !!mergedOrder?.technician || !!mergedOrder?.serviceTask;

  const canConfirm = useMemo(() => {
    if (!mergedOrder) return false;
    return mergedOrder.status?.toLowerCase() === 'pending' &&
      (mergedOrder.paymentMethod === 'COD' || mergedOrder.paymentStatus?.toLowerCase() === 'paid');
  }, [mergedOrder]);

  const canCancel = useMemo(() => {
    if (!mergedOrder) return false;
    return !['cancelled', 'completed', 'refunded', 'forcedcancelled', 'rejected'].includes(mergedOrder.status?.toLowerCase() || '');
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
    // Manager/Admin can complete if order is in processing 
    // AND technician has indicated progress completion (either by status or checkout timestamp)
    return orderStatus === 'processing' &&
      (taskStatus === 'completed' || !!mergedOrder.serviceTask?.checkOut);
  }, [mergedOrder]);

  // 5. Actions
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

  return {
    order: mergedOrder,
    isLoading: isInitialLoading,
    isError: orderQuery.isError,
    mappingQueries,
    statusCfg,
    isAssignOpen,
    selectedOrderId,
    permissions: {
      canConfirm,
      canAssign,
      canCancel,
      canComplete,
      isAssigned
    },
    actions: {
      handleAssignOpen,
      handleAssignClose,
      handleBack
    }
  };
}

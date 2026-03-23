import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import {
  Hourglass, Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { statusConfig } from './constants';
import { OrderHeader, OrderItemsArea, OrderSidebar } from './components/OrderDetail';
import type { ExtendedServiceItemDetail, ServicePackageMappingResponse } from './components/OrderDetail';
import { mapApiDetailToOrder, mapApiItemToServiceOrder } from './utils/mappers';
import type { ServiceBooking, ServiceStatus, AdminSearchOrderServiceItem } from './types';

/**
 * Senior Optimized Service Detail Page
 * Features:
 * 1. Initial Data from list cache for instant UI rendering
 * 2. Centralized Mappers for data consistency
 * 3. Specialized caching for mapping lookups
 */
export default function ServiceDetail() {
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Using placeholderData instead of initialData to prevent the query from being marked "fresh" with incomplete data
  const orderQuery = useQuery<ServiceBooking>({
    queryKey: ['serviceOrder', id],
    queryFn: async () => {
      let freshData = await api.get(`/ServiceOrders/${id}`).then(mapApiDetailToOrder);

      // Senior Performance Strategy:
      // We already pre-populated ['serviceOrder', id] from the list query (useServiceManagement).
      // If the fresh detail response is incomplete (missing serviceTask/staff), 
      // we check our own cache first for that data.
      const cachedOrder = queryClient.getQueryData<ServiceBooking>(['serviceOrder', id]);

      if (cachedOrder && (!freshData.serviceTask || !freshData.staff)) {
        freshData = {
          ...freshData,
          serviceTask: freshData.serviceTask || cachedOrder.serviceTask,
          staff: freshData.staff || cachedOrder.staff,
          technician: freshData.technician || cachedOrder.technician,
        };
      }

      // API Level Fallback (In case cache is also empty - e.g. direct URL access)
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
          console.error('[CRITICAL] Advanced fallback failed:', err);
        }
      }

      return freshData;
    },
    placeholderData: () => {
      return queryClient.getQueryData<ServiceBooking>(['serviceOrder', id]);
    },
    enabled: !!id,
    staleTime: 0, // Always fetch fresh data on detail page
  });

  const { data: order, isLoading, isError } = orderQuery;

  // New: Fetch detailed task evidences
  const serviceTaskId = order?.serviceTask?.serviceTaskId || order?.serviceTask?.taskId;
  const evidenceQuery = useQuery({
    queryKey: ['serviceEvidences', serviceTaskId, id],
    queryFn: async () => {
      const res = await api.get('/ServiceEvidences/AdminSearchSe', { 
        params: { 
          serviceTaskId, 
          soId: id, // Fallback to Order ID as subagent confirmed it works
          pageSize: 50 
        } 
      });
      const data = res.data?.data ?? res.data;
      return data?.items || data || [];
    },
    enabled: !!id, // Always enabled if we have the order ID
    staleTime: 0, // Ensure fresh data on detail page
  });

  // Memoized merged order to avoid mutation of cached results
  const mergedOrder = useMemo(() => {
    if (!order) return null;
    const newOrder = { ...order };
    if (newOrder.serviceTask && evidenceQuery.data) {
      newOrder.serviceTask = {
        ...newOrder.serviceTask,
        evidences: evidenceQuery.data
      };
    }
    return newOrder;
  }, [order, evidenceQuery.data]);

  const orderItems = mergedOrder?.items || [];
  console.log('[DEBUG] Order Items Structure:', orderItems);

  const isFetchingDetail = (isLoading && !order) || (evidenceQuery.isLoading && !!serviceTaskId && !evidenceQuery.data);

  // Parallel fetch for Service Package Mappings detail
  const mappingQueries = useQueries({
    queries: (orderItems as ExtendedServiceItemDetail[]).map((item) => ({
      queryKey: ['servicePackageMapping', item.servicePackageMappingId],
      queryFn: () => api.get(`/ServicePackageMappings/${item.servicePackageMappingId}`).then(res => (res.data?.data ?? res.data) as ServicePackageMappingResponse),
      enabled: !!item.servicePackageMappingId && !!mergedOrder,
      staleTime: 1000 * 60 * 60, // Mappings are static, cache for 1 hour
    }))
  });

  console.log('[DEBUG] Mapping Queries Results:', mappingQueries.map(q => q.data));

  if (isFetchingDetail) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Hourglass className="h-10 w-10 text-blue-500 animate-spin" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Initialising Detail...</p>
        </div>
      </div>
    );
  }

  if (isError || !mergedOrder) {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <OrderHeader order={{} as ServiceBooking} statusCfg={undefined} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white m-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <Camera className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Order Not Found</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">We couldn't retrieve the details for this service order. It might have been deleted or the connection was lost.</p>
          <Button onClick={() => navigate('/admin/services')} className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-6 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Derive optimized references
  const statusCfg = statusConfig[mergedOrder.status as ServiceStatus] || statusConfig.pending;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <OrderHeader order={mergedOrder} statusCfg={statusCfg} />

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-[1600px] mx-auto space-y-8">
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Main Area (8 units) */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              <OrderItemsArea 
                orderItems={orderItems} 
                mappingQueries={mappingQueries} 
                task={mergedOrder.serviceTask || undefined} 
              />
            </div>

            {/* Sidebar (4 units) */}
            <div className="col-span-12 lg:col-span-4 sticky top-0">
              <OrderSidebar 
                order={mergedOrder}
                task={mergedOrder.serviceTask || undefined}
                technician={mergedOrder.staff}
                scheduledDate={mergedOrder.scheduledDate}
                scheduledTime={mergedOrder.scheduledTime}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

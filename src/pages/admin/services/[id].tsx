import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle, Loader2, ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { statusConfig } from './constants';
import { OrderHeader, OrderItemsArea, OrderSidebar } from './components/OrderDetail';
import type { ExtendedServiceItemDetail, ServicePackageMappingResponse } from './components/OrderDetail';
import { mapApiDetailToOrder, mapApiItemToServiceOrder } from './utils/mappers';
import type { ServiceBooking, PaginatedAdminSearchOrderServiceResponse } from './types';

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
  const { data: order, isLoading, isError } = useQuery<ServiceBooking>({
    queryKey: ['serviceOrder', id],
    queryFn: () => api.get(`/ServiceOrders/${id}`).then(mapApiDetailToOrder),
    placeholderData: () => {
      // Look into the 'serviceOrders' cache to see if we already have basic details
      // Using a broader query key lookup if possible, or common default key
      const listData = queryClient.getQueryData<PaginatedAdminSearchOrderServiceResponse>(['serviceOrders', '', 'all', '', 1]);
      const item = listData?.items.find((it) => it.soId === id);
      return item ? mapApiItemToServiceOrder(item) : undefined;
    },
    enabled: !!id,
    staleTime: 1000 * 60, // Reduced staleTime for real data to 1 minute
  });

  const orderItems = order?.items || [];

  // Parallel fetch for Service Package Mappings detail
  // Memoized query list to avoid unnecessary query key recalculations
  const mappingQueries = useQueries({
    queries: (orderItems as ExtendedServiceItemDetail[]).map((item) => ({
      queryKey: ['servicePackageMapping', item.servicePackageMappingId],
      queryFn: () => api.get(`/ServicePackageMappings/${item.servicePackageMappingId}`).then(res => (res.data?.data ?? res.data) as ServicePackageMappingResponse),
      enabled: !!item.servicePackageMappingId && !!order,
      staleTime: 1000 * 60 * 60, // Mappings are static, cache for 1 hour
    }))
  });

  if (isLoading && !order) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <AlertCircle className="h-12 w-12 mb-3 text-red-500 animate-bounce" />
        <p className="font-semibold text-lg">Order not found or failed to load</p>
        <Button onClick={() => navigate('/admin/services')} variant="outline" className="mt-4 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to List
        </Button>
      </div>
    );
  }

  // Derive optimized references
  const task = order.serviceTask;
  const technician = order.staff;
  const statusCfg = statusConfig[order.status] || statusConfig.pending;
  const scheduledDate = order.scheduledDate;
  const scheduledTime = order.scheduledTime;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <OrderHeader order={order} statusCfg={statusCfg} orderId={id || ''} />

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-[1600px] mx-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            <div className="col-span-12 lg:col-span-8 space-y-8">
              <OrderItemsArea
                orderItems={orderItems as ExtendedServiceItemDetail[]}
                mappingQueries={mappingQueries}
                task={task || undefined}
              />
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-6">
              <OrderSidebar
                order={order}
                task={task || undefined}
                technician={technician}
                scheduledDate={scheduledDate}
                scheduledTime={scheduledTime}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

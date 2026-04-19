import {
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  OrderHeader,
  OrderItemsArea,
  OrderSidebar,
  OrderDetailSkeleton
} from './components/OrderDetail';
import { AssignTechnicianDialog } from './components/AssignTechnicianDialog';
import { RescheduleDialog } from './components/RescheduleDialog';
import { useOrderDetail } from './hooks/useOrderDetail';
import type { ServiceBooking } from './types';

/**
 * Senior Standardized Service Detail Page
 * Features concentrated data orchestration via useOrderDetail
 * Premium Loading Skeletons
 * Optimized Event Handlers
 */
export default function ServiceDetail() {
  const {
    order,
    isLoading,
    isError,
    mappingQueries,
    statusCfg,
    isAssignOpen,
    isRescheduleOpen,
    currentTaskIndex,
    selectedOrderId,
    permissions,
    payments,
    actions
  } = useOrderDetail();

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <OrderHeader
          order={{} as ServiceBooking}
          statusCfg={undefined}
          permissions={{ canConfirm: false, canAssign: false, canCancel: false, isAssigned: false, canComplete: false, canReschedule: false }}
          onBack={actions.handleBack}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white m-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <Camera className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Booking Refraction</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium italic">We couldn't synchronize the details for this booking. The record may have expired or is currently being updated in another session.</p>
          <Button
            onClick={actions.handleBack}
            className="bg-slate-900 text-white hover:bg-slate-800 px-8 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-200"
          >
            Back to Command Center
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <OrderHeader
        order={order}
        statusCfg={statusCfg}
        permissions={permissions}
        onAssign={actions.handleAssignOpen}
        onReschedule={actions.handleRescheduleOpen}
        onBack={actions.handleBack}
      />

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-[1600px] mx-auto space-y-8">
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Main Area (8 units) - Items & Evidence */}
            <div className="col-span-12 lg:col-span-8 space-y-8 order-2 lg:order-1">
              <OrderItemsArea
                order={order}
                orderItems={order.items || []}
                mappingQueries={mappingQueries}
                task={order.serviceTask || undefined}
                customerAssets={order.imageUrl}
                payments={payments}
              />
            </div>

            {/* Sidebar (4 units) - Context & Controls */}
            <div className="col-span-12 lg:col-span-4 sticky top-8 order-1 lg:order-2">
              <OrderSidebar
                order={order}
                task={order.serviceTask || undefined}
                technician={order.staff}
                scheduledDate={order.scheduledDate}
                scheduledTime={order.scheduledTime}
                permissions={permissions}
                onAssign={actions.handleAssignOpen}
                onReschedule={actions.handleRescheduleOpen}
                currentTaskIndex={currentTaskIndex}
                onTaskIndexChange={actions.setCurrentTaskIndex}
              />
            </div>
          </div>
        </div>
      </div>

      <AssignTechnicianDialog
        isOpen={isAssignOpen}
        onClose={actions.handleAssignClose}
        orderId={selectedOrderId || ""}
      />

      <RescheduleDialog
        isOpen={isRescheduleOpen}
        onClose={actions.handleRescheduleClose}
        orderId={selectedOrderId}
        currentDate={order.appointmentDate}
        currentStaffId={order.serviceTask?.staffId || order.staff?.staffId}
      />
    </div>
  );
}

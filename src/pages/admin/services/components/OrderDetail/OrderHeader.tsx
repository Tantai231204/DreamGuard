import { ArrowLeft, CheckCircle, XCircle, UserPlus, FileEdit, CalendarClock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import type { DetailOrder, StatusConfigItem } from './types';
import { useServiceActions } from '../../hooks/useServiceActions';
import { CancelBookingDialog } from '../CancelBookingDialog';
import { ConfirmServiceDialog } from '../ConfirmServiceDialog';
import { CompleteServiceDialog } from '../CompleteServiceDialog';
import { toast } from 'sonner';
import { AdminStatusBadge } from '@/components/admin';
import { memo, useState } from 'react';

interface OrderHeaderProps {
  order: DetailOrder;
  statusCfg?: StatusConfigItem;
  onAssign?: () => void;
  onReschedule?: () => void;
  onBack?: () => void;
  permissions: {
      canConfirm: boolean;
      canAssign: boolean;
      canCancel: boolean;
      canComplete?: boolean;
      canReschedule?: boolean;
      isAssigned: boolean;
  };
}

export const OrderHeader = memo(function OrderHeader({ 
  order, 
  statusCfg, 
  onAssign,
  onReschedule,
  onBack,
  permissions 
}: OrderHeaderProps) {
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  
  const StatusIcon = statusCfg?.icon;
  const { confirmBooking, cancelBooking, completeBooking, isConfirming, isCancelling, isCompleting } = useServiceActions();

  const handleConfirmAction = () => {
    confirmBooking(order.soId || order.id || "", {
      onSuccess: () => {
        setIsConfirmOpen(false);
      }
    });
  };

  const handleCompleteAction = () => {
    setIsCompleteOpen(true);
  };

  const handleConfirmComplete = () => {
    const taskId = order.serviceTask?.serviceTaskId || order.serviceTask?.taskId;
    const orderId = order.soId || order.id || "";
    
    if (!taskId) {
      toast.error("No active task found to complete");
      return;
    }

    completeBooking({ taskId, orderId }, {
      onSuccess: () => {
        setIsCompleteOpen(false);
      }
    });
  };

  const handleCancelConfirm = (reason: string, refundAmount?: number) => {
    cancelBooking({ 
      id: order.soId || order.id || "", 
      status: order.status || "",
      reason,
      refundAmount
    }, {
      onSuccess: () => {
        setIsCancelOpen(false);
      }
    });
  };

  return (
    <div className="flex-shrink-0 bg-white border-b border-blue-100/30 px-8 py-6 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full -mr-48 -mt-48 blur-[100px] opacity-40" />

      <div className="max-w-[1600px] mx-auto flex items-center justify-between relative z-10">
        <div className="flex items-center gap-6">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="h-12 w-12 rounded-2xl border-slate-100 bg-white hover:bg-slate-50 shadow-sm transition-all hover:scale-105 active:scale-95 group"
          >
            <ArrowLeft className="h-5 w-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
          </Button>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-lg shadow-slate-200">
                {order.orderCode || 'DG-REF-552'}
              </div>
              <div className="flex items-center gap-2">
                <AdminStatusBadge status="service" variant="default" className="scale-90" />
                {statusCfg && (
                  <Badge variant="outline" className={`${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} text-[10px] font-black py-0.5 px-3 rounded-full h-7 uppercase tracking-wider`}>
                    {StatusIcon && <StatusIcon className="h-3 w-3 mr-1.5" />}
                    {statusCfg.label}
                  </Badge>
                )}
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
              Service Operations Command
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            {permissions.canConfirm && (
              <Button
                size="sm"
                onClick={() => setIsConfirmOpen(true)}
                disabled={isConfirming}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl gap-2 shadow-xl shadow-emerald-500/10 transition-all hover:scale-105 active:scale-95 h-12 px-6 border-0"
              >
                <CheckCircle className="h-4 w-4" /> {isConfirming ? "Processing..." : "Authorize Order"}
              </Button>
            )}

            {permissions.canComplete && (
              <Button
                size="sm"
                onClick={handleCompleteAction}
                disabled={isCompleting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl gap-2 shadow-xl shadow-emerald-500/10 transition-all hover:scale-105 active:scale-95 h-12 px-6 border-0"
              >
                <CheckCircle className="h-4 w-4" /> {isCompleting ? "Executing..." : "Mark as Completed"}
              </Button>
            )}

            {permissions.canAssign && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAssign}
                className="bg-[#4988c4]/10 text-[#4988c4] hover:bg-[#4988c4]/20 font-black text-[10px] uppercase tracking-widest rounded-xl gap-2 h-12 px-6 transition-all border-0"
              >
                <UserPlus className="h-4 w-4" /> Personnel Dispatch
              </Button>
            )}

            {permissions.canReschedule && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReschedule}
                className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary-hover font-black text-[10px] uppercase tracking-widest rounded-xl gap-2 h-12 px-6 transition-all border-0"
              >
                <CalendarClock className="h-4 w-4" /> Reschedule
              </Button>
            )}

            {permissions.canCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCancelOpen(true)}
                disabled={isCancelling}
                className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-black text-[10px] uppercase tracking-widest rounded-xl gap-2 h-12 px-6 transition-all border-0"
              >
                <XCircle className="h-4 w-4" /> {isCancelling ? "Processing..." : (['pending', 'rescheduled'].includes(order.status?.toLowerCase() || '') ? 'Reject Order' : 'Abort Service')}
              </Button>
            )}

            <div className="h-8 w-px bg-slate-100 mx-2" />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => toast.info('Administrative lock engaged')}
              className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            >
              <FileEdit className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-right pl-8 border-l border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Net Settlement</p>
            <p className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">
              {formatPrice(order.totalPrice || 0)}
            </p>
          </div>
        </div>
      </div>

      <ConfirmServiceDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        isLoading={isConfirming}
        orderCode={order.orderCode || order.id || ''}
      />

      <CancelBookingDialog
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={handleCancelConfirm}
        isLoading={isCancelling}
        orderCode={order.orderCode || ''}
        status={order.status || ''}
        paymentMethod={order.paymentMethod}
        paymentStatus={order.paymentStatus}
        totalPrice={order.totalPrice}
      />

      <CompleteServiceDialog
        isOpen={isCompleteOpen}
        onClose={() => setIsCompleteOpen(false)}
        onConfirm={handleConfirmComplete}
        isLoading={isCompleting}
        orderCode={order.orderCode || ''}
      />
    </div>
  );
});

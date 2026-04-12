import { ArrowLeft, CheckCircle, XCircle, UserPlus, FileEdit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import type { DetailOrder, StatusConfigItem } from './types';
import { useServiceActions } from '../../hooks/useServiceActions';
import { CancelServiceDialog } from './CancelServiceDialog';
import { toast } from 'sonner';
import { AdminStatusBadge } from '@/components/admin';
import { memo, useState } from 'react';

interface OrderHeaderProps {
  order: DetailOrder;
  statusCfg?: StatusConfigItem;
  onAssign?: () => void;
  onBack?: () => void;
  permissions: {
      canConfirm: boolean;
      canAssign: boolean;
      canCancel: boolean;
      isAssigned: boolean;
  };
}

export const OrderHeader = memo(function OrderHeader({ 
  order, 
  statusCfg, 
  onAssign, 
  onBack,
  permissions 
}: OrderHeaderProps) {
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const StatusIcon = statusCfg?.icon;
  const { confirmBooking, cancelBooking, isConfirming, isCancelling } = useServiceActions();

  const handleCancelConfirm = (reason: string) => {
    cancelBooking({ 
      id: order.soId || order.id || "", 
      status: order.status || "", 
      reason 
    }, {
      onSuccess: () => {
        setIsCancelOpen(false);
      }
    });
  };

  return (
    <div className="flex-shrink-0 bg-white border-b border-blue-100/50 px-8 py-5 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

      <div className="max-w-[1600px] mx-auto flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="rounded-xl border-slate-200 hover:bg-slate-50 shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Button>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase border border-blue-100">
                {order.orderCode || 'N/A'}
              </div>
              <div className="flex items-center gap-1.5 pt-0.5">
                <AdminStatusBadge status="service" variant="default" className="scale-90" />
                {statusCfg && (
                  <Badge variant="outline" className={`${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} text-[10px] font-bold py-0.5 px-2 rounded-full h-7`}>
                    {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                    {statusCfg.label}
                  </Badge>
                )}
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Service Order Details
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Actions Group */}
          <div className="flex items-center gap-2 border-r border-slate-100 pr-6 mr-1">
            {permissions.canConfirm && (
              <Button
                size="sm"
                onClick={() => confirmBooking(order.soId || order.id || "")}
                disabled={isConfirming}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl gap-2 shadow-sm transition-all hover:shadow-md h-10 px-5"
              >
                <CheckCircle className="h-4 w-4" /> {isConfirming ? "Confirming..." : "Confirm Booking"}
              </Button>
            )}

            {permissions.canAssign && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAssign}
                className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 font-black text-[10px] uppercase tracking-widest rounded-xl gap-2 h-10 px-5 transition-all"
              >
                <UserPlus className="h-4 w-4" /> Dispatch Tech
              </Button>
            )}

            {permissions.canCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCancelOpen(true)}
                disabled={isCancelling}
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-black text-[10px] uppercase tracking-widest rounded-xl gap-2 h-10 px-5 transition-all"
              >
                <XCircle className="h-4 w-4" /> {isCancelling ? "Processing..." : (order.status?.toLowerCase() === 'pending' ? 'Reject' : 'Cancel')}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Edit mode enabled')}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest rounded-xl gap-2 h-10 px-5 transition-all"
            >
              <FileEdit className="h-4 w-4" /> Edit
            </Button>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payable</p>
            <p className="text-2xl font-black text-blue-600 tracking-tighter tabular-nums">{formatPrice(order.totalPrice || 0)}</p>
          </div>
        </div>
      </div>

      <CancelServiceDialog
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={handleCancelConfirm}
        isLoading={isCancelling}
        orderCode={order.orderCode || ''}
        status={order.status || ''}
      />
    </div>
  );
});

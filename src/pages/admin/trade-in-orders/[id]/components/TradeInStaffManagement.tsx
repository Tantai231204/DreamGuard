import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
  MessageSquarePlus,
  CheckCircle2,
  XCircle,
  Truck,
  PackageCheck,
  TrendingDown,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice, cn } from '@/lib/utils';
import { tradeInOrderService } from '@/api/services';
import { tradeInOrderKeys } from '@/hooks/queries/useTradeInOrder';
import type { TradeInOrderDetailResponse } from '@/api/types/tradeInOrder';
import { CancelTradeInOrderDialog } from '@/pages/admin/orders/components/CancelTradeInOrderDialog';

interface TradeInStaffManagementProps {
  order: TradeInOrderDetailResponse;
}

interface Identifiable {
  id?: string;
  conversationId?: string;
}

export function TradeInStaffManagement({ order }: TradeInStaffManagementProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [negotiatedPrice, setNegotiatedPrice] = useState<number>(order.tradeInPrice || 0);

  const { mutate: acceptTask, isPending: isAccepting } = useMutation({
    mutationFn: () => tradeInOrderService.createConversation(order.tradeInOrderId),
    onSuccess: async (conv) => {
      void queryClient.invalidateQueries({ queryKey: [...tradeInOrderKeys.all, 'detail', order.tradeInOrderId] });
      toast.success('Task accepted. Redirecting...');

      const identifyingConv = conv as Identifiable;
      const cid = identifyingConv?.id || identifyingConv?.conversationId;
      if (cid) navigate(`/admin/chat?id=${cid}`);
      else navigate('/admin/chat');
    },
  });

  const { mutate: confirmDeal, isPending: isConfirming } = useMutation({
    mutationFn: () => tradeInOrderService.confirmDeal(order.tradeInOrderId, negotiatedPrice),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...tradeInOrderKeys.all, 'detail', order.tradeInOrderId] });
      toast.success('Confirmed.');
    },
  });

  const { mutate: adminCancel, isPending: isCancelling } = useMutation({
    mutationFn: (reason: string) => tradeInOrderService.adminCancel(order.tradeInOrderId, reason),
    onSuccess: () => {
      setIsCancelDialogOpen(false);
      void queryClient.invalidateQueries({ queryKey: [...tradeInOrderKeys.all, 'detail', order.tradeInOrderId] });
      toast.success('Cancelled.');
    },
  });

  const { mutate: transitionStatus, isPending: isTransitioning } = useMutation({
    mutationFn: (status: string) => tradeInOrderService.updateStatus(order.tradeInOrderId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...tradeInOrderKeys.all, 'detail', order.tradeInOrderId] });
      toast.success(`Status updated.`);
    },
  });

  const previewAmountToPay = Math.max(0, (order.productVariant?.salePrice || 0) - negotiatedPrice - order.depositAmount);
  const status = order.status.toUpperCase();

  return (
    <div className="space-y-4">
      {/* SECTION HEADER - Slimmer */}
      <div className="flex items-center gap-3 px-1">
        <div className="h-4 w-1 rounded-full bg-primary/40" />
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
          Staff Management
        </h3>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">

        {/* State: WAITING_FOR_STAFF - Compact Version */}
        {status === 'WAITING_FOR_STAFF' && (
          <div className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100/50">
                <MessageSquarePlus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Unclaimed Inquiry</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight opacity-70 mt-0.5">Awaiting staff intervention</p>
              </div>
            </div>
            <Button
              className="w-full h-10 rounded-lg bg-primary border-0 ring-0 text-[10px] font-black uppercase tracking-widest shadow-inner shadow-white/10 hover:bg-primary/90 transition-all gap-2"
              onClick={() => acceptTask()}
              disabled={isAccepting}
            >
              {isAccepting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquarePlus className="w-3.5 h-3.5" />}
              Accept and Open Chat
            </Button>
          </div>
        )}

        {/* State: NEGOTIATING - Compact & Professional */}
        {status === 'NEGOTIATING' && (
          <div className="p-4 space-y-4">
            <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-3 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Live Settlement Preview</span>
                <span className="text-sm font-black text-primary tracking-tight">{formatPrice(previewAmountToPay)}</span>
              </div>
              <TrendingDown className="w-4 h-4 text-primary opacity-30" />
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                Final Valuation Decision
              </label>
              <div className="relative group">
                <Input
                  type="text"
                  value={negotiatedPrice ? negotiatedPrice.toLocaleString('vi-VN') : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    setNegotiatedPrice(Number(raw));
                  }}
                  className="h-12 pl-10 pr-4 rounded-xl border-2 border-slate-100 bg-white font-black text-sm text-primary focus:ring-0 focus:border-primary/30 transition-all shadow-inner shadow-slate-50 placeholder:text-slate-300"
                  placeholder="e.g. 5000000"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₫</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Button
                className="w-full h-10 rounded-lg bg-emerald-600 border-0 ring-0 text-[10px] font-black uppercase tracking-widest shadow-inner shadow-white/10 hover:bg-emerald-700 transition-all gap-2"
                onClick={() => confirmDeal()}
                disabled={isConfirming}
              >
                {isConfirming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Confirm Deal
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="ghost"
                  className="h-9 rounded-lg bg-blue-50/50 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-blue-50 transition-all gap-1.5"
                  onClick={() => {
                    const conv = order.conversation as Identifiable;
                    const cid = conv?.id || conv?.conversationId;
                    if (cid) navigate(`/admin/chat?id=${cid}`);
                    else navigate('/admin/chat');
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                  Chat
                </Button>
                <Button
                  variant="ghost"
                  className="h-9 rounded-lg bg-rose-50/50 text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all gap-1.5"
                  onClick={() => setIsCancelDialogOpen(true)}
                >
                  <XCircle className="w-3 h-3" />
                  Abort
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* State: CONFIRMED & PROCESSING - Streamlined */}
        {['CONFIRMED', 'PROCESSING'].includes(status) && (
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100/50">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Exchange in Progress</h4>
                <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-tight opacity-70">Physical inspection required</p>
              </div>
            </div>

            {status === 'CONFIRMED' && (
              <Button
                className="w-full h-10 rounded-lg bg-primary border-0 ring-0 text-[10px] font-black uppercase tracking-widest shadow-inner shadow-white/10 hover:bg-primary/90 transition-all gap-2"
                onClick={() => transitionStatus('PROCESSING')}
                disabled={isTransitioning}
              >
                {isTransitioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                Mark Arrived
              </Button>
            )}

            {status === 'PROCESSING' && (
              <Button
                className="w-full h-10 rounded-lg bg-emerald-600 border-0 ring-0 text-[10px] font-black uppercase tracking-widest shadow-inner shadow-white/10 hover:bg-emerald-700 transition-all gap-2"
                onClick={() => transitionStatus('DELIVERED')}
                disabled={isTransitioning}
              >
                {isTransitioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PackageCheck className="w-3.5 h-3.5" />}
                Complete Success
              </Button>
            )}

            <Button
              variant="ghost"
              className="w-full h-8 rounded-md text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:bg-rose-50/30 transition-all"
              onClick={() => setIsCancelDialogOpen(true)}
            >
              Force Cancel
            </Button>
          </div>
        )}

        {/* FINALIZED STATES */}
        {['CANCELLED', 'DELIVERED', 'COMPLETED'].includes(status) && (
          <div className="p-4 flex items-center gap-3 bg-slate-50/30">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center border",
              status === 'CANCELLED' ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-emerald-50 border-emerald-100 text-emerald-500"
            )}>
              {status === 'CANCELLED' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Archived</h4>
              <p className={cn(
                "text-[9px] font-black uppercase tracking-tight mt-1",
                status === 'CANCELLED' ? "text-rose-400" : "text-emerald-500"
              )}>
                Status: {status}
              </p>
            </div>
          </div>
        )}
      </div>

      <CancelTradeInOrderDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onConfirm={adminCancel}
        isLoading={isCancelling}
        orderCode={order.orderCode}
      />
    </div>
  );
}

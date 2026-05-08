import { useState, useEffect, useRef } from 'react';
import { useAdminTradeInOrderDetail, useConfirmTradeInDeal, useAdminCancelTradeInOrder } from '@/hooks/queries/useTradeInOrder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight,
  Info,
  ExternalLink,
  Loader2,
  RotateCcw,
  ShieldAlert,
  XCircle,
  DollarSign,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { formatPrice, formatNumber, unformatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { TRADE_IN_STATUS } from '@/utils/tradeInWorkflow';
import { useAuthStore } from '@/store/authStore';
import { isAnyStaff } from '@/lib/role';
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface TradeInNegotiationSidebarProps {
  orderId: string;
  orderCode?: string;
}

export default function TradeInNegotiationSidebar({ orderId, orderCode }: TradeInNegotiationSidebarProps) {
  const role = useAuthStore(s => s.role);
  const { data: order, isLoading, error } = useAdminTradeInOrderDetail(orderId, {
    enabled: !!orderId && isAnyStaff(role)
  });

  const confirmMutation = useConfirmTradeInDeal(orderId);
  const cancelMutation = useAdminCancelTradeInOrder();
  const [negotiatedPrice, setNegotiatedPrice] = useState<number>(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const lastOrderIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (order && order.tradeInOrderId !== lastOrderIdRef.current) {
      setNegotiatedPrice(order.tradeInPrice);
      lastOrderIdRef.current = order.tradeInOrderId;
    }
  }, [order]);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-50/50">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Fetching order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-50/50">
        <AlertCircle className="h-10 w-10 text-slate-300" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-900">Order Not Found</p>
          <p className="text-xs text-slate-500">We couldn't retrieve the details for order {orderCode}.</p>
        </div>
      </div>
    );
  }

  const isConfirmed = order.status === TRADE_IN_STATUS.CONFIRMED || 
                      order.status === TRADE_IN_STATUS.PROCESSING ||
                      order.status === TRADE_IN_STATUS.DELIVERING ||
                      order.status === TRADE_IN_STATUS.COMPLETED;
  const isCancelled = order.status === TRADE_IN_STATUS.CANCELLED ||
                      order.status === TRADE_IN_STATUS.FORCED_CANCELLED ||
                      order.status === TRADE_IN_STATUS.ADMIN_CANCELLED;
  
  const isRefunding = order.payments?.some(p => {
                        const ps = p.status?.toUpperCase() || '';
                        const pt = p.paymentType?.toUpperCase() || '';
                        return ps.includes('REFUNDING') || (pt.includes('REFUND') && ps !== 'REFUNDED');
                      });

  const handleConfirm = () => {
    confirmMutation.mutate({ tradeInPrice: negotiatedPrice }, {
      onSuccess: () => setIsConfirmOpen(false)
    });
  };

  const handleCancel = () => {
    cancelMutation.mutate({ id: orderId, reason: 'Termination' }, {
      onSuccess: () => setIsCancelOpen(false)
    });
  };

  const salePrice = order.productVariant?.salePrice || 0;
  const deposit = order.depositAmount || 0;
  const finalAmount = Math.max(0, salePrice - negotiatedPrice - deposit);

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-100 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] overflow-hidden animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-50 bg-slate-50/30">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-[10px] h-5 px-2 font-black tracking-widest uppercase bg-white">
            Trade-In
          </Badge>
          <span className={cn(
            "text-[9px] font-black px-2 py-0.5 rounded-md border tracking-wider",
            order.status === TRADE_IN_STATUS.NEGOTIATING ? "bg-amber-50 text-amber-600 border-amber-100" :
            order.status === TRADE_IN_STATUS.CONFIRMED ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
            "bg-slate-50 text-slate-500 border-slate-100"
          )}>
            {order.status.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black text-slate-900 tracking-tight">
            {order.orderCode}
          </h3>
          <ExternalLink className="h-3.5 w-3.5 text-slate-300 hover:text-blue-500 cursor-pointer transition-colors" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-5">
        {/* Product Comparison */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Trade-In Flow
          </Label>
          
          <div className="relative space-y-2">
            {/* Old Product (From) */}
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/20 flex gap-3 opacity-80">
              <div className="h-11 w-11 rounded-lg bg-white border border-slate-100 overflow-hidden flex-shrink-0">
                <img 
                  src={order.oldProductVariantUrl || '/placeholder-product.png'} 
                  alt="old" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">From Customer</span>
                <p className="text-[11px] font-bold text-slate-600 truncate leading-tight">
                  User's Trade-in Item
                </p>
              </div>
            </div>

            {/* Connecting Arrow */}
            <div className="absolute left-6 top-[38%] -translate-y-1/2 z-10 bg-white rounded-full p-1 border border-slate-100 shadow-sm">
              <ArrowRight className="h-3 w-3 text-blue-500" />
            </div>

            {/* New Product (To) */}
            <div className="p-3 rounded-xl border-2 border-blue-100 bg-blue-50/20 flex gap-3">
              <div className="h-11 w-11 rounded-lg bg-white border border-blue-200 overflow-hidden shadow-sm flex-shrink-0">
                <img 
                  src={order.orderItem?.productVariantImageUrl || order.newProductVariantUrl} 
                  alt="new" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-tight">Exchange To</span>
                <p className="text-[11px] font-black text-slate-900 truncate leading-tight mb-0.5">
                  {order.orderItem?.itemName || 'Target Product'}
                </p>
                <p className="text-[10px] font-bold text-blue-600 leading-none">
                  {formatPrice(salePrice)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-50" />

        {/* Negotiation Form */}
        <div className="space-y-4">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5" /> Negotiation
          </Label>
          
          <div className="space-y-2.5">
            <div className="flex justify-between items-end px-0.5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold text-slate-600">Buy-back Offer</span>
                <p className="text-[9px] font-medium text-slate-400 flex items-center gap-1">
                  Allowed: <span className="font-bold text-slate-500">{formatPrice(order.minTradeInPrice || 0)} - {formatPrice(order.maxTradeInPrice || 0)}</span>
                </p>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-6 px-2 text-[9px] font-black uppercase border-slate-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setNegotiatedPrice(order.minTradeInPrice || 0)}
                >
                  Min
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-6 px-2 text-[9px] font-black uppercase border-slate-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setNegotiatedPrice(order.maxTradeInPrice || 0)}
                >
                  Max
                </Button>
              </div>
            </div>
            
            <div className="relative group">
              <Input
                type="text"
                inputMode="numeric"
                value={formatNumber(negotiatedPrice)}
                onChange={(e) => {
                  setNegotiatedPrice(unformatNumber(e.target.value));
                }}
                disabled={isConfirmed}
                className={cn(
                  "pl-3 pr-10 h-10 rounded-xl border-slate-200 bg-white font-black text-slate-900 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all text-sm",
                  (negotiatedPrice < (order.minTradeInPrice || 0) || negotiatedPrice > (order.maxTradeInPrice || 0)) && 
                  negotiatedPrice > 0 && 
                  "border-rose-300 bg-rose-50/30 focus-visible:border-rose-500 focus-visible:ring-rose-500/10 text-rose-600"
                )}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                VND
              </div>
            </div>

            {/* Range Validation Visual */}
            {negotiatedPrice > 0 && (
              <div className="space-y-1 px-1">
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div 
                    className={cn(
                      "h-full transition-all duration-300",
                      negotiatedPrice < (order.minTradeInPrice || 0) || negotiatedPrice > (order.maxTradeInPrice || 0)
                        ? "bg-rose-500"
                        : "bg-blue-500"
                    )}
                    style={{ 
                      width: `${Math.min(100, (negotiatedPrice / (order.maxTradeInPrice || 1)) * 100)}%` 
                    }}
                  />
                </div>
                {negotiatedPrice < (order.minTradeInPrice || 0) ? (
                  <p className="text-[9px] font-bold text-rose-500 uppercase tracking-tight flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Offer too low (Min: {formatPrice(order.minTradeInPrice || 0)})
                  </p>
                ) : negotiatedPrice > (order.maxTradeInPrice || 0) ? (
                  <p className="text-[9px] font-bold text-rose-500 uppercase tracking-tight flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Offer too high (Max: {formatPrice(order.maxTradeInPrice || 0)})
                  </p>
                ) : null}
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400 font-bold uppercase tracking-tight">New Product</span>
              <span className="text-slate-900 font-black">{formatPrice(salePrice)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400 font-bold uppercase tracking-tight">Buy-back Value</span>
              <span className="text-rose-600 font-black">-{formatPrice(negotiatedPrice)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400 font-bold uppercase tracking-tight">Deposit Paid</span>
              <span className="text-slate-900 font-black">-{formatPrice(deposit)}</span>
            </div>
            <Separator className="bg-slate-200" />
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">Amount to Pay</span>
              <span className="text-base font-black text-blue-600">{formatPrice(finalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Protocol Alert */}
        {!isConfirmed && !isCancelled && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3 shadow-sm shadow-amber-500/5">
            <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700 leading-normal font-bold uppercase tracking-tighter">
              Confirmation locks the deal and generates delivery tasks.
            </p>
          </div>
        )}

        {isRefunding ? (
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 flex gap-3 shadow-sm shadow-blue-500/5 animate-pulse">
            <RotateCcw className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-700 leading-normal font-black uppercase tracking-tighter">
              Refunding Protocol: Financial settlement is currently in progress.
            </p>
          </div>
        ) : (isCancelled && order.payments?.some(p => p.status?.toUpperCase().includes('PAID')) && (order.depositAmount || 0) > 0) && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 flex gap-3 shadow-sm shadow-rose-500/5 animate-pulse">
            <RotateCcw className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-rose-700 leading-normal font-black uppercase tracking-tighter">
              Action Required: Order is cancelled but deposit has not been refunded.
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-50 bg-white space-y-2">
        {isConfirmed ? (
          <div className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-black uppercase tracking-widest">Deal Finalized</span>
          </div>
        ) : isCancelled ? (
           <div className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <XCircle className="h-4 w-4" />
            <span className="text-xs font-black uppercase tracking-widest">
              {order.status === TRADE_IN_STATUS.ADMIN_CANCELLED ? 'Admin Terminated' : 'Negotiation Cancelled'}
            </span>
          </div>
        ) : (
          <>
            <Button 
              onClick={() => setIsConfirmOpen(true)}
              disabled={
                confirmMutation.isPending || 
                cancelMutation.isPending || 
                negotiatedPrice <= 0 ||
                negotiatedPrice < (order.minTradeInPrice || 0) ||
                negotiatedPrice > (order.maxTradeInPrice || 0)
              }
              className="w-full h-11 rounded-xl bg-[var(--color-primary)] hover:opacity-90 text-white font-black shadow-lg shadow-[var(--color-primary)]/20 gap-2 group transition-all text-xs"
            >
              {confirmMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Confirm Valuation
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            
            <Button 
              variant="ghost"
              onClick={() => setIsCancelOpen(true)}
              disabled={confirmMutation.isPending || cancelMutation.isPending}
              className="w-full h-9 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 font-black text-[10px] gap-2 transition-all uppercase tracking-widest"
            >
              {cancelMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Terminate
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        variant="tradein"
        title="Finalize Valuation?"
        description={`This will officially set the trade-in price to **${formatPrice(negotiatedPrice)}** and move the order to confirmed status.`}
        confirmText="Confirm Deal"
        onConfirm={handleConfirm}
        isLoading={confirmMutation.isPending}
      />

      <ConfirmDialog
        open={isCancelOpen}
        onOpenChange={setIsCancelOpen}
        variant="danger"
        title="Terminate Negotiation?"
        description="Are you sure you want to cancel this trade-in? This action cannot be undone and will notify the customer."
        confirmText="Terminate Order"
        onConfirm={handleCancel}
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
}

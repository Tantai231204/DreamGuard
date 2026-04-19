import { memo, useCallback } from "react";
import { ArrowLeftRight, MessageSquare, Package, Store, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "../../utils";
import { getTradeInStatusTheme } from "../../constants";
import { TradeInOrderDetailDialog } from "./TradeInOrderDetailDialog";
import { CancelTradeInDialog } from "./CancelTradeInDialog";
import type { TradeInOrderListItem } from "@/api/types/tradeInOrder";
import { useNavigate } from "react-router-dom";
import {
    isTradeInCustomerCancelableStatus,
    isTradeInWaitingStatus,
    normalizeTradeInStatus,
} from "@/utils/tradeInWorkflow";
import { useCustomerTradeInOrderDetail } from "@/hooks/queries/useTradeInOrder";
import { useVariant } from "@/hooks/queries/useVariant";
import { useProductDetail } from "@/hooks/queries";

interface TradeInOrderCardProps {
    order: TradeInOrderListItem & { productVariant?: { sku: string }; orderItem?: { itemName: string } };
    onChatClick: (id: string) => void;
    onCancelRequest: (id: string, reason: string) => void;
    onRetryPaymentRequest: (id: string) => void;
    isCreatingChat: boolean;
    isCancelling: boolean;
    isRetryingPayment: boolean;
}

export const TradeInOrderCard = memo(({
    order,
    onChatClick,
    onCancelRequest,
    onRetryPaymentRequest,
    isCreatingChat,
    isCancelling,
    isRetryingPayment,
}: TradeInOrderCardProps) => {
    const navigate = useNavigate();
    const normalizedStatus = normalizeTradeInStatus(order.status);
    const isNegotiating = normalizedStatus === "NEGOTIATING";
    const isWaiting = isTradeInWaitingStatus(order.status);
    const canCancelRequest = isTradeInCustomerCancelableStatus(order.status);
    const isPendingStatus = normalizedStatus === "PENDING";
    const theme = getTradeInStatusTheme(order.status);

    const listPaymentStatus = String(order.paymentStatus || "").toLowerCase();

    const { data: pendingOrderDetail } = useCustomerTradeInOrderDetail(order.tradeInOrderId, {
        enabled: isPendingStatus && !listPaymentStatus,
    });

    const paymentStatus = listPaymentStatus || String(pendingOrderDetail?.payments?.[0]?.status || "").toLowerCase();
    const needsPaymentRetry = isPendingStatus && paymentStatus === "failed";
    const isAwaitingPayment = isWaiting && (paymentStatus === "pending" || paymentStatus === "unpaid");
    const canRetryPayment = needsPaymentRetry;

    const tradedName = order.orderItem?.itemName || `Device #${order.pOrderItemId.split('-')[0]}...`;
    const targetName = order.productVariant?.sku || `Upgrade #${order.productVariantId.split('-')[0]}...`;

    const { data: variant } = useVariant(order.productVariantId);
    const { data: product } = useProductDetail(variant?.productId || "", !!variant?.productId);

    const targetImage = (variant?.attributes?.imageUrls as string[])?.[0] ||
        (variant?.attributes?.imageUrl as string) ||
        product?.imageUrls?.[0] ||
        product?.assets?.[0]?.url;

    const handleChat = useCallback(() => onChatClick(order.tradeInOrderId), [onChatClick, order.tradeInOrderId]);
    const handleCancel = useCallback((reason: string) => onCancelRequest(order.tradeInOrderId, reason), [onCancelRequest, order.tradeInOrderId]);
    const handleRetryPayment = useCallback(() => onRetryPaymentRequest(order.tradeInOrderId), [onRetryPaymentRequest, order.tradeInOrderId]);

    return (
        <Card className="group relative rounded-2xl border-slate-200/60 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md will-change-transform">
            {/* Header Sync */}
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 bg-slate-50/30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        <Store className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                        <span className="text-sm font-bold text-slate-900">DreamGuard Store</span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{formatDate(order.createdAt)}</p>
                    </div>
                </div>
                <Badge
                    className="w-fit px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border-none shadow-sm"
                    style={{ backgroundColor: `${theme.color}10`, color: theme.color }}
                >
                    <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: theme.color }} />
                    {theme.label}
                </Badge>
            </div>

            {/* Body Sync */}
            <div className="p-6 flex flex-col md:flex-row gap-6">
                <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                        {targetImage ? (
                            <img src={targetImage} alt={targetName} className="w-full h-full object-contain" />
                        ) : (
                            <Package className="w-8 h-8 text-slate-300" />
                        )}
                    </div>
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2">
                            <h4 className="text-base font-bold text-slate-900 tracking-tight">Request ID: #{order.orderCode}</h4>

                            <div className="flex items-center gap-3 group/info">
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-800 truncate">{targetName}</p>
                                    <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                                        <ArrowLeftRight className="w-3 h-3 text-primary" />
                                        Trading in: {order.orderId ? (
                                            <button 
                                                onClick={() => navigate(`/profile?tab=orders&id=${order.orderId}`)}
                                                className="hover:text-primary hover:underline transition-colors font-bold text-slate-700 decoration-primary/30"
                                            >
                                                {tradedName}
                                            </button>
                                        ) : tradedName}
                                    </p>
                                    {needsPaymentRetry && (
                                        <Badge className="mt-2 h-5 px-2.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-black uppercase tracking-widest shadow-none">
                                            Payment Failed - Action Required
                                        </Badge>
                                    )}
                                    {!needsPaymentRetry && isAwaitingPayment && (
                                        <Badge className="mt-2 h-5 px-2.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase tracking-widest shadow-none">
                                            Pending Payment
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="sm:text-right shrink-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remaining Balance</p>
                            <p className="text-xl font-black text-primary tabular-nums tracking-tight">
                                {typeof order.amountToPay === 'number' ? formatPrice(order.amountToPay) : 'Calculating...'}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 italic">
                                Estimated Value: {typeof order.tradeInPrice === 'number' ? formatPrice(order.tradeInPrice) : 'TBD'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Sync */}
            <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[11px] text-slate-500 font-medium leading-tight">
                        Review valuation logs and communicate with our assessment team.
                    </p>
                    <button
                        className="text-[10px] font-black text-[#4988c4] uppercase tracking-widest flex items-center gap-1.5 hover:underline w-fit mt-1"
                        onClick={handleChat}
                    >
                        <ShieldCheck className="w-3 h-3" />
                        Expert Advice
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    {canRetryPayment && (
                        <Button
                            type="button"
                            onClick={handleRetryPayment}
                            disabled={isRetryingPayment}
                            className="h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-wider bg-primary text-white hover:bg-primary/90 shadow-sm transition-all border-none"
                        >
                            {isRetryingPayment ? "Processing..." : "Pay Again"}
                        </Button>
                    )}

                    {canCancelRequest && (
                        <CancelTradeInDialog
                            onConfirm={handleCancel}
                            isLoading={isCancelling}
                        />
                    )}

                    <TradeInOrderDetailDialog
                        tradeInOrderId={order.tradeInOrderId}
                        orderCode={order.orderCode}
                        trigger={
                            <Button
                                variant="outline"
                                className="h-9 px-4 rounded-lg text-xs font-bold uppercase tracking-wider border-slate-200 hover:bg-white transition-all shadow-sm"
                            >
                                Details
                            </Button>
                        }
                    />

                    {isNegotiating && (
                        <Button
                            onClick={handleChat}
                            disabled={isCreatingChat}
                            className="h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-wider bg-primary text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                        >
                            {isCreatingChat ? (
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                                    Discuss
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
});

TradeInOrderCard.displayName = "TradeInOrderCard";

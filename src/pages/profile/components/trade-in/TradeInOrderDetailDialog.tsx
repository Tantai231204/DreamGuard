import React from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, ShieldCheck, XCircle, Package } from "lucide-react";
import { useCustomerTradeInOrderDetail } from "@/hooks/queries/useTradeInOrder";
import tradeInOrderService from "@/api/services/tradeInOrderService";
import { normalizeTradeInStatus } from "@/utils/tradeInWorkflow";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TradeInOrderDetailSkeleton, OrderDetailSkeleton } from "@/components/common/Skeletons";
import { getTradeInStatusTheme, getStatusTheme } from "../../constants";
import { useOrderDetail } from "@/hooks/queries/useOrder";
import { motion, AnimatePresence } from "framer-motion";

// Sub-components
import { TradeInStepProgress } from "./components/TradeInStepProgress";
import { TradeInExchangeSection } from "./components/TradeInExchangeSection";
import { TradeInAssessmentSection } from "./components/TradeInAssessmentSection";
import { TradeInFulfilmentSection } from "./components/TradeInFulfilmentSection";
import { TradeInPersonnelSection } from "./components/TradeInPersonnelSection";
import { TradeInSettlementManifest } from "./components/TradeInSettlementManifest";
import { TradeInImmersiveGallery } from "./components/TradeInImmersiveGallery";

import {
    OrderItemRow,
    OrderStepFlow,
    AddressSection,
    PaymentDetailsCard,
    ShipperInfoSection
} from "../orders/components";
import { useChatStore } from "@/store/useChatStore";

interface TradeInOrderDetailDialogProps {
    tradeInOrderId: string;
    orderCode: string;
    trigger: React.ReactNode;
}

const SourceOrderDetailPane = ({ orderId, onClose }: { orderId: string; onClose: () => void }) => {
    const { data: order, isPending } = useOrderDetail(orderId);
    const theme = React.useMemo(() => order ? getStatusTheme(order.status) : getStatusTheme("Pending"), [order]);
    const isCancelled = theme.label.toLowerCase().includes("cancel");

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col bg-white border-l border-gray-100 min-w-0 h-full overflow-hidden"
        >
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100" onClick={onClose}>
                        <ChevronRight className="w-4 h-4 rotate-180 text-gray-500" />
                    </Button>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Source Order Detail</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{order?.orderCode || "..."}</p>
                    </div>
                </div>
                {order && (
                    <div className="px-3 py-1 rounded-full text-[9px] font-bold text-white uppercase tracking-widest shadow-sm" style={{ backgroundColor: theme.color }}>
                        {theme.label}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-0">
                {isPending ? (
                    <OrderDetailSkeleton />
                ) : order ? (
                    <div className="space-y-4 pb-10">
                        <OrderStepFlow step={theme.step} color={theme.color} isCancelled={isCancelled} />
                        <ShipperInfoSection
                            staffName={order.shippingStaffName}
                            shippingStatus={order.shippingStatus}
                            avatarUrl={order.shippingStaffAvatarUrl}
                        />
                        <AddressSection order={order} />

                        <div className="bg-white border-y border-gray-100">
                            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2.5">
                                <Package className="w-4 h-4 text-gray-400" />
                                <span className="text-[12px] font-black text-gray-800 uppercase tracking-widest">Inbound Order Items</span>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {order.items?.map((item) => (
                                    <OrderItemRow key={item.id} item={item} orderStatus={order.status} orderId={order.id} />
                                ))}
                            </div>
                        </div>

                        <div className="px-6 pb-6">
                            <PaymentDetailsCard
                                orderCode={order.orderCode}
                                fallbackPayment={{
                                    id: order.orderCode,
                                    orderCode: order.orderCode,
                                    paymentMethod: order.paymentMethod || "COD",
                                    paymentType: "Purchase",
                                    status: order.paymentStatus || "Pending",
                                    amount: order.totalAmount,
                                    createdAt: order.createdAt,
                                }}
                                className="mx-0 shadow-none border-gray-100 bg-white"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <XCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Order Sync Interrupted</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export const TradeInOrderDetailDialog = ({ tradeInOrderId, orderCode, trigger }: TradeInOrderDetailDialogProps) => {
    const [open, setOpen] = React.useState(false);

    // Data Fetching
    const { data: order, isLoading } = useCustomerTradeInOrderDetail(tradeInOrderId, { enabled: open });

    // State
    const [previewIndex, setPreviewIndex] = React.useState<number | null>(null);
    const [isRetryingPayment, setIsRetryingPayment] = React.useState(false);
    const [isRetryPaymentConfirmOpen, setIsRetryPaymentConfirmOpen] = React.useState(false);
    const [isSourceOrderOpen, setIsSourceOrderOpen] = React.useState(false);
    const [targetSourceOrderId, setTargetSourceOrderId] = React.useState<string | null>(null);
    const { openChat } = useChatStore();
    const [isJoiningChat, setIsJoiningChat] = React.useState(false);

    // Derived State
    const statusTheme = React.useMemo(() => (order ? getTradeInStatusTheme(order.status) : null), [order]);
    const latestPaymentStatus = React.useMemo(
        () => String(order?.payments?.[0]?.status || "").toLowerCase(),
        [order?.payments],
    );
    const needsPaymentRetry = React.useMemo(
        () => Boolean(order && normalizeTradeInStatus(order.status) === "PENDING" && latestPaymentStatus === "failed"),
        [latestPaymentStatus, order],
    );

    const [isCancelling, setIsCancelling] = React.useState(false);
    const [isCancelConfirmOpen, setIsCancelConfirmOpen] = React.useState(false);

    const canCancel = React.useMemo(() => {
        if (!order) return false;
        const normalizedStatus = normalizeTradeInStatus(order.status);
        
        // Base cancelable statuses (Waiting, Pending, Negotiating)
        const isBaseCancelable = ["WAITING_FOR_STAFF", "PENDING", "NEGOTIATING"].includes(normalizedStatus);
        if (isBaseCancelable) return true;
        
        // Special case for CONFIRMED: Only if task is not yet assigned or in pending state
        if (normalizedStatus === 'CONFIRMED') {
            const taskStatus = order.shippingTaskStatus?.toUpperCase();
            return !taskStatus || taskStatus === 'PENDING';
        }
        
        return false;
    }, [order]);



    const allImages = React.useMemo(() => {
        if (!order) return [];
        const imgs: string[] = [];
        if (order.oldProductVariantUrl) imgs.push(order.oldProductVariantUrl);
        if (order.newProductVariantUrl) imgs.push(order.newProductVariantUrl);
        if (order.tradeInImages) {
            order.tradeInImages.forEach((img) => imgs.push(img.imageUrl));
        }
        return imgs;
    }, [order]);

    // Handlers
    const handleRetryPayment = React.useCallback(async () => {
        if (!order?.tradeInOrderId || isRetryingPayment) return;
        try {
            setIsRetryingPayment(true);
            const response = await tradeInOrderService.reOrderFailedTradeInOrder(order.tradeInOrderId);
            const paymentUrl = typeof response?.paymentUrl === "string" ? response.paymentUrl.trim() : "";
            if (!paymentUrl) {
                toast.warning("Unable to create payment link.");
                return;
            }
            window.location.assign(paymentUrl);
        } catch {
            toast.error("Cannot retry payment.");
        } finally {
            setIsRetryingPayment(false);
        }
    }, [isRetryingPayment, order]);

    const handleConfirmRetryPayment = React.useCallback(() => {
        setIsRetryPaymentConfirmOpen(false);
        void handleRetryPayment();
    }, [handleRetryPayment]);

    const handleTraceLink = React.useCallback((orderId: string) => {
        setTargetSourceOrderId(orderId);
        setIsSourceOrderOpen(true);
    }, []);

    const handleCloseSourceOrder = React.useCallback(() => {
        setIsSourceOrderOpen(false);
    }, []);

    const handleChatClick = React.useCallback(async () => {
        if (!order?.tradeInOrderId || isJoiningChat) return;
        try {
            setIsJoiningChat(true);
            const conversationId = await tradeInOrderService.getTradeInConversationId(order.tradeInOrderId);
            if (conversationId) {
                const isLocked = normalizeTradeInStatus(order.status) !== "NEGOTIATING";
                openChat(conversationId, isLocked);
                toast.success("Connected to trade-in support.");
            } else {
                toast.info("Support chat is not active yet.");
            }
        } catch {
            toast.error("Could not connect to support.");
        } finally {
            setIsJoiningChat(false);
        }
    }, [order, openChat, isJoiningChat]);

    const handleCancelDeal = React.useCallback(async () => {
        if (!order?.tradeInOrderId || isCancelling) return;
        try {
            setIsCancelling(true);
            const res = await tradeInOrderService.cancelDeal(order.tradeInOrderId, "Cancelled by user");
            if (res.success) {
                toast.success("Trade-in request cancelled successfully.");
                setOpen(false);
                // Optionally refresh queries here, but setOpen(false) is fine for now
            } else {
                toast.error(res.message || "Failed to cancel request.");
            }
        } catch {
            toast.error("An error occurred while cancelling.");
        } finally {
            setIsCancelling(false);
            setIsCancelConfirmOpen(false);
        }
    }, [isCancelling, order]);

    return (
        <>
            <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) handleCloseSourceOrder(); }}>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogContent
                    className={cn(
                        "h-[92vh] max-h-[92vh] overflow-hidden flex flex-row p-0 rounded-2xl border-none shadow-2xl bg-gray-50 transition-all duration-500 ease-in-out",
                        isSourceOrderOpen ? "max-w-6xl" : "max-w-3xl"
                    )}
                >
                    <div className={cn(
                        "flex flex-col h-full bg-gray-50 transition-all duration-500 overflow-hidden",
                        isSourceOrderOpen ? "w-[45%] border-r border-gray-100" : "w-full"
                    )}>
                        <div className="bg-white border-b border-gray-100 pl-6 pr-12 py-4 flex items-center justify-between shrink-0 relative">
                            <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-gray-100" onClick={() => setOpen(false)}>
                                    <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
                                </Button>
                                <div className="text-left">
                                    <DialogTitle className="text-[16px] font-black text-gray-900 uppercase tracking-tight">Trade-In Journey</DialogTitle>
                                    <DialogDescription className="sr-only">Detailed overview of your trade-in request progress.</DialogDescription>
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">ID: {orderCode}</div>
                                </div>
                            </DialogHeader>
                            {order && statusTheme && (
                                <div className="flex items-center gap-2">
                                    <div className="px-4 py-1.5 rounded-full text-[11px] font-bold text-white uppercase tracking-widest shadow-sm" style={{ backgroundColor: statusTheme.color }}>
                                        {statusTheme.label}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto scroll-smooth">
                            {isLoading ? (
                                <TradeInOrderDetailSkeleton />
                            ) : order ? (
                                <div className="space-y-3">
                                    <TradeInStepProgress status={order.status} />
                                    <TradeInExchangeSection order={order} onPreview={setPreviewIndex} onTraceLink={handleTraceLink} />
                                    <TradeInAssessmentSection order={order} />
                                    <TradeInPersonnelSection order={order} />
                                    <TradeInFulfilmentSection order={order} />
                                    <TradeInSettlementManifest
                                        order={order}
                                        orderCode={orderCode}
                                        needsPaymentRetry={needsPaymentRetry}
                                        isRetryingPayment={isRetryingPayment}
                                        onRetryPayment={() => setIsRetryPaymentConfirmOpen(true)}
                                    />
                                </div>
                            ) : (
                                <div className="py-32 text-center bg-white">
                                    <XCircle className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                                    <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Record Not Synchronized</p>
                                </div>
                            )}
                        </div>

                        <div className="p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">
                                    {normalizeTradeInStatus(order?.status) === "CONFIRMED" ? "Logistics verified" : "Need assistance?"}
                                </span>
                                <button 
                                    className={cn(
                                        "text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all",
                                        isJoiningChat ? "opacity-50 cursor-wait" : "text-[#4988c4] hover:underline"
                                    )} 
                                    disabled={isJoiningChat}
                                    onClick={handleChatClick}
                                >
                                    <ShieldCheck className={cn("w-3.5 h-3.5", "text-[#4988c4]")} />
                                    {normalizeTradeInStatus(order?.status) === "NEGOTIATING" ? "Live Chat Support" : "View Chat History"}
                                </button>
                            </div>

                            {canCancel && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="rounded-xl border-rose-100 bg-rose-50/30 text-rose-600 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm px-6 h-9"
                                    onClick={() => setIsCancelConfirmOpen(true)}
                                    disabled={isCancelling}
                                >
                                    Cancel Request
                                </Button>
                            )}
                            {!canCancel && (
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:block text-right">Verified by DreamGuard Logistics</p>
                            )}
                        </div>
                    </div>

                    <AnimatePresence>
                        {isSourceOrderOpen && targetSourceOrderId && (
                            <SourceOrderDetailPane
                                orderId={targetSourceOrderId}
                                onClose={handleCloseSourceOrder}
                            />
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={isRetryPaymentConfirmOpen}
                onOpenChange={setIsRetryPaymentConfirmOpen}
                title={`Retry payment for #${orderCode}?`}
                description="A new secure payment link will be generated. Continue?"
                confirmText="Pay Again"
                cancelText="Not now"
                onConfirm={handleConfirmRetryPayment}
                variant="primary"
                isLoading={isRetryingPayment}
            />

            <ConfirmDialog
                open={isCancelConfirmOpen}
                onOpenChange={setIsCancelConfirmOpen}
                title="Cancel Trade-In Request?"
                description="Are you sure you want to terminate this trade-in request? This action cannot be undone."
                confirmText="Yes, Cancel Request"
                cancelText="No, Keep It"
                onConfirm={handleCancelDeal}
                variant="danger"
                isLoading={isCancelling}
            />

            <TradeInImmersiveGallery
                previewIndex={previewIndex}
                allImages={allImages}
                onClose={() => setPreviewIndex(null)}
                onPrev={(e) => { e.stopPropagation(); if (previewIndex !== null && previewIndex > 0) setPreviewIndex(previewIndex - 1); }}
                onNext={(e) => { e.stopPropagation(); if (previewIndex !== null && previewIndex < allImages.length - 1) setPreviewIndex(previewIndex + 1); }}
            />
        </>
    );
};

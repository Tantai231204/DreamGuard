import { useCallback, useEffect, useState } from "react";
import {
    useCustomerTradeInOrders,
    useReOrderFailedTradeInOrder,
    tradeInOrderKeys,
} from "@/hooks/queries/useTradeInOrder";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import tradeInOrderService from "@/api/services/tradeInOrderService";
import { useChatStore } from "@/store/useChatStore";
import { OrderSkeleton } from "./orders/OrderSkeleton";
import { useNavigate } from "react-router-dom";
import { AppRoute } from "@/lib/constants";
import { TradeInOrderCard } from "./trade-in/TradeInOrderCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const TRADE_IN_PAGE_SIZE = 6;

export const TradeInOrdersTab = () => {
    const [pageNumber, setPageNumber] = useState(1);
    const { data, isLoading, isFetching } = useCustomerTradeInOrders({
        pageNumber,
        pageSize: TRADE_IN_PAGE_SIZE,
    });
    const queryClient = useQueryClient();
    const [isCreatingChat, setIsCreatingChat] = useState<string | null>(null);
    const [retryingPaymentOrderId, setRetryingPaymentOrderId] = useState<string | null>(null);
    const [retryConfirmOrderId, setRetryConfirmOrderId] = useState<string | null>(null);
    const { openChat } = useChatStore();
    const navigate = useNavigate();
    const reOrderFailedTradeInMutation = useReOrderFailedTradeInOrder();

    const { mutate: cancelRequest, isPending: isCancelling } = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => tradeInOrderService.cancelDeal(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tradeInOrderKeys.all });
            toast.success("Request cancelled successfully.");
        },
        onError: () => {
            toast.error("Failed to cancel request. It may have been processed by staff.");
        }
    });

    const handleChatClick = useCallback(async (orderId: string) => {
        try {
            setIsCreatingChat(orderId);
            const conversationId = await tradeInOrderService.getTradeInConversationId(orderId);

            if (conversationId) {
                openChat(conversationId);
                toast.success("Connected to trade-in support.");
            } else {
                toast.info("Chat chưa sẵn sàng", {
                    description: "Staff chưa tạo hội thoại cho yêu cầu này. Vui lòng quay lại sau."
                });
            }
        } catch (error) {
            toast.error("Could not join chat. Please try again later.");
            console.error(error);
        } finally {
            setIsCreatingChat(null);
        }
    }, [openChat]);

    const handleCancelRequest = useCallback((id: string, reason: string) => {
        cancelRequest({ id, reason });
    }, [cancelRequest]);

    const handleRetryPayment = useCallback(async (tradeInOrderId: string) => {
        if (!tradeInOrderId) return;

        try {
            setRetryingPaymentOrderId(tradeInOrderId);
            const response = await reOrderFailedTradeInMutation.mutateAsync(tradeInOrderId);
            const paymentUrl = typeof response?.paymentUrl === "string" ? response.paymentUrl.trim() : "";

            if (paymentUrl) {
                window.location.assign(paymentUrl);
                return;
            }

            toast.warning("Unable to create payment link.", {
                description: "Please try again in a moment.",
            });
        } catch (error) {
            const description = error instanceof Error ? error.message : "Retry payment failed.";
            toast.error("Cannot retry payment.", { description });
        } finally {
            setRetryingPaymentOrderId(null);
        }
    }, [reOrderFailedTradeInMutation]);

    const requestRetryPayment = useCallback((tradeInOrderId: string) => {
        if (!tradeInOrderId || reOrderFailedTradeInMutation.isPending) return;
        setRetryConfirmOrderId(tradeInOrderId);
    }, [reOrderFailedTradeInMutation.isPending]);

    const handleConfirmRetryPayment = useCallback(async () => {
        if (!retryConfirmOrderId) return;

        const targetOrderId = retryConfirmOrderId;
        setRetryConfirmOrderId(null);
        await handleRetryPayment(targetOrderId);
    }, [handleRetryPayment, retryConfirmOrderId]);

    useEffect(() => {
        const totalPages = data?.totalPages ?? 1;
        if (totalPages > 0 && pageNumber > totalPages) {
            setPageNumber(totalPages);
        }
    }, [data?.totalPages, pageNumber]);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Header count={0} />
                <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => <OrderSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    const orders = data?.items || [];
    const totalCount = data?.totalCount ?? orders.length;
    const totalPages = Math.max(1, data?.totalPages ?? 1);
    const hasPreviousPage = data?.hasPreviousPage ?? pageNumber > 1;
    const hasNextPage = data?.hasNextPage ?? pageNumber < totalPages;
    const retryConfirmOrder = orders.find((order) => order.tradeInOrderId === retryConfirmOrderId) || null;

    if (totalCount === 0) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Header count={0} />
                <EmptyState onStart={() => navigate(AppRoute.PRODUCTS)} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <Header count={totalCount} />

            <div className="grid gap-6">
                {orders.map((order) => (
                    <TradeInOrderCard
                        key={order.tradeInOrderId}
                        order={order}
                        onChatClick={handleChatClick}
                        onCancelRequest={handleCancelRequest}
                        onRetryPaymentRequest={requestRetryPayment}
                        isCreatingChat={isCreatingChat === order.tradeInOrderId}
                        isCancelling={isCancelling}
                        isRetryingPayment={retryingPaymentOrderId === order.tradeInOrderId && reOrderFailedTradeInMutation.isPending}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <TradeInPagination
                    pageNumber={pageNumber}
                    totalPages={totalPages}
                    hasPreviousPage={hasPreviousPage}
                    hasNextPage={hasNextPage}
                    isDisabled={isFetching}
                    onPrevious={() => setPageNumber((prev) => Math.max(1, prev - 1))}
                    onNext={() => setPageNumber((prev) => Math.min(totalPages, prev + 1))}
                />
            )}

            <ConfirmDialog
                open={Boolean(retryConfirmOrderId)}
                onOpenChange={(open) => {
                    if (!open) setRetryConfirmOrderId(null);
                }}
                title={retryConfirmOrder ? `Retry payment for #${retryConfirmOrder.orderCode}?` : "Retry failed payment?"}
                description="A new secure payment link will be created for this pending trade-in request. Continue with **Pay Again** now?"
                confirmText="Pay Again"
                cancelText="Not now"
                onConfirm={handleConfirmRetryPayment}
                variant="primary"
                isLoading={Boolean(retryingPaymentOrderId)}
            />
        </div>
    );
};

const Header = ({ count }: { count: number }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Trade-In History</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium italic">Monitor and manage your premium device upgrade requests.</p>
        </div>
        <Badge variant="outline" className="px-4 py-2 rounded-xl bg-slate-50 text-slate-700 border-slate-200 font-bold uppercase text-[10px] tracking-widest">
            {count} Total Requests
        </Badge>
    </div>
);

const TradeInPagination = ({
    pageNumber,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    isDisabled,
    onPrevious,
    onNext,
}: {
    pageNumber: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    isDisabled: boolean;
    onPrevious: () => void;
    onNext: () => void;
}) => (
    <div className="flex items-center justify-between border-t border-slate-100 pt-6">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Page {pageNumber} of {totalPages}
        </p>

        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onPrevious}
                disabled={!hasPreviousPage || isDisabled}
                className="h-9 px-4 rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider"
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
            </Button>

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onNext}
                disabled={!hasNextPage || isDisabled}
                className="h-9 px-4 rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider"
            >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
    </div>
);

const EmptyState = ({ onStart }: { onStart: () => void }) => (
    <Card className="py-24 text-center bg-slate-50/10 border-dashed border-2 border-slate-200 rounded-[2.5rem] flex flex-col items-center shadow-sm">
        <div className="w-20 h-20 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center mb-8 border border-slate-50">
            <ArrowLeftRight className="h-10 w-10 text-slate-200" />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Your upgrade journey awaits</h3>
        <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto mt-3 leading-relaxed">
            You haven't placed any trade-in requests yet. Upgrade your equipment today for a superior experience.
        </p>
        <Button
            onClick={onStart}
            className="group/btn relative mt-10 h-12 px-12 rounded-xl text-[11px] font-black uppercase tracking-[0.25em] bg-primary text-white shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
            <span className="relative z-10">Start Trade-In Now</span>
        </Button>
    </Card>
);

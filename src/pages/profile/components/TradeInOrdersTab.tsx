import { useCallback, useState } from "react";
import { useCustomerTradeInOrders, tradeInOrderKeys } from "@/hooks/queries/useTradeInOrder";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight } from "lucide-react";
import { toast } from "sonner";
import tradeInOrderService from "@/api/services/tradeInOrderService";
import { useChatStore } from "@/store/useChatStore";
import { OrderSkeleton } from "./orders/OrderSkeleton";
import { useNavigate } from "react-router-dom";
import { AppRoute } from "@/lib/constants";
import { TradeInOrderCard } from "./trade-in/TradeInOrderCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const TradeInOrdersTab = () => {
    const { data, isLoading } = useCustomerTradeInOrders();
    const queryClient = useQueryClient();
    const [isCreatingChat, setIsCreatingChat] = useState<string | null>(null);
    const { openChat } = useChatStore();
    const navigate = useNavigate();

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

    if (orders.length === 0) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Header count={0} />
                <EmptyState onStart={() => navigate(AppRoute.PRODUCTS)} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <Header count={orders.length} />
            <div className="grid gap-6">
                {orders.map((order) => (
                    <TradeInOrderCard
                        key={order.tradeInOrderId}
                        order={order}
                        onChatClick={handleChatClick}
                        onCancelRequest={handleCancelRequest}
                        isCreatingChat={isCreatingChat === order.tradeInOrderId}
                        isCancelling={isCancelling}
                    />
                ))}
            </div>
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

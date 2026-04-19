import React from "react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    ArrowLeftRight,
    ShieldCheck,
    XCircle,
    Info,
    User,
    ChevronLeft,
    ChevronRight,
    Package,
    Box,
    Truck
} from "lucide-react";
import { formatPrice, formatDate } from "../../utils";
import { getTradeInStatusTheme } from "../../constants";
import { useCustomerTradeInOrderDetail } from "@/hooks/queries/useTradeInOrder";
import { PaymentDetailsCard } from "../orders/components/PaymentDetailsCard";
import tradeInOrderService from "@/api/services/tradeInOrderService";
import { normalizeTradeInStatus } from "@/utils/tradeInWorkflow";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useNavigate } from "react-router-dom";

interface TradeInOrderDetailDialogProps {
    tradeInOrderId: string;
    orderCode: string;
    trigger: React.ReactNode;
}

export const TradeInOrderDetailDialog = ({ tradeInOrderId, orderCode, trigger }: TradeInOrderDetailDialogProps) => {
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();
    const { data: order, isLoading } = useCustomerTradeInOrderDetail(tradeInOrderId, { enabled: open });

    const targetProductImage = order?.newProductVariantUrl;
    const sourceProductImage = order?.oldProductVariantUrl;

    const [previewIndex, setPreviewIndex] = React.useState<number | null>(null);
    const [isRetryingPayment, setIsRetryingPayment] = React.useState(false);
    const [isRetryPaymentConfirmOpen, setIsRetryPaymentConfirmOpen] = React.useState(false);
    const statusTheme = React.useMemo(() => (order ? getTradeInStatusTheme(order.status) : null), [order]);
    const latestPaymentStatus = React.useMemo(
        () => String(order?.payments?.[0]?.status || "").toLowerCase(),
        [order?.payments],
    );
    const needsPaymentRetry = React.useMemo(
        () => Boolean(order && normalizeTradeInStatus(order.status) === "PENDING" && latestPaymentStatus === "failed"),
        [latestPaymentStatus, order],
    );

    const handleRetryPayment = React.useCallback(async () => {
        if (!order?.tradeInOrderId || isRetryingPayment) return;

        try {
            setIsRetryingPayment(true);
            const response = await tradeInOrderService.reOrderFailedTradeInOrder(order.tradeInOrderId);
            const paymentUrl = typeof response?.paymentUrl === "string" ? response.paymentUrl.trim() : "";

            if (!paymentUrl) {
                toast.warning("Unable to create payment link.", {
                    description: "Please try again in a moment.",
                });
                return;
            }

            window.location.assign(paymentUrl);
        } catch (error) {
            const description = error instanceof Error ? error.message : "Retry payment failed.";
            toast.error("Cannot retry payment.", { description });
        } finally {
            setIsRetryingPayment(false);
        }
    }, [isRetryingPayment, order?.tradeInOrderId]);

    const handleConfirmRetryPayment = React.useCallback(() => {
        setIsRetryPaymentConfirmOpen(false);
        void handleRetryPayment();
    }, [handleRetryPayment]);

    const allImages = React.useMemo(() => {
        if (!order) return [];
        const imgs: string[] = [];
        if (sourceProductImage) imgs.push(sourceProductImage);
        if (targetProductImage) imgs.push(targetProductImage);
        if (order.tradeInImages) {
            order.tradeInImages.forEach(img => imgs.push(img.imageUrl));
        }
        return imgs;
    }, [order, sourceProductImage, targetProductImage]);

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (previewIndex !== null && previewIndex > 0) setPreviewIndex(previewIndex - 1);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (previewIndex !== null && previewIndex < allImages.length - 1) setPreviewIndex(previewIndex + 1);
    };

    const handleTraceLink = React.useCallback((orderId: string) => {
        setOpen(false);
        // Delay navigation slightly to allow dialog closure to begin smoothly
        setTimeout(() => {
            navigate(`/profile?tab=orders&id=${orderId}`);
        }, 10);
    }, [navigate]);

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0 rounded-xl border-none shadow-2xl bg-gray-50">
                    {/* Header - Aligned with OrderDetailDialog */}
                    <div className="bg-white border-b border-gray-100 pl-6 pr-12 py-4 flex items-center justify-between shrink-0 relative">
                        <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-gray-100" onClick={() => setOpen(false)}>
                                <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
                            </Button>
                            <div className="text-left">
                                <DialogTitle className="text-[16px] font-black text-gray-900 uppercase tracking-tight">Trade-In Journey</DialogTitle>
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                                    ID: {orderCode}
                                </div>
                            </div>
                        </DialogHeader>
                        {order && statusTheme && (
                            <div
                                className="px-4 py-1.5 rounded-full text-[11px] font-bold text-white uppercase tracking-widest shadow-sm"
                                style={{ backgroundColor: statusTheme.color }}
                            >
                                {statusTheme.label}
                            </div>
                        )}
                    </div>

                    {/* Progress Flow - Synchronized with Order History UI */}
                    <div className="bg-white px-6 py-12 border-b border-gray-100/80">
                        <div className="flex items-center relative max-w-2xl mx-auto px-4">
                            {[
                                { label: 'Pending', icon: Box },
                                { label: 'Logistic', icon: Truck },
                                { label: 'Analyze', icon: ShieldCheck },
                                { label: 'Settle', icon: ArrowLeftRight }
                            ].map((step, idx, arr) => {
                                const stepTheme = order ? getTradeInStatusTheme(order.status) : null;
                                const apiStep = stepTheme?.step ?? 0;
                                
                                let currentStepIdx = 0;
                                if (apiStep >= 5) currentStepIdx = 3;
                                else if (apiStep >= 4) currentStepIdx = 2;
                                else if (apiStep >= 2) currentStepIdx = 1;
                                else currentStepIdx = 0;

                                const isCancelled = order?.status.toString().toUpperCase().includes("CANCEL");
                                const isActive = !isCancelled && (idx <= currentStepIdx || (order?.status === 'Completed'));
                                const isCurrent = !isCancelled && idx === currentStepIdx && order?.status !== 'Completed';
                                const isFailed = isCancelled && idx <= currentStepIdx;
                                const activeColor = isFailed ? "#e11d48" : (stepTheme?.color || "#4988c4");

                                return (
                                    <React.Fragment key={idx}>
                                        <div className="flex flex-col items-center relative z-10 transition-all">
                                            <div 
                                                className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-700 bg-white shadow-sm",
                                                    isActive || isFailed ? "" : "border-gray-100 text-gray-200"
                                                )}
                                                style={{ 
                                                    borderColor: (isActive || isFailed) ? activeColor : undefined,
                                                    color: (isActive || isFailed) ? activeColor : undefined,
                                                    boxShadow: isCurrent ? `0 0 0 4px ${activeColor}20` : undefined
                                                }}
                                            >
                                                {isFailed && idx === currentStepIdx ? (
                                                    <XCircle className="w-6 h-6 animate-pulse" />
                                                ) : (
                                                    <step.icon className={cn("w-5 h-5", isCurrent && "animate-pulse")} />
                                                )}

                                                {/* Label - Absolute to not push the circles */}
                                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                                                    <span className={cn(
                                                        "text-[10px] font-bold uppercase tracking-wider",
                                                        isFailed ? "text-rose-600" :
                                                        isActive ? "text-gray-900" :
                                                        "text-gray-400"
                                                    )}>
                                                        {isFailed && idx === currentStepIdx ? "Terminated" : step.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Line */}
                                        {idx < arr.length - 1 && (
                                            <div className="flex-1 h-[2px] bg-gray-100 mx-1 relative">
                                                <div 
                                                    className="absolute inset-y-0 left-0 transition-all duration-1000 ease-out" 
                                                    style={{ 
                                                        width: (currentStepIdx > idx) || (order?.status === 'Completed') ? "100%" : "0%",
                                                        backgroundColor: activeColor
                                                    }} 
                                                />
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                        <div className="h-4" /> {/* Spacer for absolute labels */}
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-40 gap-4 bg-white">
                                <div className="w-7 h-7 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
                                <p className="text-[12px] font-bold text-gray-400 tracking-wider uppercase">Loading secure details...</p>
                            </div>
                        ) : order ? (
                            <div className="space-y-3">
                                {/* Strategic Exchange Program - Preserved as requested */}
                                <div className="bg-white">
                                    <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <Truck className="w-4 h-4 text-gray-500" />
                                            <span className="text-[14px] font-bold text-gray-800 tracking-tight">Strategic Exchange Program</span>
                                        </div>
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none text-[10px] font-black uppercase px-2 h-5">Verified Upgrade</Badge>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex flex-col sm:flex-row items-stretch gap-4 relative">
                                            {/* Source Device */}
                                            <div className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-100/60 shadow-sm relative group/card">
                                                <div className="space-y-4">
                                                    <div className="flex gap-4">
                                                        <div 
                                                            className={cn(
                                                                "w-16 h-16 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 shadow-sm p-1 transition-all",
                                                                !order.orderId && "cursor-zoom-in group/img"
                                                            )}
                                                            onClick={() => {
                                                                if (!order.orderId) {
                                                                    setPreviewIndex(0);
                                                                }
                                                            }}
                                                        >
                                                            {sourceProductImage ? (
                                                                <img
                                                                    src={sourceProductImage}
                                                                    className="w-full h-full object-contain rounded-md"
                                                                    alt="Source"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300 rounded-md">
                                                                    <Package className="w-8 h-8 stroke-[1.5]" />
                                                                </div>
                                                            )}
                                                            {order.orderId && (
                                                                <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                                            )}
                                                        </div>
                                                        <div className="space-y-1 flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Inbound</p>
                                                                {order.orderId && (
                                                                    <span className="text-[7px] font-black text-primary bg-primary/5 px-1 py-0.5 rounded uppercase tracking-tighter">Traceable</span>
                                                                )}
                                                            </div>
                                                            <p className="text-[13px] font-bold text-slate-900 leading-tight truncate">{order.orderItem?.itemName}</p>
                                                            
                                                            {order.orderId ? (
                                                                <div className="flex flex-col gap-1.5 pt-0.5">
                                                                    <button 
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleTraceLink(order.orderId!);
                                                                        }}
                                                                        className="group/btn flex items-center gap-1.5 w-fit relative z-20 cursor-pointer"
                                                                    >
                                                                        <Package className="w-3 h-3 text-[#4988c4] transition-transform group-hover/btn:-translate-y-0.5" />
                                                                        <span className="text-[10px] font-black text-[#4988c4] uppercase tracking-wider border-b-2 border-[#4988c4]/30 group-hover:border-[#4988c4] transition-all pb-0.5">
                                                                            Source Order
                                                                        </span>
                                                                    </button>
                                                                    <span className="inline-block w-fit text-[8px] font-black uppercase text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded leading-none">Pre-owned</span>
                                                                </div>
                                                            ) : (
                                                                <span className="inline-block text-[8px] font-black uppercase text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded leading-none">Pre-owned</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Condition Images */}
                                                    {order.tradeInImages && order.tradeInImages.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-200/40">
                                                            {order.tradeInImages.map((img, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="w-10 h-10 rounded-md overflow-hidden border border-slate-200 bg-white shadow-xs flex-shrink-0 transition-all hover:border-primary/40 cursor-zoom-in relative group/img"
                                                                    onClick={() => {
                                                                        const baseOffset = ((order.orderItem as { image?: string })?.image ? 1 : 0) + (targetProductImage ? 1 : 0);
                                                                        setPreviewIndex(baseOffset + idx);
                                                                    }}
                                                                >
                                                                    <img src={img.imageUrl} alt={`Condition ${idx}`} className="w-full h-full object-cover" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-center py-1 sm:py-0">
                                                <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm relative z-10 text-primary">
                                                    <ArrowLeftRight className="w-4 h-4" />
                                                </div>
                                            </div>

                                            {/* Upgrade Target */}
                                            <div className="flex-1 p-4 rounded-xl bg-blue-50/10 border border-blue-100 shadow-sm group/card text-left">
                                                <div className="space-y-4">
                                                    <div className="flex gap-4">
                                                        <div className="w-16 h-16 rounded-lg bg-white border border-blue-50 overflow-hidden shrink-0 shadow-sm p-1">
                                                            {targetProductImage ? (
                                                                <img
                                                                    src={targetProductImage}
                                                                    className="w-full h-full object-contain rounded-md cursor-zoom-in"
                                                                    alt="Target"
                                                                    onClick={() => {
                                                                        const sourceOffset = (order.orderItem as { image?: string })?.image ? 1 : 0;
                                                                        setPreviewIndex(sourceOffset);
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-white text-primary/10 rounded-md">
                                                                    <Box className="w-8 h-8 stroke-[1.5]" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1 flex-1 min-w-0">
                                                            <p className="text-[9px] font-black text-primary uppercase tracking-widest leading-none">Upgrade</p>
                                                            <p className="text-[13px] font-bold text-slate-900 leading-tight truncate">{order.productVariant?.sku}</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {order.productVariant?.size && (
                                                                    <span className="text-[8px] font-bold uppercase text-slate-500 bg-white border border-slate-100 px-1 py-0.5 rounded leading-none">{order.productVariant?.size}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-blue-50">
                                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-tighter bg-white/50 p-1 rounded-md border border-blue-50">
                                                            SEC VERIFIED
                                                        </div>
                                                        <div className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter bg-emerald-50 p-1 rounded-md border border-emerald-100">
                                                            AUTHENTIC
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Assessment Section */}
                                <div className="bg-white p-6 space-y-4">
                                    <div className="flex items-center gap-2.5">
                                        <ShieldCheck className="w-4 h-4 text-gray-500" />
                                        <span className="text-[14px] font-bold text-gray-800 tracking-tight uppercase">Assessment & Log</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3.5 rounded-xl border border-gray-50 bg-gray-50/30 space-y-2">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Condition State</p>
                                            <Badge className={cn(
                                                "border-none text-[10px] font-black uppercase tracking-widest px-2.5 h-6",
                                                order.isGood ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                                            )}>
                                                {order.isGood ? "Premium" : "Standard"}
                                            </Badge>
                                        </div>
                                        <div className="p-3.5 rounded-xl border border-gray-50 bg-gray-50/30 space-y-2">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Timestamp</p>
                                            <p className="text-[12px] font-bold text-gray-700 uppercase">{formatDate(order.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Info className="w-3 h-3 text-gray-400" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expert Evaluation</span>
                                        </div>
                                        <p className="text-[12px] text-gray-600 font-medium leading-relaxed italic">
                                            {order.description ? `"${order.description}"` : "No deviation notes recorded."}
                                        </p>
                                    </div>
                                </div>

                                {/* Fulfilment Details */}
                                <div className="bg-white p-6">
                                    <div className="flex items-center gap-2.5 mb-5">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span className="text-[14px] font-bold text-gray-800 tracking-tight uppercase">Fulfilment Address</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shadow-inner">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-gray-900 leading-none">{order.receiverName}</p>
                                                <p className="text-[11px] font-bold text-gray-400 mt-1.5">{order.phoneNumber}</p>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[12px] font-semibold text-gray-600 leading-relaxed border-l-2 border-gray-100 pl-4">
                                                {order.address}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Settlement Manifest - PricingSummary Style */}
                                <div className="bg-white pb-7 pt-2">
                                    <div className="px-6 py-4 flex items-center gap-2.5 text-slate-500">
                                        <ArrowLeftRight className="w-4 h-4" />
                                        <span className="text-[14px] font-bold text-gray-800 tracking-tight uppercase">Settlement Manifest</span>
                                    </div>
                                    <div className="px-6 space-y-2.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Base Acquisition</span>
                                            <span className="text-sm font-bold text-gray-900">{formatPrice(order.productVariant?.salePrice || 0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Trade-In Allowance</span>
                                            <span className="text-sm font-black text-emerald-600">-{formatPrice(order.tradeInPrice)}</span>
                                        </div>
                                        {order.depositAmount > 0 && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Retained Deposit</span>
                                                <span className="text-sm font-bold text-rose-500">-{formatPrice(order.depositAmount)}</span>
                                            </div>
                                        )}
                                        <div className="h-px bg-slate-50 border-t border-dashed border-slate-200 mt-3 mb-2" />
                                        <div className="flex justify-between items-end pt-1">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">Total Settlement</span>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest italic">Includes all verified deductions</p>
                                            </div>
                                            <span className="text-2xl font-black text-gray-900 tracking-tight tabular-nums">
                                                {formatPrice(order.amountToPay)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Banner if needed */}
                                    {needsPaymentRetry && (
                                        <div className="mx-6 mt-6 rounded-xl border border-rose-100 bg-rose-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <p className="text-[11px] font-bold text-rose-700 leading-snug">
                                                Payment failed. Retry to continue the trade-in journey.
                                            </p>
                                            <Button
                                                type="button"
                                                onClick={() => setIsRetryPaymentConfirmOpen(true)}
                                                disabled={isRetryingPayment}
                                                className="h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-wider bg-primary text-white hover:bg-primary/90"
                                            >
                                                {isRetryingPayment ? "Retrying..." : "Pay Again"}
                                            </Button>
                                        </div>
                                    )}

                                    {/* Payment Section */}
                                    <div className="mx-6 mt-6 pt-4 border-t border-slate-100/80">
                                        <PaymentDetailsCard
                                            payments={order.payments}
                                            fallbackPayment={{
                                                id: order.orderCode,
                                                orderCode: order.orderCode,
                                                paymentMethod: "VnPay",
                                                paymentType: "Purchase",
                                                status: "Pending",
                                                amount: order.amountToPay,
                                                createdAt: order.createdAt,
                                            }}
                                            className="mx-0"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-32 text-center bg-white">
                                <XCircle className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                                <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest uppercase">Record Not Synchronized</p>
                            </div>
                        )}
                    </div>

                    {/* Footer - Aligned with OrderDetailDialog */}
                    <div className="p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">Need assistance?</span>
                            <button
                                className="text-[10px] font-black text-[#4988c4] uppercase tracking-widest hover:underline flex items-center gap-1.5"
                                onClick={() => window.alert("Connecting to trade-in support...")}
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Chat with Expert Staff
                            </button>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:block">
                            Verified by DreamGuard Logistics
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={isRetryPaymentConfirmOpen}
                onOpenChange={setIsRetryPaymentConfirmOpen}
                title={`Retry payment for #${orderCode}?`}
                description="A new secure payment link will be generated for this pending request. Continue with **Pay Again** now?"
                confirmText="Pay Again"
                cancelText="Not now"
                onConfirm={handleConfirmRetryPayment}
                variant="primary"
                isLoading={isRetryingPayment}
            />

            {/* Detached Immersive Gallery - High viewport coverage */}
            {previewIndex !== null && createPortal(
                <div
                    className="fixed inset-0 z-[300] bg-black/98 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 animate-in fade-in zoom-in-95 duration-200 cursor-zoom-out"
                    style={{ pointerEvents: 'auto' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setPreviewIndex(null);
                    }}
                >
                    {/* Immersive Navigation - Pushed to Screen Edges */}
                    <div className="fixed inset-x-4 md:inset-x-12 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-[310] w-[calc(100%-2rem)] md:w-[calc(100%-6rem)]">
                        <div className="pointer-events-auto">
                            {previewIndex > 0 && (
                                <button
                                    className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/5 hover:bg-white text-white hover:text-primary flex items-center justify-center shadow-2xl transition-all active:scale-90 border border-white/10 hover:border-white group backdrop-blur-md"
                                    onClick={handlePrev}
                                >
                                    <ChevronLeft className="w-8 h-8 md:w-12 md:h-12" />
                                </button>
                            )}
                        </div>
                        <div className="pointer-events-auto">
                            {previewIndex < allImages.length - 1 && (
                                <button
                                    className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/5 hover:bg-white text-white hover:text-primary flex items-center justify-center shadow-2xl transition-all active:scale-90 border border-white/10 hover:border-white group backdrop-blur-md"
                                    onClick={handleNext}
                                >
                                    <ChevronRight className="w-8 h-8 md:w-12 md:h-12" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div
                        className="relative max-w-full max-h-full animate-in zoom-in-90 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img src={allImages[previewIndex]} className="max-w-[95vw] max-h-[90vh] object-contain block shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-xl" alt="Preview" />

                        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                            <div className="px-6 py-2.5 rounded-full bg-white/10 text-white/80 text-[11px] font-black uppercase tracking-[0.3em] backdrop-blur-xl border border-white/10 shadow-2xl">
                                Package Manifest {previewIndex + 1} <span className="mx-2 text-white/20">/</span> {allImages.length}
                            </div>
                        </div>

                        <button
                            className="fixed top-8 right-8 w-14 h-14 rounded-full bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white flex items-center justify-center transition-all shadow-2xl active:scale-95 border border-rose-500/20 z-[320] backdrop-blur-md"
                            onClick={() => setPreviewIndex(null)}
                        >
                            <XCircle className="w-8 h-8" />
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

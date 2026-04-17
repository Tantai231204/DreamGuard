import React from "react";
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
    Maximize2,
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
import { FormattedDescription } from "@/components/common/FormattedDescription";
import { useProductDetail } from "@/hooks/queries";

interface TradeInOrderDetailDialogProps {
    tradeInOrderId: string;
    orderCode: string;
    trigger: React.ReactNode;
}

export const TradeInOrderDetailDialog = ({ tradeInOrderId, orderCode, trigger }: TradeInOrderDetailDialogProps) => {
    const [open, setOpen] = React.useState(false);
    const { data: order, isLoading } = useCustomerTradeInOrderDetail(tradeInOrderId, { enabled: open });
    const { data: product } = useProductDetail(order?.productVariant?.productId || "", !!order?.productVariant?.productId);

    const targetProductImage = (order?.productVariant?.attributes?.imageUrls as string[])?.[0] ||
        (order?.productVariant?.attributes?.imageUrl as string) ||
        product?.imageUrls?.[0] ||
        product?.assets?.[0]?.url;

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
        if ((order.orderItem as { image?: string })?.image) imgs.push((order.orderItem as { image?: string }).image!);
        if (targetProductImage) imgs.push(targetProductImage);
        if (order.tradeInImages) {
            order.tradeInImages.forEach(img => imgs.push(img.imageUrl));
        }
        return imgs;
    }, [order, targetProductImage]);

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (previewIndex !== null && previewIndex > 0) setPreviewIndex(previewIndex - 1);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (previewIndex !== null && previewIndex < allImages.length - 1) setPreviewIndex(previewIndex + 1);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[92vh] p-0 overflow-hidden rounded-2xl border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] bg-gray-50/50 flex flex-col">
                    <DialogHeader className="bg-white border-b border-slate-100 pl-8 pr-12 py-6 flex flex-row items-center justify-between shrink-0 relative space-y-0">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                <Box className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <DialogTitle className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Trade-In Manifest</DialogTitle>
                                <div className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                    <span className="w-2 h-[1px] bg-slate-200" />
                                    Transaction: {orderCode}
                                </div>
                            </div>
                        </div>
                        {order && statusTheme && (
                            <div
                                className="px-6 py-2 rounded-xl text-[12px] font-black text-white uppercase tracking-[0.15em] shadow-lg shadow-primary/20"
                                style={{ backgroundColor: statusTheme.color }}
                            >
                                {statusTheme.label}
                            </div>
                        )}
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-48 gap-6 bg-white">
                                <div className="w-10 h-10 border-[4px] border-primary/20 border-t-primary rounded-full animate-spin" />
                                <p className="text-[13px] font-black text-slate-400 tracking-[0.3em] uppercase">Authenticating request details...</p>
                            </div>
                        ) : order ? (
                            <div className="space-y-4 pb-12">
                                {/* Upgrade Path Section */}
                                <div className="bg-white shadow-sm">
                                    <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-sm">
                                                <Truck className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="text-[14px] font-black text-slate-800 tracking-tight uppercase">Strategic Exchange Program</span>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-black border-primary/20 text-primary bg-primary/[0.02] px-3">Standard Fulfilment</Badge>
                                    </div>
                                    <div className="p-8">
                                        <div className="flex flex-col md:flex-row items-stretch gap-4 relative">
                                            {/* Source Device Package */}
                                            <div className="flex-1 p-5 rounded-2xl bg-slate-50/50 border border-slate-200/60 shadow-sm relative group/card">
                                                <div className="absolute top-4 right-4 text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] vertical-rl rotate-180">DG-INBOUND</div>
                                                <div className="space-y-4">
                                                    <div className="flex gap-4">
                                                        <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 shadow-sm p-1">
                                                            {(order.orderItem as { image?: string })?.image ? (
                                                                <img
                                                                    src={(order.orderItem as { image?: string }).image}
                                                                    className="w-full h-full object-contain rounded-lg cursor-zoom-in"
                                                                    alt="Source"
                                                                    onClick={() => setPreviewIndex(0)}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300 rounded-lg">
                                                                    <Package className="w-10 h-10 stroke-[1.5]" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1.5 flex-1 min-w-0">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inbound Package</p>
                                                            <p className="text-[14px] font-black text-slate-900 leading-tight truncate">{order.orderItem?.itemName}</p>
                                                            <Badge className="bg-slate-200/50 text-slate-500 hover:bg-slate-200/50 text-[8px] font-black uppercase tracking-tighter px-1.5 h-4.5 border-none">Pre-owned Hardware</Badge>
                                                        </div>
                                                    </div>

                                                    {/* Condition Images inside Source Card */}
                                                    {order.tradeInImages && order.tradeInImages.length > 0 && (
                                                        <div className="space-y-2 pt-2 border-t border-slate-200/40">
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inspection Photos ({order.tradeInImages.length})</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {order.tradeInImages.map((img, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-xs flex-shrink-0 transition-all hover:scale-105 hover:border-primary/40 cursor-zoom-in relative group/img"
                                                                        onClick={() => {
                                                                            const baseOffset = ((order.orderItem as { image?: string })?.image ? 1 : 0) + (targetProductImage ? 1 : 0);
                                                                            setPreviewIndex(baseOffset + idx);
                                                                        }}
                                                                    >
                                                                        <img src={img.imageUrl} alt={`Condition ${idx}`} className="w-full h-full object-cover" />
                                                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                                            <Maximize2 className="w-3 h-3 text-white" />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-center md:h-auto py-2 md:py-0">
                                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-md relative z-10 text-primary">
                                                    <ArrowLeftRight className="w-5 h-5" />
                                                </div>
                                            </div>

                                            {/* Upgrade Target Package */}
                                            <div className="flex-1 p-5 rounded-2xl bg-primary/[0.02] border border-primary/10 shadow-sm relative overflow-hidden group/card text-left">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover/card:scale-110" />
                                                <div className="space-y-4 relative z-10">
                                                    <div className="flex gap-4">
                                                        <div className="w-20 h-20 rounded-xl bg-white border border-primary/10 overflow-hidden shrink-0 shadow-sm p-1">
                                                            {targetProductImage ? (
                                                                <img
                                                                    src={targetProductImage}
                                                                    className="w-full h-full object-contain rounded-lg cursor-zoom-in"
                                                                    alt="Target"
                                                                    onClick={() => {
                                                                        const sourceOffset = (order.orderItem as { image?: string })?.image ? 1 : 0;
                                                                        setPreviewIndex(sourceOffset);
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-white text-primary/10 rounded-lg">
                                                                    <Box className="w-10 h-10 stroke-[1.5]" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1.5 flex-1 min-w-0">
                                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Luxury Outbound</p>
                                                            <p className="text-[14px] font-black text-slate-900 leading-tight truncate">{order.productVariant?.sku}</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {order.productVariant?.size && (
                                                                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tight bg-white border-slate-200 h-4 px-1.5">Size: {order.productVariant?.size}</Badge>
                                                                )}
                                                                {Object.entries(order.productVariant?.attributes || {}).slice(0, 2).map(([key, val]) => {
                                                                    const displayKey = key.toLowerCase().replace('variant', '').replace('color', 'Clr');
                                                                    return (
                                                                        <Badge key={key} variant="outline" className="text-[8px] font-black uppercase tracking-tight bg-white border-slate-200 h-4 px-1.5">
                                                                            {displayKey}: {String(val)}
                                                                        </Badge>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 pt-2 border-t border-primary/10">
                                                        <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">Package Specifications</p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="text-[10px] bg-white/50 p-1.5 rounded-lg border border-primary/5 font-bold text-slate-600">
                                                                <span className="text-primary/40 mr-1">QC</span> PASS
                                                            </div>
                                                            <div className="text-[10px] bg-white/50 p-1.5 rounded-lg border border-primary/5 font-bold text-slate-600">
                                                                <span className="text-primary/40 mr-1">SEC</span> VERIFIED
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Assessment Details */}
                                <div className="bg-white px-8 py-8 space-y-6 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                            <ShieldCheck className="w-5 h-5 text-primary" />
                                        </div>
                                        <span className="text-[16px] font-black text-slate-800 tracking-tight uppercase">Technical Assessment</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-3">
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Authentic State</p>
                                            <div className="flex items-center gap-2">
                                                {order.isGood ? (
                                                    <Badge className="bg-emerald-500 text-white border-none rounded-xl text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-md shadow-emerald-200/50">
                                                        Premium Selection
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-amber-500 text-white border-none rounded-xl text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-md shadow-amber-200/50">
                                                        Authenticated Standard
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-3">
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Assessment Timeline</p>
                                            <p className="text-sm font-black text-slate-700 uppercase tracking-tighter">{formatDate(order.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100/50 text-left relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Info className="w-12 h-12" />
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Expert Log</span>
                                        </div>
                                        <FormattedDescription
                                            content={order.description ? `"${order.description}"` : "No specific technical deviations recorded during inspection."}
                                            className="text-[13px] text-slate-600 font-medium leading-relaxed italic"
                                        />
                                    </div>
                                </div>

                                {/* Logistics info */}
                                <div className="bg-white px-8 py-8 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                            <MapPin className="w-5 h-5 text-primary" />
                                        </div>
                                        <span className="text-[16px] font-black text-slate-800 tracking-tight uppercase">Fulfilment Coordinates</span>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Designated Recipient</p>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 shadow-inner">
                                                    <User className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-black text-slate-900 leading-none">{order.receiverName}</p>
                                                    <p className="text-[12px] font-bold text-slate-400 mt-2 tracking-tight">{order.phoneNumber}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Logistics Address</p>
                                            <p className="text-[14px] font-bold text-slate-600 leading-relaxed max-w-[280px]">{order.address}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Summary */}
                                <div className="bg-slate-900 mx-8 mt-4 rounded-3xl p-8 space-y-6 shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="p-1.5 bg-white/10 rounded-lg border border-white/5">
                                            <ArrowLeftRight className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-[14px] font-black text-white/60 tracking-[0.2em] uppercase">Settlement Manifest</span>
                                    </div>
                                    <div className="space-y-4 relative z-10">
                                        <div className="flex justify-between items-center text-sm font-bold text-white/40 uppercase tracking-widest">
                                            <span>Acquisition Value</span>
                                            <span className="text-white">{formatPrice(order.productVariant?.salePrice || 0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-black tracking-widest">
                                            <span className="text-emerald-400 uppercase">Trade-In Allowance</span>
                                            <span className="text-emerald-400">-{formatPrice(order.tradeInPrice)}</span>
                                        </div>
                                        {order.depositAmount > 0 && (
                                            <div className="flex justify-between items-center text-sm font-bold text-white/40 tracking-widest">
                                                <span className="uppercase">Retained Deposit</span>
                                                <span className="text-rose-400">-{formatPrice(order.depositAmount)}</span>
                                            </div>
                                        )}
                                        <div className="h-[1px] bg-white/10 my-4" />
                                        <div className="flex justify-between items-end pt-2">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-1">Total Net Settle</span>
                                                <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest italic">Includes all authenticated deductions</span>
                                            </div>
                                            <span className="text-4xl font-black text-white tracking-tighter tabular-nums drop-shadow-md">
                                                {formatPrice(order.amountToPay)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white px-6 pt-5 pb-7 border-t border-gray-50">
                                    {needsPaymentRetry && (
                                        <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <p className="text-[11px] font-bold text-rose-700 leading-snug">
                                                Payment failed while this request is still pending. Retry payment to continue the trade-in workflow.
                                            </p>
                                            <Button
                                                type="button"
                                                onClick={() => setIsRetryPaymentConfirmOpen(true)}
                                                disabled={isRetryingPayment}
                                                className="h-8 px-3 rounded-md text-[10px] font-black uppercase tracking-wider bg-primary text-white hover:bg-primary/90"
                                            >
                                                {isRetryingPayment ? "Processing..." : "Pay Again"}
                                            </Button>
                                        </div>
                                    )}

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
                        ) : (
                            <div className="py-32 text-center bg-white">
                                <XCircle className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                                <p className="text-[13px] font-black text-gray-400 uppercase tracking-widest">Detail Not Found</p>
                            </div>
                        )}
                    </div>

                    <div className="p-5 border-t border-gray-100 bg-white flex items-center justify-center gap-3 shrink-0">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                            Secure fulfilment verified by DreamGuard logistics
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

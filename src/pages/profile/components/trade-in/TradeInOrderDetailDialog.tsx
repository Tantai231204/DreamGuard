import React from "react";
import { createPortal } from "react-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    MapPin,
    ArrowLeftRight,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    Info,
    Wallet,
    MinusCircle,
    User,
    ChevronLeft,
    ChevronRight,
    Package,
    Box,
    Maximize2,
    Truck
} from "lucide-react";
import { formatPrice, formatDate } from "../../utils";
import { getStatusTheme } from "../../constants";
import { useAdminTradeInOrderDetail } from "@/hooks/queries/useTradeInOrder";
import { cn } from "@/lib/utils";

interface TradeInOrderDetailDialogProps {
    tradeInOrderId: string;
    orderCode: string;
    trigger: React.ReactNode;
}

export const TradeInOrderDetailDialog = ({ tradeInOrderId, orderCode, trigger }: TradeInOrderDetailDialogProps) => {
    const { data: order, isLoading } = useAdminTradeInOrderDetail(tradeInOrderId);
    const [previewIndex, setPreviewIndex] = React.useState<number | null>(null);

    const allImages = React.useMemo(() => {
        if (!order) return [];
        const imgs: string[] = [];
        if ((order.orderItem as { image?: string })?.image) imgs.push((order.orderItem as { image?: string }).image!);
        if ((order.productVariant as { image?: string })?.image) imgs.push((order.productVariant as { image?: string }).image!);
        if (order.tradeInImages) {
            order.tradeInImages.forEach(img => imgs.push(img.imageUrl));
        }
        return imgs;
    }, [order]);

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
            <Dialog>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[92vh] p-0 overflow-hidden rounded-xl border-none shadow-2xl bg-gray-100 flex flex-col">
                    <DialogHeader className="bg-white border-b border-gray-100 pl-6 pr-12 py-4 flex flex-row items-center justify-between shrink-0 relative space-y-0">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                <Box className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <DialogTitle className="text-[16px] font-black text-gray-900 uppercase tracking-tight">Trade-In Manifest</DialogTitle>
                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                                    Transaction Code: {orderCode}
                                </div>
                            </div>
                        </div>
                        {order && (
                            <div
                                className="px-4 py-1.5 rounded-full text-[11px] font-bold text-white uppercase tracking-widest shadow-sm"
                                style={{ backgroundColor: getStatusTheme(order.status).color }}
                            >
                                {getStatusTheme(order.status).label}
                            </div>
                        )}
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-40 gap-4 bg-white">
                                <div className="w-7 h-7 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
                                <p className="text-[12px] font-bold text-gray-400 tracking-wider uppercase">Fetching assessment details...</p>
                            </div>
                        ) : order ? (
                            <div className="space-y-3 pb-8">
                                {/* Upgrade Path Section */}
                                <div className="bg-white">
                                    <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <Truck className="w-4 h-4 text-gray-400" />
                                            <span className="text-[13px] font-black text-gray-800 tracking-tight uppercase">Logistics Manifest</span>
                                        </div>
                                        <Badge variant="outline" className="text-[9px] font-black border-slate-100 text-slate-400">Standard Fulfillment</Badge>
                                    </div>
                                    <div className="p-6">
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
                                                                    className="w-full h-full object-cover rounded-lg cursor-zoom-in"
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
                                                                            const baseOffset = ((order.orderItem as { image?: string })?.image ? 1 : 0) + ((order.productVariant as { image?: string })?.image ? 1 : 0);
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
                                                            {(order.productVariant as { image?: string })?.image ? (
                                                                <img
                                                                    src={(order.productVariant as { image?: string }).image}
                                                                    className="w-full h-full object-cover rounded-lg cursor-zoom-in"
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
                                                                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tight bg-white border-slate-200 h-4 px-1.5">Size: {order.productVariant?.size}</Badge>
                                                                {Object.entries(order.productVariant?.attributes || {}).slice(0, 2).map(([key, val]) => (
                                                                    <Badge key={key} variant="outline" className="text-[8px] font-black uppercase tracking-tight bg-white border-slate-200 h-4 px-1.5">
                                                                        {key[0]}: {String(val)}
                                                                    </Badge>
                                                                ))}
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
                                <div className="bg-white px-6 py-5 space-y-4">
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <ShieldCheck className="w-4 h-4 text-gray-500" />
                                        <span className="text-[14px] font-bold text-gray-800 tracking-tight">Technical Assessment</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Product Condition</p>
                                            <div className="flex items-center gap-1.5 pt-1">
                                                {order.isGood ? (
                                                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest px-2 py-0.5 shadow-none">
                                                        <span className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5" />
                                                        Premium State
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-amber-50 text-amber-600 border-amber-100 rounded-lg text-[9px] font-black uppercase tracking-widest px-2 py-0.5 shadow-none">
                                                        <span className="w-1 h-1 rounded-full bg-amber-500 mr-1.5" />
                                                        Standard State
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-1 text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Assessment Date</p>
                                            <p className="text-xs font-bold text-gray-900 pt-1 uppercase tracking-tight">{formatDate(order.createdAt)}</p>
                                        </div>
                                    </div>
                                    {order.description && (
                                        <div className="p-4 bg-gray-50/80 rounded-lg border border-gray-100 text-left">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Info className="w-3 h-3 text-gray-400" />
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expert Notes</span>
                                            </div>
                                            <p className="text-[12px] text-gray-600 italic font-medium leading-relaxed">"{order.description}"</p>
                                        </div>
                                    )}
                                </div>

                                {/* Logistics info */}
                                <div className="bg-white px-6 py-5">
                                    <div className="flex items-center gap-2.5 mb-4">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span className="text-[14px] font-bold text-gray-800 tracking-tight">Logistics Details</span>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recipient</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[12px] font-bold text-gray-900">{order.receiverName}</p>
                                                    <p className="text-[11px] font-medium text-gray-500">{order.phoneNumber}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pickup/Delivery Address</p>
                                            <p className="text-[12px] font-medium text-gray-600 leading-snug">{order.address}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Summary - Refined to match standard PricingSummary */}
                                <div className="bg-white px-6 py-6 space-y-4">
                                    <div className="flex justify-between items-center text-[13px] font-medium text-gray-500">
                                        <span>Target Investment</span>
                                        <span className="text-gray-900 font-bold">{formatPrice(order.productVariant?.salePrice || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px] font-medium">
                                        <span className="text-emerald-600 font-bold">Trade-In Allowance</span>
                                        <span className="text-emerald-600 font-bold">-{formatPrice(order.tradeInPrice)}</span>
                                    </div>
                                    {order.depositAmount > 0 && (
                                        <div className="flex justify-between items-center text-[13px] font-medium text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <span>Initial Deposit</span>
                                                <Badge variant="outline" className="h-5 px-2 bg-emerald-50 border-emerald-100 text-emerald-600 text-[9px] font-black uppercase shadow-none">Verified</Badge>
                                            </div>
                                            <span className="text-red-500">-{formatPrice(order.depositAmount)}</span>
                                        </div>
                                    )}
                                    <Separator className="bg-gray-50 my-2" />
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-[15px] font-bold text-gray-900">Net Settlement</span>
                                        <span className="text-[24px] font-black text-primary tracking-tighter">
                                            {formatPrice(order.amountToPay)}
                                        </span>
                                    </div>
                                </div>

                                {/* Transaction History - Refined */}
                                {order.payments && order.payments.length > 0 && (
                                    <div className="bg-white px-6 py-6 border-t border-gray-50">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Transaction History</div>
                                        <div className="space-y-3">
                                            {order.payments.map((p) => (
                                                <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-primary/20 transition-all shadow-sm group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm transition-transform group-hover:scale-105">
                                                            {p.paymentMethod.toUpperCase().includes('VNPAY') ? (
                                                                <img src={`${import.meta.env.BASE_URL}images/vnpay.svg`} alt="VNPay" className="w-7 h-7 object-contain" />
                                                            ) : (
                                                                <Wallet className="w-5 h-5 opacity-60" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{p.paymentMethod}</p>
                                                            <p className="text-[10px] font-bold text-gray-400">{formatDate(p.createdAt)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right space-y-1.5">
                                                        <p className="text-[14px] font-black text-gray-900 tabular-nums">{formatPrice(p.amount)}</p>
                                                        <div className={cn(
                                                            "flex items-center gap-2 px-2.5 py-1 rounded-lg border shadow-xs bg-white w-fit ml-auto",
                                                            p.status === "Paid" ? "text-emerald-600 border-emerald-100" :
                                                                p.status === "Failed" ? "text-rose-600 border-rose-100" :
                                                                    "text-amber-600 border-amber-100"
                                                        )}>
                                                            {p.status === "Paid" ? <CheckCircle2 className="w-4 h-4" /> :
                                                                p.status === "Failed" ? <XCircle className="w-4 h-4" /> :
                                                                    <MinusCircle className="w-4 h-4" />}
                                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                                {p.status === "Paid" ? "Transaction Success" : p.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
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

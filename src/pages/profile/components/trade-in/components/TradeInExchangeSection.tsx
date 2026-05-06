import { cn } from "@/lib/utils";
import { 
    Package, 
    ArrowLeftRight, 
    Box, 
    Truck 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TradeInOrderDetailResponse } from "@/api/types/tradeInOrder";

interface TradeInExchangeSectionProps {
    order: TradeInOrderDetailResponse;
    onPreview: (index: number) => void;
    onTraceLink: (orderId: string) => void;
}

export const TradeInExchangeSection = ({ order, onPreview, onTraceLink }: TradeInExchangeSectionProps) => {
    const targetProductImage = order?.newProductVariantUrl;
    const sourceProductImage = order?.oldProductVariantUrl;

    return (
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
                    <div className="flex-1 min-w-0 p-4 rounded-xl bg-slate-50 border border-slate-100/60 shadow-sm relative group/card flex flex-col">
                        <div className="flex-1 min-w-0 space-y-4">
                            <div className="flex gap-4 min-w-0">
                                <div 
                                    className={cn(
                                        "w-16 h-16 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 shadow-sm p-1 transition-all",
                                        !order.orderId && "cursor-zoom-in group/img"
                                    )}
                                    onClick={() => {
                                        if (!order.orderId) onPreview(0);
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
                                </div>
                                <div className="space-y-1 flex-1 min-w-0">
                                    <div className="flex items-center justify-between min-w-0">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Inbound</p>
                                        {order.orderId && (
                                            <span className="text-[7px] font-black text-primary bg-primary/5 px-1 py-0.5 rounded uppercase tracking-tighter shrink-0 ml-2">Traceable</span>
                                        )}
                                    </div>
                                    <p className="text-[13px] font-bold text-slate-900 leading-tight break-words line-clamp-2">{order.orderItem?.itemName}</p>
                                    
                                    {order.orderId && (
                                        <div className="flex flex-col gap-1.5 pt-0.5">
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onTraceLink(order.orderId!);
                                                }}
                                                className="group/btn flex items-center gap-1.5 w-fit relative z-20 cursor-pointer"
                                            >
                                                <Package className="w-3 h-3 text-[#4988c4] transition-transform group-hover/btn:-translate-y-0.5" />
                                                <span className="text-[10px] font-black text-[#4988c4] uppercase tracking-wider border-b-2 border-[#4988c4]/30 group-hover:border-[#4988c4] transition-all pb-0.5">
                                                    Source Order
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                    {!order.orderId && (
                                        <span className="inline-block w-fit text-[8px] font-black uppercase text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded leading-none">Pre-owned</span>
                                    )}
                                </div>
                            </div>

                            {/* Condition Images */}
                            {order.tradeInImages && order.tradeInImages.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-200/40">
                                    {order.tradeInImages.map((img, idx: number) => (
                                        <div
                                            key={idx}
                                            className="w-10 h-10 rounded-md overflow-hidden border border-slate-200 bg-white shadow-xs flex-shrink-0 transition-all hover:border-primary/40 cursor-zoom-in relative group/img"
                                            onClick={() => {
                                                const baseOffset = ((order.orderItem as { image?: string })?.image ? 1 : 0) + (targetProductImage ? 1 : 0);
                                                onPreview(baseOffset + idx);
                                            }}
                                        >
                                            <img src={img.imageUrl} alt={`Condition ${idx}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-center py-1 sm:py-0 shrink-0">
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm relative z-10 text-primary">
                            <ArrowLeftRight className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Upgrade Target */}
                    <div className="flex-1 min-w-0 p-4 rounded-xl bg-blue-50/10 border border-blue-100 shadow-sm group/card text-left flex flex-col">
                        <div className="flex-1 min-w-0 space-y-4">
                            <div className="flex gap-4 min-w-0">
                                <div className="w-16 h-16 rounded-lg bg-white border border-blue-50 overflow-hidden shrink-0 shadow-sm p-1">
                                    {targetProductImage ? (
                                        <img
                                            src={targetProductImage}
                                            className="w-full h-full object-contain rounded-md cursor-zoom-in"
                                            alt="Target"
                                            onClick={() => {
                                                const sourceOffset = (order.orderItem as { image?: string })?.image ? 1 : 0;
                                                onPreview(sourceOffset);
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
                                    <p className="text-[13px] font-bold text-slate-900 leading-tight break-words line-clamp-2">{order.productVariant?.sku}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {order.productVariant?.size && (
                                            <span className="text-[8px] font-bold uppercase text-slate-500 bg-white border border-slate-100 px-1 py-0.5 rounded leading-none">{order.productVariant?.size}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-blue-50 mt-4">
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-tighter bg-white/50 p-1 rounded-md border border-blue-50 text-center truncate">
                                SEC VERIFIED
                            </div>
                            <div className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter bg-emerald-50 p-1 rounded-md border border-emerald-100 text-center truncate">
                                AUTHENTIC
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

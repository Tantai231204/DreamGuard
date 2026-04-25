import { useMemo } from "react"
import type { CartItem } from "@/store/cartTypes"
import { RefreshCcw, Package } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatPrice } from "@/lib/utils"
import { getColorHex } from "@/utils/color-utils"

interface OrderSummaryItemListProps {
    cart: CartItem[]
}

export default function OrderSummaryItemList({ cart }: OrderSummaryItemListProps) {
    const tradeInItems = useMemo(
        () => cart.filter((item) => item.tradeIn && item.tradeIn.totalValue > 0),
        [cart]
    )

    const regularItems = useMemo(
        () => cart.filter((item) => !item.tradeIn || item.tradeIn.totalValue === 0),
        [cart]
    )

    return (
        <div className="space-y-6 mb-6 max-h-[290px] overflow-y-auto pt-2 pr-4 pl-1 -ml-1 custom-scrollbar scrollbar-profile scroll-smooth">
            {tradeInItems.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-600">
                        <RefreshCcw className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Trade-in Savings</span>
                    </div>

                    {tradeInItems.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-[1.5rem] border-2 border-emerald-50 bg-emerald-50/20 p-4 space-y-4"
                        >
                            <div className="flex gap-4">
                                <div className="relative h-16 w-16 shrink-0">
                                    <div className="h-full w-full overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-emerald-100 relative">
                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                        {item.isCustom && (
                                            <div className="absolute top-0 left-0 bg-amber-500 text-white text-[6px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-br-md z-10 shadow-sm">
                                                Custom
                                            </div>
                                        )}
                                    </div>
                                    <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white ring-2 ring-white z-10 shadow-sm">
                                        {item.quantity}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black text-slate-900 truncate">{item.name}</h4>

                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                        {item.size && (
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100/50">
                                                {item.size}
                                            </span>
                                        )}
                                        {item.color && (
                                            <div className="flex items-center gap-1.5 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100/50">
                                                <div
                                                    className="w-2 h-2 rounded-full border border-slate-200 shadow-sm"
                                                    style={{ backgroundColor: getColorHex(item.color || item.customAttributes?.colorHex) }}
                                                />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                    {item.color}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-black text-emerald-600">{formatPrice(item.subtotal)}</span>
                                        <span className="text-[10px] text-slate-400 line-through font-bold">{formatPrice(item.quantity * item.price)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-emerald-100/50">
                                <TooltipProvider delayDuration={100}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button className="text-[10px] font-black uppercase tracking-widest text-emerald-700/60 hover:text-emerald-700 transition-colors flex items-center gap-1.5 focus:outline-none">
                                                <span>{item.tradeIn?.products.length} Traded</span>
                                                <Package className="w-3 h-3" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="rounded-xl border-emerald-100 p-2 shadow-xl">
                                            {item.tradeIn?.products.map((p) => (
                                                <div key={p.id} className="text-[9px] font-bold text-slate-600 px-2 py-1">
                                                    -{p.name}: {formatPrice(p.tradeInValue)}
                                                </div>
                                            ))}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-100/50">
                                    <span className="text-[10px] font-black text-emerald-600 tracking-tighter">-{formatPrice(item.tradeIn?.totalValue ?? 0)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {regularItems.map((item) => (
                <div key={item.id} className="flex gap-4 group/item items-start py-3 border-b border-slate-50 last:border-0">
                    <div className="relative h-16 w-16 shrink-0">
                        <div className="h-full w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100 relative">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                            />
                            {item.isCustom && (
                                <div className="absolute top-0 left-0 bg-amber-500 text-white text-[6px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-br-md z-10 shadow-sm">
                                    Custom
                                </div>
                            )}
                        </div>
                        <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 border-2 border-white z-10 shadow-sm">
                            <span className="text-[10px] font-black text-white leading-none">
                                {item.quantity}
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-black text-slate-900 truncate uppercase tracking-tight mb-1">{item.name}</h4>

                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            {item.size && (
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100/50">
                                    {item.size}
                                </span>
                            )}
                            {item.color && (
                                <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100/50">
                                    <div
                                        className="w-1.5 h-1.5 rounded-full border border-slate-200"
                                        style={{ backgroundColor: getColorHex(item.color || item.customAttributes?.colorHex) }}
                                    />
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                        {item.color}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col">
                            {item.availableStock !== undefined && item.quantity > item.availableStock && (
                                <div className="flex items-center gap-1.5 mb-2 text-rose-500">
                                    <Package className="w-3 h-3" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Exceeds Stock (Max: {item.availableStock})</span>
                                </div>
                            )}
                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.1em] mb-0.5">Unit Price</span>
                            <span className="text-[11px] font-black text-slate-900 tracking-tight">{formatPrice(item.price)}</span>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <span className="text-[8px] font-black text-primary-500 uppercase tracking-[0.1em] mb-0.5">Subtotal</span>
                        <span className="text-sm font-black text-primary-500 tracking-tighter">
                            {formatPrice(item.subtotal)}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}
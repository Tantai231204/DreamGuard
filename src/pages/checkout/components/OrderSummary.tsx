import type { CartItem } from "@/store/cartTypes"
import { ShoppingBag, RefreshCcw, Package, ShieldCheck } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatPrice } from "@/lib/utils"
import { getColorHex } from "@/utils/color-utils"

interface OrderSummaryProps {
    cart: CartItem[]
    totalPrice: number
    tradeInDiscount?: number
    finalTotal?: number
    estimatedDeliveryDate?: string
}

export function OrderSummary({ cart, totalPrice, tradeInDiscount = 0, finalTotal, estimatedDeliveryDate }: OrderSummaryProps) {
    const shipping = 0
    const baseTotal = finalTotal ?? totalPrice
    const tax = 0 // Resolved: UI matches API total directly, no manual tax injection
    const total = baseTotal + shipping + tax

    const tradeInItems = cart.filter(item => item.tradeIn && item.tradeIn.totalValue > 0)
    const regularItems = cart.filter(item => !item.tradeIn || item.tradeIn.totalValue === 0)

    return (
        <div className="sticky top-10">
            <div className="group rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-2xl shadow-slate-200/40 hover:shadow-3xl transition-all duration-700">
                {/* Simplified Header */}
                <div className="flex items-center justify-between mb-10 pb-8 border-b border-slate-50">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Order Summary</h2>
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Review your selections</p>
                            <span className="h-1 w-1 rounded-full bg-slate-200" />
                            <span className="text-[10px] font-black text-[#4988c4] uppercase tracking-widest">{cart.reduce((acc, item) => acc + item.quantity, 0)} Items</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-[1.25rem] bg-slate-50 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-slate-900" />
                    </div>
                </div>

                {/* Items Container */}
                <div className="space-y-8 mb-10 max-h-[400px] overflow-y-auto pt-4 pr-6 pl-2 -ml-2 custom-scrollbar scroll-smooth">
                    {/* Trade-in Items Section */}
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
                                            
                                            {/* Attributes Section */}
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

                    {/* Regular Items - Fixed & Sharp Design */}
                    {regularItems.map((item) => (
                        <div key={item.id} className="flex gap-5 group/item items-start py-4 border-b border-slate-50 last:border-0">
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
                                
                                {/* Attributes Section */}
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
                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.1em] mb-0.5">Unit Price</span>
                                    <span className="text-[11px] font-black text-slate-900 tracking-tight">{formatPrice(item.price)}</span>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <span className="text-[8px] font-black text-[#4988c4] uppercase tracking-[0.1em] mb-0.5">Subtotal</span>
                                <span className="text-sm font-black text-[#4988c4] tracking-tighter">
                                    {formatPrice(item.subtotal)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Totals Section */}
                <div className="space-y-4 pt-10 border-t border-slate-50">
                    <div className="flex justify-between items-center px-2">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Base Price</span>
                        <span className="text-sm font-black text-slate-900">{formatPrice(totalPrice)}</span>
                    </div>

                    {tradeInDiscount > 0 && (
                        <div className="flex justify-between items-center bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                                <RefreshCcw className="w-3.5 h-3.5" />
                                Trade Credit
                            </span>
                            <span className="text-sm font-black text-emerald-600">-{formatPrice(tradeInDiscount)}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Shipping Fees</span>
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[9px] font-black text-[#4988c4] uppercase tracking-tighter">Premium</span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-black text-emerald-500 uppercase tracking-widest block">Free Arrival</span>
                            {estimatedDeliveryDate && (
                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">By {estimatedDeliveryDate}</span>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-center px-2">
                        <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Est. GST / Tax</span>
                        <span className="text-sm font-bold text-slate-900">{formatPrice(tax)}</span>
                    </div>

                    <div className="h-px bg-slate-50 -mx-2 my-2" />

                    <div className="flex justify-between items-end p-2 pb-6">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">Net Total</span>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Final Amount</h3>
                        </div>
                        <div className="text-right">
                            <span className="text-4xl font-black text-[#4988c4] tracking-tighter leading-none block">
                                {formatPrice(total)}
                            </span>
                        </div>
                    </div>

                    {/* Security Trust */}
                    <div className="rounded-2xl border-2 border-slate-50 bg-slate-50/30 p-4 space-y-4">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-4 h-4 text-[#4988c4]" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Security Protocols</span>
                        </div>
                        <div className="flex items-center gap-4 px-2">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter leading-none">PCI Standard</span>
                                <span className="text-[8px] font-bold text-slate-300 uppercase leading-none mt-1">Compliant</span>
                            </div>
                            <div className="w-px h-6 bg-slate-200" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter leading-none">256-Bit SSL</span>
                                <span className="text-[8px] font-bold text-slate-300 uppercase leading-none mt-1">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

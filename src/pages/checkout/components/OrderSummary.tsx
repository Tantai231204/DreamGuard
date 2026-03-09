import type { CartItem } from "@/store/cartTypes"
import { ShoppingBag, RefreshCcw, Package, ShieldCheck } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
    const tax = baseTotal * 0.1
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
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Review your selections</p>
                    </div>
                    <div className="w-12 h-12 rounded-[1.25rem] bg-slate-50 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-slate-900" />
                    </div>
                </div>

                {/* Items Container */}
                <div className="space-y-8 mb-10 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar scroll-smooth">
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
                                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-emerald-100">
                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white ring-2 ring-white">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-black text-slate-900 truncate">{item.name}</h4>
                                            <div className="mt-1 flex items-baseline gap-2">
                                                <span className="text-xs font-black text-emerald-600">${item.subtotal.toFixed(2)}</span>
                                                <span className="text-[10px] text-slate-400 line-through font-bold">${(item.quantity * item.price).toFixed(2)}</span>
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
                                                            -{p.name}: ${p.tradeInValue.toFixed(2)}
                                                        </div>
                                                    ))}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-100/50">
                                            <span className="text-[10px] font-black text-emerald-600 tracking-tighter">-${item.tradeIn?.totalValue.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Regular Items */}
                    {regularItems.map((item) => (
                        <div key={item.id} className="flex gap-4 group/item">
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1.25rem] bg-slate-50 ring-1 ring-slate-100 group-hover/item:ring-[#4988c4] transition-all duration-500">
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover group-hover/item:scale-110 transition-transform duration-700" />
                                <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white ring-2 ring-white">
                                    {item.quantity}
                                </span>
                            </div>
                            <div className="flex flex-1 flex-col justify-center min-w-0">
                                <h4 className="text-sm font-black text-slate-900 truncate group-hover/item:text-[#4988c4] transition-colors">{item.name}</h4>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{item.quantity} × ${item.price.toFixed(2)}</p>
                                <p className="text-sm font-black text-[#4988c4] mt-2">${item.subtotal.toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Totals Section */}
                <div className="space-y-4 pt-10 border-t border-slate-50">
                    <div className="flex justify-between items-center px-2">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 font-bold">Base Price</span>
                        <span className="text-sm font-black text-slate-900">${totalPrice.toFixed(2)}</span>
                    </div>

                    {tradeInDiscount > 0 && (
                        <div className="flex justify-between items-center bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                                <RefreshCcw className="w-3.5 h-3.5" />
                                Trade Credit
                            </span>
                            <span className="text-sm font-black text-emerald-600">-${tradeInDiscount.toFixed(2)}</span>
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
                        <span className="text-sm font-bold text-slate-900">${tax.toFixed(2)}</span>
                    </div>

                    <div className="h-px bg-slate-50 -mx-2 my-2" />

                    <div className="flex justify-between items-end p-2 pb-6">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">Net Total</span>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Final Amount</h3>
                        </div>
                        <div className="text-right">
                            <span className="text-4xl font-black text-[#4988c4] tracking-tighter leading-none block">
                                ${total.toFixed(2)}
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

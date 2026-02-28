import type { CartItem } from "@/store/cartStore"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, RefreshCcw, Package, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"

interface OrderSummaryProps {
    cart: CartItem[]
    totalPrice: number
    tradeInDiscount?: number
    finalTotal?: number
}

export function OrderSummary({ cart, totalPrice, tradeInDiscount = 0, finalTotal }: OrderSummaryProps) {
    const [expandedTradeIn, setExpandedTradeIn] = useState<string | null>(null)
    const shipping = 0 // Free shipping
    const baseTotal = finalTotal ?? totalPrice
    const tax = baseTotal * 0.1 // 10% tax
    const total = baseTotal + shipping + tax

    // Separate items with and without trade-in
    const tradeInItems = cart.filter(item => item.tradeIn && item.tradeIn.totalValue > 0)
    const regularItems = cart.filter(item => !item.tradeIn || item.tradeIn.totalValue === 0)

    return (
        <div className="sticky top-24">
            <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                    <div className="rounded-full bg-gradient-to-br from-[#4988c4] to-[#3a73a8] p-3 shadow-lg">
                        <ShoppingBag className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900">Your Order</h2>
                        <p className="text-sm text-gray-500 mt-0.5">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Trade-in Items Section */}
                    {tradeInItems.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-emerald-700">
                                <RefreshCcw className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wide">Trade-in Items</span>
                            </div>
                            
                            {tradeInItems.map((item, index) => (
                                <div 
                                    key={item.id} 
                                    className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-green-50/50 p-3 animate-slide-up"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* New Product - Compact */}
                                    <div className="flex gap-3 group/item">
                                        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-white ring-2 ring-emerald-200">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white ring-2 ring-white">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                                                {item.name}
                                            </h4>
                                            {(item.color || item.size) && (
                                                <p className="text-xs text-gray-500">
                                                    {item.color && <span>Color: {item.color}</span>}
                                                    {item.color && item.size && <span> • </span>}
                                                    {item.size && <span>Size: {item.size}</span>}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between mt-1">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-sm font-bold text-emerald-600">${item.subtotal.toFixed(2)}</span>
                                                    <span className="text-xs text-gray-400 line-through">${(item.quantity * item.price).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Trade-in Badge with Tooltip */}
                                    <div className="mt-2 flex items-center justify-between">
                                        <TooltipProvider delayDuration={100}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button 
                                                        className="flex items-center gap-1.5 px-2 py-1 bg-white/80 hover:bg-white rounded-full border border-emerald-200 transition-colors cursor-help text-xs"
                                                        onClick={() => setExpandedTradeIn(expandedTradeIn === item.id ? null : item.id)}
                                                    >
                                                        <RefreshCcw className="w-3 h-3 text-emerald-600" />
                                                        <span className="font-medium text-emerald-700">
                                                            {item.tradeIn?.products.length} traded
                                                        </span>
                                                        <Info className="w-3 h-3 text-emerald-500" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent 
                                                    side="left" 
                                                    className="w-56 p-0 bg-white border border-emerald-200 shadow-xl rounded-xl overflow-hidden"
                                                >
                                                    <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-2 text-white">
                                                        <span className="text-xs font-semibold">Traded Items</span>
                                                    </div>
                                                    <div className="p-2 space-y-1.5 max-h-40 overflow-y-auto">
                                                        {item.tradeIn?.products.map((product) => (
                                                            <div key={product.id} className="flex items-center gap-2">
                                                                <img 
                                                                    src={product.image} 
                                                                    alt={product.name}
                                                                    className="w-7 h-7 rounded object-cover"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-medium text-gray-700 truncate">{product.name}</p>
                                                                </div>
                                                                <span className="text-xs font-bold text-emerald-600">
                                                                    -${product.tradeInValue.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <span className="text-xs font-bold text-emerald-600">
                                            -${item.tradeIn?.totalValue.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {/* Regular Items Section */}
                    {regularItems.length > 0 && (
                        <div className="space-y-3">
                            {tradeInItems.length > 0 && (
                                <div className="flex items-center gap-2 text-gray-500 mt-4">
                                    <Package className="w-4 h-4" />
                                    <span className="text-xs font-semibold uppercase tracking-wide">Regular Items</span>
                                </div>
                            )}
                            
                            {regularItems.map((item, index) => (
                                <div 
                                    key={item.id} 
                                    className="flex gap-3 group/item p-2 rounded-lg hover:bg-gray-50 transition-colors animate-slide-up" 
                                    style={{ animationDelay: `${(tradeInItems.length + index) * 50}ms` }}
                                >
                                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200 group-hover/item:ring-[#4988c4] transition-all">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                                        />
                                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#4988c4] to-[#3a73a8] text-[10px] font-bold text-white ring-2 ring-white">
                                            {item.quantity}
                                        </span>
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between py-0.5">
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover/item:text-[#4988c4] transition-colors">
                                                {item.name}
                                            </h4>
                                            {(item.color || item.size) && (
                                                <p className="text-xs text-gray-500">
                                                    {item.color && <span>Color: {item.color}</span>}
                                                    {item.color && item.size && <span> • </span>}
                                                    {item.size && <span>Size: {item.size}</span>}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">{item.quantity} × ${item.price.toFixed(2)}</span>
                                            <p className="text-sm font-bold text-[#4988c4]">
                                                ${item.subtotal.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Separator className="my-4" />

                {/* Pricing Details */}
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium text-gray-900">
                            ${totalPrice.toFixed(2)}
                        </span>
                    </div>
                    
                    {tradeInDiscount > 0 && (
                        <div className="flex justify-between text-sm bg-emerald-50 -mx-2 px-2 py-2 rounded-lg">
                            <span className="text-emerald-700 flex items-center gap-1.5 font-medium">
                                <RefreshCcw className="w-4 h-4" />
                                Trade-in Discount
                            </span>
                            <span className="font-bold text-emerald-600">-${tradeInDiscount.toFixed(2)}</span>
                        </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (10%)</span>
                        <span className="font-medium text-gray-900">
                            ${tax.toFixed(2)}
                        </span>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex justify-between items-center pt-2">
                        <span className="text-base font-semibold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-[#4988c4]">
                            ${total.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Trade-in Summary */}
                {tradeInDiscount > 0 && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl text-white">
                        <div className="flex items-center gap-2">
                            <RefreshCcw className="h-4 w-4" />
                            <span className="text-sm font-medium">You save ${tradeInDiscount.toFixed(2)} with Trade-in!</span>
                        </div>
                    </div>
                )}

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-[#4988c4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>Secure SSL encrypted payment</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Free returns within 30 days</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-[#4988c4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span>Multiple payment methods</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

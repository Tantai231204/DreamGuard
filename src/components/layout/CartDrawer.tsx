import { useState, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Drawer } from "vaul"
import { ShoppingCart, X, Minus, Plus, ShoppingBag, Trash2, RefreshCcw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useCart } from "@/store/useCart"
import { useCartAnimation } from "@/store/useCartAnimation"
import { AppRoute } from "@/lib/constants"
import "./cart-drawer.css"



export function CartDrawer() {
    const { cart, updateQuantity, removeItem, totalItems, totalPrice, totalTradeInDiscount, finalTotal, loadingIds, syncingIds } = useCart()
    const { cartIconRef, isCartBouncing } = useCartAnimation()
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()

    const handleUpdateQuantity = useCallback((id: string, delta: number) => {
        updateQuantity(id, delta)
    }, [updateQuantity])

    const handleRemoveItem = useCallback((id: string) => {
        removeItem(id)
    }, [removeItem])

    const handleCheckout = useCallback(() => {
        setOpen(false)
        navigate(AppRoute.CHECKOUT)
    }, [navigate])

    const cartItems = useMemo(() => (
        cart.map((item) => {
            const hasTradeIn = !!(item.tradeIn?.totalValue)
            const isLoading = loadingIds?.includes(item.id) ?? false
            const isSyncing = syncingIds?.includes(item.id) ?? false

            return (
                <div
                    key={item.id}
                    className={`group relative flex gap-3 py-4 transition-opacity duration-150 animate-slide-in-item ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                    style={{ contain: 'content' }}
                >
                    {/* Artistic Animated Separator */}
                    <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden">
                        <div className="w-full h-full border-t border-dashed border-slate-100" />
                        <div className="absolute inset-0 border-t border-dashed border-[#4988c4]/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                    </div>
                    {/* Ảnh */}
                    <div className="relative h-[66px] w-[66px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                        <img
                            src={item.image || '/placeholder.png'}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            decoding="async"
                        />
                        {/* Loading overlay trên ảnh - Chỉ dành cho Load (Add/Remove) */}
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                                <Loader2 className="h-4 w-4 text-[#4988c4] animate-spin" />
                            </div>
                        )}
                        {/* Syncing indicator - Nhẹ nhàng cho Update */}
                        {isSyncing && !isLoading && (
                            <div className="absolute top-1 right-1">
                                <RefreshCcw className="h-3 w-3 text-[#4988c4] animate-spin opacity-70" />
                            </div>
                        )}
                    </div>

                    {/* Nội dung */}
                    <div className="flex flex-1 flex-col min-w-0">
                        {/* Tên + xóa */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-[13px] font-bold text-gray-900 leading-snug line-clamp-2 flex-1 group-hover:text-[#4988c4] transition-colors">
                                {item.name}
                            </h4>
                            <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="flex-shrink-0 p-1.5 -mt-1 -mr-1 rounded-full text-gray-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                aria-label="Remove"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {/* Details & Info */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            {item.sku && (
                                <span className="text-[10px] font-mono text-gray-400">
                                    {item.sku}
                                </span>
                            )}
                            {item.size && (
                                <span className="text-[10px] font-medium text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
                                    Size: {item.size}
                                </span>
                            )}
                            {item.color && (
                                <span className="text-[10px] font-medium text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
                                    Color: {item.color}
                                </span>
                            )}
                        </div>

                        {/* Trade-in */}
                        {hasTradeIn && (
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button className="self-start mb-2 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center gap-1 text-[10px] text-emerald-600 font-bold hover:bg-emerald-100 transition-colors">
                                            <RefreshCcw className="w-2.5 h-2.5" />
                                            {item.tradeIn!.products.length} trade-in · −${item.tradeIn!.totalValue.toFixed(2)}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" align="start" className="w-56 p-3 bg-white border border-gray-200 shadow-lg rounded-xl text-xs">
                                        <p className="font-semibold text-gray-700 mb-2">Trade-in details</p>
                                        <div className="space-y-2">
                                            {item.tradeIn!.products.map((p) => (
                                                <div key={p.id} className="flex items-center gap-2">
                                                    <img src={p.image} alt={p.name} className="w-7 h-7 rounded-md object-cover flex-shrink-0 border border-gray-100" />
                                                    <span className="flex-1 text-gray-600 truncate">{p.name}</span>
                                                    <span className="text-emerald-600 font-semibold flex-shrink-0">−${p.tradeInValue.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-gray-500">
                                            <span>Total saved</span>
                                            <span className="font-semibold text-emerald-600">−${item.tradeIn!.totalValue.toFixed(2)}</span>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}

                        {/* Qty stepper + giá */}
                        <div className="flex items-center justify-between mt-0.5">
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => handleUpdateQuantity(item.id, -1)}
                                    disabled={item.quantity <= 1}
                                    className="h-6 w-6 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:border-[#4988c4] hover:text-[#4988c4] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Minus className="h-2.5 w-2.5" />
                                </button>
                                <span className="w-6 text-center text-xs font-semibold text-gray-800 tabular-nums">
                                    {item.quantity}
                                </span>
                                <button
                                    onClick={() => handleUpdateQuantity(item.id, 1)}
                                    className="h-6 w-6 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:border-[#4988c4] hover:text-[#4988c4] transition-colors"
                                >
                                    <Plus className="h-2.5 w-2.5" />
                                </button>
                            </div>

                            <div className="text-right">
                                {hasTradeIn ? (
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-[11px] text-gray-400 line-through">
                                            ${(item.quantity * item.price).toFixed(2)}
                                        </span>
                                        <span className="text-sm font-semibold text-emerald-600">
                                            ${item.subtotal.toFixed(2)}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-sm font-semibold text-gray-900">
                                        ${item.subtotal.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )
        })
    ), [cart, loadingIds, syncingIds, handleUpdateQuantity, handleRemoveItem])

    return (
        <Drawer.Root
            open={open}
            onOpenChange={setOpen}
            direction="right"
            shouldScaleBackground={false}
        >
            <Drawer.Trigger asChild>
                <button
                    ref={cartIconRef}
                    className={`cart-icon-container group relative rounded-full p-2 text-gray-600 transition-all duration-200 hover:bg-[#bde8f5]/20 hover:text-[#4988c4] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#4988c4]/20 active:scale-95 ${isCartBouncing ? 'cart-bounce' : ''}`}
                >
                    <ShoppingCart className="h-5 w-5 transition-transform group-hover:rotate-12" />
                    {totalItems > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#4988c4] px-1.5 text-[10px] font-bold text-white shadow-md ring-2 ring-white">
                            {totalItems > 9 ? "9+" : totalItems}
                        </span>
                    )}
                </button>
            </Drawer.Trigger>

            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 z-50 bg-slate-900/10" />
                <Drawer.Content className="cart-drawer-content fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl outline-none">

                    {/* Header (Premium Refinement) */}
                    <div className="relative border-b border-slate-100 bg-white px-6 py-6 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#4988c4]" />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative h-12 w-12 rounded-xl bg-[#4988c4]/5 flex items-center justify-center border border-[#4988c4]/10">
                                    <ShoppingBag className="h-5 w-5 text-[#4988c4]" />
                                    <div className="absolute inset-1 border border-dashed border-[#4988c4]/20 rounded-lg" />
                                </div>
                                <div>
                                    <Drawer.Title className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">
                                        Your Bag
                                    </Drawer.Title>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">
                                            {totalItems} {totalItems === 1 ? 'item' : 'items'}
                                        </p>
                                        <div className="h-1 w-1 rounded-full bg-slate-200" />
                                        <span className="text-[8px] font-black text-[#4988c4] uppercase tracking-tighter">Premium Collection</span>
                                    </div>
                                </div>
                            </div>
                            <Drawer.Close asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-50 text-slate-300 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100">
                                    <X className="h-4 w-4" />
                                </Button>
                            </Drawer.Close>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="cart-drawer-scroll flex-1 overflow-y-auto px-5 overscroll-contain">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center px-8 relative overflow-hidden">
                                {/* Decorative Background Elements */}
                                <div className="absolute top-1/4 -right-12 w-32 h-32 bg-slate-50 rounded-full blur-3xl opacity-60" />
                                <div className="absolute bottom-1/4 -left-12 w-40 h-40 bg-[#4988c4]/5 rounded-full blur-3xl opacity-40" />

                                <div className="relative mb-8 group">
                                    <div className="absolute inset-0 bg-[#4988c4]/10 rounded-full scale-150 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                                    <div className="relative w-20 h-20 rounded-[2rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:border-[#4988c4]/20 transition-all duration-500">
                                        <div className="absolute inset-2 border border-dashed border-slate-100 rounded-[1.5rem] group-hover:border-[#4988c4]/30 transition-colors" />
                                        <ShoppingCart className="w-8 h-8 text-[#4988c4] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" />
                                    </div>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">
                                        Your bag is <span className="text-[#4988c4]">empty</span>
                                    </h3>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] max-w-[240px] mx-auto leading-relaxed">
                                        Discover our premium collection and begin your dream journey with us.
                                    </p>
                                </div>

                                <Drawer.Close asChild>
                                    <Button
                                        size="lg"
                                        className="mt-12 h-12 rounded-xl px-10 bg-white border border-dashed border-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#4988c4] hover:text-white hover:border-transparent transition-all duration-500 shadow-sm active:scale-95 group/btn overflow-hidden relative"
                                    >
                                        <span className="relative z-10">Explore Now</span>
                                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform" />
                                    </Button>
                                </Drawer.Close>
                            </div>
                        ) : (
                            <div className="py-1">{cartItems}</div>
                        )}
                    </div>

                    {/* Footer */}
                    {cart.length > 0 && (
                        <div className="border-t border-gray-100 bg-white px-6 py-5 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
                            <div className="space-y-2.5 mb-5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-medium text-gray-900">${totalPrice.toFixed(2)}</span>
                                </div>
                                {totalTradeInDiscount > 0 && (
                                    <div className="flex justify-between items-center px-3 py-2 bg-emerald-50 rounded-lg">
                                        <span className="text-emerald-700 flex items-center gap-1.5 font-medium">
                                            <RefreshCcw className="w-3.5 h-3.5" />
                                            Trade-in Discount
                                        </span>
                                        <span className="font-semibold text-emerald-600">−${totalTradeInDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Shipping</span>
                                    <span className="font-medium text-emerald-600">Free</span>
                                </div>
                                <div className="relative py-2">
                                    <div className="absolute inset-x-0 top-0 h-px border-t border-dashed border-slate-100" />
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Total</span>
                                        <span className="text-xl font-black text-[#4988c4] tracking-tighter tabular-nums">
                                            ${finalTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <Button
                                    onClick={handleCheckout}
                                    className="w-full h-12 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl bg-[#4988c4] hover:bg-slate-900 text-white shadow-lg shadow-blue-500/10 transition-all active:scale-[0.98] btn-press-effect"
                                >
                                    Proceed to Checkout
                                </Button>
                                <Drawer.Close asChild>
                                    <Button variant="outline" className="w-full h-11 rounded-xl border-dashed border-slate-200 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-[0.98]">
                                        Continue Shopping
                                    </Button>
                                </Drawer.Close>
                            </div>

                            <div className="mt-4 flex items-center justify-center gap-5 text-xs text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <svg className="h-3.5 w-3.5 text-[#4988c4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span>Secure Payment</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Free Returns</span>
                                </div>
                            </div>
                        </div>
                    )}
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    )
}
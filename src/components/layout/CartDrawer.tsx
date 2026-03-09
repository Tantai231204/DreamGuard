import { useState, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Drawer } from "vaul"
import { ShoppingCart, X, Minus, Plus, ShoppingBag, Trash2, RefreshCcw, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useCart } from "@/store/useCart"
import { useCartAnimation } from "@/store/useCartAnimation"
import { AppRoute } from "@/lib/constants"
import "./cart-drawer.css"


// Map tên màu thông dụng → hex
const COLOR_HEX: Record<string, string> = {
    red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
    black: '#111827', white: '#e5e7eb', gray: '#6b7280', grey: '#6b7280',
    pink: '#ec4899', purple: '#a855f7', orange: '#f97316', brown: '#92400e',
    navy: '#1e3a5f', teal: '#14b8a6', gold: '#d97706', silver: '#9ca3af',
    beige: '#d4b896', cream: '#fffdd0', coral: '#ff6b6b', mint: '#98d8c8',
}

function resolveColor(color: string): string {
    const key = color.toLowerCase().trim()
    return COLOR_HEX[key] ?? (key.startsWith('#') ? key : '#9ca3af')
}

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
                    className={`group flex gap-3 py-3.5 border-b border-gray-100 last:border-0 transition-opacity duration-150 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    {/* Ảnh */}
                    <div className="relative h-[66px] w-[66px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                        <img
                            src={item.image || '/placeholder.png'}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
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

                        {/* Variants & SKU */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            {item.sku && (
                                <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                    {item.sku}
                                </span>
                            )}
                            {(item.color || item.size) && (
                                <div className="flex items-center gap-1">
                                    {item.color && (
                                        <Badge
                                            variant="secondary"
                                            className="h-[18px] px-1.5 gap-1 text-[10px] font-medium rounded-md bg-[#4988c4]/5 text-[#4988c4] border-0 hover:bg-[#4988c4]/10 select-none"
                                        >
                                            <span
                                                className="w-1.5 h-1.5 rounded-full flex-shrink-0 ring-[1px] ring-black/10"
                                                style={{ backgroundColor: resolveColor(item.color) }}
                                            />
                                            {item.color}
                                        </Badge>
                                    )}
                                    {item.size && (
                                        <Badge
                                            variant="outline"
                                            className="h-[18px] px-1.5 text-[10px] font-semibold rounded-md border-gray-200 text-gray-500 select-none"
                                        >
                                            {item.size}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Stock warning */}
                        {item.availableStock !== undefined && item.availableStock < 5 && item.availableStock > 0 && (
                            <div className="flex items-center gap-1 text-[10px] text-orange-600 font-medium mb-2">
                                <Info className="w-3 h-3" />
                                Chỉ còn {item.availableStock} sản phẩm
                            </div>
                        )}

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
        <Drawer.Root open={open} onOpenChange={setOpen} direction="right">
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
                <Drawer.Overlay className="fixed inset-0 z-50 bg-black/30" />
                <Drawer.Content className="cart-drawer-content fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl outline-none">

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-[#bde8f5]/30 to-white px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-[#4988c4]/10 p-2.5">
                                <ShoppingBag className="h-5 w-5 text-[#4988c4]" />
                            </div>
                            <div>
                                <Drawer.Title className="text-base font-semibold text-gray-900">
                                    Shopping Cart
                                </Drawer.Title>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                                </p>
                            </div>
                        </div>
                        <Drawer.Close asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-500">
                                <X className="h-4 w-4" />
                            </Button>
                        </Drawer.Close>
                    </div>

                    {/* Items */}
                    <div className="cart-drawer-scroll flex-1 overflow-y-auto px-5 overscroll-contain">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <div className="rounded-full bg-[#bde8f5]/20 p-6 mb-4">
                                    <ShoppingCart className="h-10 w-10 text-[#4988c4]" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1.5">Your cart is empty</h3>
                                <p className="text-sm text-gray-500 mb-6 max-w-[220px]">
                                    Add some products and they'll appear here
                                </p>
                                <Drawer.Close asChild>
                                    <Button size="default" className="rounded-full px-6 bg-[#4988c4] hover:bg-[#3a73a8] text-white">
                                        Start Shopping
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
                                <Separator />
                                <div className="flex justify-between items-center pt-0.5">
                                    <span className="font-semibold text-gray-900">Total</span>
                                    <span className="text-xl font-bold text-[#4988c4]">
                                        ${finalTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <Button
                                    onClick={handleCheckout}
                                    className="w-full h-11 font-semibold rounded-full bg-[#4988c4] hover:bg-[#3a73a8] text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                                >
                                    Proceed to Checkout
                                </Button>
                                <Drawer.Close asChild>
                                    <Button variant="outline" className="w-full h-11 rounded-full border-gray-200 text-gray-600 hover:bg-gray-50 transition-all active:scale-[0.98]">
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
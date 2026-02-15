import { useState, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Drawer } from "vaul"
import { ShoppingCart, X, Minus, Plus, ShoppingBag, Trash2, RefreshCcw, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useCart } from "@/store/useCart"
import { useCartAnimation } from "@/store/useCartAnimation"
import { AppRoute } from "@/lib/constants"
import "./cart-drawer.css"

export function CartDrawer() {
    const { cart, updateQuantity, removeItem, totalItems, totalPrice, totalTradeInDiscount, finalTotal } = useCart()
    const { cartIconRef, isCartBouncing } = useCartAnimation()
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()

    // Memoize handlers to prevent unnecessary re-renders
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

    // Memoize cart items rendering
    const cartItems = useMemo(() => (
        cart.map((item, index) => (
            <div
                key={item.id}
                className={`cart-item smooth-hover group relative rounded-xl border bg-white p-4 ${
                    item.tradeIn && item.tradeIn.totalValue > 0 
                        ? 'border-emerald-200 ring-1 ring-emerald-100' 
                        : 'border-gray-200'
                }`}
                style={{
                    animationDelay: `${index * 40}ms`
                }}
            >
                <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200">
                        <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-300 ease-out will-change-transform"
                            loading="lazy"
                            decoding="async"
                        />
                        {item.tradeIn && item.tradeIn.totalValue > 0 && (
                            <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1">
                                <RefreshCcw className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-1 flex-col justify-between">
                        <div>
                            <h4 className="font-medium text-sm leading-snug mb-1 pr-8 text-gray-900">
                                {item.name}
                            </h4>
                            {/* Variant info */}
                            {(item.color || item.size) && (
                                <p className="text-xs text-gray-500 mb-1">
                                    {item.color && <span>Color: {item.color}</span>}
                                    {item.color && item.size && <span> • </span>}
                                    {item.size && <span>Size: {item.size}</span>}
                                </p>
                            )}
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-[#4988c4]">
                                    ${item.price.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full border-gray-300 hover:border-[#4988c4] hover:text-[#4988c4] hover:bg-[#bde8f5]/10 transition-all duration-200"
                                    onClick={() => handleUpdateQuantity(item.id, -1)}
                                    disabled={item.quantity <= 1}
                                >
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-sm font-semibold text-gray-900 tabular-nums">
                                    {item.quantity}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-full border-gray-300 hover:border-[#4988c4] hover:text-[#4988c4] hover:bg-[#bde8f5]/10 transition-all duration-200"
                                    onClick={() => handleUpdateQuantity(item.id, 1)}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>

                            <div className="text-right">
                                {item.tradeIn && item.tradeIn.totalValue > 0 ? (
                                    <div>
                                        <p className="text-xs text-gray-400 line-through">
                                            ${(item.quantity * item.price).toFixed(2)}
                                        </p>
                                        <p className="text-sm font-bold text-emerald-600">
                                            ${item.subtotal.toFixed(2)}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm font-bold text-gray-900">
                                        ${item.subtotal.toFixed(2)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Remove Button */}
                    <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="absolute top-3 right-3 rounded-full p-1.5 text-gray-400 opacity-0 transition-all duration-200 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                        aria-label="Remove item"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
                
                {/* Trade-in Info - Compact Badge with Tooltip */}
                {item.tradeIn && item.tradeIn.totalValue > 0 && (
                    <div className="mt-3 flex items-center justify-between">
                        <TooltipProvider delayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-full border border-emerald-200 transition-colors cursor-help">
                                        <RefreshCcw className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="text-xs font-medium text-emerald-700">
                                            Trade-in {item.tradeIn.products.length} {item.tradeIn.products.length === 1 ? 'item' : 'items'}
                                        </span>
                                        <Info className="w-3 h-3 text-emerald-500" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent 
                                    side="bottom" 
                                    align="start"
                                    className="w-64 p-0 bg-white border border-emerald-200 shadow-xl rounded-xl overflow-hidden"
                                >
                                    <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-3 text-white">
                                        <div className="flex items-center gap-2">
                                            <RefreshCcw className="w-4 h-4" />
                                            <span className="font-semibold">Trade-in Details</span>
                                        </div>
                                    </div>
                                    <div className="p-3 space-y-2">
                                        {item.tradeIn.products.map((product) => (
                                            <div key={product.id} className="flex items-center gap-2">
                                                <img 
                                                    src={product.image} 
                                                    alt={product.name}
                                                    className="w-8 h-8 rounded-md object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-gray-700 truncate">{product.name}</p>
                                                    <p className="text-[10px] text-gray-400">Original: ${product.originalPrice.toFixed(2)}</p>
                                                </div>
                                                <span className="text-xs font-bold text-emerald-600">
                                                    -${product.tradeInValue.toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                        <div className="pt-2 mt-2 border-t border-emerald-100 flex justify-between items-center">
                                            <span className="text-xs text-gray-500">Total savings</span>
                                            <span className="text-sm font-bold text-emerald-600">-${item.tradeIn.totalValue.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-50 px-3 py-2 text-[10px] text-emerald-600">
                                        Old items collected on delivery
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <span className="text-sm font-bold text-emerald-600">
                            -${item.tradeIn.totalValue.toFixed(2)}
                        </span>
                    </div>
                )}
            </div>
        ))
    ), [cart, handleUpdateQuantity, handleRemoveItem])

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
                    <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-[#bde8f5]/30 to-white px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-primary/10 p-2.5">
                                <ShoppingBag className="h-5 w-5 text-[#4988c4]" />
                            </div>
                            <div>
                                <Drawer.Title className="text-lg font-semibold text-gray-900">
                                    Shopping Cart
                                </Drawer.Title>
                                <p className="text-sm text-gray-600">
                                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                                </p>
                            </div>
                        </div>
                        <Drawer.Close asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full hover:bg-gray-100 text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </Drawer.Close>
                    </div>

                    {/* Cart Items */}
                    <div className="cart-drawer-scroll flex-1 overflow-y-auto px-6 py-4 bg-gray-50 overscroll-contain">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <div className="rounded-full bg-[#bde8f5]/20 p-6 mb-4">
                                    <ShoppingCart className="h-12 w-12 text-[#4988c4]" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                                <p className="text-gray-600 mb-6 max-w-sm">
                                    You haven't added any products to your cart yet
                                </p>
                                <Drawer.Close asChild>
                                    <Button size="lg" className="rounded-full px-8 bg-[#4988c4] hover:bg-[#3a73a8] text-white shadow-md">
                                        Start Shopping
                                    </Button>
                                </Drawer.Close>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cartItems}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {cart.length > 0 && (
                        <div className="border-t border-gray-200 bg-white px-6 py-5 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                            {/* Subtotal */}
                            <div className="space-y-3 mb-5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold text-gray-900">${totalPrice.toFixed(2)}</span>
                                </div>
                                {totalTradeInDiscount > 0 && (
                                    <div className="flex justify-between text-sm bg-emerald-50 -mx-2 px-2 py-2 rounded-lg">
                                        <span className="text-emerald-700 flex items-center gap-1.5 font-medium">
                                            <RefreshCcw className="w-4 h-4" />
                                            Trade-in Discount
                                        </span>
                                        <span className="font-bold text-emerald-600">-${totalTradeInDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-semibold text-green-600">Free</span>
                                </div>
                                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-base font-semibold text-gray-900">Total</span>
                                    <span className="text-2xl font-bold text-[#4988c4]">
                                        ${finalTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <Button
                                    onClick={handleCheckout}
                                    className="w-full h-12 text-base font-semibold rounded-full bg-[#4988c4] hover:bg-[#3a73a8] text-white shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
                                    size="lg"
                                >
                                    Proceed to Checkout
                                </Button>
                                <Drawer.Close asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full h-12 rounded-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 active:scale-[0.98]"
                                    >
                                        Continue Shopping
                                    </Button>
                                </Drawer.Close>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-4 flex items-center justify-center gap-5 text-xs text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <svg className="h-4 w-4 text-[#4988c4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span className="font-medium">Secure Payment</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="font-medium">Free Returns</span>
                                </div>
                            </div>
                        </div>
                    )}
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    )
}
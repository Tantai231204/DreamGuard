import { useMemo, useCallback, memo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Drawer } from "vaul"
import { ShoppingCart, X, Minus, Plus, ShoppingBag, Trash2, RefreshCcw, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useCart } from "@/store/useCart"
import { useEnrichCartItem } from "../../pages/cart/hooks/useEnrichCartItem"
import { useCartStore } from "@/store/useCartStore"
import { type CartItem } from "@/store/cartTypes"
import { useCartAnimation } from "@/store/useCartAnimation"
import { AppRoute } from "@/lib/constants"
import { cn, formatPrice } from "@/lib/utils"
import { getColorHex } from "@/utils/color-utils"
import "./cart-drawer.css"

import { useVariant } from "@/hooks/queries/useVariant"
import type { VariantResponse, VariantAttributes } from "@/api/services/variantService"
import { useProductDetail } from "@/hooks/queries/useProduct";
import { Skeleton } from "@/components/ui/skeleton";

const SubItemImage = memo(({ variantId, fallbackImage, alt }: { variantId: string; fallbackImage?: string; alt: string }) => {
    const { data: variantData, isLoading: isVarLoading } = useVariant(variantId || "");
    const variant = variantData as VariantResponse;
    const vImg = (variant?.attributes as VariantAttributes)?.imageUrl || (variant as { imageUrl?: string })?.imageUrl;

    // Recovery: Fetch root product if variant has no image
    const productId = variant?.productId || (variant as { product?: { id: string } })?.product?.id || "";
    const { data: productData } = useProductDetail(productId, !!productId && (!vImg || (vImg as string).length < 5) && (!fallbackImage || (fallbackImage as string).length < 5));

    const pData = productData as { imageUrls?: string[]; imageUrl?: string; assets?: { url: string }[] };
    const pImg = pData?.imageUrls?.[0] || pData?.imageUrl || pData?.assets?.[0]?.url || (variant as { product?: { imageUrl?: string } })?.product?.imageUrl;

    const imageUrl = ((vImg as string)?.length > 5) ? (vImg as string) : ((fallbackImage as string)?.length > 5) ? (fallbackImage as string) : (pImg as string);
    const isLoading = isVarLoading;

    if (isLoading && !imageUrl) {
        return <Skeleton className="w-full h-full bg-slate-100" />;
    }

    return (
        <img
            src={imageUrl || "/images/placeholder-product.svg"}
            alt={alt}
            className={cn("w-full h-full object-cover transition-all duration-500", !imageUrl && "opacity-0", imageUrl && "opacity-100")}
            onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('placeholder-product.svg')) {
                    target.src = "/images/placeholder-product.svg";
                }
            }}
        />
    );
});
const CartDrawerItem = memo(({
    item,
    loadingIds,
    syncingIds,
    onUpdateQuantity,
    onSetQuantity,
    onRemove
}: {
    item: CartItem;
    loadingIds: string[];
    syncingIds: string[];
    onUpdateQuantity: (id: string, delta: number) => void;
    onSetQuantity: (id: string, quantity: number) => void;
    onRemove: (id: string) => void;
}) => {
    const enriched = useEnrichCartItem(item);
    const hasTradeIn = !!(item.tradeIn?.totalValue)
    const itemKey = item.configHash || item.id;
    const isLoading = loadingIds?.includes(item.id) ?? false
    const isSyncing = syncingIds?.includes(item.id) ?? false
    
    const [localQty, setLocalQty] = useState('')
    const [isEditing, setIsEditing] = useState(false)

    const handleFocus = () => {
        setLocalQty(item.quantity.toString())
        setIsEditing(true)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '')
        setLocalQty(val)
    }

    const handleBlur = () => {
        const num = parseInt(localQty)
        setIsEditing(false)
        if (!isNaN(num) && num >= 1 && num !== item.quantity) {
            // Stock limit check
            if (item.availableStock !== undefined && num > item.availableStock) {
                // Toast is handled in store, but we can prevent calling it here too if we want
                // or just let the store handle the warning. 
                // To keep UI responsive, let's call the store and it will handle the revert if needed.
            }
            onSetQuantity(item.id, num)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur()
        }
    }

    return (
        <div
            key={itemKey}
            className={cn(
                "group relative flex flex-col pt-4 pb-2 transition-opacity duration-150 animate-slide-in-item",
                (isLoading || isSyncing) && "opacity-50 pointer-events-none"
            )}
            style={{ contain: 'content' }}
        >
            {(isLoading || isSyncing) && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/10 backdrop-blur-[0.5px]">
                    <RefreshCcw className="w-5 h-5 text-[#4988c4] animate-spin" />
                </div>
            )}
            <div className="flex gap-3">
                {/* Ảnh */}
                <div className="relative h-[66px] w-[66px] flex-shrink-0 rounded-xl overflow-hidden bg-slate-50 group border border-slate-100 shadow-sm">
                    {enriched.isLoading && !enriched.image ? (
                        <Skeleton className="w-full h-full bg-slate-100" />
                    ) : (
                        <img
                            src={enriched.image || "/images/placeholder-product.svg"}
                            alt={enriched.name || item.name}
                            className={cn(
                                "w-full h-full object-contain transition-all duration-500 group-hover:scale-105",
                                !enriched.image && !isLoading ? "opacity-50" : "opacity-100"
                            )}
                            decoding="async"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/placeholder-product.svg"
                            }}
                        />
                    )}
                    {item.isCustom && (
                        <div className="absolute top-0 left-0 bg-amber-500 text-white text-[6px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-br-md z-10 shadow-sm">
                            Custom
                        </div>
                    )}
                    {enriched.isCombo && (
                        <div className="absolute top-0 left-0 bg-[#4988c4] text-white text-[6px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-br-md z-10 shadow-sm">
                            Bundle
                        </div>
                    )}
                </div>

                {/* Nội dung */}
                <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-[13px] font-bold text-gray-900 leading-snug line-clamp-2 flex-1 group-hover:text-[#4988c4] transition-colors uppercase tracking-tight">
                            {enriched.name || item.name}
                        </h4>
                        <button
                            onClick={() => onRemove(item.id)}
                            className="flex-shrink-0 p-1.5 -mt-1 -mr-1 rounded-full text-gray-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {item.isCustom && (
                            <span className="text-[8px] font-black text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                                Bespoke
                            </span>
                        )}
                        {(enriched.color || item.color) && (
                            <span className="text-[9px] font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded flex items-center gap-1 border border-gray-100">
                                <div className="w-2 h-2 rounded-full border border-gray-200" style={{ backgroundColor: getColorHex(enriched.color || item.color) }} />
                                {enriched.color || item.color}
                            </span>
                        )}
                        {(enriched.size || item.size) && (
                            <span className="text-[9px] font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                {enriched.size || item.size}
                            </span>
                        )}
                        {item.customAttributes && Object.entries(item.customAttributes).map(([k, v]) => {
                            if (['length', 'width', 'thickness', 'size', 'colorHex', 'imageMode', 'productVariantId'].includes(k) || !v) return null;
                            const isUrl = typeof v === 'string' && (v.includes('cloudinary.com') || v.startsWith('blob:'));
                            const displayValue = isUrl ? (v.split('/').pop() || 'Design') : v;
                            return (
                                <span key={k} className="text-[9px] font-bold text-amber-600 bg-amber-50/30 px-1.5 py-0.5 rounded border border-amber-100/30">
                                    <span className="opacity-40 uppercase text-[7px]">{k}:</span> {displayValue}
                                </span>
                            );
                        })}
                    </div>

                    {item.availableStock !== undefined && item.availableStock <= 10 && (
                        <div className={cn(
                            "flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-md w-fit text-[8px] font-black uppercase tracking-[0.1em]",
                            item.quantity >= item.availableStock
                                ? "bg-rose-50 text-rose-600 border border-rose-100"
                                : "bg-amber-50 text-amber-600 border border-amber-100"
                        )}>
                            <Package className="w-2.5 h-2.5" />
                            {item.quantity >= item.availableStock
                                ? `Stock Limit Reached (${item.availableStock} max)`
                                : `Only ${item.availableStock} remaining`
                            }
                        </div>
                    )}

                    {/* Trade-in */}
                    {hasTradeIn && (
                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="self-start mb-2 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center gap-1 text-[9px] text-emerald-600 font-bold hover:bg-emerald-100">
                                        <RefreshCcw className="w-2.5 h-2.5" />
                                        {item.tradeIn!.products.length} Trade-in · −{formatPrice(item.tradeIn!.totalValue)}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="start" className="w-56 p-3 bg-white border border-slate-100 shadow-xl rounded-xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Trade-in bundle</p>
                                    <div className="space-y-2">
                                        {item.tradeIn!.products.map((p) => (
                                            <div key={p.id} className="flex items-center gap-2">
                                                <img src={p.image} alt={p.name} className="w-7 h-7 rounded-lg object-cover border border-slate-100" />
                                                <span className="flex-1 text-[11px] font-bold text-slate-600 truncate">{p.name}</span>
                                                <span className="text-emerald-600 font-bold">−{formatPrice(p.tradeInValue)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    {/* Qty & Price */}
                    <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-lg border border-slate-100">
                            <button
                                onClick={() => onUpdateQuantity(item.id, -1)}
                                disabled={item.quantity <= 1}
                                className="h-7 w-7 flex items-center justify-center rounded-md bg-white border border-slate-200 text-gray-400 hover:border-[#4988c4] hover:text-[#4988c4] disabled:opacity-20 transition-all shadow-sm"
                            >
                                <Minus className="h-2.5 w-2.5" />
                            </button>
                            
                            <input
                                type="text"
                                inputMode="numeric"
                                value={isEditing ? localQty : item.quantity.toString()}
                                onChange={handleInputChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                onKeyDown={handleKeyDown}
                                className={cn(
                                    "w-8 text-center text-[11px] font-black text-slate-900 bg-transparent border-none focus:outline-none tabular-nums",
                                    isEditing && "text-[#4988c4]"
                                )}
                            />

                            <button
                                onClick={() => onUpdateQuantity(item.id, 1)}
                                disabled={item.availableStock !== undefined && item.quantity >= item.availableStock}
                                className={cn(
                                    "h-7 w-7 flex items-center justify-center rounded-md bg-white border border-slate-200 text-gray-400 transition-all shadow-sm",
                                    "hover:border-[#4988c4] hover:text-[#4988c4]",
                                    "disabled:opacity-20 disabled:cursor-not-allowed"
                                )}
                            >
                                <Plus className="h-2.5 w-2.5" />
                            </button>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-black text-slate-900 tabular-nums">
                                {formatPrice(item.subtotal)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Combo Expansion Details */}
            {enriched.isCombo && enriched.subItems && enriched.subItems.length > 0 && (
                <div className="mt-3 ml-[78px] space-y-2 border-t border-dashed border-slate-100 pt-3">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1 h-1 rounded-full bg-[#4988c4]" />
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Includes</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        {enriched.subItems.map((sub, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                    <SubItemImage
                                        variantId={sub.productVariantId || ""}
                                        fallbackImage={sub.image}
                                        alt={sub.name}
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 truncate flex-1">{sub.name}</span>
                                <span className="text-[9px] font-black text-[#4988c4]">x{sub.quantity * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Artistic Animated Separator */}
            <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden mt-2">
                <div className="w-full h-full border-t border-dashed border-slate-100" />
            </div>
        </div>
    );
});

export function CartDrawer() {
    const { cart, updateQuantity, setQuantity, removeItem, totalItems, totalPrice, totalTradeInDiscount, finalTotal, loadingIds, syncingIds } = useCart()
    const { isCartOpen: open, setCartOpen: setOpen } = useCartStore()
    const { cartIconRef, isCartBouncing } = useCartAnimation()
    const navigate = useNavigate()

    const handleUpdateQuantity = useCallback((id: string, delta: number) => {
        updateQuantity(id, delta)
    }, [updateQuantity])

    const handleSetQuantity = useCallback((id: string, quantity: number) => {
        setQuantity(id, quantity)
    }, [setQuantity])

    const handleRemoveItem = useCallback((id: string) => {
        removeItem(id)
    }, [removeItem])

    const handleCheckout = useCallback(() => {
        setOpen(false)
        navigate(AppRoute.CHECKOUT)
    }, [navigate, setOpen])

    const cartItems = useMemo(() => (
        cart.map((item: CartItem) => (
            <CartDrawerItem
                key={item.configHash || item.id}
                item={item}
                loadingIds={loadingIds}
                syncingIds={syncingIds}
                onUpdateQuantity={handleUpdateQuantity}
                onSetQuantity={handleSetQuantity}
                onRemove={handleRemoveItem}
            />
        ))
    ), [cart, loadingIds, syncingIds, handleUpdateQuantity, handleSetQuantity, handleRemoveItem])

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
                    <div className="custom-scrollbar scrollbar-profile flex-1 overflow-y-auto px-5 overscroll-contain">
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
                                    <span className="cart-drawer-footer-label">Subtotal</span>
                                    <span className="cart-drawer-footer-value">{formatPrice(totalPrice)}</span>
                                </div>
                                {totalTradeInDiscount > 0 && (
                                    <div className="flex justify-between items-center px-3 py-2 bg-emerald-50 rounded-lg">
                                        <span className="text-emerald-700 flex items-center gap-1.5 font-medium">
                                            <RefreshCcw className="w-3.5 h-3.5" />
                                            Trade-in Discount
                                        </span>
                                        <span className="font-semibold text-emerald-600">−{formatPrice(totalTradeInDiscount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Shipping</span>
                                    <span className="font-medium text-emerald-600">Free</span>
                                </div>
                                <div className="relative py-2">
                                    <div className="absolute inset-x-0 top-0 h-px border-t border-dashed border-slate-100" />
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="cart-drawer-footer-label !text-slate-500">Total</span>
                                        <span className="text-xl font-black text-[#4988c4] tracking-tighter tabular-nums">
                                            {formatPrice(finalTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <Button
                                    onClick={handleCheckout}
                                    className="cart-checkout-btn relative w-full h-12 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl text-white group overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Proceed to Checkout
                                    </span>
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
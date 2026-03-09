import { Minus, Plus, Trash2, ShoppingBag, AlertCircle, ShieldCheck, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartItem } from "@/store/cartTypes";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CartTableProps {
    cart: CartItem[];
    onQuantity: (id: string, delta: number) => void;
    onRemove: (id: string) => void;
    loadingIds?: string[];
    syncingIds?: string[];
}

// Map tên màu thông dụng → hex (giống CartDrawer)
const COLOR_HEX: Record<string, string> = {
    red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
    black: '#111827', white: '#ffffff', gray: '#6b7280', grey: '#6b7280',
    pink: '#ec4899', purple: '#a855f7', orange: '#f97316', brown: '#92400e',
    navy: '#1e3a5f', teal: '#14b8a6', gold: '#d97706', silver: '#9ca3af',
    beige: '#d4b896', cream: '#fffdd0', coral: '#ff6b6b', mint: '#98d8c8',
}

function resolveColor(color: string): string {
    const key = color.toLowerCase().trim();
    return COLOR_HEX[key] ?? (key.startsWith('#') ? key : '#e2e8f0');
}

export function CartTable({ cart, onQuantity, onRemove, loadingIds = [], syncingIds = [] }: CartTableProps) {
    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white/40 backdrop-blur-md rounded-[40px] border-2 border-dashed border-primary/20 transition-all duration-500 hover:border-primary/40">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                    <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-8 rounded-full border border-white/50 shadow-inner">
                        <ShoppingBag className="w-12 h-12 text-primary" />
                    </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Your cart is empty</h3>
                <p className="text-gray-500 max-w-xs text-center leading-relaxed">
                    Looks like you haven't added anything to your cart yet. Let's find something special!
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {cart.map((item) => {
                const isLoading = loadingIds.includes(item.id);
                const isSyncing = syncingIds.includes(item.id);
                const isOutOfStock = item.availableStock !== undefined && item.availableStock < item.quantity;
                const isLowStock = item.availableStock !== undefined && item.availableStock > 0 && item.availableStock < 5;
                const hasTradeIn = !!(item.tradeIn?.totalValue && item.tradeIn.totalValue > 0);

                return (
                    <div
                        key={item.id}
                        className={cn(
                            "group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-[32px] border transition-all duration-500 hover:shadow-2xl hover:-translate-y-1",
                            hasTradeIn
                                ? "border-emerald-200 shadow-emerald-700/5 bg-gradient-to-br from-white/90 to-emerald-50/30"
                                : "border-white/60 shadow-black/[0.03] hover:shadow-primary/5",
                            isLoading && "opacity-70 pointer-events-none"
                        )}
                    >
                        {/* Trade-in Indicator Badge */}
                        {hasTradeIn && (
                            <div className="absolute top-0 right-0 pt-3 pr-8">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-2xl rounded-tr-lg shadow-lg shadow-emerald-500/20">
                                    <RefreshCw className="w-3 h-3 animate-spin-slow" /> Trade-in Bundle
                                </span>
                            </div>
                        )}

                        {/* Loading Overlay */}
                        {isLoading && (
                            <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Updating</span>
                                </div>
                            </div>
                        )}

                        <div className="p-6 sm:p-8">
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* 1. Image Section */}
                                <div className="relative group/img flex-shrink-0 mx-auto md:mx-0">
                                    <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-[32px] overflow-hidden bg-gray-50 border-2 border-white shadow-md transition-transform duration-700 group-hover/img:scale-[1.03]">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className={cn(
                                                "w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110",
                                                isLoading && "opacity-30"
                                            )}
                                        />
                                        {isLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                            </div>
                                        )}
                                        {isSyncing && !isLoading && (
                                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg border border-primary/20 animate-bounce-subtle">
                                                <RefreshCw className="w-3 h-3 text-primary animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    {isOutOfStock && (
                                        <div className="absolute inset-0 z-[1] bg-black/40 backdrop-blur-sm rounded-[32px] flex items-center justify-center">
                                            <span className="text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-rose-500 rounded-full">Out of Stock</span>
                                        </div>
                                    )}
                                </div>

                                {/* 2. Content Section */}
                                <div className="flex flex-1 flex-col min-w-0">
                                    <div className="flex justify-between items-start gap-4 mb-4">
                                        <div className="space-y-1.5">
                                            <h3 className="text-xl md:text-2xl font-black text-gray-900 group-hover:text-primary transition-colors leading-[1.1] tracking-tight">
                                                {item.name}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {item.sku && (
                                                    <Badge variant="outline" className="bg-gray-100/50 text-gray-400 border-gray-200 text-[10px] py-0 px-2 font-mono">
                                                        #{item.sku}
                                                    </Badge>
                                                )}
                                                <span className="h-1 w-1 bg-gray-300 rounded-full" />
                                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">DreamGuard Verified</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => onRemove(item.id)}
                                            className="p-3.5 rounded-2xl text-gray-300 hover:text-rose-500 hover:bg-rose-50 border border-transparent transition-all duration-300 group/del"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 className="w-5 h-5 transition-transform duration-300 group-hover/del:scale-110" />
                                        </button>
                                    </div>

                                    {/* VISUAL VARIANTS - Highly Distinct */}
                                    <div className="flex flex-wrap items-center gap-3 mb-6">
                                        {item.color && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm ring-1 ring-black/5 hover:ring-primary/20 transition-all cursor-default">
                                                            <div
                                                                className="w-5 h-5 rounded-full border-2 border-white ring-1 ring-black/10 shadow-sm"
                                                                style={{ backgroundColor: resolveColor(item.color) }}
                                                            />
                                                            <div className="flex flex-col leading-none">
                                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Color</span>
                                                                <span className="text-[13px] font-black text-gray-900">{item.color}</span>
                                                            </div>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Color: {item.color}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {item.size && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex items-center gap-2.5 px-3 py-2 bg-primary/5 rounded-2xl border border-primary/10 shadow-sm ring-1 ring-primary/5 hover:ring-primary/20 transition-all cursor-default">
                                                            <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                                                                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                                            </div>
                                                            <div className="flex flex-col leading-none">
                                                                <span className="text-[9px] font-black text-primary/60 uppercase tracking-tighter">Size</span>
                                                                <span className="text-[13px] font-black text-primary">{item.size}</span>
                                                            </div>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Size: {item.size}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        <div className="h-4 w-px bg-gray-200 mx-1" />
                                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-[11px]">
                                            <ShieldCheck className="w-4 h-4" />
                                            <span>Premium Warranty</span>
                                        </div>
                                    </div>

                                    {/* 3. Business Bar */}
                                    <div className="mt-auto grid grid-cols-1 sm:grid-cols-3 gap-6 items-center p-5 bg-gray-50/50 rounded-[24px] border border-gray-100/50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Unit Price</span>
                                            <span className="text-xl font-black text-gray-900 tracking-tight">${item.price.toFixed(2)}</span>
                                        </div>

                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center p-1.5 rounded-2xl bg-white shadow-sm border border-gray-100">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all"
                                                    onClick={() => onQuantity(item.id, -1)}
                                                    disabled={item.quantity <= 1 || isLoading}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-10 text-center text-sm font-black text-gray-900 tabular-nums">{item.quantity}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-xl hover:bg-emerald-50 hover:text-emerald-500 transition-all"
                                                    onClick={() => onQuantity(item.id, 1)}
                                                    disabled={isLoading || (item.availableStock !== undefined && item.quantity >= item.availableStock)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Subtotal</span>
                                            <div className="flex flex-col items-end leading-none">
                                                <span className={cn(
                                                    "text-2xl font-black tracking-tighter",
                                                    hasTradeIn ? "text-emerald-600" : "text-primary"
                                                )}>
                                                    ${item.subtotal.toFixed(2)}
                                                </span>
                                                {hasTradeIn && (
                                                    <span className="text-[10px] font-bold text-emerald-500 line-through opacity-50">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TRADE-IN DETAILS DRAWER (Visible if Trade-in exists) */}
                        {hasTradeIn && (
                            <div className="bg-emerald-500/5 border-t border-emerald-100/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="flex -space-x-4 overflow-hidden py-1">
                                        {item.tradeIn!.products.map((p, idx) => (
                                            <div key={idx} className="inline-block h-12 w-12 rounded-2xl ring-4 ring-white shadow-lg overflow-hidden group-hover:translate-y-[-4px] transition-transform duration-300">
                                                <img src={p.image} className="h-full w-full object-cover" alt={p.name} title={p.name} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="text-[11px] font-black text-emerald-700 uppercase tracking-widest mb-1">Trading Devices ({item.tradeIn!.products.length})</h4>
                                        <p className="text-[13px] font-bold text-gray-600 flex items-center gap-1 leading-none">
                                            {item.tradeIn!.products.map(p => p.name).join(' + ')}
                                            <ChevronRight className="w-3.5 h-3.5 opacity-40 ml-1" />
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center sm:items-end">
                                    <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-1">Bundle Savings</span>
                                    <span className="text-xl font-black text-emerald-600">−${item.tradeIn!.totalValue.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        {/* Stock Warnings */}
                        {(isLowStock || isOutOfStock) && (
                            <div className={cn(
                                "m-6 sm:mx-8 sm:mb-8 mt-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[11px] font-bold border",
                                isOutOfStock ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-orange-50 text-orange-600 border-orange-100"
                            )}>
                                <AlertCircle className="w-4 h-4" />
                                <span>{isOutOfStock ? "Critical: This version is currently unavailable." : `Limited: Only ${item.availableStock} units left in stock for this variant.`}</span>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Premium Bottom Summary */}
            <div className="mt-4 px-10 py-6 bg-primary/5 backdrop-blur-md rounded-[32px] border border-primary/10 flex flex-wrap justify-between items-center gap-6">
                <div className="flex gap-10">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-primary/50 uppercase tracking-widest mb-1">Total Grouped</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-primary-dark">{cart.length}</span>
                            <span className="text-xs font-bold text-primary/60">ITEMS</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-primary/50 uppercase tracking-widest mb-1">Gross Units</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-primary-dark">
                                {cart.reduce((acc, item) => acc + item.quantity, 0)}
                            </span>
                            <span className="text-xs font-bold text-primary/60">UNITS</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 py-2 px-5 bg-white/60 rounded-2xl border border-white/80 shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span className="text-[11px] font-black text-gray-700 uppercase tracking-widest">Secured Checkout by DreamGuard</span>
                </div>
            </div>
        </div>
    );
}

// Custom animations in Tailwind usually go to CSS, but since we are using inline/cn:
// Note: animate-spin-slow and animate-pulse-slow would need configuration in tailwind.config.js
// or use simple custom CSS if needed.

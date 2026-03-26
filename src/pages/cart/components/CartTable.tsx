import { Minus, Plus, Trash2, ShoppingBag, ShieldCheck, RefreshCw, ChevronRight, AlertCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartItem } from "@/store/cartTypes";
import { cn, formatPrice } from "@/lib/utils";

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

function resolveColor(item: CartItem): string {
    const color = item.color || '';
    const key = color.toLowerCase().trim();
    if (key === 'custom' && item.customAttributes?.colorHex) {
        return item.customAttributes.colorHex;
    }
    return COLOR_HEX[key] ?? (key.startsWith('#') ? key : '#e2e8f0');
}

export function CartTable({ cart, onQuantity, onRemove, loadingIds = [] }: CartTableProps) {
    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-50" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#4988c4]/5 rounded-full -ml-12 -mb-12 opacity-50" />
                
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-6 relative z-10">
                    <ShoppingBag className="w-6 h-6 text-[#4988c4]" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight uppercase relative z-10">Your bag is empty</h3>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] max-w-xs text-center leading-relaxed relative z-10">
                    Discover our premium collection and start your dream journey.
                </p>
                <Button 
                    variant="ghost" 
                    className="mt-8 px-8 h-10 rounded-xl border border-dashed border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-[#4988c4] hover:text-white hover:border-transparent transition-all relative z-10 overflow-hidden group/btn"
                    onClick={() => window.location.href = '/'}
                >
                    <span className="relative z-10">Start Exploring</span>
                    <div className="absolute inset-x-0 bottom-0 h-[1px] border-t border-dashed border-[#4988c4] scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-500 origin-left" />
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {cart.map((item) => {
                const isLoading = loadingIds.includes(item.id);
                const isOutOfStock = item.availableStock !== undefined && item.availableStock < item.quantity;
                const isLowStock = item.availableStock !== undefined && item.availableStock > 0 && item.availableStock < 5;
                const hasTradeIn = !!(item.tradeIn?.totalValue && item.tradeIn.totalValue > 0);

                return (
                    <div
                        key={item.id}
                        className={cn(
                            "group relative overflow-hidden bg-white rounded-2xl border border-slate-100 p-3 sm:p-4 transition-all duration-300 hover:border-[#4988c4]/30",
                            hasTradeIn && "bg-emerald-50/10 border-emerald-100/50",
                            item.isCustom && "bg-amber-50/50 border-amber-100/50", // Added for custom items
                            isLoading && "opacity-70 pointer-events-none"
                        )}
                    >
                        {/* Artistic Subtle Separator - Sharp Reveal */}
                        <div className="absolute top-4 bottom-4 right-10 w-px hidden lg:block overflow-hidden">
                            <div className="h-full w-full border-r border-dashed border-slate-100 scale-y-0 group-hover:scale-y-100 transition-transform duration-1000 origin-top opacity-50" />
                        </div>
                        {/* Trade-in Indicator Badge */}
                        {hasTradeIn && (
                            <div className="absolute top-0 right-0 pt-3 pr-8">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-2xl rounded-tr-lg shadow-lg shadow-emerald-500/20">
                                    <RefreshCw className="w-3 h-3 animate-spin-slow" /> Trade-in Bundle
                                </span>
                            </div>
                        )}

                        {/* Loading State Overlay - Sharp & Clean */}
                        {isLoading && (
                            <div className="absolute inset-0 z-10 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
                                <RefreshCw className="w-6 h-6 text-[#4988c4] animate-spin" />
                            </div>
                        )}

                        <div className="p-4 sm:p-5">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="relative flex-shrink-0">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 group-hover:border-[#4988c4]/20 transition-colors relative">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className={cn(
                                                "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
                                                isLoading && "opacity-30"
                                            )}
                                        />
                                        {item.isCustom && (
                                            <div className="absolute top-0 left-0 bg-amber-500 text-white text-[7px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-br-lg z-10 shadow-sm border-r border-b border-white/20">
                                                Bespoke
                                            </div>
                                        )}
                                    </div>
                                    {isOutOfStock && (
                                        <div className="absolute inset-0 z-[1] bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-200">
                                            <span className="text-[7px] font-black text-white/90 uppercase tracking-widest px-1.5 py-0.5 bg-rose-500 rounded">Sold Out</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col min-w-0">
                                    {item.isCustom && (
                                        <div className="mb-2">
                                            <span className="px-2 py-0.5 bg-amber-500 text-white text-[7px] font-black uppercase tracking-[0.2em] rounded-md shadow-sm">
                                                Bespoke / Custom Build
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start gap-4 mb-3">
                                        <div className="space-y-0.5">
                                            <h3 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight leading-tight uppercase">
                                                {item.isCustom && <Star className="w-3.5 h-3.5 inline mr-2 text-amber-500 fill-current" />}
                                                {item.name}
                                            </h3>
                                            <p className={cn(
                                                "text-[8px] font-black uppercase tracking-widest flex items-center gap-2",
                                                item.isCustom ? "text-amber-500" : "text-[#4988c4]"
                                            )}>
                                                ID: <span className="text-slate-300 font-bold">#{item.id.slice(0, 8)}</span>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                <span className="text-emerald-500">Verified</span>
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => onRemove(item.id)}
                                            className="p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors group/del"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        {item.color && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50/50 rounded-lg border border-slate-100">
                                                <div 
                                                    className="w-2 h-2 rounded-full border border-white shadow-sm" 
                                                    style={{ backgroundColor: resolveColor(item) }}
                                                />
                                                <span className="text-[8px] font-black text-slate-900 uppercase">
                                                    {item.color === 'Custom' && item.customAttributes?.colorHex ? item.customAttributes.colorHex : item.color}
                                                </span>
                                            </div>
                                        )}
                                        {item.size && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#4988c4]/5 rounded-lg border border-[#4988c4]/10">
                                                <span className="text-[8px] font-black text-[#4988c4] uppercase tracking-widest pl-1">
                                                    {item.size === 'Custom' && item.customAttributes?.length 
                                                        ? `${item.customAttributes.length}x${item.customAttributes.width}x${item.customAttributes.thickness} cm` 
                                                        : item.size}
                                                </span>
                                            </div>
                                        )}
                                        {item.isCustom && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 rounded-lg border border-amber-100">
                                                <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Bespoke Build</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-auto pt-3 relative">
                                        <div className="absolute top-0 left-0 w-full h-px border-t border-dashed border-slate-50 overflow-hidden">
                                            <div className="w-full h-full border-t border-dashed border-[#4988c4]/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                                        </div>
                                        <div className="flex flex-row items-center justify-between gap-2">
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Price</span>
                                                    <span className="text-xs font-black text-slate-900 tracking-tight tabular-nums">{formatPrice(item.price)}</span>
                                                </div>

                                                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-50 border border-slate-100">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 rounded-md hover:bg-white transition-all p-0 flex items-center justify-center text-slate-400 hover:text-[#4988c4]"
                                                        onClick={() => onQuantity(item.id, -1)}
                                                        disabled={item.quantity <= 1 || isLoading}
                                                    >
                                                        <Minus className="h-2.5 w-2.5" />
                                                    </Button>
                                                    <span className="w-5 text-center text-[10px] font-black text-slate-900">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 rounded-md hover:bg-white transition-all p-0 flex items-center justify-center text-slate-400 hover:text-[#4988c4]"
                                                        onClick={() => onQuantity(item.id, 1)}
                                                        disabled={isLoading || (item.availableStock !== undefined && item.quantity >= item.availableStock)}
                                                    >
                                                        <Plus className="h-2.5 w-2.5" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end">
                                                <span className="text-[7px] font-black text-[#4988c4] uppercase tracking-widest mb-0.5">Subtotal</span>
                                                <span className={cn(
                                                    "text-sm font-black tracking-tight tabular-nums leading-none",
                                                    hasTradeIn ? "text-emerald-500" : "text-[#4988c4]"
                                                )}>
                                                    {formatPrice(item.subtotal)}
                                                </span>
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
                                    <span className="text-xl font-black text-emerald-600">−{formatPrice(item.tradeIn!.totalValue)}</span>
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

            {/* Clean Bottom Summary - Compact Design */}
            <div className="mt-4 flex flex-wrap justify-between items-center gap-4 p-2 bg-white rounded-2xl border border-slate-100 relative overflow-hidden group/summary">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-slate-50" />
                <div className="flex items-center gap-8 px-6 py-2">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-[7px] font-black text-[#4988c4] uppercase tracking-widest mb-0.5">Selection</span>
                            <span className="text-xl font-black text-slate-900 tabular-nums">{cart.length} <span className="text-[9px] text-slate-400">Items</span></span>
                        </div>
                    </div>
                    <div className="w-px h-6 border-r border-dashed border-slate-100" />
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Units</span>
                            <span className="text-xl font-black text-slate-900 tabular-nums">
                                {cart.reduce((acc, item) => acc + item.quantity, 0)} <span className="text-[9px] text-slate-400">Total</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 py-2 px-4 mr-4 bg-[#4988c4]/5 rounded-xl border border-dashed border-[#4988c4]/10 hover:border-[#4988c4]/30 transition-all duration-500 cursor-default">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#4988c4]" />
                    <span className="text-[9px] font-black text-[#4988c4] uppercase tracking-widest">Premium Secure Check</span>
                </div>
            </div>
        </div>
    );
}

// Custom animations in Tailwind usually go to CSS, but since we are using inline/cn:
// Note: animate-spin-slow and animate-pulse-slow would need configuration in tailwind.config.js
// or use simple custom CSS if needed.

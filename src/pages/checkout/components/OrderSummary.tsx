import type { CartItem } from "@/store/cartTypes"
import type { UserVoucherResponse } from "@/api/types/voucher.types"
import { lazy, Suspense, useMemo } from "react"
import { ShoppingBag, RefreshCcw, ShieldCheck, TicketPercent, WalletCards } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { formatPrice } from "@/lib/utils"
import { getVoucherDiscountRatio } from "@/utils/user-voucher"
import { useCoinRewardConfig } from "@/hooks/queries/useCoinRewardConfig"
import { Sparkles } from "lucide-react"

const EMPTY_VALUE = "__none__"
const LazyOrderSummaryItemList = lazy(() => import("./OrderSummaryItemList"))

interface OrderSummaryProps {
    cart: CartItem[]
    totalPrice: number
    tradeInDiscount?: number
    finalTotal?: number
    voucherDiscount?: number
    appliedVoucherCode?: string | null
    payableTotal?: number
    availableVouchers?: UserVoucherResponse[]
    selectedVoucherId?: string | null
    onVoucherChange?: (voucherId: string | null) => void
    isVoucherEnabled?: boolean
    isVoucherLoading?: boolean
    isVoucherError?: boolean
    onVoucherRetry?: () => void
    estimatedDeliveryDate?: string
}

export function OrderSummary({
    cart,
    totalPrice,
    tradeInDiscount = 0,
    finalTotal,
    voucherDiscount = 0,
    appliedVoucherCode,
    payableTotal,
    availableVouchers = [],
    selectedVoucherId = null,
    onVoucherChange,
    isVoucherEnabled = false,
    isVoucherLoading = false,
    isVoucherError = false,
    onVoucherRetry,
    estimatedDeliveryDate
}: OrderSummaryProps) {
    const { orderCompletionCoin } = useCoinRewardConfig();
    const shipping = 0
    const subtotalAfterTradeIn = finalTotal ?? totalPrice
    const safeVoucherDiscount = Math.min(Math.max(voucherDiscount, 0), Math.max(subtotalAfterTradeIn, 0))
    const totalAfterVoucher = typeof payableTotal === "number"
        ? Math.max(0, payableTotal)
        : Math.max(0, subtotalAfterTradeIn - safeVoucherDiscount)
    const tax = 0 // Resolved: UI matches API total directly, no manual tax injection
    const total = totalAfterVoucher + shipping + tax

    const itemCount = useMemo(
        () => cart.reduce((acc, item) => acc + item.quantity, 0),
        [cart]
    )

    return (
        <div className="sticky top-10">
            <div className="group rounded-[2rem] border border-slate-100 bg-white p-7 shadow-2xl shadow-slate-200/35 hover:shadow-3xl transition-all duration-700">
                {/* Simplified Header */}
                <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-50">
                    <div className="space-y-1">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Order Summary</h2>
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Review your selections</p>
                            <span className="h-1 w-1 rounded-full bg-slate-200" />
                            <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{itemCount} Items</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-[1.25rem] bg-slate-50 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-slate-900" />
                    </div>
                </div>

                <Suspense
                    fallback={
                        <div className="space-y-4 mb-6 max-h-[290px] overflow-hidden pt-2 pr-4 pl-1 -ml-1">
                            <Skeleton className="h-16 w-full rounded-2xl" />
                            <Skeleton className="h-16 w-full rounded-2xl" />
                            <Skeleton className="h-16 w-full rounded-2xl" />
                        </div>
                    }
                >
                    <LazyOrderSummaryItemList cart={cart} />
                </Suspense>

                <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 text-primary-500">
                            <TicketPercent className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Apply Voucher</span>
                        </div>
                        {appliedVoucherCode && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary-500 bg-white border border-primary-100 rounded-lg px-2 py-1">
                                {appliedVoucherCode}
                            </span>
                        )}
                    </div>

                    {!isVoucherEnabled && (
                        <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2 text-amber-700 text-[11px] font-semibold flex items-center gap-2">
                            <WalletCards className="w-3.5 h-3.5" />
                            Login to select and apply voucher.
                        </div>
                    )}

                    {isVoucherEnabled && (
                        <>
                            {isVoucherLoading && (
                                <div className="space-y-2">
                                    <Skeleton className="h-10 w-full rounded-xl" />
                                    <Skeleton className="h-3 w-3/4 rounded-full" />
                                </div>
                            )}

                            {!isVoucherLoading && isVoucherError && (
                                <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3">
                                    <p className="text-xs font-bold text-rose-600">Failed to load vouchers.</p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onVoucherRetry}
                                        className="mt-2 h-8 rounded-lg border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
                                    >
                                        Retry
                                    </Button>
                                </div>
                            )}

                            {!isVoucherLoading && !isVoucherError && (
                                <div className="space-y-2">
                                    <Select
                                        value={selectedVoucherId ?? EMPTY_VALUE}
                                        onValueChange={(value) => onVoucherChange?.(value === EMPTY_VALUE ? null : value)}
                                        disabled={!onVoucherChange || availableVouchers.length === 0}
                                    >
                                        <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white font-bold">
                                            <SelectValue placeholder="Choose voucher" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-100">
                                            <SelectItem value={EMPTY_VALUE} className="rounded-lg">
                                                No voucher
                                            </SelectItem>
                                            {availableVouchers.map((voucher) => {
                                                const percent = Math.round(getVoucherDiscountRatio(voucher) * 100)
                                                const capText =
                                                    voucher.maxDiscountAmount > 0
                                                        ? ` - cap ${formatPrice(voucher.maxDiscountAmount)}`
                                                        : ""

                                                return (
                                                    <SelectItem
                                                        key={voucher.userVoucherId}
                                                        value={voucher.userVoucherId}
                                                        className="rounded-lg"
                                                    >
                                                        {voucher.code} - {percent}% OFF{capText}
                                                    </SelectItem>
                                                )
                                            })}
                                        </SelectContent>
                                    </Select>

                                    {availableVouchers.length === 0 && (
                                        <p className="text-[11px] font-semibold text-slate-400">
                                            No active order vouchers available.
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Totals Section */}
                <div className="space-y-4 pt-6 border-t border-slate-50">
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

                    {safeVoucherDiscount > 0 && (
                        <div className="flex justify-between items-center bg-blue-50/60 rounded-2xl p-4 border border-blue-100/70">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 flex items-center gap-2">
                                Voucher
                                {appliedVoucherCode && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-white/80 border border-blue-100 text-[9px] tracking-wider">
                                        {appliedVoucherCode}
                                    </span>
                                )}
                            </span>
                            <span className="text-sm font-black text-primary-500">-{formatPrice(safeVoucherDiscount)}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Shipping Fees</span>
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[9px] font-black text-primary-500 uppercase tracking-tighter">Premium</span>
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

                    <div className="flex justify-between items-end p-2 pb-2">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">Payable Total</span>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Amount To Pay</h3>
                        </div>
                        <div className="text-right">
                            <span className="text-4xl font-black text-primary-500 tracking-tighter leading-none block">
                                {formatPrice(total)}
                            </span>
                        </div>
                    </div>

                    {/* Security Trust */}
                    <div className="rounded-2xl border-2 border-slate-50 bg-slate-50/30 p-4 space-y-4">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-4 h-4 text-primary-500" />
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

                    {/* Reward Awareness UI */}
                    <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Completion Reward</span>
                        </div>
                        <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">
                            +{Math.floor((total * orderCompletionCoin) / 100)} coins
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

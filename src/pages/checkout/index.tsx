import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useBreadcrumb } from "@/components/common/BreadcrumbNav"
import { LoadingSpinner } from "@/components/common"
import { useCart } from "@/store/useCart"
import { useAuthStore } from "@/store/authStore"
import { AppRoute } from "@/lib/constants"
import { CheckoutForm } from "./components/CheckoutForm"
import { ShieldCheck, ArrowLeft, Lock, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/useCartStore"
import { formatDate } from "@/lib/utils"
import { useUserVouchers } from "@/hooks/queries"
import { calculateVoucherDiscount, isUserVoucherUsable } from "@/utils/user-voucher"

const LazyOrderSummary = lazy(() =>
    import("./components/OrderSummary").then((module) => ({ default: module.OrderSummary }))
)

interface CheckoutRouteState {
    preselectedVoucherId?: string
    preselectedVoucherCode?: string
}

export default function CheckoutPage() {
    const { setItems } = useBreadcrumb()
    const { cart, totalPrice, totalTradeInDiscount, finalTotal, isSyncing, isFetching } = useCart()
    const navigate = useNavigate()
    const location = useLocation()
    const { isAuthenticated } = useAuthStore()
    const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null)

    const navigationState = location.state as CheckoutRouteState | null
    const preselectedVoucherId = navigationState?.preselectedVoucherId ?? null
    const preselectedVoucherCode = navigationState?.preselectedVoucherCode?.trim().toUpperCase() ?? null

    // Production Sync Guard: Ensure we have a clean, synced cart before showing UI
    const isCartReady = !isSyncing && !isFetching;

    const {
        data: voucherPage,
        isLoading: isVoucherLoading,
        isError: isVoucherError,
        refetch: refetchVouchers,
    } = useUserVouchers(isAuthenticated && isCartReady)

    const orderVouchers = useMemo(() => {
        const items = voucherPage?.items ?? [];
        return items.filter((voucher) => isUserVoucherUsable(voucher, "order"));
    }, [voucherPage?.items]);

    const selectedVoucher = useMemo(
        () => orderVouchers.find((voucher) => voucher.userVoucherId === selectedVoucherId) ?? null,
        [orderVouchers, selectedVoucherId]
    );

    const voucherDiscount = useMemo(
        () => (selectedVoucher ? calculateVoucherDiscount(finalTotal, selectedVoucher) : 0),
        [finalTotal, selectedVoucher]
    );

    const payableTotal = useMemo(
        () => Math.max(0, finalTotal - voucherDiscount),
        [finalTotal, voucherDiscount]
    );

    const handleVoucherChange = useCallback((voucherId: string | null) => {
        setSelectedVoucherId(voucherId);
    }, []);

    const handleVoucherRetry = useCallback(() => {
        void refetchVouchers();
    }, [refetchVouchers]);

    const estimatedDate = useMemo(() => {
        const date = new Date();
        date.setDate(date.getDate() + 3); // 3 days shipping
        return formatDate(date);
    }, []);

    useEffect(() => {
        setItems([
            { label: "Home", href: AppRoute.HOME },
            { label: "Cart", href: AppRoute.CART },
            { label: "Checkout", href: AppRoute.CHECKOUT },
        ])
        return () => setItems([])
    }, [setItems])

    useEffect(() => {
        if (isCartReady && cart.length === 0) {
            const timer = setTimeout(() => {
                const freshState = useCartStore.getState();
                if (!freshState.isSyncing && !freshState.isFetching && freshState.cart.length === 0) {
                    navigate(AppRoute.CART);
                }
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [cart.length, navigate, isCartReady]);

    useEffect(() => {
        if (!selectedVoucherId || isVoucherLoading || isVoucherError) return;

        const stillExists = orderVouchers.some((voucher) => voucher.userVoucherId === selectedVoucherId);
        if (!stillExists) {
            // Defer update to avoid cascading render warning
            queueMicrotask(() => setSelectedVoucherId(null));
        }
    }, [isVoucherError, isVoucherLoading, orderVouchers, selectedVoucherId]);

    useEffect(() => {
        if (!isAuthenticated && selectedVoucherId) {
            queueMicrotask(() => setSelectedVoucherId(null));
        }
    }, [isAuthenticated, selectedVoucherId]);

    useEffect(() => {
        if (!isAuthenticated || isVoucherLoading || isVoucherError || orderVouchers.length === 0) {
            return;
        }

        let nextVoucherId: string | null = null;

        if (preselectedVoucherId) {
            const matchedById = orderVouchers.find((voucher) => voucher.userVoucherId === preselectedVoucherId);
            if (matchedById) {
                nextVoucherId = matchedById.userVoucherId;
            }
        }

        if (!nextVoucherId && preselectedVoucherCode) {
            const matchedByCode = orderVouchers.find(
                (voucher) => voucher.code.trim().toUpperCase() === preselectedVoucherCode
            );
            if (matchedByCode) {
                nextVoucherId = matchedByCode.userVoucherId;
            }
        }

        if (nextVoucherId && selectedVoucherId !== nextVoucherId) {
            queueMicrotask(() => setSelectedVoucherId(nextVoucherId));
        }
    }, [
        isAuthenticated,
        isVoucherError,
        isVoucherLoading,
        orderVouchers,
        preselectedVoucherCode,
        preselectedVoucherId,
        selectedVoucherId,
    ]);

    // UI Loading State (Merged) - Placed after all hooks to follow React rules
    if (!isCartReady || (cart.length === 0 && isAuthenticated)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <LoadingSpinner size="md" text="Synchronizing your secure session..." />
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl animate-pulse">
                        <RefreshCcw className="w-4 h-4 text-primary-500 animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Neutral Sync in progress</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Sharp Modern Header */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
                <div className="container mx-auto max-w-[1300px] px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            onClick={() => navigate(AppRoute.CART)}
                            className="group h-8 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Return</span>
                        </Button>
                        <div className="h-4 w-px bg-slate-200" />
                        <h1 className="text-xs font-black uppercase tracking-[0.25em] text-slate-900 leading-none">Checkout</h1>
                    </div>

                    {/* Progress Steps - Ultra Clean */}
                    <div className="hidden md:flex items-center gap-10">
                        <div className="flex items-center gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center text-[8px] font-black text-white">1</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">Shipping</span>
                        </div>
                        <div className="w-6 h-px bg-slate-200" />
                        <div className="flex items-center gap-2.5 opacity-20">
                            <span className="w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center text-[8px] font-black text-slate-900">2</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">Payment</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-100">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">SSL Secure</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-12 items-start">
                    {/* Left Column: Form Fields */}
                    <div className="lg:col-span-7 space-y-6">
                        <section className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 text-white shadow-xl shadow-slate-200">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Guaranteed Purchase</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter leading-tight">
                                Secure checkout
                                <span className="text-primary-500"> in one screen</span>
                            </h2>
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                                Voucher is selected from order summary and synced to final submit.
                            </p>
                        </section>

                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                            <CheckoutForm
                                totalPrice={payableTotal}
                                selectedVoucherId={selectedVoucherId}
                            />
                        </div>
                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="lg:col-span-5 relative">
                        <div className="animate-in fade-in slide-in-from-right-4 duration-1000 delay-300">
                            <Suspense
                                fallback={
                                    <div className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-2xl shadow-slate-200/30 space-y-4">
                                        <div className="h-6 w-40 rounded bg-slate-100 animate-pulse" />
                                        <div className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
                                        <div className="h-12 rounded-xl bg-slate-100 animate-pulse" />
                                        <div className="h-36 rounded-2xl bg-slate-100 animate-pulse" />
                                    </div>
                                }
                            >
                                <LazyOrderSummary
                                    cart={cart}
                                    totalPrice={totalPrice}
                                    tradeInDiscount={totalTradeInDiscount}
                                    finalTotal={finalTotal}
                                    voucherDiscount={voucherDiscount}
                                    appliedVoucherCode={selectedVoucher?.code ?? null}
                                    payableTotal={payableTotal}
                                    availableVouchers={orderVouchers}
                                    selectedVoucherId={selectedVoucherId}
                                    onVoucherChange={handleVoucherChange}
                                    isVoucherEnabled={isAuthenticated}
                                    isVoucherLoading={isVoucherLoading}
                                    isVoucherError={isVoucherError}
                                    onVoucherRetry={handleVoucherRetry}
                                    estimatedDeliveryDate={estimatedDate}
                                />
                            </Suspense>
                        </div>

                        {/* Additional Content / Trust Area */}
                        <div className="mt-6 px-6 py-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                                <RefreshCcw className="w-8 h-8 text-primary-500 animate-spin-slow" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Buyer Protection</h4>
                                <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
                                    30-day return policy for qualified products.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

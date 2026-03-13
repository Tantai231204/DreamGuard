import { useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useBreadcrumb } from "@/components/common/BreadcrumbNav"
import { useCart } from "@/store/useCart"
import { AppRoute } from "@/lib/constants"
import { CheckoutForm } from "./components/CheckoutForm"
import { OrderSummary } from "./components/OrderSummary"
import { ShieldCheck, ArrowLeft, Lock, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/useCartStore"
import { formatDate } from "@/lib/utils"

export default function CheckoutPage() {
    const { setItems } = useBreadcrumb()
    const { cart, totalPrice, totalTradeInDiscount, finalTotal } = useCart()
    const navigate = useNavigate()

    // Production UX: Estimated Delivery calculation (Moved up to follow Hook rules)
    const estimatedDate = useMemo(() => {
        const date = new Date()
        date.setDate(date.getDate() + 3) // 3 days shipping
        return formatDate(date)
    }, [])

    useEffect(() => {
        setItems([
            { label: "Home", href: AppRoute.HOME },
            { label: "Cart", href: AppRoute.CART },
            { label: "Checkout", href: AppRoute.CHECKOUT },
        ])
    }, [setItems])


    useEffect(() => {
        // Redirect to cart if empty, but only after a short delay to allow sync to finish 
        // when switching accounts
        if (cart.length === 0) {
            const timer = setTimeout(() => {
                if (useCartStore.getState().cart.length === 0) {
                    navigate(AppRoute.CART)
                }
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [cart.length, navigate])

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCcw className="w-8 h-8 text-[#4988c4] animate-spin" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing your secure session...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Sharp Modern Header */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-[50] border-b border-slate-100">
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

            <main className="container mx-auto max-w-[1400px] px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    {/* Left Column: Form Fields */}
                    <div className="lg:col-span-7 space-y-12">
                        <section className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 text-white shadow-xl shadow-slate-200">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Guaranteed Purchase</span>
                            </div>
                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                                Complete your <br />
                                <span className="text-[#4988c4]">DreamGuard Experience.</span>
                            </h2>
                        </section>

                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                            <CheckoutForm totalPrice={finalTotal} />
                        </div>
                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="lg:col-span-5 relative">
                        <div className="animate-in fade-in slide-in-from-right-4 duration-1000 delay-300">
                            <OrderSummary
                                cart={cart}
                                totalPrice={totalPrice}
                                tradeInDiscount={totalTradeInDiscount}
                                finalTotal={finalTotal}
                                estimatedDeliveryDate={estimatedDate} // Added estimatedDeliveryDate prop
                            />
                        </div>

                        {/* Additional Content / Trust Area */}
                        <div className="mt-12 px-10 py-8 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                                <RefreshCcw className="w-8 h-8 text-[#4988c4] animate-spin-slow" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Buyer Protection</h4>
                                <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                                    Not satisfied with your purchase? We offer 30-day no-questions-asked returns.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

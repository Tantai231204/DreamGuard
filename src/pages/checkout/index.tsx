import { useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useBreadcrumb } from "@/components/common/breadcrumb/useBreadcrumb"
import { useCart } from "@/store/useCart"
import { AppRoute } from "@/lib/constants"
import { CheckoutForm } from "./components/CheckoutForm"
import { OrderSummary } from "./components/OrderSummary"
import { ShieldCheck, ArrowLeft, Lock, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion" // Added this import

export default function CheckoutPage() {
    const { setItems } = useBreadcrumb()
    const { cart, totalPrice, totalTradeInDiscount, finalTotal } = useCart()
    const navigate = useNavigate()

    // Production UX: Estimated Delivery calculation (Moved up to follow Hook rules)
    const estimatedDate = useMemo(() => {
        const date = new Date()
        date.setDate(date.getDate() + 3) // 3 days shipping
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }, [])

    useEffect(() => {
        setItems([
            { label: "Home", href: AppRoute.HOME },
            { label: "Cart", href: AppRoute.CART },
            { label: "Checkout", href: AppRoute.CHECKOUT },
        ])
    }, [setItems])

    useEffect(() => {
        if (cart.length === 0) {
            navigate(AppRoute.CART)
        }
    }, [cart, navigate])

    if (cart.length === 0) return null

    return (
        <div className="min-h-screen bg-[#fafbfc]">
            {/* Top Slim Progress Bar */}
            <div className="fixed top-0 left-0 right-0 h-1 z-[100] bg-slate-100 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "50%" }}
                    className="h-full bg-[#4988c4] shadow-[0_0_10px_#4988c4]"
                />
            </div>

            {/* Minimalist Premium Header */}
            <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-[50] border-b border-slate-100">
                <div className="container mx-auto max-w-[1400px] px-8 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Button
                            variant="ghost"
                            onClick={() => navigate(AppRoute.CART)}
                            className="group h-12 w-12 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all flex items-center justify-center p-0"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-0.5 transition-all" />
                        </Button>
                        <div className="h-8 w-px bg-slate-100 hidden sm:block" />
                        <div className="space-y-0.5">
                            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase italic">Checkout</h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4988c4]">Secure Transaction</p>
                        </div>
                    </div>

                    {/* Progress Steps - Ultra Minimalist */}
                    <div className="hidden lg:flex items-center gap-12">
                        <div className="flex items-center gap-4 group">
                            <div className="w-8 h-8 rounded-full bg-[#4988c4] flex items-center justify-center shadow-lg shadow-[#4988c4]/20 border-2 border-white">
                                <span className="text-[10px] font-black text-white">01</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Delivery</span>
                        </div>
                        <div className="w-12 h-px bg-slate-100" />
                        <div className="flex items-center gap-4 group opacity-40">
                            <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                                <span className="text-[10px] font-black text-slate-400">02</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Payment</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 px-6 py-2.5 rounded-2xl bg-[#4988c4]/5 border border-[#4988c4]/10">
                        <Lock className="w-3.5 h-3.5 text-[#4988c4]" />
                        <span className="text-[10px] font-black text-[#4988c4] uppercase tracking-widest">End-to-End Encrypted</span>
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

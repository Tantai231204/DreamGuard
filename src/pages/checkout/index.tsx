import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useBreadcrumb } from "@/components/common/breadcrumb/useBreadcrumb"
import { useCart } from "@/store/useCart"
import { AppRoute } from "@/lib/constants"
import { CheckoutForm } from "./components/CheckoutForm.tsx"
import { OrderSummary } from "./components/OrderSummary.tsx"

export default function CheckoutPage() {
    const { setItems } = useBreadcrumb()
    const { cart, totalPrice, totalTradeInDiscount, finalTotal } = useCart()
    const navigate = useNavigate()

    useEffect(() => {
        setItems([
            { label: "Home", href: AppRoute.HOME },
            { label: "Cart", href: AppRoute.CART },
            { label: "Checkout", href: AppRoute.CHECKOUT },
        ])
    }, [setItems])

    useEffect(() => {
        // Redirect to cart if empty
        if (cart.length === 0) {
            navigate(AppRoute.CART)
        }
    }, [cart, navigate])

    if (cart.length === 0) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
            {/* Header Section with Progress */}
            <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-white/95">
                <div className="container mx-auto max-w-7xl px-4 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Checkout</h1>
                            <p className="text-sm text-gray-600 mt-1">Complete your order in just a few steps</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-sm">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-medium">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                SSL Secured
                            </div>
                        </div>
                    </div>
                    
                    {/* Progress Steps */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#4988c4] flex items-center justify-center text-white font-semibold text-sm">
                                1
                            </div>
                            <span className="text-sm font-medium text-gray-900">Shipping</span>
                        </div>
                        <div className="flex-1 h-0.5 bg-gradient-to-r from-[#4988c4] to-gray-300 mx-2" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#4988c4] flex items-center justify-center text-white font-semibold text-sm">
                                2
                            </div>
                            <span className="text-sm font-medium text-gray-900">Payment</span>
                        </div>
                        <div className="flex-1 h-0.5 bg-gray-300 mx-2" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 font-semibold text-sm">
                                3
                            </div>
                            <span className="text-sm font-medium text-gray-400">Complete</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2 space-y-6 animate-slide-up">
                        <CheckoutForm totalPrice={finalTotal} />
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1 animate-slide-up" style={{ animationDelay: "100ms" }}>
                        <OrderSummary 
                            cart={cart} 
                            totalPrice={totalPrice} 
                            tradeInDiscount={totalTradeInDiscount}
                            finalTotal={finalTotal}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

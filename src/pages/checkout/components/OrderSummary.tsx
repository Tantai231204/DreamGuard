import type { CartItem } from "@/store/cartStore"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag } from "lucide-react"

interface OrderSummaryProps {
    cart: CartItem[]
    totalPrice: number
}

export function OrderSummary({ cart, totalPrice }: OrderSummaryProps) {
    const shipping = 0 // Free shipping
    const tax = totalPrice * 0.1 // 10% tax
    const total = totalPrice + shipping + tax

    return (
        <div className="sticky top-24">
            <div className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                    <div className="rounded-full bg-gradient-to-br from-[#4988c4] to-[#3a73a8] p-3 shadow-lg">
                        <ShoppingBag className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                        <p className="text-sm text-gray-500 mt-0.5">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {cart.map((item, index) => (
                        <div key={item.id} className="flex gap-3 group/item animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200 group-hover/item:ring-[#4988c4] transition-all">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                                />
                                <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#4988c4] to-[#3a73a8] text-xs font-bold text-white shadow-lg ring-2 ring-white">
                                    {item.quantity}
                                </span>
                            </div>
                            <div className="flex flex-1 flex-col justify-between py-1">
                                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover/item:text-[#4988c4] transition-colors">
                                    {item.name}
                                </h4>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">{item.quantity} × ${item.price.toFixed(2)}</span>
                                    <p className="text-base font-bold text-[#4988c4]">
                                        ${item.subtotal.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <Separator className="my-4" />

                {/* Pricing Details */}
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium text-gray-900">
                            ${totalPrice.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (10%)</span>
                        <span className="font-medium text-gray-900">
                            ${tax.toFixed(2)}
                        </span>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex justify-between items-center pt-2">
                        <span className="text-base font-semibold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-[#4988c4]">
                            ${total.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-[#4988c4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>Secure SSL encrypted payment</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>30-day money back guarantee</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-[#4988c4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span>Multiple payment options</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

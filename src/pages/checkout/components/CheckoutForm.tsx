import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import type { CheckoutFormData } from "../schema"
import { checkoutSchema } from "../schema"
import { Button } from "@/components/ui/button"
import { DeliveryInfoSection } from "./DeliveryInfoSection.tsx"
import { PaymentSection } from "./PaymentSection.tsx"
import { Loader2 } from "lucide-react"

interface CheckoutFormProps {
    totalPrice: number
}

export function CheckoutForm({ totalPrice }: CheckoutFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            streetAddress: "",
            city: "",
            state: "",
            zipCode: "",
            orderNotes: "",
            paymentMethod: "card",
            cardNumber: "",
            cardName: "",
            expiryDate: "",
            cvv: "",
            saveAddress: false,
        },
    })

    const onSubmit = async (data: CheckoutFormData) => {
        setIsSubmitting(true)
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000))
            console.log("Order submitted:", data)
            
            // Here you would typically:
            // 1. Process payment
            // 2. Create order in backend
            // 3. Clear cart
            // 4. Redirect to success page
            
            alert("Order placed successfully!")
        } catch (error) {
            console.error("Order submission failed:", error)
            alert("Failed to place order. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Delivery Information */}
            <DeliveryInfoSection form={form} />

            {/* Payment Information */}
            <PaymentSection form={form} />

            {/* Submit Button */}
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-16 text-lg font-bold rounded-2xl bg-gradient-to-r from-[#4988c4] to-[#3a73a8] hover:from-[#3a73a8] hover:to-[#2d5a8a] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing your order...
                        </>
                    ) : (
                        <div className="flex items-center justify-center gap-3">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>Complete Order • ${(totalPrice * 1.1).toFixed(2)}</span>
                        </div>
                    )}
                </Button>
                
                <p className="mt-4 text-center text-sm text-gray-500">
                    By placing your order, you agree to our{" "}
                    <a href="#" className="text-[#4988c4] hover:underline font-medium">
                        Terms & Conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-[#4988c4] hover:underline font-medium">
                        Privacy Policy
                    </a>
                </p>

                {/* Trust indicators */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Easy Returns</span>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}

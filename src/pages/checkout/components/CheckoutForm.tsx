import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import type { CheckoutFormData } from "../schema"
import { checkoutSchema } from "../schema"
import { Button } from "@/components/ui/button"
import { DeliveryInfoSection } from "./DeliveryInfoSection"
import { PaymentSection } from "./PaymentSection"
import { Loader2, ArrowRight, ShieldCheck, RefreshCcw } from "lucide-react"

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
            addressId: null,
            userVoucherId: null,
            streetAddress: "",
            city: "",
            district: "",
            ward: "",
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
            const orderPayload = {
                addressId: data.addressId,
                userVoucherId: data.userVoucherId,
                note: data.orderNotes || ""
            }

            console.log("Submitting Order Payload:", orderPayload)
            await new Promise((resolve) => setTimeout(resolve, 2000))
            alert("Order placed successfully!")
        } catch (error) {
            console.error("Order submission failed:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const currentTotal = (totalPrice * 1.1).toLocaleString('en-US', { minimumFractionDigits: 2 })

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 pb-20">
            {/* Delivery Information */}
            <DeliveryInfoSection form={form} />

            {/* Payment Information */}
            <PaymentSection form={form} />

            {/* Submit Button & Trust Area */}
            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-2xl shadow-slate-200/40">
                <div className="flex flex-col gap-8">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-20 text-xl font-black rounded-[1.5rem] bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 group"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-6 w-6 animate-spin text-[#4988c4]" />
                                <span className="uppercase tracking-widest text-sm">Validating Security...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between w-full px-6">
                                <span className="uppercase tracking-widest text-sm">Confirm Order</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl tracking-tighter">${currentTotal}</span>
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </Button>

                    <div className="space-y-6">
                        <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            By placing order, you agree to our{" "}
                            <a href="#" className="underline text-[#4988c4] hover:text-[#3a73a8] transition-colors">Terms</a>
                            {" "} & {" "}
                            <a href="#" className="underline text-[#4988c4] hover:text-[#3a73a8] transition-colors">Privacy</a>
                        </p>

                        <div className="h-px bg-slate-50 w-full" />

                        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
                            <div className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Payment</span>
                            </div>
                            <div className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <RefreshCcw className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Easy Returns</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}

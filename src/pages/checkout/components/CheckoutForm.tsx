import { useEffect, useMemo } from "react"
import type { CheckoutFormData } from "../schema"
import { Button } from "@/components/ui/button"
import { DeliveryInfoSection } from "./DeliveryInfoSection"
import { PaymentSection } from "./PaymentSection"
import { Loader2, ArrowRight, ShieldCheck, RefreshCcw } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { AppRoute } from "@/lib/constants"
import { useToast } from "@/hooks/useToast"
import { useCart } from "@/store/useCart"
import { useCreateOrder, useCreateAddress } from "@/hooks/queries"
import { formatPrice } from "@/lib/utils"
import type { UseFormReturn } from "react-hook-form"

interface CheckoutFormProps {
    form: UseFormReturn<CheckoutFormData>
    totalPrice: number
    selectedVoucherId: string | null
    shippingFee: number
}

export function CheckoutForm({ form, totalPrice, selectedVoucherId, shippingFee }: CheckoutFormProps) {
    const { cart, clearCart } = useCart()
    const navigate = useNavigate()
    const { error: toastError } = useToast()

    const { mutateAsync: createOrder, isPending: isOrderSubmitting } = useCreateOrder()
    const { isPending: isAddressCreating } = useCreateAddress()

    const isSubmitting = isOrderSubmitting || isAddressCreating;


    const { formState: { errors, isSubmitted } } = form

    // Production Optimization: Auto-scroll to first error
    useEffect(() => {
        if (isSubmitted && Object.keys(errors).length > 0) {
            const firstErrorField = Object.keys(errors)[0]
            const element = document.getElementById(firstErrorField) || document.getElementsByName(firstErrorField)[0]
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }
    }, [isSubmitted, errors])

    useEffect(() => {
        const nextVoucherId = selectedVoucherId ?? null
        const currentVoucherId = form.getValues("userVoucherId") ?? null

        if (currentVoucherId === nextVoucherId) return

        form.setValue("userVoucherId", nextVoucherId)
    }, [form, selectedVoucherId])

    const hasCustomProduct = useMemo(() => cart.some(item => item.isCustom), [cart]);

    useEffect(() => {
        if (hasCustomProduct && form.getValues("paymentMethod") === "COD") {
            form.setValue("paymentMethod", "VnPay");
        }
    }, [hasCustomProduct, form]);

    const onSubmit = async (data: CheckoutFormData) => {
        try {
            const addressId = data.addressId

            // Extra safety: Clean the ID of any quotes or whitespace
            const finalAddressId = addressId ? String(addressId).replace(/^["']+|["']+$/g, '').trim() : null

            if (!finalAddressId || finalAddressId === "null" || finalAddressId.length < 32) {
                toastError("Address Required", "Please select or confirm your shipping address before placing an order.")
                return
            }

            const response = await createOrder({
                addressId: finalAddressId,
                userVoucherId: data.userVoucherId || null,
                note: data.orderNotes || "",
                shippingFee: shippingFee,
                paymentMethod: data.paymentMethod
            })

            // Clear cart immediately after successful order creation on backend
            await clearCart()

            if (response.paymentUrl) {
                sessionStorage.setItem('lastOrderType', 'order');
                window.location.assign(response.paymentUrl)
            } else {
                const code = response.checkoutOrderCode || response.orderCode;
                navigate(`${AppRoute.CHECKOUT_RESULT}?orderCode=${code}`)
            }
        } catch (err: unknown) {
            console.error("Checkout process failed:", err)
            // Error toast is already handled by axios interceptor and useToast hook fallback
        }
    }

    const onInvalid = (errors: object) => {
        console.warn("Checkout Form Validation Failed:", errors)
        toastError("Incomplete Information", "Please check the highlighted fields and try again.")
    }

    const currentTotal = formatPrice(totalPrice)

    return (
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6 pb-14">
            {/* Delivery Information */}
            <DeliveryInfoSection form={form} />

            {/* Payment Information */}
            <PaymentSection form={form} isCODRestricted={hasCustomProduct} />

            {/* Submit Button & Trust Area */}
            <div className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-xl shadow-slate-200/35">
                <div className="flex flex-col gap-5">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-16 text-base font-black rounded-[1.1rem] bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:to-primary-700 shadow-xl shadow-primary-500/25 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 group border-none"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-6 w-6 animate-spin text-white" />
                                <span className="uppercase tracking-widest text-sm">Validating Security...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between w-full px-4">
                                <span className="uppercase tracking-widest text-xs">Confirm Order</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-xl tracking-tighter">{currentTotal}</span>
                                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </Button>

                    <div className="space-y-4">
                        <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            By placing order, you agree to our{" "}
                            <a href="#" className="underline text-primary-500 hover:text-primary-600 transition-colors">Terms</a>
                            {" "} & {" "}
                            <a href="#" className="underline text-primary-500 hover:text-primary-600 transition-colors">Privacy</a>
                        </p>

                        <div className="h-px bg-slate-50 w-full" />

                        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
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

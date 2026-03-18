import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import type { CheckoutFormData } from "../schema"
import { checkoutSchema } from "../schema"
import { Button } from "@/components/ui/button"
import { DeliveryInfoSection } from "./DeliveryInfoSection"
import { PaymentSection } from "./PaymentSection"
import { Loader2, ArrowRight, ShieldCheck, RefreshCcw } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { AppRoute } from "@/lib/constants"
import { useToast } from "@/hooks/useToast"
import { useCart } from "@/store/useCart"
import vnAddress from "@/shared/data/vnAddress.json"
import type { CreateAddressPayload } from "@/api/types/address"
import { useCreateOrder, useCreateAddress } from "@/hooks/queries"
import { formatPrice } from "@/lib/utils"

interface CheckoutFormProps {
    totalPrice: number
}

export function CheckoutForm({ totalPrice }: CheckoutFormProps) {
    const { clearCart } = useCart()
    const navigate = useNavigate()
    const { success, error: toastError } = useToast()

    const { mutateAsync: createOrder, isPending: isOrderSubmitting } = useCreateOrder()
    const { mutateAsync: createAddress, isPending: isAddressCreating } = useCreateAddress()

    const isSubmitting = isOrderSubmitting || isAddressCreating;

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
            orderNotes: "",
            paymentMethod: "VnPay",
        },
    })

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

    const onSubmit = async (data: CheckoutFormData) => {
        try {
            let addressId = data.addressId

            // If manual entry (no addressId), create address first
            if (!addressId) {
                const cityObj = vnAddress.find(p => p.code === data.city)
                const districtObj = cityObj?.districts.find(d => d.code === data.district)
                const wardObj = districtObj?.wards.find(w => w.code === data.ward)

                if (!cityObj || !districtObj || !wardObj) {
                    toastError("Invalid Address", "Please select a valid city, district, and ward.")
                    return
                }

                const addressPayload: CreateAddressPayload = {
                    receiverName: `${data.firstName} ${data.lastName}`,
                    phoneNumber: data.phone,
                    street: data.streetAddress,
                    province: cityObj.name,
                    city: cityObj.name,
                    district: districtObj.name,
                    ward: wardObj.name
                }

                addressId = await createAddress(addressPayload)

                if (!addressId) {
                    throw new Error("Failed to populate addressId after creation.")
                }
            }

            const response = await createOrder({
                addressId: addressId!,
                userVoucherId: data.userVoucherId,
                note: data.orderNotes || "",
                paymentMethod: data.paymentMethod
            })

            if (response.paymentUrl) {
                window.location.assign(response.paymentUrl)
            } else {
                clearCart()
                success("Order Successful", `Your order ${response.orderCode} has been placed.`)
                navigate(`${AppRoute.CHECKOUT_RESULT}?orderCode=${response.orderCode}`)
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

    const currentTotal = formatPrice(totalPrice * 1.1)

    return (
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-10 pb-20">
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
                        className="w-full h-20 text-xl font-black rounded-[1.5rem] bg-gradient-to-r from-[#4988c4] to-[#3a73a8] text-white hover:to-[#2d5d8a] shadow-2xl shadow-[#4988c4]/30 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 group border-none"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-6 w-6 animate-spin text-white" />
                                <span className="uppercase tracking-widest text-sm">Validating Security...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between w-full px-6">
                                <span className="uppercase tracking-widest text-sm">Confirm Order</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl tracking-tighter">{currentTotal}</span>
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
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

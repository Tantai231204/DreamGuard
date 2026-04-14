import { useCallback } from "react"
import { useWatch, type UseFormReturn } from "react-hook-form"
import type { CheckoutFormData } from "../schema"
import { memo } from "react"
import { Label } from "@/components/ui/label"
import * as RadioGroup from "@radix-ui/react-radio-group"
import { ShieldCheck, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PaymentSectionProps {
    form: UseFormReturn<CheckoutFormData>
}

function PaymentSectionInner({ form }: PaymentSectionProps) {
    const paymentMethod = useWatch({ control: form.control, name: "paymentMethod" }) ?? "VnPay"

    const handlePaymentMethodChange = useCallback((value: string) => {
        const nextMethod = value as "VnPay" | "COD"
        if (nextMethod === paymentMethod) return

        form.setValue("paymentMethod", nextMethod, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        })
    }, [form, paymentMethod])

    return (
        <div className="group rounded-[1.5rem] border border-slate-100 bg-white p-6 transition-all duration-500">
            {/* Refined Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 border-b border-slate-50 pb-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 text-primary-500 border border-slate-100">
                        <ShieldCheck className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary-500">Payment Protocol</span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Payment Method</h2>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Select your preferred gateway</p>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50/50 text-emerald-600 rounded-xl border border-emerald-100/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest">SSL Encrypted</span>
                </div>
            </div>

            {/* Payment Method Selection */}
            <RadioGroup.Root
                value={paymentMethod}
                onValueChange={handlePaymentMethodChange}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                {/* VnPay Option */}
                <div className="relative">
                    <RadioGroup.Item value="VnPay" id="payment-vnpay" className="peer sr-only" />
                    <Label
                        htmlFor="payment-vnpay"
                        className="flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:border-primary-500/40 hover:bg-slate-50/40 peer-data-[state=checked]:border-primary-500 peer-data-[state=checked]:bg-primary-500/5 peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:shadow-primary-500/5 group/pay"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-1.5 rounded-xl bg-white shadow-sm border border-slate-100">
                                <img
                                    src={`${import.meta.env.BASE_URL}images/vnpay.svg`}
                                    alt="VnPay"
                                    className="h-6 w-16 object-contain p-0.5 group-hover/pay:scale-110 transition-transform"
                                />
                            </div>
                            {paymentMethod === "VnPay" && (
                                <CheckCircle2 className="w-5 h-5 text-primary-500" />
                            )}
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-base font-black tracking-tight block">VnPay Wallet</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary-500 opacity-80">Online Banking System</span>
                        </div>
                    </Label>
                </div>

                {/* COD Option */}
                <div className="relative">
                    <RadioGroup.Item value="COD" id="payment-cod" className="peer sr-only" />
                    <Label
                        htmlFor="payment-cod"
                        className="flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:border-primary-500/40 hover:bg-slate-50/40 peer-data-[state=checked]:border-primary-500 peer-data-[state=checked]:bg-primary-500/5 peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:shadow-primary-500/5 group/pay"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-1.5 rounded-xl bg-white shadow-sm border border-slate-100">
                                <img
                                    src={`${import.meta.env.BASE_URL}images/cod.svg`}
                                    alt="COD"
                                    className="h-6 w-16 object-contain p-0.5 group-hover/pay:scale-110 transition-transform"
                                />
                            </div>
                            {paymentMethod === "COD" && (
                                <CheckCircle2 className="w-5 h-5 text-primary-500" />
                            )}
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-base font-black tracking-tight block">COD</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary-500 opacity-80">Cash on Delivery</span>
                        </div>
                    </Label>
                </div>
            </RadioGroup.Root>

            <AnimatePresence mode="wait">
                {paymentMethod === "VnPay" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-6 flex items-center justify-center gap-3 py-3 border-t border-slate-50"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600">
                            Secure redirection to VnPay gateway active
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export const PaymentSection = memo(PaymentSectionInner)
PaymentSection.displayName = "PaymentSection"

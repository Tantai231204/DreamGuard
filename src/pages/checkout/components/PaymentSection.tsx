import type { UseFormReturn } from "react-hook-form"
import type { CheckoutFormData } from "../schema"
import { Label } from "@/components/ui/label"
import * as RadioGroup from "@radix-ui/react-radio-group"
import { ShieldCheck, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PaymentSectionProps {
    form: UseFormReturn<CheckoutFormData>
}

export function PaymentSection({ form }: PaymentSectionProps) {
    const { setValue, watch } = form
    const paymentMethod = watch("paymentMethod")

    return (
        <div className="group rounded-[2rem] border border-slate-100 bg-white p-8 transition-all duration-500">
            {/* Refined Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-slate-50 pb-8">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 text-[#4988c4] border border-slate-100">
                        <ShieldCheck className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#4988c4]">Payment Protocol</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payment Method</h2>
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
                onValueChange={(value) => setValue("paymentMethod", value as "VnPay" | "COD", { shouldValidate: true })}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                {/* VnPay Option */}
                <div className="relative">
                    <RadioGroup.Item value="VnPay" id="payment-vnpay" className="peer sr-only" />
                    <Label
                        htmlFor="payment-vnpay"
                        className="flex flex-col p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 hover:border-[#4988c4]/40 hover:bg-slate-50/40 peer-data-[state=checked]:border-[#4988c4] peer-data-[state=checked]:bg-[#4988c4]/5 peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:shadow-[#4988c4]/5 group/pay"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-1.5 rounded-xl bg-white shadow-sm border border-slate-100">
                                <img
                                    src={`${import.meta.env.BASE_URL}images/vnpay.svg`}
                                    alt="VnPay"
                                    className="h-7 w-20 object-contain p-0.5 group-hover/pay:scale-110 transition-transform"
                                />
                            </div>
                            {paymentMethod === "VnPay" && (
                                <CheckCircle2 className="w-5 h-5 text-[#4988c4]" />
                            )}
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-lg font-black tracking-tight block">VnPay Wallet</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4988c4] opacity-80">Online Banking System</span>
                        </div>
                    </Label>
                </div>

                {/* COD Option */}
                <div className="relative">
                    <RadioGroup.Item value="COD" id="payment-cod" className="peer sr-only" />
                    <Label
                        htmlFor="payment-cod"
                        className="flex flex-col p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 hover:border-[#4988c4]/40 hover:bg-slate-50/40 peer-data-[state=checked]:border-[#4988c4] peer-data-[state=checked]:bg-[#4988c4]/5 peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:shadow-[#4988c4]/5 group/pay"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-1.5 rounded-xl bg-white shadow-sm border border-slate-100">
                                <img
                                    src={`${import.meta.env.BASE_URL}images/cod.svg`}
                                    alt="COD"
                                    className="h-7 w-20 object-contain p-0.5 group-hover/pay:scale-110 transition-transform"
                                />
                            </div>
                            {paymentMethod === "COD" && (
                                <CheckCircle2 className="w-5 h-5 text-[#4988c4]" />
                            )}
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-lg font-black tracking-tight block">COD</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4988c4] opacity-80">Cash on Delivery</span>
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
                        className="mt-8 flex items-center justify-center gap-3 py-4 border-t border-slate-50"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
                            Secure redirection to VnPay gateway active
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

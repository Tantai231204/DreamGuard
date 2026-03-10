import type { UseFormReturn } from "react-hook-form"
import type { CheckoutFormData } from "../schema"
import { Label } from "@/components/ui/label"
import * as RadioGroup from "@radix-ui/react-radio-group"
import { DollarSign, ShieldCheck, Wallet, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface PaymentSectionProps {
    form: UseFormReturn<CheckoutFormData>
}

export function PaymentSection({ form }: PaymentSectionProps) {
    const { setValue, watch } = form
    const paymentMethod = watch("paymentMethod")

    return (
        <div className="group rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-2xl shadow-slate-200/40 hover:shadow-3xl hover:shadow-slate-300/30 transition-all duration-700">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4988c4]/10 text-[#4988c4] border border-[#4988c4]/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step 02</span>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                        Payment Method
                    </h2>
                    <p className="text-slate-400 font-medium">All transactions are secure and encrypted.</p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.1em]">SSL Secured</span>
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
                        className="flex flex-col p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 hover:border-[#4988c4]/40 hover:bg-slate-50/50 peer-data-[state=checked]:border-[#4988c4] peer-data-[state=checked]:bg-[#4988c4] peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-2xl peer-data-[state=checked]:shadow-[#4988c4]/30"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className={cn(
                                "p-4 rounded-2xl transition-colors duration-500",
                                paymentMethod === "VnPay" ? "bg-white/20" : "bg-slate-100"
                            )}>
                                <Wallet className={cn("h-6 w-6", paymentMethod === "VnPay" ? "text-white" : "text-slate-600")} />
                            </div>
                            {paymentMethod === "VnPay" && (
                                <div className="bg-white rounded-full p-1.5 shadow-lg">
                                    <CheckCircle2 className="w-4 h-4 text-[#4988c4]" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <span className="text-xl font-black tracking-tight block">VnPay</span>
                            <span className={cn(
                                "text-xs font-bold uppercase tracking-widest block opacity-60",
                                paymentMethod === "VnPay" ? "text-white" : "text-slate-400"
                            )}>Fast & Secure Payment</span>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0ox Nolan_638210334860000000.svg" alt="VnPay" className={cn("h-8 transition-all duration-500", paymentMethod === "VnPay" ? "brightness-0 invert opacity-100" : "opacity-100")} />
                        </div>
                    </Label>
                </div>

                {/* COD Option */}
                <div className="relative">
                    <RadioGroup.Item value="COD" id="payment-cod" className="peer sr-only" />
                    <Label
                        htmlFor="payment-cod"
                        className="flex flex-col p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 hover:border-[#4988c4]/40 hover:bg-slate-50/50 peer-data-[state=checked]:border-[#4988c4] peer-data-[state=checked]:bg-[#4988c4] peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-2xl peer-data-[state=checked]:shadow-[#4988c4]/30"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className={cn(
                                "p-4 rounded-2xl transition-colors duration-500",
                                paymentMethod === "COD" ? "bg-white/20" : "bg-slate-100"
                            )}>
                                <DollarSign className={cn("h-6 w-6", paymentMethod === "COD" ? "text-white" : "text-slate-600")} />
                            </div>
                            {paymentMethod === "COD" && (
                                <div className="bg-white rounded-full p-1.5 shadow-lg">
                                    <CheckCircle2 className="w-4 h-4 text-[#4988c4]" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <span className="text-xl font-black tracking-tight block">COD</span>
                            <span className={cn(
                                "text-xs font-bold uppercase tracking-widest block opacity-60",
                                paymentMethod === "COD" ? "text-white" : "text-slate-400"
                            )}>Cash on Delivery</span>
                        </div>
                        <div className="mt-8 flex items-center gap-2">
                            <span className={cn("text-xs font-bold", paymentMethod === "COD" ? "text-white/80" : "text-slate-400")}>Pay at your doorstep</span>
                        </div>
                    </Label>
                </div>
            </RadioGroup.Root>

            <AnimatePresence mode="wait">
                {paymentMethod === "VnPay" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-12 rounded-[2rem] bg-indigo-50/50 border-2 border-indigo-100 p-8 flex items-center gap-6"
                    >
                        <div className="w-16 h-16 rounded-[1.25rem] bg-indigo-100 flex items-center justify-center shrink-0">
                            <Wallet className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-lg font-black text-indigo-900 tracking-tight">Redirect to VnPay</h4>
                            <p className="text-sm font-bold text-indigo-600/60 leading-relaxed">
                                You'll be redirected to VnPay to complete your purchase securely.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

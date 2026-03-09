import type { UseFormReturn } from "react-hook-form"
import type { CheckoutFormData } from "../schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import * as RadioGroup from "@radix-ui/react-radio-group"
import { CreditCard, DollarSign, ShieldCheck, Wallet, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface PaymentSectionProps {
    form: UseFormReturn<CheckoutFormData>
}

export function PaymentSection({ form }: PaymentSectionProps) {
    const { register, setValue, watch, formState: { errors } } = form
    const paymentMethod = watch("paymentMethod")
    const [cardNumber, setCardNumber] = useState("")
    const [expiryDate, setExpiryDate] = useState("")
    const [cvv, setCvv] = useState("")

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
        const match = v.match(/\d{4,16}/g)?.[0] || ""
        const parts = []
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4))
        }
        return parts.length ? parts.join(" ") : value
    }

    const formatExpiryDate = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
        if (v.length >= 2) return `${v.slice(0, 2)}/${v.slice(2, 4)}`
        return v
    }

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value)
        setCardNumber(formatted)
        setValue("cardNumber", formatted, { shouldValidate: true })
    }

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatExpiryDate(e.target.value)
        setExpiryDate(formatted)
        setValue("expiryDate", formatted, { shouldValidate: true })
    }

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value.replace(/[^0-9]/gi, "").slice(0, 3)
        setCvv(v)
        setValue("cvv", v, { shouldValidate: true })
    }

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
                onValueChange={(value) => setValue("paymentMethod", value as "card" | "paypal", { shouldValidate: true })}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                {/* Credit Card Option */}
                <div className="relative">
                    <RadioGroup.Item value="card" id="payment-card" className="peer sr-only" />
                    <Label
                        htmlFor="payment-card"
                        className="flex flex-col p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 hover:border-[#4988c4]/40 hover:bg-slate-50/50 peer-data-[state=checked]:border-[#4988c4] peer-data-[state=checked]:bg-[#4988c4] peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-2xl peer-data-[state=checked]:shadow-[#4988c4]/30"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className={cn(
                                "p-4 rounded-2xl transition-colors duration-500",
                                paymentMethod === "card" ? "bg-white/20" : "bg-slate-100"
                            )}>
                                <CreditCard className={cn("h-6 w-6", paymentMethod === "card" ? "text-white" : "text-slate-600")} />
                            </div>
                            {paymentMethod === "card" && (
                                <div className="bg-white rounded-full p-1.5 shadow-lg">
                                    <CheckCircle2 className="w-4 h-4 text-[#4988c4]" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <span className="text-xl font-black tracking-tight block">Credit Card</span>
                            <span className={cn(
                                "text-xs font-bold uppercase tracking-widest block opacity-60",
                                paymentMethod === "card" ? "text-white" : "text-slate-400"
                            )}>Visa, Mastercard, Amex</span>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className={cn("h-4 transition-all duration-500", paymentMethod === "card" ? "brightness-0 invert opacity-100" : "opacity-40 grayscale")} />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className={cn("h-4 transition-all duration-500", paymentMethod === "card" ? "brightness-0 invert opacity-100" : "opacity-40 grayscale")} />
                        </div>
                    </Label>
                </div>

                {/* PayPal Option */}
                <div className="relative">
                    <RadioGroup.Item value="paypal" id="payment-paypal" className="peer sr-only" />
                    <Label
                        htmlFor="payment-paypal"
                        className="flex flex-col p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 hover:border-[#4988c4]/40 hover:bg-slate-50/50 peer-data-[state=checked]:border-[#4988c4] peer-data-[state=checked]:bg-[#4988c4] peer-data-[state=checked]:text-white peer-data-[state=checked]:shadow-2xl peer-data-[state=checked]:shadow-[#4988c4]/30"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className={cn(
                                "p-4 rounded-2xl transition-colors duration-500",
                                paymentMethod === "paypal" ? "bg-white/20" : "bg-slate-100"
                            )}>
                                <Wallet className={cn("h-6 w-6", paymentMethod === "paypal" ? "text-white" : "text-slate-600")} />
                            </div>
                            {paymentMethod === "paypal" && (
                                <div className="bg-white rounded-full p-1.5 shadow-lg">
                                    <CheckCircle2 className="w-4 h-4 text-[#4988c4]" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <span className="text-xl font-black tracking-tight block">PayPal</span>
                            <span className={cn(
                                "text-xs font-bold uppercase tracking-widest block opacity-60",
                                paymentMethod === "paypal" ? "text-white" : "text-slate-400"
                            )}>Express Checkout</span>
                        </div>
                        <div className="mt-8">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className={cn("h-4 transition-all duration-500", paymentMethod === "paypal" ? "brightness-0 invert opacity-100" : "opacity-40 grayscale")} />
                        </div>
                    </Label>
                </div>
            </RadioGroup.Root>

            {/* Credit Card Form */}
            <AnimatePresence mode="wait">
                {paymentMethod === "card" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-12 space-y-10 overflow-hidden"
                    >
                        <div className="h-px bg-slate-100 w-full" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label htmlFor="cardNumber" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                                    Card Number
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="cardNumber"
                                        value={cardNumber}
                                        onChange={handleCardNumberChange}
                                        placeholder="0000 0000 0000 0000"
                                        maxLength={19}
                                        className="h-16 rounded-[1.25rem] border-slate-100 bg-slate-50/50 border-2 focus:border-[#4988c4] focus:bg-white transition-all font-bold placeholder:text-slate-300"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                        <CreditCard className="w-5 h-5 text-slate-200" />
                                    </div>
                                </div>
                                {errors.cardNumber && <p className="text-[10px] text-rose-500 font-black uppercase tracking-wider ml-1">{errors.cardNumber.message}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="cardName" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                                    Cardholder Name
                                </Label>
                                <Input
                                    id="cardName"
                                    {...register("cardName")}
                                    placeholder="Enter full name"
                                    className="h-16 rounded-[1.25rem] border-slate-100 bg-slate-50/50 border-2 focus:border-[#4988c4] focus:bg-white transition-all font-bold placeholder:text-slate-300 uppercase"
                                />
                                {errors.cardName && <p className="text-[10px] text-rose-500 font-black uppercase tracking-wider ml-1">{errors.cardName.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="expiryDate" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                                        Exp. Date
                                    </Label>
                                    <Input
                                        id="expiryDate"
                                        value={expiryDate}
                                        onChange={handleExpiryChange}
                                        placeholder="MM / YY"
                                        maxLength={5}
                                        className="h-16 rounded-[1.25rem] border-slate-100 bg-slate-50/50 border-2 focus:border-[#4988c4] focus:bg-white transition-all font-bold text-center placeholder:text-slate-300"
                                    />
                                    {errors.expiryDate && <p className="text-[10px] text-rose-500 font-black uppercase tracking-wider ml-1">{errors.expiryDate.message}</p>}
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="cvv" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                                        CVV / CVC
                                    </Label>
                                    <Input
                                        id="cvv"
                                        value={cvv}
                                        onChange={handleCvvChange}
                                        placeholder="***"
                                        maxLength={3}
                                        type="password"
                                        className="h-16 rounded-[1.25rem] border-slate-100 bg-slate-50/50 border-2 focus:border-[#4988c4] focus:bg-white transition-all font-bold text-center placeholder:text-slate-300"
                                    />
                                    {errors.cvv && <p className="text-[10px] text-rose-500 font-black uppercase tracking-wider ml-1">{errors.cvv.message}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 px-6 h-16 rounded-[1.25rem] border-2 border-slate-50 bg-slate-50/30">
                                <input
                                    type="checkbox"
                                    id="saveAddress"
                                    {...register("saveAddress")}
                                    className="h-5 w-5 rounded-lg border-slate-200 text-[#4988c4] focus:ring-[#4988c4]/20 transition-all pointer-events-auto"
                                />
                                <Label htmlFor="saveAddress" className="text-xs font-bold text-slate-500 cursor-pointer select-none">
                                    Billing same as shipping
                                </Label>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PayPal Info */}
            <AnimatePresence>
                {paymentMethod === "paypal" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-12 rounded-[2rem] bg-indigo-50/50 border-2 border-indigo-100 p-8 flex items-center gap-6"
                    >
                        <div className="w-16 h-16 rounded-[1.25rem] bg-indigo-100 flex items-center justify-center shrink-0">
                            <DollarSign className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-lg font-black text-indigo-900 tracking-tight">Redirect to PayPal</h4>
                            <p className="text-sm font-bold text-indigo-600/60 leading-relaxed">
                                You'll be redirected to complete your purchase securely.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

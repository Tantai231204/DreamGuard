import type { UseFormReturn } from "react-hook-form"
import type { CheckoutFormData } from "../schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import * as RadioGroup from "@radix-ui/react-radio-group"
import { CreditCard, DollarSign } from "lucide-react"
import { useState } from "react"

interface PaymentSectionProps {
    form: UseFormReturn<CheckoutFormData>
}

export function PaymentSection({ form }: PaymentSectionProps) {
    const { register, setValue, watch, formState: { errors } } = form
    const paymentMethod = watch("paymentMethod")
    const [cardNumber, setCardNumber] = useState("")
    const [expiryDate, setExpiryDate] = useState("")
    const [cvv, setCvv] = useState("")

    // Format card number (XXXX XXXX XXXX XXXX)
    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
        const matches = v.match(/\d{4,16}/g)
        const match = (matches && matches[0]) || ""
        const parts = []

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4))
        }

        if (parts.length) {
            return parts.join(" ")
        } else {
            return value
        }
    }

    // Format expiry date (MM/YY)
    const formatExpiryDate = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
        if (v.length >= 2) {
            return `${v.slice(0, 2)}/${v.slice(2, 4)}`
        }
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
        <div className="group rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
                <div className="rounded-full bg-gradient-to-br from-[#4988c4] to-[#3a73a8] p-3 shadow-lg">
                    <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">Payment</h2>
                    <p className="text-sm text-gray-500 mt-0.5">All transactions are secure and encrypted</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Secure</span>
                </div>
            </div>

            {/* Payment Method Selection */}
            <RadioGroup.Root
                value={paymentMethod}
                onValueChange={(value) => setValue("paymentMethod", value as "card" | "paypal", { shouldValidate: true })}
                className="space-y-3"
            >
                {/* Credit Card Option */}
                <div className="relative group/option">
                    <RadioGroup.Item
                        value="card"
                        id="payment-card"
                        className="peer sr-only"
                    />
                    <Label
                        htmlFor="payment-card"
                        className="flex items-center justify-between rounded-xl border-2 border-gray-300 p-4 cursor-pointer transition-all duration-200 hover:border-[#4988c4] hover:bg-[#bde8f5]/5 peer-data-[state=checked]:border-[#4988c4] peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-[#bde8f5]/20 peer-data-[state=checked]:to-[#4988c4]/5 peer-data-[state=checked]:shadow-md"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-400 transition-colors peer-data-[state=checked]:border-[#4988c4]">
                                <div className="h-3 w-3 rounded-full bg-transparent transition-all peer-data-[state=checked]:bg-[#4988c4] peer-data-[state=checked]:scale-100 scale-0" />
                            </div>
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-gray-700" />
                                <span className="font-semibold text-gray-900">Credit Card</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-6 opacity-70 group-hover/option:opacity-100 transition-opacity" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-70 group-hover/option:opacity-100 transition-opacity" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-6 opacity-70 group-hover/option:opacity-100 transition-opacity" />
                        </div>
                    </Label>
                </div>

                {/* PayPal Option */}
                <div className="relative group/option">
                    <RadioGroup.Item
                        value="paypal"
                        id="payment-paypal"
                        className="peer sr-only"
                    />
                    <Label
                        htmlFor="payment-paypal"
                        className="flex items-center justify-between rounded-xl border-2 border-gray-300 p-4 cursor-pointer transition-all duration-200 hover:border-[#4988c4] hover:bg-[#bde8f5]/5 peer-data-[state=checked]:border-[#4988c4] peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-[#bde8f5]/20 peer-data-[state=checked]:to-[#4988c4]/5 peer-data-[state=checked]:shadow-md"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-400 transition-colors peer-data-[state=checked]:border-[#4988c4]">
                                <div className="h-3 w-3 rounded-full bg-transparent transition-all peer-data-[state=checked]:bg-[#4988c4] peer-data-[state=checked]:scale-100 scale-0" />
                            </div>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-gray-700" />
                                <span className="font-semibold text-gray-900">PayPal</span>
                            </div>
                        </div>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6 opacity-70 group-hover/option:opacity-100 transition-opacity" />
                    </Label>
                </div>
            </RadioGroup.Root>

            {errors.paymentMethod && (
                <p className="mt-2 text-sm text-red-600">{errors.paymentMethod.message}</p>
            )}

            {/* Credit Card Form */}
            {paymentMethod === "card" && (
                <div className="mt-6 space-y-4 animate-slide-in-item">
                    <div className="space-y-2">
                        <Label htmlFor="cardNumber" className="text-sm font-medium text-gray-700">
                            Card number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="cardNumber"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className={`h-11 ${errors.cardNumber ? "border-red-500" : ""}`}
                        />
                        {errors.cardNumber && (
                            <p className="text-sm text-red-600">{errors.cardNumber.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cardName" className="text-sm font-medium text-gray-700">
                            Name on card <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="cardName"
                            {...register("cardName")}
                            placeholder="JOHN DOE"
                            className={`h-11 uppercase ${errors.cardName ? "border-red-500" : ""}`}
                        />
                        {errors.cardName && (
                            <p className="text-sm text-red-600">{errors.cardName.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="expiryDate" className="text-sm font-medium text-gray-700">
                                Expiry date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="expiryDate"
                                value={expiryDate}
                                onChange={handleExpiryChange}
                                placeholder="MM/YY"
                                maxLength={5}
                                className={`h-11 ${errors.expiryDate ? "border-red-500" : ""}`}
                            />
                            {errors.expiryDate && (
                                <p className="text-sm text-red-600">{errors.expiryDate.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cvv" className="text-sm font-medium text-gray-700">
                                Security code <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="cvv"
                                value={cvv}
                                onChange={handleCvvChange}
                                placeholder="123"
                                maxLength={3}
                                type="password"
                                className={`h-11 ${errors.cvv ? "border-red-500" : ""}`}
                            />
                            {errors.cvv && (
                                <p className="text-sm text-red-600">{errors.cvv.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Save Address Checkbox */}
                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="saveAddress"
                            {...register("saveAddress")}
                            className="h-4 w-4 rounded border-gray-300 text-[#4988c4] focus:ring-[#4988c4]"
                        />
                        <Label htmlFor="saveAddress" className="text-sm text-gray-700 cursor-pointer">
                            Use shipping address as billing address
                        </Label>
                    </div>
                </div>
            )}

            {/* PayPal Info */}
            {paymentMethod === "paypal" && (
                <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 p-4 animate-slide-in-item">
                    <p className="text-sm text-blue-900">
                        After clicking "Place Order", you will be redirected to PayPal to complete your purchase securely.
                    </p>
                </div>
            )}
        </div>
    )
}

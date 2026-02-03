import type { UseFormReturn } from "react-hook-form"
import type { CheckoutFormData } from "../schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Truck, MapPin } from "lucide-react"

interface DeliveryInfoSectionProps {
    form: UseFormReturn<CheckoutFormData>
}

export function DeliveryInfoSection({ form }: DeliveryInfoSectionProps) {
    const { register, formState: { errors } } = form

    return (
        <div className="group rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
                <div className="rounded-full bg-gradient-to-br from-[#4988c4] to-[#3a73a8] p-3 shadow-lg">
                    <Truck className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">Delivery Information</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Where should we send your order?</p>
                </div>
            </div>

            <div className="space-y-5">
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 group/field">
                        <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            First name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="firstName"
                            {...register("firstName")}
                            placeholder="John"
                            className={`h-12 transition-all duration-200 ${errors.firstName ? "border-red-500 focus:ring-red-500" : "focus:ring-[#4988c4] focus:border-[#4988c4]"}`}
                        />
                        {errors.firstName && (
                            <p className="text-sm text-red-600 flex items-center gap-1 animate-slide-down">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.firstName.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2 group/field">
                        <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                            Last name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="lastName"
                            {...register("lastName")}
                            placeholder="Doe"
                            className={`h-12 transition-all duration-200 ${errors.lastName ? "border-red-500 focus:ring-red-500" : "focus:ring-[#4988c4] focus:border-[#4988c4]"}`}
                        />
                        {errors.lastName && (
                            <p className="text-sm text-red-600 flex items-center gap-1 animate-slide-down">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.lastName.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Contact Fields */}
                <div className="space-y-2 group/field">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                        Email address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="john.doe@example.com"
                        className={`h-12 transition-all duration-200 ${errors.email ? "border-red-500 focus:ring-red-500" : "focus:ring-[#4988c4] focus:border-[#4988c4]"}`}
                    />
                    {errors.email && (
                        <p className="text-sm text-red-600 flex items-center gap-1 animate-slide-down">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2 group/field">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                        Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="phone"
                        type="tel"
                        {...register("phone")}
                        placeholder="(123) 456-7890"
                        className={`h-12 transition-all duration-200 ${errors.phone ? "border-red-500 focus:ring-red-500" : "focus:ring-[#4988c4] focus:border-[#4988c4]"}`}
                    />
                    {errors.phone && (
                        <p className="text-sm text-red-600 flex items-center gap-1 animate-slide-down">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.phone.message}
                        </p>
                    )}
                </div>

                {/* Address Section */}
                <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#bde8f5] to-[#4988c4]/20">
                            <MapPin className="h-4 w-4 text-[#4988c4]" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">Shipping Address</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="streetAddress" className="text-sm font-semibold text-gray-700">
                                Street address <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="streetAddress"
                                {...register("streetAddress")}
                                placeholder="123 Main Street"
                                className={`h-12 transition-all duration-200 ${errors.streetAddress ? "border-red-500 focus:ring-red-500" : "focus:ring-[#4988c4] focus:border-[#4988c4]"}`}
                            />
                            {errors.streetAddress && (
                                <p className="text-sm text-red-600 flex items-center gap-1 animate-slide-down">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.streetAddress.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-sm font-semibold text-gray-700">
                                    Town / City <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="city"
                                    {...register("city")}
                                    placeholder="New York"
                                    className={`h-12 transition-all duration-200 ${errors.city ? "border-red-500 focus:ring-red-500" : "focus:ring-[#4988c4] focus:border-[#4988c4]"}`}
                                />
                                {errors.city && (
                                    <p className="text-sm text-red-600 flex items-center gap-1 animate-slide-down">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.city.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state" className="text-sm font-semibold text-gray-700">
                                    State <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="state"
                                    {...register("state")}
                                    placeholder="NY"
                                    className={`h-12 transition-all duration-200 ${errors.state ? "border-red-500 focus:ring-red-500" : "focus:ring-[#4988c4] focus:border-[#4988c4]"}`}
                                />
                                {errors.state && (
                                    <p className="text-sm text-red-600 flex items-center gap-1 animate-slide-down">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.state.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="zipCode" className="text-sm font-semibold text-gray-700">
                                ZIP code <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="zipCode"
                                {...register("zipCode")}
                                placeholder="10001"
                                className={`h-12 transition-all duration-200 ${errors.zipCode ? "border-red-500 focus:ring-red-500" : "focus:ring-[#4988c4] focus:border-[#4988c4]"}`}
                            />
                            {errors.zipCode && (
                                <p className="text-sm text-red-600">{errors.zipCode.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Notes */}
                <div className="space-y-2">
                    <Label htmlFor="orderNotes" className="text-sm font-medium text-gray-700">
                        Order notes (optional)
                    </Label>
                    <textarea
                        id="orderNotes"
                        {...register("orderNotes")}
                        rows={3}
                        placeholder="Notes about your order, e.g. special notes for delivery"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#4988c4] focus:ring-2 focus:ring-[#4988c4]/20 transition-all"
                    />
                </div>
            </div>
        </div>
    )
}

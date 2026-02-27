import type { UseFormReturn } from "react-hook-form"
import type { CheckoutFormData } from "../schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Truck, MapPin, Mail, Phone, User } from "lucide-react"
import { VN_PROVINCES, getWardsByProvince } from "../data/locations"
import { useMemo, useEffect } from "react"

interface DeliveryInfoSectionProps {
    form: UseFormReturn<CheckoutFormData>
}

export function DeliveryInfoSection({ form }: DeliveryInfoSectionProps) {
    const { register, setValue, watch, formState: { errors } } = form
    const selectedCity = watch("city")
    const selectedDistrict = watch("state")

    // Compute available districts based on selected city using useMemo
    const availableDistricts = useMemo(() => {
        if (selectedCity) {
            return getWardsByProvince(selectedCity);
        }
        return [];
    }, [selectedCity]);

    // Reset district when city changes
    useEffect(() => {
        if (selectedCity && selectedDistrict) {
            // Check if current district is still valid for new city
            const isValidDistrict = availableDistricts.some((d: { value: string; label: string }) => d.value === selectedDistrict);
            if (!isValidDistrict) {
                setValue("state", "", { shouldValidate: false });
            }
        }
    }, [selectedCity, selectedDistrict, availableDistricts, setValue]);

    return (
        <div className="group rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white via-white to-blue-50/30 p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-gray-100">
                <div className="rounded-2xl bg-gradient-to-br from-[#4988c4] to-[#3a73a8] p-4 shadow-lg ring-4 ring-blue-100">
                    <Truck className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Delivery Information
                        <span className="text-xs font-normal px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            Step 1 of 2
                        </span>
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Where should we send your order?</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2.5">
                        <Label htmlFor="firstName" className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-[#4988c4]" />
                            First name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="firstName"
                            {...register("firstName")}
                            placeholder="John"
                            className={`h-14 rounded-2xl border-2 text-base font-medium transition-all duration-200 ${errors.firstName
                                ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-200 bg-white hover:border-[#4988c4] focus:border-[#4988c4] focus:ring-[#4988c4]"
                                }`}
                        />
                        {errors.firstName && (
                            <p className="text-sm text-red-600 flex items-center gap-1.5 font-medium animate-slide-down">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.firstName.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2.5">
                        <Label htmlFor="lastName" className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-[#4988c4]" />
                            Last name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="lastName"
                            {...register("lastName")}
                            placeholder="Doe"
                            className={`h-14 rounded-2xl border-2 text-base font-medium transition-all duration-200 ${errors.lastName
                                ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-200 bg-white hover:border-[#4988c4] focus:border-[#4988c4] focus:ring-[#4988c4]"
                                }`}
                        />
                        {errors.lastName && (
                            <p className="text-sm text-red-600 flex items-center gap-1.5 font-medium animate-slide-down">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.lastName.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Contact Fields */}
                <div className="space-y-2.5">
                    <Label htmlFor="email" className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-[#4988c4]" />
                        Email address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="john.doe@example.com"
                        className={`h-14 rounded-2xl border-2 text-base font-medium transition-all duration-200 ${errors.email
                            ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-200 bg-white hover:border-[#4988c4] focus:border-[#4988c4] focus:ring-[#4988c4]"
                            }`}
                    />
                    {errors.email && (
                        <p className="text-sm text-red-600 flex items-center gap-1.5 font-medium animate-slide-down">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2.5">
                    <Label htmlFor="phone" className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-[#4988c4]" />
                        Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="phone"
                        type="tel"
                        {...register("phone")}
                        placeholder="(123) 456-7890"
                        className={`h-14 rounded-2xl border-2 text-base font-medium transition-all duration-200 ${errors.phone
                            ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-200 bg-white hover:border-[#4988c4] focus:border-[#4988c4] focus:ring-[#4988c4]"
                            }`}
                    />
                    {errors.phone && (
                        <p className="text-sm text-red-600 flex items-center gap-1.5 font-medium animate-slide-down">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.phone.message}
                        </p>
                    )}
                </div>

                {/* Address Section */}
                <div className="pt-6 mt-6 border-t-2 border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-100 to-[#4988c4]/20 ring-2 ring-blue-200">
                            <MapPin className="h-5 w-5 text-[#4988c4]" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Shipping Address</h3>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2.5">
                            <Label htmlFor="streetAddress" className="text-sm font-bold text-gray-800">
                                Street address <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="streetAddress"
                                {...register("streetAddress")}
                                placeholder="123 Main Street, Apt 4B"
                                className={`h-14 rounded-2xl border-2 text-base font-medium transition-all duration-200 ${errors.streetAddress
                                    ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                                    : "border-gray-200 bg-white hover:border-[#4988c4] focus:border-[#4988c4] focus:ring-[#4988c4]"
                                    }`}
                            />
                            {errors.streetAddress && (
                                <p className="text-sm text-red-600 flex items-center gap-1.5 font-medium animate-slide-down">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.streetAddress.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2.5">
                                <Label htmlFor="city" className="text-sm font-bold text-gray-800">
                                    City/Province <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={selectedCity}
                                    onValueChange={(value) => setValue("city", value, { shouldValidate: true })}
                                >
                                    <SelectTrigger className={`h-14 rounded-2xl border-2 text-base font-medium transition-all duration-200 ${errors.city
                                        ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                                        : "border-gray-200 bg-white hover:border-[#4988c4] focus:border-[#4988c4] focus:ring-[#4988c4]"
                                        }`}>
                                        <SelectValue placeholder="Select city or province" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-2 shadow-xl max-h-80 bg-white">
                                        {VN_PROVINCES.map((province: { value: string; label: string }) => (
                                            <SelectItem
                                                key={province.value}
                                                value={province.value}
                                                className="rounded-xl cursor-pointer focus:bg-blue-50 focus:text-[#4988c4] transition-colors py-3"
                                            >
                                                {province.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.city && (
                                    <p className="text-sm text-red-600 flex items-center gap-1.5 font-medium animate-slide-down">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.city.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2.5">
                                <Label htmlFor="state" className="text-sm font-bold text-gray-800">
                                    District/Ward <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={selectedDistrict}
                                    onValueChange={(value) => setValue("state", value, { shouldValidate: true })}
                                    disabled={!selectedCity || availableDistricts.length === 0}
                                >
                                    <SelectTrigger className={`h-14 rounded-2xl border-2 text-base font-medium transition-all duration-200 ${errors.state
                                        ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                                        : !selectedCity
                                            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                            : "border-gray-200 bg-white hover:border-[#4988c4] focus:border-[#4988c4] focus:ring-[#4988c4]"
                                        }`}>
                                        <SelectValue placeholder={!selectedCity ? "Select city first" : "Select district or ward"} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-2 shadow-xl max-h-80 bg-white">
                                        {availableDistricts.map((district: { value: string; label: string }) => (
                                            <SelectItem
                                                key={district.value}
                                                value={district.value}
                                                className="rounded-xl cursor-pointer focus:bg-blue-50 focus:text-[#4988c4] transition-colors py-3"
                                            >
                                                {district.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.state && (
                                    <p className="text-sm text-red-600 flex items-center gap-1.5 font-medium animate-slide-down">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.state.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <Label htmlFor="zipCode" className="text-sm font-bold text-gray-800">
                                ZIP code <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="zipCode"
                                {...register("zipCode")}
                                placeholder="10001"
                                className={`h-14 rounded-2xl border-2 text-base font-medium transition-all duration-200 ${errors.zipCode
                                    ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500"
                                    : "border-gray-200 bg-white hover:border-[#4988c4] focus:border-[#4988c4] focus:ring-[#4988c4]"
                                    }`}
                            />
                            {errors.zipCode && (
                                <p className="text-sm text-red-600 flex items-center gap-1.5 font-medium">{errors.zipCode.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Notes */}
                <div className="space-y-2.5 pt-4">
                    <Label htmlFor="orderNotes" className="text-sm font-bold text-gray-800">
                        Order notes <span className="text-gray-400 font-normal">(optional)</span>
                    </Label>
                    <textarea
                        id="orderNotes"
                        {...register("orderNotes")}
                        rows={4}
                        placeholder="Any special instructions for delivery? Let us know here..."
                        className="w-full rounded-2xl border-2 border-gray-200 bg-white px-5 py-4 text-base font-medium hover:border-[#4988c4] focus:border-[#4988c4] focus:ring-2 focus:ring-[#4988c4]/20 transition-all resize-none"
                    />
                </div>
            </div>
        </div>
    )
}

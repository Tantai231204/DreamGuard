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
import { Button } from "@/components/ui/button"
import vnAddress from "@/shared/data/vnAddress.json"
import { useMemo, useEffect, useState, useCallback } from "react"
import { useAuthStore } from "@/store/authStore"
import { useAddresses } from "@/hooks/useAddress"
import { useProfile } from "@/hooks/queries/useUser"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Plus, CheckCircle2, ShoppingBag, User, Phone, Mail, Navigation2 } from "lucide-react"
import type { Address } from "@/api/types/address"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface DeliveryInfoSectionProps {
    form: UseFormReturn<CheckoutFormData>
}

export function DeliveryInfoSection({ form }: DeliveryInfoSectionProps) {
    const { register, setValue, watch, formState: { errors } } = form
    const selectedCityCode = watch("city")
    const selectedDistrictCode = watch("district")
    const selectedWardCode = watch("ward")

    const { isAuthenticated } = useAuthStore()
    const { data: addresses, isLoading: isLoadingAddresses } = useAddresses()
    const { data: profile } = useProfile()

    const [isManualEntry, setIsManualEntry] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const handleSelectAddress = useCallback((addr: Address) => {
        setSelectedId(addr.addressId)
        setIsManualEntry(false)

        const names = addr.receiverName.trim().split(/\s+/)
        const firstName = names[0] || ""
        const lastName = names.length > 1 ? names.slice(1).join(" ") : names[0]

        setValue("addressId", addr.addressId)
        setValue("firstName", firstName, { shouldValidate: true })
        setValue("lastName", lastName, { shouldValidate: true })
        setValue("phone", addr.phoneNumber, { shouldValidate: true })
        setValue("streetAddress", addr.street, { shouldValidate: true })

        if (profile?.email) {
            setValue("email", profile.email, { shouldValidate: true })
        }

        const province = vnAddress.find(p => p.name.toLowerCase().includes(addr.province.toLowerCase()))
        if (province) {
            setValue("city", province.code, { shouldValidate: true })
            const district = province.districts.find(d => d.name.toLowerCase().includes(addr.district.toLowerCase()))
            if (district) {
                setValue("district", district.code, { shouldValidate: true })
                const ward = district.wards.find(w => w.name.toLowerCase().includes(addr.ward.toLowerCase()))
                if (ward) {
                    setValue("ward", ward.code, { shouldValidate: true })
                }
            }
        }
    }, [profile, setValue])

    // Initial load: Set default address or switch to manual if guest
    useEffect(() => {
        if (isLoadingAddresses) return

        if (isAuthenticated && addresses && addresses.length > 0) {
            const defaultAddr = addresses.find(a => a.isDefault) || addresses[0]
            if (defaultAddr && !selectedId && !isManualEntry) {
                const timer = setTimeout(() => handleSelectAddress(defaultAddr), 0)
                return () => clearTimeout(timer)
            }
        } else if (!isAuthenticated || (addresses && addresses.length === 0)) {
            if (!isManualEntry) {
                const timer = setTimeout(() => setIsManualEntry(true), 0)
                return () => clearTimeout(timer)
            }
        }
    }, [addresses, isLoadingAddresses, isAuthenticated, selectedId, handleSelectAddress, isManualEntry])

    const provinces = vnAddress
    const districts = useMemo(() => {
        return provinces.find(p => p.code === selectedCityCode)?.districts || []
    }, [selectedCityCode, provinces])

    const wards = useMemo(() => {
        return districts.find(d => d.code === selectedDistrictCode)?.wards || []
    }, [selectedDistrictCode, districts])

    // Reset dependents when parents change
    useEffect(() => {
        if (selectedCityCode) {
            const isValid = provinces.some(p => p.code === selectedCityCode)
            if (!isValid) {
                setValue("district", "")
                setValue("ward", "")
            }
        }
    }, [selectedCityCode, provinces, setValue])

    if (isLoadingAddresses) {
        return (
            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-10 space-y-12 shadow-2xl shadow-slate-200/20">
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-10 w-64 rounded-full" />
                    <Skeleton className="h-4 w-48 rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2].map(i => (
                        <div key={i} className="p-8 rounded-[2rem] border-2 border-slate-50 bg-slate-50/20 space-y-6">
                            <div className="flex justify-between">
                                <Skeleton className="h-6 w-32 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <div className="pt-6 border-t border-slate-100 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="group rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-2xl shadow-slate-200/40 hover:shadow-3xl hover:shadow-slate-300/30 transition-all duration-700">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4988c4]/10 text-[#4988c4] border border-[#4988c4]/20">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step 01</span>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                        Shipping Details
                    </h2>
                    <p className="text-slate-400 font-medium">Please provide your delivery information.</p>
                </div>

                {isAuthenticated && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            setIsManualEntry(!isManualEntry)
                            if (!isManualEntry) {
                                setSelectedId(null)
                                setValue("addressId", null)
                            }
                        }}
                        className="h-12 px-6 rounded-2xl bg-slate-50 text-slate-600 hover:bg-[#4988c4] hover:text-white transition-all duration-300 group/btn"
                        aria-label={isManualEntry ? "Switch to saved addresses" : "Switch to custom address"}
                    >
                        <div className="flex items-center gap-3">
                            {isManualEntry ? <MapPin className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            <span className="text-xs font-black uppercase tracking-widest">
                                {isManualEntry ? "Saved Addresses" : "Custom Address"}
                            </span>
                        </div>
                    </Button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {isManualEntry ? (
                    <motion.div
                        key="manual-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-10"
                    >
                        {/* Identity Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <User className="w-3 h-3 text-[#4988c4]" /> First Name
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="firstName"
                                        {...register("firstName")}
                                        placeholder="Enter your first name"
                                        className={cn(
                                            "h-16 rounded-[1.25rem] border-slate-100 bg-slate-50/50 border-2 focus:border-[#4988c4] focus:bg-white focus:ring-4 focus:ring-[#4988c4]/5 transition-all duration-300 font-bold placeholder:text-slate-300",
                                            watch("firstName") && !errors.firstName && "border-emerald-100 bg-emerald-50/10"
                                        )}
                                    />
                                    {watch("firstName") && !errors.firstName && (
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                                {errors.firstName && <p className="text-[10px] text-rose-500 font-black ml-1 uppercase tracking-wider">{errors.firstName.message}</p>}
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <User className="w-3 h-3 text-[#4988c4]" /> Last Name
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="lastName"
                                        {...register("lastName")}
                                        placeholder="Enter your last name"
                                        className={cn(
                                            "h-16 rounded-[1.25rem] border-slate-100 bg-slate-50/50 border-2 focus:border-[#4988c4] focus:bg-white focus:ring-4 focus:ring-[#4988c4]/5 transition-all duration-300 font-bold placeholder:text-slate-300",
                                            watch("lastName") && !errors.lastName && "border-emerald-100 bg-emerald-50/10"
                                        )}
                                    />
                                    {watch("lastName") && !errors.lastName && (
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                                {errors.lastName && <p className="text-[10px] text-rose-500 font-black ml-1 uppercase tracking-wider">{errors.lastName.message}</p>}
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Phone className="w-3 h-3 text-[#4988c4]" /> Phone Number
                                </Label>
                                <Input
                                    {...register("phone")}
                                    placeholder="09xx xxx xxx"
                                    className="h-16 rounded-[1.25rem] border-slate-100 bg-slate-50/50 border-2 focus:border-[#4988c4] focus:bg-white focus:ring-4 focus:ring-[#4988c4]/5 transition-all duration-300 font-bold placeholder:text-slate-300"
                                />
                                {errors.phone && <p className="text-[10px] text-rose-500 font-black ml-1 uppercase tracking-wider">{errors.phone.message}</p>}
                            </div>
                        </div>

                        {/* Location Detail */}
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Mail className="w-3 h-3 text-[#4988c4]" /> Email Address
                                </Label>
                                <Input
                                    {...register("email")}
                                    type="email"
                                    placeholder="your@email.com"
                                    className="h-16 rounded-[1.25rem] border-slate-100 bg-slate-50/50 border-2 focus:border-[#4988c4] focus:bg-white focus:ring-4 focus:ring-[#4988c4]/5 transition-all duration-300 font-bold placeholder:text-slate-300"
                                />
                                {errors.email && <p className="text-[10px] text-rose-500 font-black ml-1 uppercase tracking-wider">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Street Address</Label>
                                <Input
                                    {...register("streetAddress")}
                                    placeholder="E.g. No. 123 Nguyen Hue Street"
                                    className="h-16 rounded-[1.25rem] border-slate-100 bg-slate-50/50 border-2 focus:border-[#4988c4] focus:bg-white focus:ring-4 focus:ring-[#4988c4]/5 transition-all duration-300 font-bold placeholder:text-slate-300"
                                />
                                {errors.streetAddress && <p className="text-[10px] text-rose-500 font-black ml-1 uppercase tracking-wider">{errors.streetAddress.message}</p>}
                            </div>

                            {/* Geographical Selects */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Province / City</Label>
                                    <Select value={selectedCityCode} onValueChange={(v) => {
                                        setValue("city", v, { shouldValidate: true })
                                        setValue("district", "")
                                        setValue("ward", "")
                                    }}>
                                        <SelectTrigger className="h-16 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50/50 focus:ring-4 focus:ring-[#4988c4]/5 transition-all font-bold">
                                            <SelectValue placeholder="Select City" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-100 animate-in fade-in-0 zoom-in-95">
                                            {provinces.map(p => (
                                                <SelectItem key={p.code} value={p.code} className="rounded-xl my-1 focus:bg-[#4988c4] focus:text-white transition-colors">{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">District</Label>
                                    <Select value={selectedDistrictCode} onValueChange={(v) => {
                                        setValue("district", v, { shouldValidate: true })
                                        setValue("ward", "")
                                    }} disabled={!selectedCityCode}>
                                        <SelectTrigger className="h-16 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50/50 focus:ring-4 focus:ring-[#4988c4]/5 transition-all font-bold disabled:opacity-30">
                                            <SelectValue placeholder="Select District" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-100">
                                            {districts.map(d => (
                                                <SelectItem key={d.code} value={d.code} className="rounded-xl my-1">{d.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Ward</Label>
                                    <Select value={selectedWardCode} onValueChange={(v) => setValue("ward", v, { shouldValidate: true })} disabled={!selectedDistrictCode}>
                                        <SelectTrigger className="h-16 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50/50 focus:ring-4 focus:ring-[#4988c4]/5 transition-all font-bold disabled:opacity-30">
                                            <SelectValue placeholder="Select Ward" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-100">
                                            {wards.map(w => (
                                                <SelectItem key={w.code} value={w.code} className="rounded-xl my-1">{w.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="address-grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {addresses?.map((addr) => (
                            <button
                                key={addr.addressId}
                                type="button"
                                onClick={() => handleSelectAddress(addr)}
                                className={cn(
                                    "flex flex-col text-left p-8 rounded-[2rem] border-2 transition-all duration-500 relative overflow-hidden group/card",
                                    selectedId === addr.addressId
                                        ? "border-[#4988c4] bg-[#4988c4] text-white shadow-2xl shadow-[#4988c4]/30"
                                        : "border-slate-100 bg-slate-50/30 hover:border-[#4988c4]/40 hover:bg-white text-slate-900"
                                )}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className={cn(
                                        "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em]",
                                        selectedId === addr.addressId ? "bg-white/10 text-white" : "bg-white text-[#4988c4] shadow-sm border border-slate-100"
                                    )}>
                                        {addr.isDefault ? "Primary Shipping" : "Home Address"}
                                    </div>
                                    {selectedId === addr.addressId && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                            <div className="bg-white rounded-full p-1.5 shadow-lg shadow-black/5">
                                                <CheckCircle2 className="w-5 h-5 text-[#4988c4]" />
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <h4 className="font-black text-2xl tracking-tight leading-none">{addr.receiverName}</h4>
                                    <p className={cn(
                                        "text-sm font-bold opacity-70",
                                        selectedId === addr.addressId ? "text-white" : "text-[#4988c4]"
                                    )}>
                                        {addr.phoneNumber}
                                    </p>
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/10 space-y-1">
                                    <p className={cn(
                                        "text-xs leading-relaxed font-bold uppercase tracking-[0.1em]",
                                        selectedId === addr.addressId ? "text-white/60" : "text-slate-400"
                                    )}>
                                        {addr.street}
                                    </p>
                                    <p className={cn(
                                        "text-xs leading-relaxed font-bold uppercase tracking-[0.1em]",
                                        selectedId === addr.addressId ? "text-white/40" : "text-slate-300"
                                    )}>
                                        {addr.ward}, {addr.district} <br />
                                        {addr.province}
                                    </p>
                                </div>

                                {/* Background Decoration */}
                                {selectedId === addr.addressId && (
                                    <div className="absolute -bottom-4 -right-4 opacity-5 group-hover/card:scale-110 transition-transform duration-700">
                                        <Navigation2 className="w-32 h-32 rotate-45" />
                                    </div>
                                )}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={() => setIsManualEntry(true)}
                            className="flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/20 hover:bg-white hover:border-[#4988c4] hover:text-[#4988c4] transition-all duration-500 text-slate-400 gap-4 group"
                        >
                            <div className="p-5 rounded-[1.25rem] bg-slate-100 group-hover:bg-[#4988c4] group-hover:text-white transition-all duration-500 shadow-sm">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <span className="block text-[10px] font-black uppercase tracking-[0.2em]">Add Custom</span>
                                <span className="block text-xs font-bold mt-1 opacity-60">New delivery location</span>
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delivery Instructions */}
            <div className="mt-16 pt-12 border-t border-slate-50">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                            <Navigation2 className="w-5 h-5 text-[#4988c4]" />
                        </div>
                        <div>
                            <Label htmlFor="orderNotes" className="text-sm font-black text-slate-900 uppercase tracking-widest block">
                                Order Note
                            </Label>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Optional instructions</p>
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <textarea
                        id="orderNotes"
                        {...register("orderNotes")}
                        rows={4}
                        placeholder="E.g. Call me before delivery, leave it at the gate..."
                        className="w-full rounded-[1.5rem] border-2 border-slate-100 bg-slate-50/50 px-8 py-6 text-sm font-bold hover:border-[#4988c4]/30 focus:border-[#4988c4] focus:bg-white focus:ring-4 focus:ring-[#4988c4]/5 transition-all duration-500 resize-none placeholder:text-slate-300"
                    />
                    <div className="absolute top-4 right-8 pointer-events-none">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                    </div>
                </div>
            </div>
        </div>
    )
}

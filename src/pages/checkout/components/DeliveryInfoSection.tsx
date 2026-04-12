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
import { AddressCardList } from "./AddressCardList"
import vnAddress from "@/shared/data/vnAddress.json"
import { memo, useMemo, useEffect, useState, useCallback } from "react"
import { useAuthStore } from "@/store/authStore"
import { useAddresses } from "@/hooks/useAddress"
import { useProfile } from "@/hooks/queries/useUser"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, CheckCircle2, ShoppingBag, User, Phone, Mail, Navigation2, Plus } from "lucide-react"
import type { Address } from "@/api/types/address"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface DeliveryInfoSectionProps {
    form: UseFormReturn<CheckoutFormData>
}

function DeliveryInfoSectionInner({ form }: DeliveryInfoSectionProps) {
    const { register, setValue, watch, formState: { errors } } = form
    const selectedCityCode = watch("city")
    const selectedDistrictCode = watch("district")
    const selectedWardCode = watch("ward")
    const firstNameValue = watch("firstName")
    const lastNameValue = watch("lastName")

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

    const handleAddCustomAddress = useCallback(() => {
        setIsManualEntry(true)
        setSelectedId(null)
    }, [])

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
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 space-y-6 shadow-xl shadow-slate-200/20">
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-10 w-64 rounded-full" />
                    <Skeleton className="h-4 w-48 rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map(i => (
                        <div key={i} className="p-6 rounded-[1.5rem] border-2 border-slate-50 bg-slate-50/20 space-y-5">
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
        <div className="group rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-slate-300/20 transition-all duration-500">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 border border-primary-500/20">
                        <ShoppingBag className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step 01</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                        Shipping Details
                    </h2>
                    <p className="text-sm text-slate-400 font-medium">Please provide your delivery information.</p>
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
                        className="h-9 px-3.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-primary-500 hover:text-white transition-all duration-300 group/btn"
                        aria-label={isManualEntry ? "Switch to saved addresses" : "Switch to custom address"}
                    >
                        <div className="flex items-center gap-3">
                            {isManualEntry ? <MapPin className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            <span className="text-[11px] font-black uppercase tracking-widest">
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
                        className="space-y-6"
                    >
                        {/* Identity Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <User className="w-3 h-3 text-primary-500" /> First Name
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="firstName"
                                        {...register("firstName")}
                                        placeholder="Enter your first name"
                                        className={cn(
                                            "h-12 rounded-2xl border-slate-100 bg-slate-50/50 border-2 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all duration-300 font-bold placeholder:text-slate-300",
                                            firstNameValue && !errors.firstName && "border-emerald-100 bg-emerald-50/10"
                                        )}
                                    />
                                    {firstNameValue && !errors.firstName && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                                {errors.firstName && <p className="text-[10px] text-rose-500 font-black ml-1 uppercase tracking-wider">{errors.firstName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <User className="w-3 h-3 text-primary-500" /> Last Name
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="lastName"
                                        {...register("lastName")}
                                        placeholder="Enter your last name"
                                        className={cn(
                                            "h-12 rounded-2xl border-slate-100 bg-slate-50/50 border-2 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all duration-300 font-bold placeholder:text-slate-300",
                                            lastNameValue && !errors.lastName && "border-emerald-100 bg-emerald-50/10"
                                        )}
                                    />
                                    {lastNameValue && !errors.lastName && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                                {errors.lastName && <p className="text-[10px] text-rose-500 font-black ml-1 uppercase tracking-wider">{errors.lastName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Phone className="w-3 h-3 text-primary-500" /> Phone Number
                                </Label>
                                <Input
                                    {...register("phone")}
                                    placeholder="09xx xxx xxx"
                                    className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 border-2 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all duration-300 font-bold placeholder:text-slate-300"
                                />
                                {errors.phone && <p className="text-[10px] text-rose-500 font-black ml-1 uppercase tracking-wider">{errors.phone.message}</p>}
                            </div>
                        </div>

                        {/* Location Detail */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Mail className="w-3 h-3 text-primary-500" /> Email Address
                                </Label>
                                <Input
                                    {...register("email")}
                                    type="email"
                                    placeholder="your@email.com"
                                    className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 border-2 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all duration-300 font-bold placeholder:text-slate-300"
                                />
                                {errors.email && <p className="text-[10px] text-rose-500 font-black ml-1 uppercase tracking-wider">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Street Address</Label>
                                <Input
                                    {...register("streetAddress")}
                                    placeholder="E.g. No. 123 Nguyen Hue Street"
                                    className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 border-2 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all duration-300 font-bold placeholder:text-slate-300"
                                />
                                {errors.streetAddress && <p className="text-[10px] text-rose-500 font-black ml-1 uppercase tracking-wider">{errors.streetAddress.message}</p>}
                            </div>

                            {/* Geographical Selects */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Province / City</Label>
                                    <Select value={selectedCityCode} onValueChange={(v) => {
                                        setValue("city", v, { shouldValidate: true })
                                        setValue("district", "")
                                        setValue("ward", "")
                                    }}>
                                        <SelectTrigger className="h-12 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:ring-4 focus:ring-primary-500/5 transition-all font-bold">
                                            <SelectValue placeholder="Select City" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-100 animate-in fade-in-0 zoom-in-95">
                                            {provinces.map(p => (
                                                <SelectItem key={p.code} value={p.code} className="rounded-xl my-1 focus:bg-primary-500 focus:text-white transition-colors">{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">District</Label>
                                    <Select value={selectedDistrictCode} onValueChange={(v) => {
                                        setValue("district", v, { shouldValidate: true })
                                        setValue("ward", "")
                                    }} disabled={!selectedCityCode}>
                                        <SelectTrigger className="h-12 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:ring-4 focus:ring-primary-500/5 transition-all font-bold disabled:opacity-30">
                                            <SelectValue placeholder="Select District" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-100">
                                            {districts.map(d => (
                                                <SelectItem key={d.code} value={d.code} className="rounded-xl my-1">{d.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Ward</Label>
                                    <Select value={selectedWardCode} onValueChange={(v) => setValue("ward", v, { shouldValidate: true })} disabled={!selectedDistrictCode}>
                                        <SelectTrigger className="h-12 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:ring-4 focus:ring-primary-500/5 transition-all font-bold disabled:opacity-30">
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
                        className="grid grid-cols-1 md:grid-cols-2 gap-5"
                    >
                        <AddressCardList
                            addresses={addresses ?? []}
                            selectedId={selectedId}
                            onSelectAddress={handleSelectAddress}
                            onAddCustomAddress={handleAddCustomAddress}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delivery Instructions */}
            <div className="mt-10 pt-8 border-t border-slate-50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                            <Navigation2 className="w-4 h-4 text-primary-500" />
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
                        rows={3}
                        placeholder="E.g. Call me before delivery, leave it at the gate..."
                        className="w-full rounded-[1.25rem] border-2 border-slate-100 bg-slate-50/50 px-6 py-4 text-sm font-bold hover:border-primary-500/30 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all duration-500 resize-none placeholder:text-slate-300"
                    />
                    <div className="absolute top-3 right-6 pointer-events-none">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export const DeliveryInfoSection = memo(DeliveryInfoSectionInner)
DeliveryInfoSection.displayName = "DeliveryInfoSection"

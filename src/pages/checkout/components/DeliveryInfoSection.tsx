import { Controller, type UseFormReturn } from "react-hook-form"
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
import { useWatch } from "react-hook-form"
import { MapPin, ShoppingBag, User, Phone, Mail, Navigation2, Plus, Loader2 } from "lucide-react"
import type { Address } from "@/api/types/address"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/useToast"
import * as addressService from "@/api/services/address.service"
import type { CreateAddressPayload } from "@/api/types/address"
import { queryClient as libQueryClient } from "@/lib/queryClient"

interface DeliveryInfoSectionProps {
    form: UseFormReturn<CheckoutFormData>
}

function DeliveryInfoSectionInner({ form }: DeliveryInfoSectionProps) {
    const { register, setValue, control, formState: { errors } } = form
    
    const selectedCityCode = useWatch({ control, name: "city" })
    const selectedDistrictCode = useWatch({ control, name: "district" })
    const firstNameValue = useWatch({ control, name: "firstName" })
    const lastNameValue = useWatch({ control, name: "lastName" })

    const { isAuthenticated } = useAuthStore()
    const { data: addresses, isLoading: isLoadingAddresses } = useAddresses()
    const { data: profile } = useProfile()

    const [isManualEntry, setIsManualEntry] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const { success, error: toastError } = useToast()

    const handleSelectAddress = useCallback((addr: Address) => {
        setSelectedId(addr.addressId)
        setIsManualEntry(false)

        const names = addr.receiverName.trim().split(/\s+/)
        const firstName = names[0] || ""
        const lastName = names.length > 1 ? names.slice(1).join(" ") : names[0]

        setValue("addressId", addr.addressId, { shouldValidate: true })
        setValue("firstName", firstName, { shouldValidate: true })
        setValue("lastName", lastName, { shouldValidate: true })
        setValue("phone", addr.phoneNumber, { shouldValidate: true })
        setValue("streetAddress", addr.street, { shouldValidate: true })

        if (profile?.email) {
            setValue("email", profile.email, { shouldValidate: true })
        }

        const normalize = (s: string) => {
            if (!s) return "";
            return s.toLowerCase()
                .replace(/^(tp\.|thành phố|tỉnh|quận|huyện|thị xã|phường|xã)\s+/, "")
                .trim();
        };
        
        const province = vnAddress.find(p => normalize(p.name).includes(normalize(addr.province)) || normalize(addr.province).includes(normalize(p.name)));
        
        if (province) {
            setValue("city", province.code, { shouldValidate: true })
            const district = province.districts.find(d => normalize(d.name).includes(normalize(addr.district)) || normalize(addr.district).includes(normalize(d.name)));
            if (district) {
                setValue("district", district.code, { shouldValidate: true })
                const ward = district.wards.find(w => normalize(w.name).includes(normalize(addr.ward)) || normalize(addr.ward).includes(normalize(w.name)));
                if (ward) {
                    setValue("ward", ward.code, { shouldValidate: true })
                }
            }
        }
    }, [profile, setValue])

    const handleSaveAndUseAddress = async () => {
        const values = form.getValues()
        
        // Basic validation
        if (!values.firstName || !values.lastName || !values.phone || !values.city || !values.district || !values.ward || !values.streetAddress) {
            toastError("Missing Information", "Please fill in all address fields before confirming.")
            return
        }

        setIsSaving(true)
        try {
            const cityObj = vnAddress.find(p => p.code === values.city)
            const districtObj = cityObj?.districts.find(d => d.code === values.district)
            const wardObj = districtObj?.wards.find(w => w.code === values.ward)

            if (!cityObj || !districtObj || !wardObj) {
                throw new Error("Invalid location selection.")
            }

            const payload: CreateAddressPayload = {
                receiverName: `${values.firstName} ${values.lastName}`,
                phoneNumber: values.phone,
                street: values.streetAddress,
                province: cityObj.name,
                city: cityObj.name,
                district: districtObj.name,
                ward: wardObj.name
            }

            const createdId = await addressService.createAddress(payload)
            
            if (createdId) {
                success(
                    "Address Confirmed",
                    "Your address has been saved and selected for this order.",
                )
                
                // Invalidate addresses query to show the new one in the list
                libQueryClient.invalidateQueries({ queryKey: ["addresses"] })
                
                // Set the ID in form
                setValue("addressId", createdId, { shouldValidate: true })
                
                // Switch back to "Saved" view to show it's selected
                setSelectedId(createdId)
                setIsManualEntry(false)
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to save address."
            toastError("Address Error", message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleAddCustomAddress = useCallback(() => {
        setIsManualEntry(true)
        setSelectedId(null)
        setValue("addressId", null, { shouldValidate: true })
    }, [setValue])

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
                            const nextManualState = !isManualEntry
                            setIsManualEntry(nextManualState)
                            if (nextManualState) {
                                setSelectedId(null)
                                setValue("addressId", null, { shouldValidate: true })
                            }
                        }}
                        className="h-9 px-3.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-primary-500 hover:text-white transition-all duration-300 group/btn"
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <User className="w-3 h-3 text-primary-500" /> First Name
                                </Label>
                                <Input
                                    {...register("firstName")}
                                    placeholder="Enter your first name"
                                    className={cn(
                                        "h-12 rounded-2xl border-slate-100 bg-slate-50/50 border-2 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all duration-300 font-bold placeholder:text-slate-300",
                                        firstNameValue && !errors.firstName && "border-emerald-100 bg-emerald-50/10"
                                    )}
                                />
                                {errors.firstName && <p className="text-[10px] text-rose-500 font-black ml-1 uppercase tracking-wider">{errors.firstName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <User className="w-3 h-3 text-primary-500" /> Last Name
                                </Label>
                                <Input
                                    {...register("lastName")}
                                    placeholder="Enter your last name"
                                    className={cn(
                                        "h-12 rounded-2xl border-slate-100 bg-slate-50/50 border-2 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all duration-300 font-bold placeholder:text-slate-300",
                                        lastNameValue && !errors.lastName && "border-emerald-100 bg-emerald-50/10"
                                    )}
                                />
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Province / City</Label>
                                    <Controller
                                        name="city"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select 
                                                value={field.value || ""} 
                                                onValueChange={(v) => {
                                                    field.onChange(v)
                                                    setValue("district", "")
                                                    setValue("ward", "")
                                                }}
                                            >
                                                <SelectTrigger className="h-12 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:ring-4 focus:ring-primary-500/5 transition-all font-bold">
                                                    <SelectValue placeholder="Select City" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-100">
                                                    {provinces.map(p => (
                                                        <SelectItem key={p.code} value={p.code} className="rounded-xl my-1">
                                                            {p.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">District</Label>
                                    <Controller
                                        name="district"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select 
                                                value={field.value || ""} 
                                                onValueChange={(v) => {
                                                    field.onChange(v)
                                                    setValue("ward", "")
                                                }}
                                                disabled={!selectedCityCode}
                                            >
                                                <SelectTrigger className="h-12 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:ring-4 focus:ring-primary-500/5 transition-all font-bold disabled:opacity-30">
                                                    <SelectValue placeholder="Select District" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-100">
                                                    {districts.map(d => (
                                                        <SelectItem key={d.code} value={d.code} className="rounded-xl my-1">
                                                            {d.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Ward</Label>
                                    <Controller
                                        name="ward"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select 
                                                value={field.value || ""} 
                                                onValueChange={field.onChange}
                                                disabled={!selectedDistrictCode}
                                            >
                                                <SelectTrigger className="h-12 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:ring-4 focus:ring-primary-500/5 transition-all font-bold disabled:opacity-30">
                                                    <SelectValue placeholder="Select Ward" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-100">
                                                    {wards.map(w => (
                                                        <SelectItem key={w.code} value={w.code} className="rounded-xl my-1">
                                                            {w.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-start pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSaveAndUseAddress}
                                    disabled={isSaving}
                                    className="rounded-xl h-10 px-6 font-bold text-[11px] uppercase tracking-wider border-slate-200 text-slate-500 hover:bg-primary-500 hover:border-primary-500 hover:text-white transition-all duration-300"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save & Use This Address"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="address-grid"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
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

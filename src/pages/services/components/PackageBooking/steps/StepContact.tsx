import { MapPin, CheckCircle2, Plus, ChevronRight, MessageSquare } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { BookingFormValues } from "../schema";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAddresses } from "@/hooks/useAddress";
import { useProfile } from "@/hooks/queries/useUser";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import vnAddress from "@/shared/data/vnAddress.json";
import type { Address } from "@/api/types/address";

interface StepContactProps {
    form: UseFormReturn<BookingFormValues>;
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-[10px] text-rose-500 font-bold ml-1 uppercase tracking-wider mt-1">{message}</p>;
}

export default function StepContact({ form }: StepContactProps) {
    const { register, setValue, watch, formState: { errors } } = form;
    const notesValue = watch("notes") ?? "";

    const selectedCityCode = watch("address.city");
    const selectedDistrictCode = watch("address.district");
    const selectedWardCode = watch("address.ward");

    const { isAuthenticated } = useAuthStore();
    const { data: addresses, isLoading: isLoadingAddresses } = useAddresses();
    const { data: profile } = useProfile();

    const [isManualEntry, setIsManualEntry] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const activeAddress = useMemo(() => {
        return addresses?.find(a => a.addressId === selectedId) || null;
    }, [addresses, selectedId]);

    const handleSelectAddress = useCallback((addr: Address) => {
        setSelectedId(addr.addressId);
        setIsManualEntry(false);
        setModalOpen(false);

        setValue("customerName", addr.receiverName, { shouldValidate: true });
        setValue("customerPhone", addr.phoneNumber, { shouldValidate: true });
        setValue("address.street", addr.street, { shouldValidate: true });

        if (profile?.email) {
            setValue("customerEmail", profile.email, { shouldValidate: true });
        }

        const province = vnAddress.find(p => p.name.toLowerCase().includes(addr.province.toLowerCase()));
        if (province) {
            setValue("address.city", province.code, { shouldValidate: true });
            const district = province.districts.find(d => d.name.toLowerCase().includes(addr.district.toLowerCase()));
            if (district) {
                setValue("address.district", district.code, { shouldValidate: true });
                const ward = district.wards.find(w => w.name.toLowerCase().includes(addr.ward.toLowerCase()));
                if (ward) {
                    setValue("address.ward", ward.code, { shouldValidate: true });
                }
            }
        }
    }, [profile, setValue]);

    useEffect(() => {
        if (isLoadingAddresses) return;

        if (isAuthenticated && addresses && addresses.length > 0) {
            const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
            if (defaultAddr && !selectedId && !isManualEntry) {
                const timer = setTimeout(() => handleSelectAddress(defaultAddr), 0);
                return () => clearTimeout(timer);
            }
        } else if (!isAuthenticated || (addresses && addresses.length === 0)) {
            if (!isManualEntry) {
                const timer = setTimeout(() => setIsManualEntry(true), 0);
                return () => clearTimeout(timer);
            }
        }
    }, [addresses, isLoadingAddresses, isAuthenticated, selectedId, handleSelectAddress, isManualEntry]);

    const provinces = vnAddress;
    const districts = provinces.find(p => p.code === selectedCityCode)?.districts || [];
    const wards = districts.find(d => d.code === selectedDistrictCode)?.wards || [];

    // Apple/Stripe Design System Styles
    const cellClass = "flex flex-col px-4 py-3 border-b border-slate-100 last:border-b-0 focus-within:bg-[#4988c4]/5 transition-colors";
    const cellInputClass = "p-0 h-auto border-0 bg-transparent focus-visible:ring-0 font-bold text-slate-900 placeholder:text-slate-400 text-sm";
    const cellLabelClass = "text-[11px] font-black text-slate-500 uppercase tracking-widest mb-0.5";

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#4988c4]/10 text-[#4988c4] border border-[#4988c4]/20 text-[10px] font-black uppercase tracking-widest">
                    Step 04
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Contact & Address Details</h3>
                <p className="text-sm text-slate-500 font-medium tracking-wide">Provide your address for order sizing & lookup.</p>
            </div>

            <div className="space-y-4">
                <AnimatePresence mode="wait">
                    {!isManualEntry ? (
                        <motion.div
                            key="selected-view"
                            className="bg-slate-50/50 hover:bg-white border-2 border-dashed border-slate-200 hover:border-[#4988c4] rounded-2xl p-5 flex items-start justify-between cursor-pointer group transition-all"
                            onClick={() => setModalOpen(true)}
                        >
                            {activeAddress ? (
                                <div className="space-y-1.5 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-[#4988c4] flex-shrink-0" />
                                        <span className="font-black text-sm text-slate-900 tracking-tight truncate">
                                            {activeAddress.receiverName}
                                        </span>
                                        <span className="h-3 w-px bg-slate-200" />
                                        <p className="text-[11px] font-black text-slate-500">{activeAddress.phoneNumber}</p>
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-bold truncate pl-5">
                                        {activeAddress.street}, {activeAddress.ward}, {activeAddress.district}, {activeAddress.province}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-slate-500">
                                    <MapPin className="h-5 w-5" />
                                    <div className="space-y-1">
                                        <span className="font-black text-sm text-slate-700">No Address Selected</span>
                                        <p className="text-[11px] text-slate-500 font-medium">Click to choose a saved address</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-1 self-center text-[10px] font-black uppercase tracking-wider text-[#4988c4] opacity-0 group-hover:opacity-100 transition-opacity">
                                Change <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="manual-entry" className="space-y-5">
                            {isAuthenticated && addresses && addresses.length > 0 && (
                                <div className="flex justify-end">
                                    <Button type="button" variant="link" onClick={() => setIsManualEntry(false)} className="text-[10px] font-black uppercase tracking-widest text-[#4988c4] h-auto p-0 flex items-center gap-1"><MapPin className="w-3 h-3" /> Use Saved Address</Button>
                                </div>
                            )}

                            {/* Section 1: Contact (Apple Frame Style) */}
                            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                                <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
                                    <div className={cellClass}>
                                        <Label className={cellLabelClass}>Full Name</Label>
                                        <Input placeholder="John Doe" {...register("customerName")} className={cellInputClass} />
                                        <FieldError message={errors.customerName?.message} />
                                    </div>
                                    <div className={cellClass}>
                                        <Label className={cellLabelClass}>Phone Number</Label>
                                        <Input placeholder="09xx xxx xxx" {...register("customerPhone")} className={cellInputClass} />
                                        <FieldError message={errors.customerPhone?.message} />
                                    </div>
                                </div>
                                <div className={cellClass}>
                                    <Label className={cellLabelClass}>Email (Optional)</Label>
                                    <Input placeholder="john@example.com" {...register("customerEmail")} className={cellInputClass} />
                                </div>
                            </div>

                            {/* Section 2: Address Full */}
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Delivery Address</Label>
                                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                                    <div className={cellClass}>
                                        <Label className={cellLabelClass}>Street / Apartment</Label>
                                        <Input placeholder="123 Nguyen Hue Str" {...register("address.street")} className={cellInputClass} />
                                    </div>
                                    <div className="grid grid-cols-3 divide-x divide-slate-100">
                                        <Select value={selectedCityCode} onValueChange={(v) => { setValue("address.city", v, { shouldValidate: true }); setValue("address.district", ""); setValue("address.ward", ""); }}>
                                            <SelectTrigger className="border-0 shadow-none rounded-none px-4 py-6 h-auto focus:ring-0 focus:bg-[#4988c4]/5"><SelectValue placeholder="City" /></SelectTrigger>
                                            <SelectContent>{provinces.map(p => <SelectItem key={p.code} value={p.code} className="text-xs font-bold">{p.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <Select value={selectedDistrictCode} onValueChange={(v) => { setValue("address.district", v, { shouldValidate: true }); setValue("address.ward", ""); }} disabled={!selectedCityCode}>
                                            <SelectTrigger className="border-0 shadow-none rounded-none px-4 py-6 h-auto focus:ring-0 focus:bg-[#4988c4]/5"><SelectValue placeholder="District" /></SelectTrigger>
                                            <SelectContent>{districts.map(d => <SelectItem key={d.code} value={d.code} className="text-xs font-bold">{d.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <Select value={selectedWardCode} onValueChange={(v) => setValue("address.ward", v, { shouldValidate: true })} disabled={!selectedDistrictCode}>
                                            <SelectTrigger className="border-0 shadow-none rounded-none px-4 py-6 h-auto focus:ring-0 focus:bg-[#4988c4]/5"><SelectValue placeholder="Ward" /></SelectTrigger>
                                            <SelectContent>{wards.map(w => <SelectItem key={w.code} value={w.code} className="text-xs font-bold">{w.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100 border-dashed">
                <div className="flex items-center justify-between ml-1">
                    <Label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#4988c4]" /> Notes Settings
                    </Label>
                    <span className="text-[10px] font-bold text-slate-400">{notesValue.length} / 500</span>
                </div>
                <Textarea
                    rows={2}
                    placeholder="E.g., Gate number, fragile handling, leave at front..."
                    {...register("notes")}
                    className="w-full rounded-2xl border-slate-100 bg-white shadow-sm p-4 text-xs font-bold focus:border-[#4988c4] resize-none transition-all placeholder:text-slate-300"
                />
            </div>

            {/* Address Modal unchanged since it uses independent overlaid view space */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl p-6 border-slate-100">
                    <DialogHeader className="pb-4 border-b border-slate-50">
                        <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Saved Addresses</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-2 mt-4 max-h-80 overflow-y-auto items-container custom-scrollbar pr-1">
                        {addresses && addresses.length > 0 ? (
                            addresses.map((addr) => (
                                <button key={addr.addressId} type="button" onClick={() => handleSelectAddress(addr)} className={cn("w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 transition-all text-left bg-white hover:bg-slate-50/50", selectedId === addr.addressId && "border-[#4988c4] bg-[#4988c4]/5 shadow-sm")}>
                                    <div className="min-w-0 pr-4">
                                        <span className="font-black text-sm text-slate-900 tracking-tight">{addr.receiverName}</span>
                                        <p className="text-[10px] font-bold text-slate-500 mt-0.5">{addr.phoneNumber}</p>
                                        <p className="text-[10px] font-bold text-slate-400 truncate mt-1">{addr.street}, {addr.ward}</p>
                                        <p className="text-[9px] text-slate-300 font-bold">{addr.district}, {addr.province}</p>
                                    </div>
                                    <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0", selectedId === addr.addressId ? "border-[#4988c4] bg-[#4988c4]" : "border-slate-200")}>
                                        {selectedId === addr.addressId && <CheckCircle2 className="h-3 w-3 text-white" />}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-6 text-slate-400 font-bold text-xs">No address lists found.</div>
                        )}
                    </div>
                    <div className="pt-4 border-t border-slate-50">
                        <Button type="button" variant="ghost" onClick={() => { setIsManualEntry(true); setModalOpen(false); }} className="w-full h-11 rounded-xl border-2 border-dashed border-slate-200 bg-white text-slate-500 hover:border-[#4988c4] hover:text-[#4988c4] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all"><Plus className="w-3.5 h-3.5" /> Add Manual Form Address</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

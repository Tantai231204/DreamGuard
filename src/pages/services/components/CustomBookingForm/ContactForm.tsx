import { ArrowLeft, ArrowRight, Check, CheckCircle2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMemo, useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAddresses } from "@/hooks/useAddress";
import { useProfile } from "@/hooks/queries/useUser";
import { useAuthStore } from "@/store/authStore";
import vnAddress from "@/shared/data/vnAddress.json";
import type { Address } from "@/api/types/address";
import type { FieldErrors } from "react-hook-form";
import type { CustomBookingFormValues } from "./schema";

export interface BookingAddress {
    street: string;
    ward: string;
    district: string;
    city: string;
}

interface ContactFormProps {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    address: BookingAddress;
    preferredDate?: string;
    preferredTime?: string;
    onFieldChange: (key: string, value: string) => void;
    onAddressChange: (addr: Partial<BookingAddress>) => void;
    errors?: FieldErrors<CustomBookingFormValues>;
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-[10px] text-rose-500 font-bold ml-1 uppercase tracking-wider mt-1">{message}</p>;
}

export default function ContactForm({
    customerName,
    customerPhone,
    customerEmail,
    address,
    onFieldChange,
    onAddressChange,
    errors
}: ContactFormProps) {
    const { isAuthenticated } = useAuthStore();
    const { data: addresses, isLoading: isLoadingAddresses } = useAddresses();
    const { data: profile } = useProfile();

    const [isManualEntry, setIsManualEntry] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const activeAddress = useMemo(() => {
        return addresses?.find(a => a.addressId === selectedId) || null;
    }, [addresses, selectedId]);

    const handleSelectAddress = useCallback((addr: Address) => {
        setSelectedId(addr.addressId);
        setIsManualEntry(false);
        setModalOpen(false);

        onFieldChange("customerName", addr.receiverName);
        onFieldChange("customerPhone", addr.phoneNumber);

        if (profile?.email) {
            onFieldChange("customerEmail", profile.email);
        }

        const province = vnAddress.find(p => p.name.toLowerCase().includes(addr.province.toLowerCase()));
        if (province) {
            onAddressChange({ city: province.code, street: addr.street });
            const district = province.districts.find(d => d.name.toLowerCase().includes(addr.district.toLowerCase()));
            if (district) {
                onAddressChange({ district: district.code });
                const ward = district.wards.find(w => w.name.toLowerCase().includes(addr.ward.toLowerCase()));
                if (ward) {
                    onAddressChange({ ward: ward.code });
                }
            }
        }
    }, [profile, onFieldChange, onAddressChange]);

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
    const districts = useMemo(() => {
        return provinces.find(p => p.code === address.city)?.districts || [];
    }, [address.city, provinces]);

    const wards = useMemo(() => {
        return districts.find(d => d.code === address.district)?.wards || [];
    }, [address.district, districts]);

    const cellClass = "flex flex-col px-5 py-4 border-b border-slate-100 last:border-b-0 focus-within:bg-[#4988c4]/5 transition-colors";
    const cellInputClass = "p-0 h-auto border-0 bg-transparent focus-visible:ring-0 font-black text-slate-900 placeholder:text-slate-300 text-base leading-snug";
    const cellLabelClass = "text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1.5";

    return (
        <div className="animate-in fade-in duration-500 space-y-8">
            <div className="space-y-4">
                <AnimatePresence mode="wait">
                    {!isManualEntry ? (
                        <motion.div
                            key="selected-view"
                            className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-6 flex items-start justify-between cursor-pointer group transition-all"
                            onClick={() => setModalOpen(true)}
                        >
                            {activeAddress ? (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full bg-[#4988c4] flex items-center justify-center">
                                            <Check className="h-3 w-3 text-white" />
                                        </div>
                                        <span className="font-black text-slate-900 tracking-tight">{activeAddress.receiverName}</span>
                                        <span className="h-3 w-px bg-slate-300" />
                                        <span className="text-xs font-bold text-slate-500">{activeAddress.phoneNumber}</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 pl-7 leading-relaxed flex items-center gap-2">
                                        {activeAddress.street}, {activeAddress.ward}, {activeAddress.district}, {activeAddress.province}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-slate-400">
                                    <span className="font-black text-sm">Chưa có địa chỉ nào được chọn.</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1 self-center text-[10px] font-black uppercase tracking-wider text-[#4988c4] opacity-0 group-hover:opacity-100 transition-opacity">
                                Sửa <ArrowRight className="w-3.5 h-3.5" strokeWidth={3} />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="manual-entry" className="space-y-6">
                            {isAuthenticated && addresses && addresses.length > 0 && (
                                <div className="flex justify-end">
                                    <Button type="button" variant="link" onClick={() => setIsManualEntry(false)} className="text-[10px] font-black uppercase tracking-widest text-[#4988c4] h-auto p-0 flex items-center gap-1">
                                        <ArrowLeft className="w-3 H-3" /> Địa chỉ đã lưu
                                    </Button>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">Thông tin khách hàng</Label>
                                <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-2xl shadow-slate-100/50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 border-b border-slate-100">
                                        <div className={cellClass}>
                                            <Label className={cellLabelClass}>Họ và tên</Label>
                                            <Input placeholder="Nguyễn Văn A" value={customerName} onChange={(e) => onFieldChange("customerName", e.target.value)} className={cellInputClass} />
                                            <FieldError message={errors?.customerName?.message} />
                                        </div>
                                        <div className={cellClass}>
                                            <Label className={cellLabelClass}>Số điện thoại</Label>
                                            <Input placeholder="09xx xxx xxx" value={customerPhone} onChange={(e) => onFieldChange("customerPhone", e.target.value)} className={cellInputClass} />
                                            <FieldError message={errors?.customerPhone?.message} />
                                        </div>
                                    </div>
                                    <div className={cellClass}>
                                        <Label className={cellLabelClass}>Email (Không bắt buộc)</Label>
                                        <Input placeholder="example@gmail.com" value={customerEmail || ""} onChange={(e) => onFieldChange("customerEmail", e.target.value)} className={cellInputClass} />
                                        <FieldError message={errors?.customerEmail?.message} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">Địa chỉ dịch vụ</Label>
                                <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-2xl shadow-slate-100/50">
                                    <div className={cellClass}>
                                        <Label className={cellLabelClass}>Tên đường, Số nhà, Căn hộ</Label>
                                        <Input placeholder="123 Nguyễn Huệ" value={address.street} onChange={(e) => onAddressChange({ street: e.target.value })} className={cellInputClass} />
                                        <FieldError message={errors?.address?.street?.message} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                        <Select value={address.city} onValueChange={(v) => { onAddressChange({ city: v, district: "", ward: "" }); }}>
                                            <SelectTrigger className="border-0 shadow-none rounded-none px-5 py-7 h-auto focus:ring-0 focus:bg-[#4988c4]/5"><SelectValue placeholder="Chọn Tỉnh/Thành" /></SelectTrigger>
                                            <SelectContent>{provinces.map(p => <SelectItem key={p.code} value={p.code} className="text-xs font-bold">{p.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <Select value={address.district} onValueChange={(v) => { onAddressChange({ district: v, ward: "" }); }} disabled={!address.city}>
                                            <SelectTrigger className="border-0 shadow-none rounded-none px-5 py-7 h-auto focus:ring-0 focus:bg-[#4988c4]/5"><SelectValue placeholder="Chọn Quận/Huyện" /></SelectTrigger>
                                            <SelectContent>{districts.map(d => <SelectItem key={d.code} value={d.code} className="text-xs font-bold">{d.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <Select value={address.ward} onValueChange={(v) => onAddressChange({ ward: v })} disabled={!address.district}>
                                            <SelectTrigger className="border-0 shadow-none rounded-none px-5 py-7 h-auto focus:ring-0 focus:bg-[#4988c4]/5"><SelectValue placeholder="Chọn Phường/Xã" /></SelectTrigger>
                                            <SelectContent>{wards.map(w => <SelectItem key={w.code} value={w.code} className="text-xs font-bold">{w.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

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

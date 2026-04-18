import { useState, useEffect, useCallback, useMemo } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { CheckCircle2, MessageSquare, MapPin, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { BookingFormValues } from "../schema";
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
  const { register, setValue, formState: { errors } } = form;

  const notesValue = useWatch({ control: form.control, name: "notes" }) ?? "";
  const selectedCityCode = useWatch({ control: form.control, name: "address.city" });
  const selectedDistrictCode = useWatch({ control: form.control, name: "address.district" });
  const selectedWardCode = useWatch({ control: form.control, name: "address.ward" });

  const { isAuthenticated } = useAuthStore();
  const { data: addresses, isLoading: isLoadingAddresses } = useAddresses();
  const { data: profile } = useProfile();

  const [isManualEntry, setIsManualEntry] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const currentAddress = addresses?.find(a => a.addressId === selectedId);

  const handleSelectAddress = useCallback((addr: Address) => {
    setSelectedId(addr.addressId);
    setIsManualEntry(false);
    setModalOpen(false); // Close Modal

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
  }, [profile, setValue, setSelectedId, setIsManualEntry, setModalOpen]);

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
  const districts = useMemo(
    () => provinces.find((p) => p.code === selectedCityCode)?.districts || [],
    [selectedCityCode]
  );
  const wards = useMemo(
    () => districts.find((d) => d.code === selectedDistrictCode)?.wards || [],
    [districts, selectedDistrictCode]
  );

  const cellClass = "flex flex-col px-4 py-3 rounded-xl border border-dashed border-slate-200 bg-white focus-within:border-[#4988c4] focus-within:border-solid focus-within:ring-1 focus-within:ring-[#4988c4]/20 focus-within:shadow-sm transition-all";
  const cellInputClass = "p-0 mt-1 h-auto border-0 bg-transparent focus-visible:ring-0 font-black text-slate-900 placeholder:text-slate-300 text-sm";
  const cellLabelClass = "text-[10px] font-black text-slate-400 uppercase tracking-wider";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#4988c4]/10 text-[#4988c4] border border-[#4988c4]/20 text-[10px] font-black uppercase tracking-widest">
          Step 05
        </div>
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Contact & Address</h3>
        <p className="text-sm text-slate-500 font-medium tracking-wide">Tell us where we can pick up and deliver your items.</p>
      </div>

      <div className="max-w-xl mx-auto w-full bg-white border border-slate-100/80 rounded-3xl shadow-xl shadow-slate-100/20 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-6 bg-slate-50/40 border-b border-slate-100/80 space-y-3">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] flex items-center justify-center gap-2 mb-1">
            Address Source
          </Label>

          {/* Render Dialog at the Root of this Container panel to guarantee it stays mounted in DOM */}
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="max-w-md rounded-3xl p-6 bg-white">
              <DialogHeader>
                <DialogTitle className="text-lg font-black tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
                  <MapPin className="h-5 w-5 text-[#4988c4]" /> Choose Saved Location
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-2 overflow-y-auto max-h-[350px] pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                {addresses && addresses.length > 0 ? (
                  addresses.map((addr) => {
                    const isSelected = selectedId === addr.addressId;
                    return (
                      <button
                        key={addr.addressId}
                        type="button"
                        onClick={() => handleSelectAddress(addr)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left duration-200",
                          isSelected
                            ? "border-[#4988c4] border-solid bg-[#4988c4]/[0.03]"
                            : "border-slate-100 border-dashed bg-white hover:border-[#4988c4]/30 hover:bg-slate-50/50"
                        )}
                      >
                        <div className="min-w-0 pr-4">
                          <span className="font-black text-sm text-slate-800">{addr.receiverName}</span>
                          <p className="text-[10px] font-bold text-slate-500 mt-0.5">{addr.phoneNumber}</p>
                          <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{addr.street}, {addr.ward}</p>
                        </div>
                        <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all", isSelected ? "border-[#4988c4] bg-[#4988c4]" : "border-slate-200")}>
                          {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-slate-400 font-bold text-xs">No address lists found.</div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <AnimatePresence mode="wait">
            {!selectedId || isManualEntry ? (
              <motion.div
                key="picker"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <button type="button" onClick={() => setModalOpen(true)} className="w-full flex items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-[#4988c4]/40 hover:bg-white bg-white/50 transition-all text-xs font-black text-slate-600 shadow-sm shadow-slate-100/10">
                  <Plus className="h-4 w-4 mr-1 text-[#4988c4]" /> Select from Saved Addresses
                </button>

                <div className="text-center">
                  <button type="button" onClick={() => { setIsManualEntry(!isManualEntry); setSelectedId(null); }} className={`text-[10px] font-black uppercase tracking-wider transition-all ${isManualEntry ? "text-[#4988c4]" : "text-slate-400 hover:text-slate-600"}`}>
                    {isManualEntry ? "Cancel Manual Input" : "Or fill manually below"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="summary"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-md mx-auto bg-white border border-[#4988c4]/30 border-dashed rounded-2xl p-4 flex items-center justify-between shadow-md shadow-[#4988c4]/5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 rounded-xl bg-[#4988c4]/10 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <MapPin className="h-5 w-5 text-[#4988c4]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Location</p>
                    <p className="text-base font-black text-slate-800 mt-0.5 truncate">
                      {currentAddress?.receiverName || "Selected"}
                    </p>
                    <p className="text-xs font-bold text-slate-500 mt-0.5 leading-relaxed">
                      {currentAddress?.street && `${currentAddress.street}, `}
                      {currentAddress?.ward && `${currentAddress.ward}, `}
                      {currentAddress?.district && `${currentAddress.district}, `}
                      {currentAddress?.province}
                    </p>
                  </div>
                </div>
                {addresses && addresses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="text-xs font-black text-[#4988c4] bg-[#4988c4]/10 px-3 py-2 rounded-lg hover:bg-[#4988c4]/20 transition-all shadow-sm flex-shrink-0 ml-3"
                  >
                    Change
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fallback to Manual Input trigger below Summary/Picker if not in manual view already */}
          {!isManualEntry && (
            <div className="text-center mt-2 animate-in fade-in duration-300">
              <button
                type="button"
                onClick={() => { setIsManualEntry(true); setSelectedId(null); }}
                className="text-[10px] font-black uppercase tracking-wider text-[#4988c4]/80 hover:text-[#4988c4] transition-all"
              >
                Or Enter Manual Location
              </button>
            </div>
          )}
        </div>

        <div className="p-6 space-y-5">
          <AnimatePresence mode="wait">
            {isManualEntry && (
              <motion.div
                key="manual"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4 pt-2 overflow-hidden border-t border-slate-100/80 mt-2"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={cellClass}>
                    <Label className={cellLabelClass}>Full Name</Label>
                    <Input placeholder="E.g. John Doe" {...register("customerName")} className={cellInputClass} />
                    <FieldError message={errors.customerName?.message} />
                  </div>
                  <div className={cellClass}>
                    <Label className={cellLabelClass}>Phone Number</Label>
                    <Input placeholder="E.g. 0912345678" {...register("customerPhone")} className={cellInputClass} />
                    <FieldError message={errors.customerPhone?.message} />
                  </div>
                </div>

                <div className={cellClass}>
                  <Label className={cellLabelClass}>Email (Optional)</Label>
                  <Input placeholder="E.g. contact@email.com" {...register("customerEmail")} className={cellInputClass} />
                </div>

                <div className={cellClass}>
                  <Label className={cellLabelClass}>Street / Apartment</Label>
                  <Input placeholder="E.g. 123 Nguyen Hue Street" {...register("address.street")} className={cellInputClass} />
                  <FieldError message={errors.address?.street?.message} />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col border border-slate-200 border-dashed rounded-xl bg-white px-2 py-1 focus-within:border-[#4988c4] focus-within:border-solid focus-within:ring-1 focus-within:ring-[#4988c4]/20 transition-all">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-wider pl-1 pt-1">City</Label>
                    <Select value={selectedCityCode} onValueChange={(v) => { setValue("address.city", v, { shouldValidate: true }); setValue("address.district", ""); setValue("address.ward", ""); }}>
                      <SelectTrigger className="border-0 shadow-none h-7 px-1 focus:ring-0 text-xs font-black text-slate-800"><SelectValue placeholder="City" /></SelectTrigger>
                      <SelectContent>{provinces.map(p => <SelectItem key={p.code} value={p.code} className="text-xs font-bold">{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col border border-slate-200 border-dashed rounded-xl bg-white px-2 py-1 focus-within:border-[#4988c4] focus-within:border-solid focus-within:ring-1 focus-within:ring-[#4988c4]/20 transition-all">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-wider pl-1 pt-1">District</Label>
                    <Select value={selectedDistrictCode} onValueChange={(v) => { setValue("address.district", v, { shouldValidate: true }); setValue("address.ward", ""); }} disabled={!selectedCityCode}>
                      <SelectTrigger className="border-0 shadow-none h-7 px-1 focus:ring-0 text-xs font-black text-slate-800"><SelectValue placeholder="District" /></SelectTrigger>
                      <SelectContent>{districts.map(d => <SelectItem key={d.code} value={d.code} className="text-xs font-bold">{d.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col border border-slate-200 border-dashed rounded-xl bg-white px-2 py-1 focus-within:border-[#4988c4] focus-within:border-solid focus-within:ring-1 focus-within:ring-[#4988c4]/20 transition-all">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-wider pl-1 pt-1">Ward</Label>
                    <Select value={selectedWardCode} onValueChange={(v) => setValue("address.ward", v, { shouldValidate: true })} disabled={!selectedDistrictCode}>
                      <SelectTrigger className="border-0 shadow-none h-7 px-1 focus:ring-0 text-xs font-black text-slate-800"><SelectValue placeholder="Ward" /></SelectTrigger>
                      <SelectContent>{wards.map(w => <SelectItem key={w.code} value={w.code} className="text-xs font-bold">{w.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5 border-t border-slate-100/80 pt-4">
            <div className="flex items-center justify-between mb-1">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Notes Settings</Label>
              <span className="text-[9px] font-black text-slate-400 bg-slate-100 rounded-md px-1.5 py-0.5">{notesValue.length} / 500</span>
            </div>
            <Textarea rows={2} placeholder="E.g., Gate number, leave at front..." {...register("notes")} className="w-full rounded-xl border border-dashed border-slate-200 bg-white p-3 text-xs font-black focus:border-[#4988c4] focus:border-solid focus:ring-1 focus:ring-[#4988c4]/40 resize-none transition-all shadow-sm placeholder:text-slate-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { memo, useState, useCallback, useMemo, useEffect } from 'react';
import { Truck, MapPin, Plus, MapPin as MapPinIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CollectionType } from '../types';
import type { Address, CreateAddressPayload } from '@/api/types/address';
import { AddressCardList } from '@/pages/checkout/components/AddressCardList';
import { Button } from '@/components/ui/button';
import vnAddress from "@/shared/data/vnAddress.json";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/useToast";
import * as addressService from "@/api/services/address.service";
import { queryClient } from "@/lib/queryClient";
import { addressKeys } from "@/hooks/useAddress";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface StepLogisticsProps {
  collectionType: CollectionType;
  setCollectionType: (t: CollectionType) => void;
  contact: {
    receiverName: string;
    phoneNumber: string;
    address: string;
  };
  setContact: (c: { receiverName: string; phoneNumber: string; address: string }) => void;
  addresses?: Address[];
  isManualEntry: boolean;
  setIsManualEntry: (v: boolean) => void;
}

const LOGISTICS_OPTIONS: Array<{
  type: CollectionType;
  title: string;
  desc: string;
  badge: string | null;
  Icon: React.ElementType;
}> = [
    {
      type: 'pickup',
      title: 'Home Pickup',
      desc: 'Our team collects when your new order is delivered. No extra cost.',
      badge: 'Free',
      Icon: Truck,
    },
    {
      type: 'dropoff',
      title: 'Drop-off at Hub',
      desc: 'Bring to the nearest authorised collection point.',
      badge: null,
      Icon: MapPin,
    },
  ];

export const StepLogistics = memo(function StepLogistics({ 
  collectionType, 
  setCollectionType, 
  contact, 
  setContact,
  addresses = [],
  isManualEntry,
  setIsManualEntry,
}: StepLogisticsProps) {
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddressListOpen, setIsAddressListOpen] = useState(false);
  const [addressPage, setAddressPage] = useState(1);

  // Fetch paginated addresses for the dialog
  const { data: paginatedData, isLoading: isLoadingPages } = useQuery({
    queryKey: ["addresses", "paginated", addressPage],
    queryFn: () => addressService.getPaginatedAddresses(addressPage, 4),
    enabled: isAddressListOpen,
  });

  // Initialize manual entry state if no addresses exist
  useEffect(() => {
    if (addresses.length === 0) {
      setIsManualEntry(true);
    }
  }, [addresses.length, setIsManualEntry]);

  // Structured address state for manual entry
  const [cityCode, setCityCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [street, setStreet] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { success, error: toastError } = useToast();

  const handleSelectAddress = useCallback((addr: Address) => {
    setSelectedAddress(addr);
    setIsManualEntry(false);
    setContact({
      receiverName: addr.receiverName,
      phoneNumber: addr.phoneNumber,
      address: [addr.street, addr.ward, addr.district, addr.province].filter(Boolean).join(", "),
    });
  }, [setContact, setIsManualEntry]);

  const handleAddCustomAddress = useCallback(() => {
    setIsManualEntry(true);
    setSelectedAddress(null);
    setCityCode("");
    setDistrictCode("");
    setWardCode("");
    setStreet("");
  }, [setIsManualEntry]);

  const handleSaveAndUseAddress = useCallback(async () => {
    if (!contact.receiverName || !contact.phoneNumber || !cityCode || !districtCode || !wardCode || !street) {
      toastError("Missing Information", "Please fill in all address fields before confirming.");
      return;
    }

    setIsSaving(true);
    try {
      const cityObj = vnAddress.find(p => p.code === cityCode);
      const districtObj = cityObj?.districts.find(d => d.code === districtCode);
      const wardObj = districtObj?.wards.find(w => w.code === wardCode);

      if (!cityObj || !districtObj || !wardObj) {
        throw new Error("Invalid location selection.");
      }

      const payload: CreateAddressPayload = {
        receiverName: contact.receiverName,
        phoneNumber: contact.phoneNumber,
        street: street,
        province: cityObj.name,
        city: cityObj.name,
        district: districtObj.name,
        ward: wardObj.name
      };

      const createdId = await addressService.createAddress(payload);
      
      if (createdId) {
        success("Address Confirmed", "Your address has been saved and selected.");
        queryClient.invalidateQueries({ queryKey: addressKeys.all });
        
        // Also invalidate paginated list if it exists
        queryClient.invalidateQueries({ queryKey: ["addresses", "paginated"] });
        
        // Use the new address
        const fullAddress = [street, wardObj.name, districtObj.name, cityObj.name].filter(Boolean).join(", ");
        setContact({ ...contact, address: fullAddress });
        
        // Construct temporary address object to show selection
        const newAddr: Address = {
          addressId: createdId,
          receiverName: contact.receiverName,
          phoneNumber: contact.phoneNumber,
          street: street,
          ward: wardObj.name,
          district: districtObj.name,
          province: cityObj.name
        };
        setSelectedAddress(newAddr);
        setIsManualEntry(false);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save address.";
      toastError("Address Error", message);
    } finally {
      setIsSaving(false);
    }
  }, [contact, cityCode, districtCode, wardCode, street, toastError, success, setContact, setIsManualEntry]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContact({ ...contact, [name]: value });
  };

  // Update contact.address whenever manual fields change (live preview/fallback)
  useEffect(() => {
    if (isManualEntry) {
      const cityObj = vnAddress.find(p => p.code === cityCode);
      const districtObj = cityObj?.districts.find(d => d.code === districtCode);
      const wardObj = districtObj?.wards.find(w => w.code === wardCode);
      
      const parts = [street, wardObj?.name, districtObj?.name, cityObj?.name].filter(Boolean);
      if (parts.length > 0) {
        const fullAddress = parts.join(", ");
        if (fullAddress !== contact.address) {
          setContact({ ...contact, address: fullAddress });
        }
      }
    }
  }, [cityCode, districtCode, wardCode, street, isManualEntry, setContact, contact]);

  const provinces = vnAddress;
  const districts = useMemo(() => {
    return provinces.find(p => p.code === cityCode)?.districts || [];
  }, [cityCode, provinces]);

  const wards = useMemo(() => {
    return districts.find(d => d.code === districtCode)?.wards || [];
  }, [districtCode, districts]);

  // Auto-select default address on first load if available
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress && !isManualEntry) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      if (defaultAddr) {
        handleSelectAddress(defaultAddr);
      }
    }
  }, [addresses, handleSelectAddress, isManualEntry, selectedAddress]);

  const displayedAddresses = useMemo(() => {
    const initial = addresses.slice(0, 2);
    
    // If selected address exists and is not in the first two, replace the second one
    if (selectedAddress && !initial.some(a => a.addressId === selectedAddress.addressId)) {
      return [initial[0], selectedAddress];
    }
    return initial;
  }, [addresses, selectedAddress]);

  const hasMoreAddresses = addresses.length > 2;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <div className="mb-5">
          <h3 className="font-serif italic text-[22px] text-gray-900 font-normal leading-tight">
            How should we collect?
          </h3>
          <p className="text-[12px] text-[#8C7A6B] mt-1 font-medium">
            Select your preferred return logistics method
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {LOGISTICS_OPTIONS.map(({ type, title, desc, Icon, badge }) => {
            const selected = collectionType === type;
            return (
              <button
                key={type}
                onClick={() => setCollectionType(type)}
                className={cn(
                  'relative flex flex-col p-6 rounded-[22px] border-2 text-left transition-all duration-300',
                  selected
                    ? 'bg-[#F2F7F2] border-[#3D5140] shadow-sm'
                    : 'bg-white border-[#EDE8E1] hover:border-[#3D5140]/30 hover:bg-[#FAFAF8]'
                )}
              >
                {badge && (
                  <span className="absolute top-4 right-4 text-[9px] font-black text-[#3D5140] bg-[#C8E0CB] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {badge}
                  </span>
                )}

                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300',
                    selected ? 'bg-[#3D5140]' : 'bg-[#F5F2EE]'
                  )}
                >
                  <Icon className={cn('w-6 h-6', selected ? 'text-white' : 'text-[#8C7A6B]')} />
                </div>

                <p className="text-[15px] font-bold text-gray-900 mb-1.5">{title}</p>
                <p className="text-[11.5px] font-medium text-[#8C7A6B] leading-relaxed flex-1">{desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-[#EDE8E1]/50">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-serif italic text-[22px] text-gray-900 font-normal leading-tight">
              Contact Details
            </h3>
            <p className="text-[12px] text-[#8C7A6B] mt-1 font-medium italic text-left">
              Provide the shipping information for your new product.
            </p>
          </div>

          {addresses.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                const nextManualState = !isManualEntry;
                setIsManualEntry(nextManualState);
                if (nextManualState) {
                   setSelectedAddress(null);
                   setCityCode("");
                   setDistrictCode("");
                   setWardCode("");
                   setStreet("");
                   setContact({ ...contact, address: "" });
                }
              }}
              className="h-9 px-3.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-[#3D5140] hover:text-white transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                {isManualEntry ? <MapPinIcon className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {isManualEntry ? "Saved" : "Manual"}
                </span>
              </div>
            </Button>
          )}
        </div>

        {isManualEntry || addresses.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">Recipient Name</label>
              <input
                type="text"
                name="receiverName"
                value={contact.receiverName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full h-12 px-4 rounded-xl border border-[#EDE8E1] focus:border-[#3D5140] focus:ring-1 focus:ring-[#3D5140] bg-white text-sm font-medium outline-none transition-all placeholder:text-gray-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-left block">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={contact.phoneNumber}
                onChange={handleChange}
                placeholder="0901234567"
                className="w-full h-12 px-4 rounded-xl border border-[#EDE8E1] focus:border-[#3D5140] focus:ring-1 focus:ring-[#3D5140] bg-white text-sm font-medium outline-none transition-all placeholder:text-gray-300 font-mono"
              />
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">City / Province</Label>
                <Select value={cityCode} onValueChange={(v) => { setCityCode(v); setDistrictCode(""); setWardCode(""); }}>
                  <SelectTrigger className="h-12 rounded-xl border-border bg-white font-medium text-sm">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    {provinces.map(p => (
                      <SelectItem key={p.code} value={p.code} className="rounded-lg">{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">District</Label>
                <Select value={districtCode} onValueChange={(v) => { setDistrictCode(v); setWardCode(""); }} disabled={!cityCode}>
                  <SelectTrigger className="h-12 rounded-xl border-border bg-white font-medium text-sm disabled:opacity-50">
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    {districts.map(d => (
                      <SelectItem key={d.code} value={d.code} className="rounded-lg">{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Ward</Label>
                <Select value={wardCode} onValueChange={setWardCode} disabled={!districtCode}>
                  <SelectTrigger className="h-12 rounded-xl border-border bg-white font-medium text-sm disabled:opacity-50">
                    <SelectValue placeholder="Select Ward" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    {wards.map(w => (
                      <SelectItem key={w.code} value={w.code} className="rounded-lg">{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Street Address</label>
              <input
                type="text"
                name="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="123 Luxury St"
                className="w-full h-12 px-4 rounded-xl border border-[#EDE8E1] focus:border-[#3D5140] focus:ring-1 focus:ring-[#3D5140] bg-white text-sm font-medium outline-none transition-all placeholder:text-gray-300"
              />
            </div>

            <div className="md:col-span-2 flex justify-start">
               <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSaveAndUseAddress}
                  disabled={isSaving}
                  className="rounded-xl h-10 px-6 font-bold text-[10px] uppercase tracking-wider border-[#EDE8E1] text-gray-500 hover:bg-[#3D5140] hover:text-white transition-all duration-300"
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
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <AddressCardList
                addresses={displayedAddresses}
                selectedId={selectedAddress?.addressId || null}
                onSelectAddress={handleSelectAddress}
                onAddCustomAddress={handleAddCustomAddress}
                variant="tradein"
              />

              {hasMoreAddresses && (
                <Dialog open={isAddressListOpen} onOpenChange={setIsAddressListOpen}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="flex flex-col items-center justify-center p-6 rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50/20 hover:bg-white transition-all duration-500 text-slate-400 gap-3 group hover:border-[#3D5140] hover:text-[#3D5140]"
                    >
                      <div className="p-4 rounded-xl bg-slate-100 transition-all duration-500 shadow-sm group-hover:bg-[#3D5140] group-hover:text-white">
                        <MapPinIcon className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <span className="block text-[10px] font-black uppercase tracking-[0.2em]">View All</span>
                        <span className="block text-xs font-bold mt-1 opacity-60">
                          {addresses.length - 2} more saved locations
                        </span>
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[800px] max-h-[90vh] overflow-hidden rounded-[32px] p-0 border-none bg-[#FDFCFA] flex flex-col">
                    <DialogHeader className="px-8 pt-8 pb-4 bg-white border-b border-[#EDE8E1]/50">
                      <div className="flex items-center justify-between">
                         <DialogTitle className="font-serif italic text-2xl">All Saved Locations</DialogTitle>
                         {paginatedData && (
                           <div className="flex items-center gap-2">
                             <Button
                               variant="outline"
                               size="icon"
                               disabled={!paginatedData.hasPreviousPage || isLoadingPages}
                               onClick={() => setAddressPage(prev => Math.max(1, prev - 1))}
                               className="w-8 h-8 rounded-full border-[#EDE8E1]"
                             >
                               <ChevronLeft className="w-4 h-4" />
                             </Button>
                             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 w-16 text-center">
                               Page {paginatedData.pageNumber} / {paginatedData.totalPages}
                             </span>
                             <Button
                               variant="outline"
                               size="icon"
                               disabled={!paginatedData.hasNextPage || isLoadingPages}
                               onClick={() => setAddressPage(prev => prev + 1)}
                               className="w-8 h-8 rounded-full border-[#EDE8E1]"
                             >
                               <ChevronRight className="w-4 h-4" />
                             </Button>
                           </div>
                         )}
                      </div>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                      {isLoadingPages ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4 text-gray-400">
                           <Loader2 className="w-8 h-8 animate-spin text-[#3D5140]" />
                           <p className="text-[10px] font-black uppercase tracking-widest">Loading Addresses...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <AddressCardList
                            addresses={paginatedData?.items || []}
                            selectedId={selectedAddress?.addressId || null}
                            onSelectAddress={(addr) => {
                              handleSelectAddress(addr);
                              setIsAddressListOpen(false);
                            }}
                            onAddCustomAddress={() => {
                              handleAddCustomAddress();
                              setIsAddressListOpen(false);
                            }}
                            variant="tradein"
                          />
                        </div>
                      )}
                    </div>

                    <div className="px-8 py-4 bg-[#F6FAF7] border-t border-[#EDE8E1] flex justify-between items-center text-[10px] font-bold text-[#6A7A6B]">
                       <span>Total {paginatedData?.totalCount || 0} addresses found</span>
                       <span className="italic opacity-70">* Select a card to use as your delivery destination</span>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

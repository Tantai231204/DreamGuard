import React, { memo } from 'react';
import { Truck, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CollectionType } from '../types';
import type { Address } from '@/api/types/address';
import { AddressCardList } from '@/pages/checkout/components/AddressCardList';
import { Button } from '@/components/ui/button';
import { Plus, MapPin as MapPinIcon } from 'lucide-react';

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
  addresses = []
}: StepLogisticsProps) {
  const [isManualEntry, setIsManualEntry] = React.useState(addresses.length === 0);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const handleSelectAddress = React.useCallback((addr: Address) => {
    setSelectedId(addr.addressId);
    setIsManualEntry(false);
    setContact({
      receiverName: addr.receiverName,
      phoneNumber: addr.phoneNumber,
      address: [addr.street, addr.ward, addr.district, addr.province].filter(Boolean).join(", "),
    });
  }, [setContact]);

  const handleAddCustomAddress = React.useCallback(() => {
    setIsManualEntry(true);
    setSelectedId(null);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContact({ ...contact, [name]: value });
  };

  // Auto-select default address on first load if available
  React.useEffect(() => {
    if (addresses.length > 0 && !selectedId && !isManualEntry) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      if (defaultAddr) {
        handleSelectAddress(defaultAddr);
      }
    }
  }, [addresses, handleSelectAddress, isManualEntry, selectedId]);

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
                setIsManualEntry(!isManualEntry);
                if (!isManualEntry) {
                   setSelectedId(null);
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
            <div className="space-y-2 md:col-span-2 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Delivery Address</label>
              <input
                type="text"
                name="address"
                value={contact.address}
                onChange={handleChange}
                placeholder="123 Luxury St, District 1, HCM"
                className="w-full h-12 px-4 rounded-xl border border-[#EDE8E1] focus:border-[#3D5140] focus:ring-1 focus:ring-[#3D5140] bg-white text-sm font-medium outline-none transition-all placeholder:text-gray-300"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in zoom-in-95 duration-300">
            <AddressCardList
              addresses={addresses}
              selectedId={selectedId}
              onSelectAddress={handleSelectAddress}
              onAddCustomAddress={handleAddCustomAddress}
              variant="tradein"
            />
          </div>
        )}
      </div>
    </div>
  );
});

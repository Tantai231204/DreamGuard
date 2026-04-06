import type React from 'react';
import { Check, Truck, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CollectionType } from '../types';

interface StepLogisticsProps {
  collectionType: CollectionType;
  setCollectionType: (t: CollectionType) => void;
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

export function StepLogistics({ collectionType, setCollectionType }: StepLogisticsProps) {
  return (
    <div>
      <div className="mb-5">
        <h3 className="font-serif italic text-[20px] text-gray-900 font-normal leading-tight">
          How should we collect?
        </h3>
        <p className="text-[11.5px] text-[#8C7A6B] mt-1">
          Choose the most convenient option for you
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {LOGISTICS_OPTIONS.map(({ type, title, desc, Icon, badge }) => {
          const selected = collectionType === type;
          return (
            <button
              key={type}
              onClick={() => setCollectionType(type)}
              className={cn(
                'relative flex flex-col p-5 rounded-2xl border text-left transition-all duration-150',
                selected
                  ? 'bg-[#F2F7F2] border-[#4A5D4E]'
                  : 'bg-white border-[#EDE8E1] hover:border-[#4A5D4E]/40 hover:bg-[#FAFAF8]'
              )}
            >
              {badge && (
                <span className="absolute top-3 right-3 text-[9px] font-bold text-[#3D5140] bg-[#C8E0CB] px-2 py-0.5 rounded-full uppercase tracking-wide">
                  {badge}
                </span>
              )}

              <div
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors duration-150',
                  selected ? 'bg-[#3D5140]' : 'bg-[#F5F2EE]'
                )}
              >
                <Icon className={cn('w-5 h-5', selected ? 'text-white' : 'text-[#8C7A6B]')} />
              </div>

              <p className="text-[14px] font-semibold text-gray-900 mb-1">{title}</p>
              <p className="text-[11px] text-[#8C7A6B] leading-relaxed flex-1">{desc}</p>

              {/* Selected badge — pure CSS visibility */}
              <span
                className={cn(
                  'mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-[#3D5140]',
                  'transition-all duration-150',
                  selected ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none h-0 mt-0 overflow-hidden'
                )}
              >
                <Check className="w-3 h-3 stroke-[3]" /> Selected
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

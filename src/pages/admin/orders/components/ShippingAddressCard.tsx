import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ShippingAddressCardProps {
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
}

export function ShippingAddressCard({ fullName, phone, street, ward, district, city }: ShippingAddressCardProps) {
  return (
    <Card className="border border-blue-100/50 bg-white rounded-2xl shadow-sm overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-colors" />

      <div className="p-5 flex flex-col gap-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Recipient</span>
            <p className="text-sm font-black text-slate-900 leading-tight">{fullName}</p>
            <p className="text-[11px] font-bold text-slate-500 font-mono tracking-tighter mt-0.5">{phone}</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50">
            <MapPin className="w-3.5 h-3.5 text-primary" />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-50">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Delivery Address</span>
          <div className="space-y-2">
            <div className="flex items-center gap-2 group/addr">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover/addr:bg-primary transition-colors" />
              <p className="text-[11px] font-bold text-slate-700 leading-relaxed uppercase">{street}</p>
            </div>
            <div className="flex items-center gap-2 group/addr">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/addr:bg-primary transition-colors" />
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
                {ward}, {district}
              </p>
            </div>
            <div className="flex items-center gap-2 group/addr">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/addr:bg-primary transition-colors" />
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-black text-slate-900 uppercase">{city}</p>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-bold uppercase tracking-wider border-none px-2 py-0.5">
                  VERIFIED
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

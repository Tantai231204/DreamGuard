import { Card } from '@/components/ui/card';
import { User, ShieldCheck } from 'lucide-react';

interface CustomerInfoCardProps {
  name: string;
  email: string;
  phone: string;
}

export function CustomerInfoCard({ name, email, phone }: CustomerInfoCardProps) {
  return (
    <Card className="border border-blue-100/50 bg-blue-50/10 rounded-2xl shadow-sm overflow-hidden relative group">
       <div className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between">
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer Profile</span>
                <h3 className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight">{name}</h3>
             </div>
             <div className="p-2 rounded-lg bg-white border border-blue-50 shadow-sm">
                <User className="w-3.5 h-3.5 text-primary" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Email</span>
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                   <p className="text-[10px] font-bold text-slate-600 truncate">{email}</p>
                </div>
             </div>
             <div className="space-y-1 text-right">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phone</span>
                <p className="text-[10px] font-bold text-slate-900 font-mono tracking-tighter">{phone}</p>
             </div>
          </div>

          <div className="pt-3 border-t border-blue-50/50 flex items-center justify-between mt-1">
             <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-primary/40" />
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Verified Customer</span>
             </div>
             <div className="w-2 h-2 rounded-full border-2 border-primary/20" />
          </div>
       </div>
    </Card>
  );
}

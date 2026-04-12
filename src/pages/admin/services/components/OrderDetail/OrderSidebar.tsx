import { User, Phone, MapPin, Calendar, Clock, Briefcase, ShieldCheck, UserPlus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';
import { AdminStatusBadge } from '@/components/admin';
import type { DetailOrder, TaskDetail } from './types';
import type { Staff } from '../../types';

interface OrderSidebarProps {
  order: DetailOrder;
  task?: TaskDetail;
  technician?: Staff | null;
  scheduledDate: string | null | undefined;
  scheduledTime: string | null | undefined;
  onAssign?: () => void;
}

import { memo } from 'react';

export const OrderSidebar = memo(function OrderSidebar({
  order,
  task,
  technician,
  scheduledDate,
  scheduledTime,
  onAssign
}: OrderSidebarProps) {
  return (
    <div className="space-y-6">
      {/* PRIMARY CONTEXT: WHO & WHEN */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-50">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400 group-hover:text-[#4988c4] transition-colors" /> Service Context
          </h3>
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
        </div>

        <div className="space-y-4">
          {/* Customer Info */}
          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">Client:</span>
              <span className="font-bold text-slate-800">{order.customerName || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">Contact:</span>
              <a href={`tel:${order.customerPhone}`} className="font-bold text-[#4988c4] flex items-center gap-1.5 hover:underline cursor-pointer">
                <Phone className="h-3.5 w-3.5" /> {order.customerPhone || 'N/A'}
              </a>
            </div>
          </div>

          {/* Schedule Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50 flex flex-col items-center gap-1">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Scheduled Date</span>
              <span className="text-xs font-bold text-slate-800">{scheduledDate ? formatDate(scheduledDate) : 'N/A'}</span>
            </div>
            <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50 flex flex-col items-center gap-1">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Shift Time</span>
              <span className="text-xs font-bold text-slate-800">{scheduledTime || 'N/A'}</span>
            </div>
          </div>

          {/* Address */}
          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 flex flex-col gap-2 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-2 opacity-5">
                <MapPin className="h-10 w-10 text-slate-900" />
             </div>
             <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
               <MapPin className="h-3.5 w-3.5 text-slate-400" /> Service Location
             </div>
             <p className="text-xs font-medium text-slate-600 leading-relaxed relative z-10">
               {order.address?.street || 'N/A'}
             </p>
          </div>
        </div>
      </div>

      {/* RESOURCE MANAGEMENT: TECHNICIAN & WORKFLOW */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-50">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-slate-400" /> Operations Command
          </h3>
          {task && (
             <Badge className="bg-blue-50 text-[#4988c4] border-blue-100 border font-bold text-[8px] h-5 px-2 rounded-lg">LIVE TRACKING</Badge>
          )}
        </div>

        <div className="space-y-5">
           {technician ? (
             <div className="space-y-4">
                <div className="flex items-center gap-3.5 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 shadow-sm group hover:bg-white transition-all duration-300">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-slate-100 bg-slate-50">
                    <AvatarImage src={technician.avatarUrl || undefined} className="object-cover" />
                    <AvatarFallback className="bg-slate-200 text-slate-500 font-black text-sm">
                      {technician.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 text-sm truncate tracking-tight">{technician.fullName}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                       <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                         <ShieldCheck className="h-3 w-3 text-blue-500" /> Verified Personnel
                       </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                   <div className="flex items-center justify-between p-3.5 bg-slate-50/30 rounded-2xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Execution State</span>
                      <AdminStatusBadge status={task?.status || 'Assigned'} className="shadow-none border-none bg-transparent" />
                   </div>

                   {(task?.checkIn || task?.checkOut) && (
                     <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100/50 flex flex-col items-center gap-1">
                           <span className="text-[8px] font-black text-slate-400 uppercase">Check-In</span>
                           <span className="text-xs font-bold text-slate-800">
                             {task?.checkIn ? format(parseISO(task.checkIn as string), 'hh:mm a') : '--:--'}
                           </span>
                        </div>
                        <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100/50 flex flex-col items-center gap-1">
                           <span className="text-[8px] font-black text-slate-400 uppercase">Check-Out</span>
                           <span className="text-xs font-bold text-slate-800">
                             {task?.checkOut ? format(parseISO(task.checkOut as string), 'hh:mm a') : '--:--'}
                           </span>
                        </div>
                     </div>
                   )}
                </div>
             </div>
           ) : (
             <button
                onClick={onAssign}
                className="w-full py-12 rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4 hover:bg-slate-50/50 hover:border-blue-200 transition-all group bg-white"
             >
                <div className="h-14 w-14 rounded-full bg-slate-50/50 flex items-center justify-center text-slate-200 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all duration-500">
                  <UserPlus className="h-7 w-7" />
                </div>
                <div className="text-center space-y-1">
                  <span className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-600 transition-colors">Unassigned Asset</span>
                  <span className="block text-[9px] font-bold text-slate-300 group-hover:text-slate-400 transition-colors">Dispatch personnel to begin execution</span>
                </div>
             </button>
           )}
        </div>
      </div>

    </div>
  );
});


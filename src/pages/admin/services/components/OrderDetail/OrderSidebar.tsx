import { User, Phone, MapPin, Calendar, Clock, Briefcase, ShieldCheck, AlertCircle, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AdminStatusBadge } from '@/components/admin';
import { formatPrice, formatDate } from '@/lib/utils';
import type { DetailOrder, TaskDetail } from './types';
import type { Staff } from '../../types';

interface OrderSidebarProps {
  order: DetailOrder;
  task?: TaskDetail;
  technician?: Staff | null;
  scheduledDate: string | null | undefined;
  scheduledTime: string | null | undefined;
}

export function OrderSidebar({ order, task, technician, scheduledDate, scheduledTime }: OrderSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Customer & Address Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <User className="h-4 w-4 text-blue-600" /> Customer Information
        </h3>
        <Separator className="bg-slate-100" />
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Name:</span>
            <span className="font-bold text-slate-800">{order.customerName || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Phone:</span>
            <span className="font-bold text-slate-800 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md text-xs">
              <Phone className="h-3 w-3 text-blue-600" /> {order.customerPhone || 'N/A'}
            </span>
          </div>
          <Separator className="bg-slate-50" />
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-red-500" /> Service Address
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
              {order.address?.street || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Details Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-600" /> Booking Schedule
        </h3>
        <Separator className="bg-slate-100" />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-50 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-1 border border-slate-100 shadow-sm">
            <Calendar className="h-5 w-5 text-blue-600 mb-0.5" />
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Scheduled Date</span>
            <span className="font-black text-slate-800 text-sm">{scheduledDate ? formatDate(scheduledDate) : 'N/A'}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-1 border border-slate-100 shadow-sm">
            <Clock className="h-5 w-5 text-blue-600 mb-0.5" />
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Scheduled Time</span>
            <span className="font-black text-slate-800 text-sm">{scheduledTime || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Task Assignment Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-emerald-500" /> Technician Assigned
        </h3>
        <Separator className="bg-slate-100" />
        {technician ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100/80">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-slate-100">
                <AvatarImage src={technician.avatarUrl} />
                <AvatarFallback className="bg-blue-600 text-white font-black text-base">
                  {technician.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                   <p className="font-black text-slate-800 text-sm truncate">{technician.fullName}</p>
                   <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                </div>
                <p className="text-xs font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                   <Phone className="h-3 w-3" /> {technician.phoneNumber || 'N/A'}
                </p>
              </div>
            </div>

            {task && (
              <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100/30">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Task Status</span>
                <Badge className="bg-blue-600 text-white border-0 font-black px-2.5 rounded-full h-5 text-[10px] uppercase tracking-wide">
                  {task.status || 'Active'}
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Assign Technician</span>
          </div>
        )}
      </div>

      {/* Billing & Notes Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-sky-500" /> Billing Overview
        </h3>
        <Separator className="bg-slate-100" />
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100/50 hover:bg-slate-100/50 transition-colors">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Payment Info</span>
              <div className="flex gap-1.5 flex-wrap">
                <AdminStatusBadge status={order.paymentStatus?.toLowerCase() || ''} />
                {order.paymentMethod && order.paymentMethod?.toLowerCase() !== order.paymentStatus?.toLowerCase() && (
                  <AdminStatusBadge status={order.paymentMethod?.toLowerCase() || ''} />
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-0.5">Payable</span>
              <p className="text-lg font-black text-slate-800">{formatPrice(order.totalPrice || 0)}</p>
            </div>
          </div>

          {order.notes && (
            <div className="bg-amber-50/30 p-3.5 rounded-xl border border-amber-100/50 flex flex-col gap-2 shadow-inner">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-700 uppercase tracking-widest leading-none">
                <AlertCircle className="h-3.5 w-3.5" /> Customer Note
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{order.notes}"
              </p>
            </div>
          )}

          {task?.staffNote && (
            <div className="bg-sky-50/30 p-3.5 rounded-xl border border-sky-100/50 flex flex-col gap-2 shadow-inner">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-sky-700 uppercase tracking-widest leading-none">
                 <Briefcase className="h-3.5 w-3.5" /> Staff Internal Note
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                 "{task.staffNote}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

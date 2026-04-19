import React from 'react';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';
import { parseAddress } from '@/shared/utils/address/parseAddress';

export const AppointmentSection = React.memo(({ appointmentDate, receiverName, address }: { 
    appointmentDate?: string; 
    receiverName?: string; 
    address?: string 
}) => (
    <div className="bg-white p-5 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-3.5 h-3.5 text-[#4988c4]" />
                </div>
                <div className="space-y-0.5">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Appointment</h3>
                    <p className="text-[14px] font-black text-gray-900 tracking-tight">
                        {appointmentDate ? formatDate(appointmentDate) : 'Pending Date'}
                    </p>
                    <div className="flex items-center gap-1.5 opacity-60">
                        <Clock className="w-2.5 h-2.5 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                            {appointmentDate ? formatTime(appointmentDate) : 'Time TBD'}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-start gap-3 border-l border-gray-50 pl-4">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="space-y-0.5">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Service Site</h3>
                    <p className="text-[13px] font-bold text-gray-900 truncate max-w-[140px]">
                        {receiverName || 'Registered Client'}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400 leading-tight line-clamp-1">
                        {parseAddress(address)}
                    </p>
                </div>
            </div>
        </div>
    </div>
));
AppointmentSection.displayName = 'AppointmentSection';

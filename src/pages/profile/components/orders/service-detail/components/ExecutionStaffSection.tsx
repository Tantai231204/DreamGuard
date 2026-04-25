import React from 'react';
import { Star, Phone, ShieldCheck, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { RatingResponse } from '@/api/types/rating';

export const ExecutionStaffSection = React.memo(({ 
    hasAssignedStaff, 
    taskStatus, 
    ratedStaffName, 
    assignedStaffPhone, 
    displayAverage, 
    resolvedRating 
}: {
    hasAssignedStaff: boolean;
    taskStatus: string;
    ratedStaffName: string;
    assignedStaffPhone: string;
    displayAverage: string;
    resolvedRating: RatingResponse | null;
}) => (
    <div className="bg-white border-y border-gray-50">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5 text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[13px] font-bold uppercase tracking-widest">Execution Staff</span>
            </div>
            <Badge className="bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                {taskStatus || 'Awaiting'}
            </Badge>
        </div>

        {hasAssignedStaff ? (
            <div className="p-5">
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 overflow-hidden shadow-sm uppercase font-black text-sm">
                            {(ratedStaffName || 'S').charAt(0)}
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[14px] font-bold text-gray-900 tracking-tight">{ratedStaffName}</p>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <Phone className="w-2.5 h-2.5" />
                                    <span className="text-[11px] font-medium tracking-tight">{assignedStaffPhone || 'Secured'}</span>
                                </div>
                                <div className="bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-1 border border-amber-100/50">
                                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                    <span className="text-[10px] font-black text-amber-700">{displayAverage}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {resolvedRating && (
                    <div className="mt-4 p-5 rounded-xl border border-amber-100 bg-amber-50/30">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Service Evaluation</p>
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((v) => (
                                    <Star key={v} className={`w-3.5 h-3.5 ${v <= (resolvedRating?.score || 0) ? 'fill-amber-400 text-amber-400 shadow-sm' : 'text-slate-200'}`} />
                                ))}
                            </div>
                        </div>
                        <p className="text-[13px] text-slate-600 font-medium italic border-l-2 border-amber-200 pl-4 py-0.5 leading-relaxed">
                            &ldquo;{resolvedRating?.comment || 'Exceptional work performed at the site.'}&rdquo;
                        </p>
                    </div>
                )}
            </div>
        ) : (
            <div className="p-12 text-center">
                <Briefcase className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Optimizing staff assignment...</p>
            </div>
        )}
    </div>
));
ExecutionStaffSection.displayName = 'ExecutionStaffSection';

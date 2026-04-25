import React from 'react';
import { formatDate, formatPrice } from '@/lib/utils';

export const ServiceSummarySection = React.memo(({ createdAt, totalPrice }: { createdAt?: string; totalPrice?: number }) => (
    <div className="grid grid-cols-2 gap-px bg-gray-100 border-b border-gray-100">
        <div className="bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Created On</p>
            <p className="text-[15px] font-bold text-slate-800 tracking-tight">
                {formatDate(createdAt || '')}
            </p>
        </div>
        <div className="bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1">Total Value</p>
            <p className="text-xl font-black text-[#4988c4]">
                {formatPrice(totalPrice || 0)}
            </p>
        </div>
    </div>
));
ServiceSummarySection.displayName = 'ServiceSummarySection';

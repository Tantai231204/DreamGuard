import React from 'react';
import { AlertCircle } from 'lucide-react';

export const LoadingView = React.memo(() => (
    <div className="flex flex-col items-center justify-center py-40 gap-4 bg-white">
        <div className="w-7 h-7 border-[3px] border-[#4988c4] border-t-transparent rounded-full animate-spin" />
        <p className="text-[12px] font-bold text-gray-400 tracking-wider uppercase">Loading secure details...</p>
    </div>
));
LoadingView.displayName = 'LoadingView';

export const AccessRestrictedView = React.memo(() => (
    <div className="py-32 flex flex-col items-center justify-center text-center bg-white">
        <AlertCircle className="w-12 h-12 text-gray-200 mb-4" />
        <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Access Restricted</p>
    </div>
));
AccessRestrictedView.displayName = 'AccessRestrictedView';

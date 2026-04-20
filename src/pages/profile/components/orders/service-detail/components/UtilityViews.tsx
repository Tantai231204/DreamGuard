import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ServiceOrderDetailSkeleton } from '@/components/common/Skeletons';

export const LoadingView = React.memo(() => (
    <ServiceOrderDetailSkeleton />
));
LoadingView.displayName = 'LoadingView';

export const AccessRestrictedView = React.memo(() => (
    <div className="py-32 flex flex-col items-center justify-center text-center bg-white">
        <AlertCircle className="w-12 h-12 text-gray-200 mb-4" />
        <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Access Restricted</p>
    </div>
));
AccessRestrictedView.displayName = 'AccessRestrictedView';

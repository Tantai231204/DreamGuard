import React from 'react';
import { Package2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { ServiceOrderItem } from '@/api/types/serviceOrder';

export const ConsolidatedManifest = React.memo(({ items }: { items: ServiceOrderItem[] }) => (
    <div className="bg-white">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2.5">
            <Package2 className="w-4 h-4 text-gray-400" />
            <span className="text-[14px] font-bold text-gray-800 tracking-tight">Consolidated Manifest</span>
        </div>
        <div className="divide-y divide-gray-50">
            {items.length ? (
                items.map((item, idx) => {
                    const name = item.itemName || item.serviceName || item.packageName || `Service Item ${idx + 1}`;
                    return (
                        <div key={item.id || idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                            <div className="space-y-0.5">
                                <p className="text-[13px] font-bold text-gray-900 leading-tight">{name}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty: {item.quantity || 1}</p>
                            </div>
                            <p className="text-[14px] font-black text-[#4988c4] tabular-nums tracking-tighter shrink-0">
                                {formatPrice(item.totalPrice || item.unitPrice || 0)}
                            </p>
                        </div>
                    );
                })
            ) : (
                <div className="py-12 text-center text-slate-300">
                    <p className="text-[11px] font-black uppercase tracking-widest">No detailed items recorded</p>
                </div>
            )}
        </div>
    </div>
));
ConsolidatedManifest.displayName = 'ConsolidatedManifest';

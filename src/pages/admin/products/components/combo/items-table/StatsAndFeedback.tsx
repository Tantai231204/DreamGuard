import React from 'react';
import { LayoutGrid, ShoppingBag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

/* ─── Statistics Components ─── */

export function StatsGroup({ variants, items, isParent }: { variants: number, items: number, isParent: boolean }) {
    return (
        <div className="flex items-center gap-8">
            <StatItem label="Configuration" value={`${variants} ${isParent ? 'Variants' : 'Items'}`} icon={<LayoutGrid className="h-3 w-3" />} color="indigo" />
            <StatItem label="Total Inventory" value={`${items} Units Total`} icon={<ShoppingBag className="h-3 w-3" />} color="purple" />
        </div>
    );
}

function StatItem({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: 'indigo' | 'purple' }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
            <div className="flex items-center gap-2">
                <div className={`h-5 w-5 rounded-md ${color === 'indigo' ? 'bg-indigo-50 text-indigo-500 border-indigo-100' : 'bg-purple-50 text-purple-500 border-purple-100'} flex items-center justify-center border`}>
                    {icon}
                </div>
                <span className="text-xs font-bold text-gray-700">{value}</span>
            </div>
        </div>
    );
}

export function DiscountBadge({ discount }: { discount: number }) {
    if (discount <= 0) return <p className="text-[10px] text-gray-400 italic">Static pricing model</p>;

    return (
        <div className="bg-gradient-to-br from-orange-400 to-red-500 p-[1px] rounded-xl shadow-lg shadow-orange-500/20">
            <div className="bg-white/95 px-4 py-2 rounded-[11px] flex items-center gap-3">
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-tight">Active Promo</span>
                <Separator orientation="vertical" className="h-4 bg-orange-100" />
                <span className="text-sm font-black text-gray-900">
                    SAVE {discount}% <span className="text-xs font-bold text-gray-400 ml-1 uppercase">Off</span>
                </span>
            </div>
        </div>
    );
}

/* ─── Feedback States ─── */

export function EmptyResults() {
    return (
        <div className="p-12 text-center">
            <p className="text-xs text-gray-400 italic">No variants match your filter criteria.</p>
        </div>
    );
}

export function LoadingSkeleton() {
    return (
        <div className="bg-[#fafafa] border-t border-b border-gray-100 px-8 py-6 space-y-3">
            <div className="flex items-center gap-3 mb-5">
                <Skeleton className="h-8 w-8 rounded-lg bg-gray-200" />
                <Skeleton className="h-5 w-48 bg-gray-200" />
                <Skeleton className="h-5 w-16 bg-gray-100 rounded-full" />
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-4">
                <Skeleton className="h-[200px] w-full rounded-xl bg-gray-100" />
                <Skeleton className="h-[200px] w-full rounded-xl bg-gray-100" />
            </div>
        </div>
    );
}

export function ErrorState() {
    return (
        <div className="bg-[#fafafa] border-t border-b border-gray-100 px-8 py-6 text-center">
            <p className="text-sm text-red-500 font-medium">Failed to load combo items.</p>
        </div>
    );
}

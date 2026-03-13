import React from 'react';
import { LayoutGrid, ShoppingBag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AdminStatusBadge } from '@/components/admin';

/* ─── Statistics Components ─── */

export function StatsGroup({ variants, items, isParent }: { variants: number, items: number, isParent: boolean }) {
    return (
        <div className="flex items-center gap-8">
            <StatItem label="Configuration" value={`${variants} ${isParent ? 'Variants' : 'Items'}`} icon={<LayoutGrid className="h-3 w-3" />} color="primary" />
            <StatItem label="Total Inventory" value={`${items} Units Total`} icon={<ShoppingBag className="h-3 w-3" />} color="slate" />
        </div>
    );
}

function StatItem({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: 'primary' | 'slate' }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <div className="flex items-center gap-2">
                <div className={cn(
                    "h-5 w-5 rounded-md flex items-center justify-center border",
                    color === 'primary' 
                        ? 'bg-primary-50 text-primary-500 border-primary-100' 
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                )}>
                    {icon}
                </div>
                <span className="text-xs font-bold text-slate-700">{value}</span>
            </div>
        </div>
    );
}

export function DiscountBadge({ discount }: { discount: number }) {
    if (discount <= 0) return <p className="text-[10px] text-gray-400 italic">Static pricing model</p>;

    return (
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm transition-all hover:border-orange-200">
            <span className="text-[10px] font-black text-orange-600 uppercase tracking-tight">Active Promo</span>
            <Separator orientation="vertical" className="h-4 bg-orange-100" />
            <div className="flex items-center gap-2">
                <span className="text-sm font-black text-gray-900">SAVE {discount}%</span>
                <AdminStatusBadge status="OFF" type="warning" dot={false} className="h-4 px-1 bg-orange-500 text-white border-none text-[9px]" />
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

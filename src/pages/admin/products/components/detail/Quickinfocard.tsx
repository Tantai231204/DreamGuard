import { formatPrice } from '@/lib/utils';
import {
    FolderTree, Layers, DollarSign, Hash,
    Copy, Check, TrendingUp
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { AdminStatusBadge } from '@/components/admin';

interface QuickInfoCardProps {
    status: string;
    statusVariant?: string; // Kept for interface compatibility
    categoryName?: string;
    variantCount?: number;
    minPrice?: number;
    maxPrice?: number;
    productId: string;
}

function Row({
    icon: Icon,
    label,
    children,
}: {
    icon: React.ElementType;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-3.5">
            <div className="flex items-center gap-2">
                <Icon size={12} className="text-slate-300" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
            </div>
            <div className="font-bold text-slate-900 text-[10px] uppercase tracking-wide">{children}</div>
        </div>
    );
}

export default function QuickInfoCard({
    status,
    categoryName,
    variantCount,
    minPrice,
    maxPrice,
    productId,
}: QuickInfoCardProps) {
    const [copiedId, setCopiedId] = useState(false);

    const handleCopyId = useCallback(() => {
        navigator.clipboard.writeText(productId);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    }, [productId]);

    const priceDisplay = minPrice != null && maxPrice != null && (
        minPrice === maxPrice
            ? formatPrice(minPrice)
            : `${formatPrice(minPrice)} — ${formatPrice(maxPrice)}`
    );

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#4988c4]" />
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">General Profile</h3>
            </div>

            <div className="space-y-0 divide-y divide-slate-100/50">
                <Row icon={TrendingUp} label="Status">
                    <AdminStatusBadge status={status} dot={true} className="scale-90 origin-right" />
                </Row>

                <Row icon={FolderTree} label="Category">
                    <span className="text-slate-900">{categoryName ?? 'Unassigned'}</span>
                </Row>

                <Row icon={Layers} label="Variants">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-black text-[9px]">
                        {variantCount ?? 0} UNITS
                    </span>
                </Row>

                {priceDisplay && (
                    <Row icon={DollarSign} label="Price Range">
                        <span className="text-slate-900 font-bold">{priceDisplay}</span>
                    </Row>
                )}

                <Row icon={Hash} label="Product ID">
                    <button
                        onClick={handleCopyId}
                        className="flex items-center gap-2 font-mono text-[9px] text-slate-400 hover:text-slate-900 transition-colors uppercase"
                    >
                        <span className="truncate max-w-[80px]">{productId.slice(0, 8)}…</span>
                        {copiedId ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} className="text-slate-300" />}
                    </button>
                </Row>
            </div>
        </section>
    );
}

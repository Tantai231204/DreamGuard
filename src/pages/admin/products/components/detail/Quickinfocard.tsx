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
        <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-2">
                <Icon size={14} className="text-slate-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
            </div>
            <div className="font-black text-slate-900 text-[10px] uppercase tracking-wider">{children}</div>
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
        <section className="space-y-10">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_rgba(73,136,196,0.5)]" />
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">General Profile</h3>
            </div>

            <div className="space-y-1 divide-y divide-slate-50">
                <Row icon={TrendingUp} label="Deployment Status">
                    <AdminStatusBadge status={status} dot={true} className="scale-90 origin-right" />
                </Row>

                <Row icon={FolderTree} label="Taxonomy Path">
                    <span className="text-slate-900">{categoryName ?? 'Unassigned'}</span>
                </Row>

                <Row icon={Layers} label="In-Stock SKUs">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 font-bold">
                        {variantCount ?? 0}
                    </span>
                </Row>

                {priceDisplay && (
                    <Row icon={DollarSign} label="Market Valuation">
                        <span className="text-slate-900 font-black">{priceDisplay}</span>
                    </Row>
                )}

                <Row icon={Hash} label="Signature UUID">
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

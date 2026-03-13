import {
    Package, Tag, Baby, Shirt, Star,
    Calendar, ShieldCheck,
    Check, Copy, AlignLeft,
} from 'lucide-react';
import { InfoField } from './Infofield';
import { formatDateTime } from '@/lib/utils';

/* ─── Simplified Components ────────────────────────────── */
function SectionTitle({ title, icon: Icon }: { title: string, icon: React.ElementType }) {
    return (
        <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Icon size={14} className="text-white" />
            </div>
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">{title}</h3>
        </div>
    );
}

/* ─── Main Component ──────────────────────────────────── */
interface ProductInfoCardProps {
    product: {
        name: string;
        slug: string;
        ageGroupLabel: string | null;
        material?: string;
        averageRating?: number;
        createdAt?: string;
        warrantyPolicyDay?: number;
        returnPolicyDay?: number;
        summary?: string;
        description?: string;
    };
    copiedSlug: boolean;
    onCopySlug: () => void;
}

export default function ProductInfoCard({
    product,
    copiedSlug,
    onCopySlug,
}: ProductInfoCardProps) {
    return (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ── Basic Info ── */}
            <section>
                <SectionTitle title="Core Specifications" icon={Package} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                    <InfoField icon={Package} label="Commercial Name" value={<span className="font-black text-slate-900 text-sm tracking-tight">{product.name}</span>} />
                    <InfoField
                        icon={Tag}
                        label="Resource Slug"
                        value={
                            <button
                                onClick={onCopySlug}
                                className="flex items-center gap-2 font-mono text-[10px] text-slate-400 hover:text-slate-900 transition-colors uppercase"
                            >
                                <span className="truncate max-w-[150px]">{product.slug}</span>
                                {copiedSlug ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} className="text-slate-300" />}
                            </button>
                        }
                    />
                    <InfoField icon={Baby} label="Demographic Target" value={<span className="font-black text-slate-700 text-xs uppercase tracking-widest">{product.ageGroupLabel || 'General'}</span>} />
                    <InfoField icon={Shirt} label="Material Composition" value={<span className="font-black text-slate-700 text-xs uppercase tracking-widest">{product.material || 'Premium'}</span>} />
                    <InfoField
                        icon={Star}
                        label="Quality Index"
                        value={
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-slate-900">{product.averageRating?.toFixed(1) ?? '0.0'}</span>
                                <div className="flex items-center text-amber-400">
                                    <Star size={10} className="fill-current" />
                                </div>
                            </div>
                        }
                    />
                    <InfoField
                        icon={Calendar}
                        label="System Entry"
                        value={<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.createdAt ? formatDateTime(product.createdAt) : '--'}</span>}
                    />
                </div>
            </section>

            {/* ── Policies ── */}
            <section>
                <SectionTitle title="Operational Policies" icon={ShieldCheck} />
                <div className="flex items-center gap-12">
                    <div className="p-10 rounded-[2.5rem] bg-blue-50/20 border border-blue-100/30 flex flex-col gap-1 border border-transparent hover:border-blue-100 transition-all duration-500 group">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none group-hover:text-[var(--color-primary)] transition-colors">Warranty Assurance</p>
                        <div className="flex items-baseline gap-1">
                            <p className="text-4xl font-black text-slate-900 tracking-tighter group-hover:scale-110 transition-transform origin-left duration-500">{product.warrantyPolicyDay ?? 0}</p>
                            <span className="text-[10px] font-black text-slate-400 uppercase">Days</span>
                        </div>
                    </div>
                    <div className="p-10 rounded-[2.5rem] bg-blue-50/20 border border-blue-100/30 flex flex-col gap-1 border border-transparent hover:border-blue-100 transition-all duration-500 group">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none group-hover:text-[var(--color-primary)] transition-colors">Return Window</p>
                        <div className="flex items-baseline gap-1">
                            <p className="text-4xl font-black text-slate-900 tracking-tighter group-hover:scale-110 transition-transform origin-left duration-500">{product.returnPolicyDay ?? 0}</p>
                            <span className="text-[10px] font-black text-slate-400 uppercase">Days</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Descriptions ── */}
            {(product.summary || product.description) && (
                <section className="space-y-12">
                    {product.summary && (
                        <div className="p-10 rounded-[2.5rem] bg-gradient-to-r from-blue-50/30 to-white/0 border border-blue-100/20 text-base font-medium text-slate-600 leading-relaxed italic relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-primary)] opacity-20 group-hover:opacity-100 transition-opacity" />
                            "{product.summary}"
                        </div>
                    )}

                    {product.description && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <AlignLeft size={14} className="text-slate-900" />
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em]">Master Description</h4>
                            </div>
                            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                                {product.description}
                            </div>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}

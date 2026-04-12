import {
    Package, Tag, Baby, Shirt, Star,
    Calendar, ShieldCheck,
    Check, Copy, AlignLeft,
} from 'lucide-react';
import { InfoField } from './Infofield';
import { formatDateTime, formatPrice } from '@/lib/utils';

/* ─── Simplified Components ────────────────────────────── */
function SectionTitle({ title, icon: Icon }: { title: string, icon: React.ElementType }) {
    return (
        <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-3">
            <Icon size={12} className="text-[#4988c4]" />
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{title}</h3>
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
        isTradeInEligible?: boolean;
        minTradeInPrice?: number;
        depositAmount?: number;
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ── Basic Info ── */}
            <section>
                <SectionTitle title="Specifications" icon={Package} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <InfoField icon={Package} label="Product Name" value={<span className="font-bold text-slate-900 text-sm">{product.name}</span>} />
                    <InfoField
                        icon={Tag}
                        label="Slug URL"
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
                    <InfoField icon={Baby} label="Age Group" value={<span className="font-bold text-slate-700 text-xs uppercase tracking-tight">{product.ageGroupLabel || 'General'}</span>} />
                    <InfoField icon={Shirt} label="Material" value={<span className="font-bold text-slate-700 text-xs uppercase tracking-tight">{product.material || 'Standard Premium'}</span>} />
                    <InfoField
                        icon={Star}
                        label="Rating"
                        value={
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-black text-slate-900">{product.averageRating?.toFixed(1) ?? '0.0'}</span>
                                <Star size={10} className="fill-amber-400 text-amber-400" />
                            </div>
                        }
                    />
                    <InfoField
                        icon={Calendar}
                        label="Date Created"
                        value={<span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{product.createdAt ? formatDateTime(product.createdAt) : '--'}</span>}
                    />
                </div>
            </section>

            {/* ── Policies ── */}
            <section>
                <SectionTitle title="Service Policies" icon={ShieldCheck} />
                <div className="grid grid-cols-2 gap-4">
                    <div className="px-6 py-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1 transition-all hover:border-blue-100 hover:bg-white group cursor-default">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warranty Protection</p>
                        <div className="flex items-baseline gap-1.5 mt-1">
                            <p className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-[#4988c4] transition-colors">{product.warrantyPolicyDay ?? 0}</p>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Days</span>
                        </div>
                    </div>
                    <div className="px-6 py-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1 transition-all hover:border-blue-100 hover:bg-white group cursor-default">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Return Window</p>
                        <div className="flex items-baseline gap-1.5 mt-1">
                            <p className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-[#4988c4] transition-colors">{product.returnPolicyDay ?? 0}</p>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Days</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Trade-In & Settlement ── */}
            <section>
                <SectionTitle title="Settlement & Trade-In" icon={Tag} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="px-6 py-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1 transition-all hover:border-blue-100 hover:bg-white group cursor-default">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Program Eligibility</p>
                        <div className="flex items-center gap-2 mt-2">
                            {product.isTradeInEligible ? (
                                <>
                                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                        <Check size={10} className="text-white" />
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Qualified Product</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                                        <div className="w-2 h-0.5 bg-slate-400 rounded-full" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Program Disabled</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="px-6 py-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1 transition-all hover:border-blue-100 hover:bg-white group cursor-default">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min Trade Valuation</p>
                        <div className="flex items-baseline gap-1.5 mt-1">
                            <p className="text-xl font-black text-slate-900 tracking-tight group-hover:text-[#4988c4] transition-colors">
                                {product.minTradeInPrice ? formatPrice(product.minTradeInPrice) : '--'}
                            </p>
                        </div>
                    </div>

                    <div className="px-6 py-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1 transition-all hover:border-blue-100 hover:bg-white group cursor-default">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mandatory Deposit</p>
                        <div className="flex items-baseline gap-1.5 mt-1">
                            <p className="text-xl font-black text-slate-900 tracking-tight group-hover:text-[#4988c4] transition-colors">
                                {product.depositAmount ? formatPrice(product.depositAmount) : '--'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Descriptions ── */}
            {(product.summary || product.description) && (
                <section className="space-y-8">
                    {product.summary && (
                        <div className="p-8 rounded-2xl bg-[#4988c4]/5 border border-[#4988c4]/10 text-base font-medium text-slate-600 leading-relaxed italic relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#4988c4]" />
                            "{product.summary}"
                        </div>
                    )}

                    {product.description && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <AlignLeft size={12} className="text-slate-400" />
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Detailed Description</h4>
                            </div>
                            <div className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap font-medium p-6 rounded-2xl bg-slate-50/30 border border-slate-100/50">
                                {product.description}
                            </div>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}

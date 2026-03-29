import { memo, useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import { ShieldCheck, ArrowRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCertificateStyle } from '@/shared/data/certificates';

interface CertificateData {
    id: string;
    name: string;
    summary?: string;
    description?: string;
    fullName?: string;
    icon?: LucideIcon;
    bgColor?: string;
    iconColor?: string;
    borderColor?: string;
    coverageBars?: { label: string; value: number }[];
    scope?: string;
    since?: string;
    featured?: boolean;
}

interface SafetyCertificationsProps {
    certifications: CertificateData[];
}

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
    }),
};

const DEFAULT_BARS = [
    { label: 'Pesticides', value: 96 },
    { label: 'Heavy metals', value: 100 },
    { label: 'Allergens', value: 89 },
    { label: 'Dyes & pigments', value: 100 },
];

export const SafetyCertifications = memo(({ certifications }: SafetyCertificationsProps) => {
    const enriched = useMemo(() =>
        certifications.map(cert => {
            const registry = getCertificateStyle(cert.name);
            return {
                ...cert,
                description: cert.description || registry.defaultDescription,
                scope: cert.scope || registry.scope,
                coverageBars: cert.coverageBars || registry.coverageBars,
                style: {
                    ...registry,
                    bgColor: cert.bgColor || registry.bgColor,
                    iconColor: cert.iconColor || registry.iconColor,
                    icon: cert.icon || registry.icon || ShieldCheck,
                },
            };
        }),
        [certifications]);

    if (!enriched.length) return null;

    const featured = enriched.find(c => c.featured) ?? enriched[0];
    const secondary = enriched.filter(c => c.id !== featured.id).slice(0, 3);
    const FeatIcon = featured.style.icon;
    const bars = featured.coverageBars || DEFAULT_BARS;

    return (
        <section className="mt-24 space-y-4">
            {/* ── Header ── */}
            <div className="text-center max-w-xl mx-auto mb-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-800 text-[11px] font-medium tracking-wide uppercase mb-4">
                        <ShieldCheck className="w-3 h-3" />
                        Trust &amp; Safety
                    </span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl font-semibold text-slate-900 tracking-tight mb-3"
                >
                    Certified protection
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.08 }}
                    className="text-sm text-slate-500 leading-relaxed"
                >
                    Independently verified by the world's leading safety authorities —
                    at every stage of production.
                </motion.p>
            </div>

            {/* ── Featured + Secondary layout ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
                {/* Featured card — dark */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0F172A] p-8 flex flex-col gap-6">
                    {/* Most trusted badge */}
                    <div className="flex justify-between items-start">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            Primary certification
                        </p>
                        <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Most trusted
                        </span>
                    </div>

                    {/* Logo/Icon Slot - Constrained */}
                    <div className="relative group/logo">
                        <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover/logo:scale-105">
                            {featured.style.image ? (
                                <img src={featured.style.image} alt={featured.name} className="w-full h-full object-contain p-4" />
                            ) : (
                                <FeatIcon className="w-10 h-10 text-emerald-400" />
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight leading-tight mb-1">
                                {featured.name}
                            </h3>
                            {featured.fullName && (
                                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{featured.fullName}</p>
                            )}
                        </div>

                        {featured.description && (
                            <p className="text-[14px] text-slate-400 leading-relaxed font-medium line-clamp-2">
                                {featured.description}
                            </p>
                        )}
                    </div>

                    {/* Coverage bars */}
                    <div className="pt-4 border-t border-white/5 mt-auto">
                        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 mb-4">Precision Analysis</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                            {bars.map(bar => (
                                <div key={bar.label} className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[11px]">
                                        <span className="text-slate-400 font-bold uppercase tracking-tight">{bar.label}</span>
                                        <span className="text-emerald-400 font-black">{bar.value}%</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${bar.value}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, ease: "circOut" }}
                                            className="h-full bg-emerald-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right column: secondary cards + counters */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3">
                        {secondary.map((cert, i) => {
                            const Icon = cert.style.icon;
                            return (
                                <motion.div
                                    key={cert.id}
                                    variants={fadeInUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    custom={i}
                                    className="group relative flex items-center gap-5 p-5 rounded-[2rem] bg-white border border-slate-100 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:border-transparent"
                                >
                                    {/* Icon - Constrained */}
                                    <div className={cn(
                                        'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden transition-transform duration-500 group-hover:scale-110',
                                        cert.style.bgColor,
                                    )}>
                                        {cert.style.image ? (
                                            <img src={cert.style.image} alt={cert.name} className="w-full h-full object-contain p-2.5" />
                                        ) : (
                                            <Icon className={cn('w-7 h-7', cert.style.iconColor)} />
                                        )}
                                    </div>

                                    {/* Body */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-[15px] font-black text-slate-900 tracking-tight">{cert.name}</h4>
                                            {cert.summary && (
                                                <span className={cn(
                                                    'text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md',
                                                    cert.style.bgColor,
                                                    cert.style.iconColor,
                                                )}>
                                                    {cert.summary}
                                                </span>
                                            )}
                                        </div>
                                        {cert.description && (
                                            <p className="text-[12px] text-slate-500 leading-relaxed font-medium line-clamp-1">
                                                {cert.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Verification Check */}
                                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Counter row */}
                    <div className="grid grid-cols-3 gap-3 mt-auto">
                        {[
                            { num: '100+', label: 'Substances tested' },
                            { num: String(enriched.length), label: 'Certifications' },
                            { num: '0', label: 'Harmful chemicals' },
                        ].map(({ num, label }) => (
                            <div key={label} className="rounded-[1.5rem] bg-slate-50 p-5 text-center transition-colors hover:bg-slate-100">
                                <p className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">
                                    {num}
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* ── Banner ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-6 rounded-[2.5rem] bg-[#0F172A] p-8 mt-4"
            >
                <div className="w-14 h-14 flex-shrink-0 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.35)]">
                    <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-black text-white tracking-tight mb-1">
                        Uncompromising Safety Standard
                    </h3>
                    <p className="text-[13px] text-slate-400 leading-relaxed font-medium">
                        Rigorously tested by global authorities to ensure every fiber is free from formaldehyde, 
                        toxic allergens and harmful dyes.
                    </p>
                </div>
                <button className="flex-shrink-0 inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-white text-slate-900 text-[14px] font-black hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 group">
                    Learn more
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
            </motion.div>
        </section>
    );
});

SafetyCertifications.displayName = 'SafetyCertifications';
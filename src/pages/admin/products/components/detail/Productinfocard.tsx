import { motion } from 'framer-motion';
import {
    Package, Tag, Baby, Shirt, Star,
    Calendar, ShieldCheck, RotateCcw,
    Check, Copy, FileText, AlignLeft,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoField } from './Infofield';
import { SectionHeading } from './Sectionheading';
import { cn } from '@/lib/utils';

/* ─── Animation variants ──────────────────────────────── */
const stagger = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1] as const,
        },
    },
};

/* ─── Policy Stat ─────────────────────────────────────── */
function PolicyStat({
    icon: Icon,
    iconBg,
    iconColor,
    label,
    value,
}: {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    label: string;
    value?: number;
}) {
    return (
        <div className="flex items-center gap-3.5 py-3 px-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:border-gray-200 transition-colors">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border', iconBg)}>
                <Icon size={18} className={iconColor} />
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 leading-none mb-1.5">
                    {label}
                </p>
                <p className="text-lg font-bold text-gray-900 leading-none tabular-nums">
                    {value != null ? (
                        <>
                            {value}
                            <span className="text-xs font-medium text-gray-400 ml-1">days</span>
                        </>
                    ) : (
                        <span className="text-xs font-normal italic text-gray-300">Not set</span>
                    )}
                </p>
            </div>
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
    formatDate: (iso: string) => string;
}

function ProductInfoCard({
    product,
    copiedSlug,
    onCopySlug,
    formatDate,
}: ProductInfoCardProps) {
    return (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
            {/* ── Product Information ── */}
            <motion.div variants={fadeUp}>
                <Card className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="h-[2px] bg-gradient-to-r from-[var(--color-primary)] via-blue-500 to-blue-600" />
                    <div className="p-6">
                        <SectionHeading label="Product Information" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                            <InfoField icon={Package} label="Product Name" value={product.name} />
                            <InfoField
                                icon={Tag}
                                label="Slug"
                                mono
                                value={
                                    <TooltipProvider delayDuration={300}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={onCopySlug}
                                                    className="inline-flex items-center gap-2 font-mono text-xs text-gray-500 hover:text-[var(--color-primary)] transition-colors group/slug"
                                                >
                                                    <span className="truncate max-w-[200px]">{product.slug}</span>
                                                    {copiedSlug
                                                        ? <Check size={12} className="text-emerald-500 shrink-0" />
                                                        : <Copy size={12} className="opacity-0 group-hover/slug:opacity-100 transition-opacity shrink-0" />
                                                    }
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                {copiedSlug ? 'Copied!' : 'Click to copy'}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                }
                            />
                            <InfoField icon={Baby} label="Age Group" value={product.ageGroupLabel} />
                            <InfoField icon={Shirt} label="Material" value={product.material || null} />
                            <InfoField
                                icon={Star}
                                label="Average Rating"
                                value={
                                    <span className="inline-flex items-center gap-2.5">
                                        <span className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star
                                                    key={s}
                                                    size={13}
                                                    className={cn(
                                                        'transition-colors',
                                                        s <= Math.round(product.averageRating ?? 0)
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'fill-gray-100 text-gray-200',
                                                    )}
                                                />
                                            ))}
                                        </span>
                                        <span className="text-sm font-bold text-gray-700 tabular-nums">
                                            {product.averageRating?.toFixed(1) ?? '0.0'}
                                        </span>
                                    </span>
                                }
                            />
                            <InfoField
                                icon={Calendar}
                                label="Created At"
                                value={product.createdAt ? formatDate(product.createdAt) : null}
                            />
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* ── Policies ── */}
            <motion.div variants={fadeUp}>
                <Card className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="h-[2px] bg-gradient-to-r from-emerald-400 via-teal-500 to-[var(--color-primary)]" />
                    <div className="p-6">
                        <SectionHeading label="Policies" accent="from-emerald-500 to-teal-500" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PolicyStat
                                icon={ShieldCheck}
                                iconBg="bg-emerald-50 border-emerald-100"
                                iconColor="text-emerald-600"
                                label="Warranty"
                                value={product.warrantyPolicyDay}
                            />
                            <PolicyStat
                                icon={RotateCcw}
                                iconBg="bg-primary-50 border-primary-100"
                                iconColor="text-[var(--color-primary)]"
                                label="Return Policy"
                                value={product.returnPolicyDay}
                            />
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* ── Description ── */}
            {(product.summary || product.description) && (
                <motion.div variants={fadeUp}>
                    <Card className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="h-[2px] bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />
                        <div className="p-6">
                            <SectionHeading label="Description" accent="from-amber-500 to-orange-500" />

                            {product.summary && (
                                <div className="mb-5 rounded-xl bg-gradient-to-br from-amber-50/80 to-orange-50/50 border border-amber-100/80 px-5 py-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText size={13} className="text-amber-500" />
                                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-500/80">
                                            Summary
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">{product.summary}</p>
                                </div>
                            )}

                            {product.summary && product.description && <Separator className="my-5 bg-gray-100" />}

                            {product.description && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlignLeft size={13} className="text-gray-400" />
                                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                                            Full Description
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                        {product.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </motion.div>
            )}
        </motion.div>
    );
}

export default ProductInfoCard;

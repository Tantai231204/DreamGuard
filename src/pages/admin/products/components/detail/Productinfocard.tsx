import { motion } from 'framer-motion';
import {
    Package, Tag, Baby, Shirt, Star,
    Calendar, ShieldCheck, RotateCcw,
    Check, Copy,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoField } from './Infofield';
import { SectionHeading } from './Sectionheading';


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
        <div className="flex items-center gap-3.5 py-2">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${iconBg}`}>
                <Icon size={18} className={iconColor} />
            </div>
            <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-widest text-gray-400 leading-none mb-1">
                    {label}
                </p>
                <p className="text-base font-bold text-gray-900 leading-none">
                    {value != null ? (
                        <>
                            {value}{' '}
                            <span className="text-xs font-normal text-gray-400">days</span>
                        </>
                    ) : (
                        <span className="text-xs font-normal italic text-gray-300">Not set</span>
                    )}
                </p>
            </div>
        </div>
    );
}

// Removed named export, use default export below
function ProductInfoCard({
    product,
    copiedSlug,
    onCopySlug,
    formatDate,
}: ProductInfoCardProps) {
    return (
        <div className="space-y-5">
            {/* Basic Info */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <Card className="p-5 border border-gray-100 rounded-2xl shadow-sm">
                    <SectionHeading label="Product Information" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 divide-y divide-gray-50 md:divide-y-0">
                        <InfoField icon={Package} label="Product Name" value={product.name} />
                        <InfoField
                            icon={Tag}
                            label="Slug"
                            mono
                            value={
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={onCopySlug}
                                                className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-600 hover:text-[var(--color-primary)] transition-colors"
                                            >
                                                {product.slug}
                                                {copiedSlug
                                                    ? <Check size={11} className="text-emerald-500" />
                                                    : <Copy size={11} className="opacity-30" />}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
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
                                <span className="inline-flex items-center gap-2">
                                    <span className="flex">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                                key={s}
                                                size={12}
                                                className={
                                                    s <= Math.round(product.averageRating ?? 0)
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'fill-gray-150 text-gray-200'
                                                }
                                            />
                                        ))}
                                    </span>
                                    <span className="text-gray-500 text-xs">
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
                </Card>
            </motion.div>

            {/* Policies */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="p-5 border border-gray-100 rounded-2xl shadow-sm">
                    <SectionHeading label="Policies" accent="from-emerald-400 to-teal-500" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 divide-y divide-gray-50 md:divide-y-0">
                        <PolicyStat
                            icon={ShieldCheck}
                            iconBg="bg-emerald-50 border-emerald-100"
                            iconColor="text-emerald-600"
                            label="Warranty"
                            value={product.warrantyPolicyDay}
                        />
                        <PolicyStat
                            icon={RotateCcw}
                            iconBg="bg-blue-50 border-blue-100"
                            iconColor="text-blue-500"
                            label="Return Policy"
                            value={product.returnPolicyDay}
                        />
                    </div>
                </Card>
            </motion.div>

            {/* Description */}
            {(product.summary || product.description) && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <Card className="p-5 border border-gray-100 rounded-2xl shadow-sm">
                        <SectionHeading label="Description" accent="from-amber-400 to-orange-400" />

                        {product.summary && (
                            <div className="mb-4 rounded-xl bg-amber-50/60 border border-amber-100/80 px-4 py-3.5">
                                <p className="text-[10.5px] font-semibold uppercase tracking-widest text-amber-500/80 mb-1.5">
                                    Summary
                                </p>
                                <p className="text-sm text-gray-700 leading-relaxed">{product.summary}</p>
                            </div>
                        )}

                        {product.summary && product.description && <Separator className="my-4 bg-gray-50" />}

                        {product.description && (
                            <div>
                                <p className="text-[10.5px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                                    Full Description
                                </p>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {product.description}
                                </p>
                            </div>
                        )}
                    </Card>
                </motion.div>
            )}
        </div>
    );
}

export default ProductInfoCard;
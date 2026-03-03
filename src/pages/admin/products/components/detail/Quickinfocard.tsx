import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SectionHeading } from './Sectionheading';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    CircleDot, FolderTree, Layers, DollarSign, Hash,
    Copy, Check, TrendingUp,
} from 'lucide-react';
import { useState, useCallback } from 'react';

type StatusVariant = 'success' | 'warning' | 'outline' | 'danger';

interface QuickInfoCardProps {
    status: string;
    statusVariant: StatusVariant;
    categoryName?: string;
    variantCount?: number;
    minPrice?: number;
    maxPrice?: number;
    productId: string;
}

/* ─── Row ─────────────────────────────────────────────── */
function Row({
    icon: Icon,
    iconColor,
    label,
    children,
}: {
    icon: React.ElementType;
    iconColor?: string;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-3 py-2.5 group">
            <div className="flex items-center gap-2.5 text-sm text-gray-400">
                <Icon size={14} className={cn('shrink-0', iconColor ?? 'text-gray-400')} />
                <span className="font-medium">{label}</span>
            </div>
            <div className="font-semibold text-gray-800 text-sm">{children}</div>
        </div>
    );
}

/* ─── Main ────────────────────────────────────────────── */
function QuickInfoCard({
    status,
    statusVariant,
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

    const priceRange = minPrice != null && maxPrice != null && (
        minPrice === maxPrice
            ? `${minPrice.toLocaleString('vi-VN')}₫`
            : `${minPrice.toLocaleString('vi-VN')}₫ — ${maxPrice.toLocaleString('vi-VN')}₫`
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
            <Card className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                {/* Gradient accent */}
                <div className="h-[2px] bg-gradient-to-r from-[var(--color-primary)] via-blue-500 to-blue-600" />

                <div className="p-5">
                    <SectionHeading label="Quick Info" accent="from-[var(--color-primary)] to-blue-600" />

                    <div className="space-y-1">
                        <Row icon={CircleDot} iconColor="text-gray-500" label="Status">
                            <Badge
                                variant={statusVariant}
                                className="font-semibold text-[11px] px-2.5 py-0.5"
                            >
                                {status}
                            </Badge>
                        </Row>

                        <Separator className="bg-gray-50" />

                        <Row icon={FolderTree} iconColor="text-[var(--color-primary)]" label="Category">
                            <span className="text-sm">{categoryName ?? <span className="text-gray-300">—</span>}</span>
                        </Row>

                        <Separator className="bg-gray-50" />

                        <Row icon={Layers} iconColor="text-[var(--color-primary)]" label="Variants">
                            <span className={cn(
                                'inline-flex items-center gap-1.5 font-bold tabular-nums',
                                (variantCount ?? 0) > 0 ? 'text-[var(--color-primary)]' : 'text-gray-400',
                            )}>
                                {variantCount ?? 0}
                            </span>
                        </Row>

                        {priceRange && (
                            <>
                                <Separator className="bg-gray-50" />
                                <Row icon={DollarSign} iconColor="text-emerald-400" label="Price">
                                    <span className="flex items-center gap-1.5 text-[13px] font-bold text-gray-800">
                                        <TrendingUp size={12} className="text-emerald-500" />
                                        {priceRange}
                                    </span>
                                </Row>
                            </>
                        )}

                        <Separator className="bg-gray-50" />

                        <Row icon={Hash} iconColor="text-gray-400" label="Product ID">
                            <TooltipProvider delayDuration={300}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={handleCopyId}
                                            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-gray-400 hover:text-[var(--color-primary)] transition-colors group/id"
                                        >
                                            <span className="truncate max-w-[120px]">{productId.slice(0, 8)}…</span>
                                            {copiedId
                                                ? <Check size={11} className="text-emerald-500 shrink-0" />
                                                : <Copy size={11} className="opacity-0 group-hover/id:opacity-100 transition-opacity shrink-0" />
                                            }
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">
                                        <p className="font-mono text-xs">{copiedId ? 'Copied!' : productId}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </Row>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

export default QuickInfoCard;

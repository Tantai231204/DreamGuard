import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    GitBranch,
    ChevronDown,
    ChevronRight,
    Package,
    Plus,
    Edit,
    Trash2,
    Copy,
    MoreVertical,
    Check,
} from 'lucide-react';
import { useComboDetail } from '@/hooks/queries/useCombo';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatNumber } from '@/lib/utils';
import type { Combo } from '../../types';

/* ─── Status config (reuse same style as variant table) ── */
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-amber-50 text-amber-700 border-amber-300' },
    published: { label: 'Published', className: '!bg-green-50 !text-green-700 !border-green-300' },
    hidden: { label: 'Hidden', className: 'bg-gray-50 text-gray-600 border-gray-300' },
};

/* ─── Inline items for a single variant ─────────────────── */
const VariantItemsPanel = memo(({ variantId }: { variantId: string }) => {
    const { data, isLoading } = useComboDetail(variantId);
    const items = data?.items ?? [];

    if (isLoading) {
        return (
            <div className="px-6 py-3 space-y-2">
                <Skeleton className="h-8 w-full rounded-lg bg-gray-100" />
                <Skeleton className="h-8 w-full rounded-lg bg-gray-100" />
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="px-6 py-3 text-xs text-gray-400 italic">
                No product items configured for this combo variant.
            </div>
        );
    }

    return (
        <div className="px-6 py-3 space-y-1.5">
            {items.map((item, idx) => (
                <div
                    key={item.variantId ?? item.productId ?? idx}
                    className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-2.5 hover:border-[var(--color-primary)]/60 hover:bg-primary-50/30 transition-colors shadow-sm"
                >
                    <div className="h-7 w-7 rounded-md bg-primary-50 flex items-center justify-center flex-shrink-0 border border-primary-100">
                        <Package className="h-4 w-4 text-primary-500" />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <span className="text-[13px] font-bold text-gray-700 truncate leading-tight">
                            {item.productName}
                        </span>
                        {item.variantLabel && (
                            <span className="text-[11px] font-medium text-gray-400 mt-0.5 truncate">
                                Variant: <strong className="text-gray-500 font-bold">{item.variantLabel}</strong>
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 flex-shrink-0 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                            QTY
                        </span>
                        <span className="text-[13px] font-black text-primary-600">
                            {item.quantity}
                        </span>
                    </div>
                </div>
            ))}
            <div className="pt-2 flex items-center justify-between text-[11px] text-gray-500 px-1">
                <span className="font-semibold">
                    Total Distinct Items: <span className="text-gray-800">{items.length}</span>
                </span>
                <span className="font-semibold">
                    Total Units: <span className="text-primary-600 font-bold">{items.reduce((s, i) => s + (i.quantity ?? 1), 0)}</span>
                </span>
            </div>
        </div>
    );
});

/* ─── Single variant row ─────────────────────────────────── */
const ComboVariantRowInternal = memo(({
    variant,
    isEven,
    onEdit,
    onDelete,
    onDuplicate,
    onUpdateStatus,
}: {
    variant: Combo;
    isEven: boolean;
    onEdit?: (v: Combo) => void;
    onDelete?: (v: Combo) => void;
    onDuplicate?: (v: Combo) => void;
    onUpdateStatus?: (id: string, status: string, name?: string, currentStatus?: string, totalStock?: number) => void;
}) => {
    const [expanded, setExpanded] = useState(false);
    const statusKey = (variant.status || 'Draft').toLowerCase().replace(' ', '');
    const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.draft;

    return (
        <div className={cn(
            'flex flex-col border-l-2',
            expanded ? 'border-primary-500 bg-primary-50/10' : 'border-transparent'
        )}>
            <div className={cn(
                'grid grid-cols-[40px_1fr_140px_120px_60px] gap-4 items-center px-6 py-4 transition-colors',
                isEven ? 'bg-white' : 'bg-gray-50/40',
                'hover:bg-primary-50/40'
            )}>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-gray-200 text-gray-400 transition-colors"
                >
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                <div className="min-w-0">
                    <div className="text-[13px] font-bold text-gray-800 truncate">{variant.name}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant="outline" className="text-[9px] h-4 bg-white font-bold opacity-70">
                            {variant.color} / {variant.size}
                        </Badge>
                        <span className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{variant.sku}</span>
                    </div>
                </div>

                <div className="text-right flex flex-col items-end">
                    <div className="text-[14px] font-black text-gray-900 leading-none">
                        {formatNumber(variant.salePrice)}₫
                    </div>
                    {variant.basePrice > variant.salePrice && (
                        <div className="text-[10px] text-gray-400 line-through mt-1">
                            {formatNumber(variant.basePrice)}₫
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={cn(
                                "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all hover:ring-2",
                                status.className
                            )}>
                                {status.label}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-32 rounded-xl">
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                                const isActive = variant.status === config.label;

                                return (
                                    <DropdownMenuItem
                                        key={key}
                                        disabled={isActive}
                                        onClick={() => onUpdateStatus?.(variant.id, config.label, variant.name, variant.status, variant.totalStock)}
                                        className={cn(
                                            "text-[11px] font-bold",
                                            isActive && "bg-primary-50 text-primary-700"
                                        )}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            {config.label}
                                            {isActive && <Check className="h-3 w-3" />}
                                        </div>
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex justify-end pr-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-gray-100">
                                <MoreVertical className="h-4 w-4 text-gray-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 p-1.5 rounded-xl shadow-xl border-gray-100">
                            <DropdownMenuItem onClick={() => onEdit?.(variant)} className="rounded-lg h-9 gap-2.5 text-[12px] font-semibold">
                                <Edit className="h-3.5 w-3.5 text-blue-500" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDuplicate?.(variant)} className="rounded-lg h-9 gap-2.5 text-[12px] font-semibold">
                                <Copy className="h-3.5 w-3.5 text-amber-500" /> Duplicate Variant
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1.5 opacity-50" />
                            <DropdownMenuItem onClick={() => onDelete?.(variant)} className="rounded-lg h-9 gap-2.5 text-[12px] font-semibold text-rose-600 focus:bg-rose-50 focus:text-rose-700">
                                <Trash2 className="h-3.5 w-3.5" /> Delete Variant
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Expanded items */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        key="items"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-primary-50/20 border-t border-primary-100"
                    >
                        <VariantItemsPanel variantId={variant.id} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

/* ─── Main panel rendered below the parent combo row ────── */
interface ComboVariantsPanelProps {
    parentCombo: Combo;
    variants: Combo[];
    onAddVariant?: (parent: Combo) => void;
    onEditVariant?: (variant: Combo) => void;
    onDeleteVariant?: (variant: Combo) => void;
    onDuplicateVariant?: (variant: Combo) => void;
    onUpdateStatus?: (id: string, status: string, name?: string, currentStatus?: string, totalStock?: number) => void;
}

const ComboVariantsPanel = memo(({
    parentCombo,
    variants,
    onAddVariant,
    onEditVariant,
    onDeleteVariant,
    onDuplicateVariant,
    onUpdateStatus,
}: ComboVariantsPanelProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
        >
            <div className="bg-white border-t border-b border-gray-200 px-4 sm:px-6 py-4">
                {/* Header — same style as VariantTable header */}
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <GitBranch className="h-4 w-4 text-primary-600" />
                        <span className="text-sm font-semibold text-gray-700">
                            Variants of{' '}
                            <span className="text-primary-600">{parentCombo.name}</span>
                        </span>
                        <Badge variant="outline" className="text-xs bg-white border-gray-300 text-gray-600 rounded-full px-3">
                            {variants.length} variant{variants.length !== 1 ? 's' : ''}
                        </Badge>
                    </div>
                    {onAddVariant && (
                        <Button
                            size="sm"
                            onClick={() => onAddVariant(parentCombo)}
                            className="h-8 px-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg shadow-sm"
                        >
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            Add Variant
                        </Button>
                    )}
                </div>

                {/* Variants container */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {variants.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-500">
                            No variants yet. Click "Add Variant" to create one.
                        </div>
                    ) : (
                        <>
                            {/* Column header */}
                            <div className="bg-gray-50 border-b border-gray-200">
                                <div className="grid grid-cols-[40px_1fr_140px_120px_60px] gap-4 items-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <div />
                                    <div>Variant</div>
                                    <div className="text-right">Price</div>
                                    <div className="text-center">Status</div>
                                    <div />
                                </div>
                            </div>

                            {/* Variant rows */}
                            <div className="divide-y divide-gray-100">
                                {variants.map((v, idx) => (
                                    <ComboVariantRowInternal
                                        key={v.id}
                                        variant={v}
                                        isEven={idx % 2 === 0}
                                        onEdit={onEditVariant}
                                        onDelete={onDeleteVariant}
                                        onDuplicate={onDuplicateVariant}
                                        onUpdateStatus={onUpdateStatus}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer stats */}
                {variants.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                        <span>
                            Total variants:{' '}
                            <span className="font-bold text-gray-700">{variants.length}</span>
                        </span>
                        <span className="text-gray-200">|</span>
                        <span>
                            Published:{' '}
                            <span className="font-bold text-green-600">
                                {variants.filter(v => v.status === 'Published').length}
                            </span>
                        </span>
                        <span className="text-gray-200">|</span>
                        <span>
                            Draft:{' '}
                            <span className="font-bold text-amber-600">
                                {variants.filter(v => v.status === 'Draft').length}
                            </span>
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
});

export default ComboVariantsPanel;

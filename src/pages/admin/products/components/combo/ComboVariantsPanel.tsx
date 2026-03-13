import { useState } from 'react';
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
    ShoppingBag,
} from 'lucide-react';
import { useComboDetail } from '@/hooks/queries/useCombo';
import { Skeleton } from '@/components/ui/skeleton';
import type { Combo } from '../../types';

/* ─── Status config (reuse same style as variant table) ── */
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    Draft: { label: 'Draft', className: 'bg-amber-50 text-amber-700 border-amber-300' },
    Published: { label: 'Published', className: 'bg-green-50 text-green-700 border-green-300' },
    OutOfStock: { label: 'Out of Stock', className: 'bg-red-50 text-red-700 border-red-300' },
    Hidden: { label: 'Hidden', className: 'bg-gray-50 text-gray-600 border-gray-300' },
};

/* ─── Inline items for a single variant ─────────────────── */
function VariantItemsPanel({ variantId }: { variantId: string }) {
    const { data, isLoading } = useComboDetail(variantId);
    const items = data?.productItems ?? [];

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
                No product items configured for this variant.
            </div>
        );
    }

    return (
        <div className="px-6 py-3 space-y-1.5">
            {items.map((item, idx) => (
                <div
                    key={item.productVariantId ?? idx}
                    className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-3 py-2 hover:border-[var(--color-primary)]/60 hover:bg-primary-50/30 transition-colors"
                >
                    <div className="h-6 w-6 rounded-md bg-primary-50 flex items-center justify-center flex-shrink-0">
                        <Package className="h-3.5 w-3.5 text-primary-500" />
                    </div>
                    <span className="flex-1 text-[13px] font-semibold text-gray-700 truncate">
                        {item.productName}
                    </span>
                    {item.sku && (
                        <span className="font-mono text-[10px] text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                            {item.sku}
                        </span>
                    )}
                    <span className="text-[12px] text-gray-500 flex-shrink-0">
                        ×{item.quantity}
                    </span>
                    <div className="text-right flex-shrink-0 min-w-[80px]">
                        <div className="text-[12px] font-bold text-primary-700">
                            {item.salePrice.toLocaleString('en-US')}₫
                        </div>
                        {item.salePrice < item.basePrice && (
                            <div className="text-[10px] text-gray-400 line-through">
                                {item.basePrice.toLocaleString('en-US')}₫
                            </div>
                        )}
                    </div>
                </div>
            ))}
            <div className="pt-1 flex items-center gap-3 text-[11px] text-gray-400">
                <span>{items.length} product{items.length !== 1 ? 's' : ''}</span>
                <span>·</span>
                <span>
                    Total qty:{' '}
                    <span className="font-bold text-gray-600">
                        {items.reduce((s, i) => s + i.quantity, 0)}
                    </span>
                </span>
            </div>
        </div>
    );
}

/* ─── Single variant row ─────────────────────────────────── */
function ComboVariantRow({
    variant,
    isEven,
    onEdit,
    onDelete,
    onDuplicate,
}: {
    variant: Combo;
    isEven: boolean;
    onEdit?: (v: Combo) => void;
    onDelete?: (v: Combo) => void;
    onDuplicate?: (v: Combo) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const statusConfig = STATUS_CONFIG[variant.status] ?? STATUS_CONFIG['Draft'];
    const hasSale = variant.baseSalePrice != null && variant.baseSalePrice < variant.basePrice;
    const itemCount = variant.productItems?.length ?? 0;

    return (
        <div>
            {/* Row */}
            <div
                className={[
                    'grid grid-cols-[40px_1fr_140px_120px_100px_60px] gap-4 items-center',
                    'px-6 py-3 transition-colors group cursor-pointer',
                    isEven ? 'bg-white hover:bg-primary-50/30' : 'bg-gray-50/40 hover:bg-primary-50/30',
                    expanded ? 'bg-primary-50/40 border-b-0' : '',
                ].join(' ')}
                onClick={() => setExpanded((v) => !v)}
            >
                {/* Expand toggle */}
                <div className="flex items-center justify-center">
                    {expanded
                        ? <ChevronDown className="h-4 w-4 text-primary-500" />
                        : <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                    }
                </div>

                {/* Name + attributes */}
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold text-gray-800 truncate">
                            {variant.name}
                        </span>
                        {variant.color && (
                            <Badge variant="outline" className="text-[10px] bg-primary-50 text-primary-600 border-primary-200">
                                🎨 {variant.color}
                            </Badge>
                        )}
                        {variant.size && (
                            <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-500 border-slate-200">
                                📐 {variant.size}
                            </Badge>
                        )}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5 font-mono">
                        {variant.sku || '—'}
                        {itemCount > 0 && <span className="ml-2 not-italic">· {itemCount} items</span>}
                    </div>
                </div>

                {/* Price */}
                <div className="text-right">
                    <div className="text-sm font-bold text-blue-600">
                        {(hasSale ? variant.baseSalePrice! : variant.basePrice).toLocaleString('en-US')}₫
                    </div>
                    {hasSale && (
                        <div className="text-[10px] text-gray-400 line-through">
                            {variant.basePrice.toLocaleString('en-US')}₫
                        </div>
                    )}
                </div>

                {/* Status */}
                <div className="text-center">
                    <Badge variant="outline" className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusConfig.className}`}>
                        {statusConfig.label}
                    </Badge>
                </div>

                {/* Item count badge */}
                <div className="text-center">
                    <span className="inline-flex items-center gap-1 text-[12px] font-bold text-primary-700">
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {itemCount}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 rounded-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 shadow-xl border rounded-xl">
                            <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit?.(variant)}>
                                <Edit className="h-4 w-4 mr-2 text-gray-600" />
                                Edit Variant
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => onDuplicate?.(variant)}>
                                <Copy className="h-4 w-4 mr-2 text-gray-600" />
                                Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="cursor-pointer text-red-600 font-semibold focus:bg-red-50 focus:text-red-700"
                                onClick={() => onDelete?.(variant)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
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
}

/* ─── Main panel rendered below the parent combo row ────── */
interface ComboVariantsPanelProps {
    parentCombo: Combo;
    variants: Combo[];
    onAddVariant?: (parent: Combo) => void;
    onEditVariant?: (variant: Combo) => void;
    onDeleteVariant?: (variant: Combo) => void;
    onDuplicateVariant?: (variant: Combo) => void;
}

export default function ComboVariantsPanel({
    parentCombo,
    variants,
    onAddVariant,
    onEditVariant,
    onDeleteVariant,
    onDuplicateVariant,
}: ComboVariantsPanelProps) {
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
                                <div className="grid grid-cols-[40px_1fr_140px_120px_100px_60px] gap-4 items-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <div />
                                    <div>Variant</div>
                                    <div className="text-right">Price</div>
                                    <div className="text-center">Status</div>
                                    <div className="text-center">Items</div>
                                    <div />
                                </div>
                            </div>

                            {/* Variant rows */}
                            <div className="divide-y divide-gray-100">
                                {variants.map((v, idx) => (
                                    <ComboVariantRow
                                        key={v.id}
                                        variant={v}
                                        isEven={idx % 2 === 0}
                                        onEdit={onEditVariant}
                                        onDelete={onDeleteVariant}
                                        onDuplicate={onDuplicateVariant}
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
}

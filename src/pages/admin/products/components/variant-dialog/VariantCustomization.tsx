import { memo, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid,
    Paintbrush,
    Ruler,
    Settings2,
    Edit3,
    Check,
    X,
    Sparkles,
} from 'lucide-react';
import { cn, formatNumber, unformatNumber } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCustomizeTypes } from '@/hooks/queries/useCustomizeType';

/* ─── Shared Types & Icons ─── */
interface CapabilityInfo {
    id: string;
    name: string;
    summary: string | null;
    category: string;
    applicableType: string;
    type: string;
    isAssigned: boolean;
    price: number | null;
    multiplier: number | null;
}

const ICON_MAP: Record<string, import('lucide-react').LucideIcon> = {
    color: Paintbrush,
    size: Ruler,
    material: LayoutGrid,
    pattern: Sparkles,
    embroidery: Edit3,
    other: Settings2,
};

const getIconKey = (name: string, category?: string): string => {
    const n = name.toLowerCase();
    const c = category?.toLowerCase() || '';
    if (n.includes('color') || n.includes('màu')) return 'color';
    if (n.includes('size') || n.includes('kích thước')) return 'size';
    if (c.includes('material') || c.includes('chất liệu')) return 'material';
    if (c.includes('pattern') || c.includes('họa tiết')) return 'pattern';
    if (c.includes('embroidery') || c.includes('thêu')) return 'embroidery';
    return 'other';
};

/* ─── Atomic Component: CapabilityItem ─── */
const CapabilityItem = memo(({
    capability,
    isBespokeContext,
    disabled,
    editingId,
    tempPrice,
    onEditInit,
    onEditCancel,
    onEditSave,
    onEditChange,
    onToggle
}: {
    capability: CapabilityInfo;
    isBespokeContext: boolean;
    disabled: boolean;
    editingId: string | null;
    tempPrice: string;
    onEditInit: (id: string, price: number | null) => void;
    onEditCancel: () => void;
    onEditSave: (id: string) => void;
    onEditChange: (val: string) => void;
    onToggle: (id: string, active: boolean) => void;
}) => {
    const Icon = ICON_MAP[capability.type] || Settings2;
    const isActive = capability.isAssigned;
    const isGlobal = capability.applicableType === 'None';
    const isEditing = editingId === capability.id;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "group relative overflow-hidden rounded-2xl border transition-all duration-300",
                isBespokeContext ? "p-3.5" : "p-4",
                isActive
                    ? "bg-white border-[#4988c4] shadow-[0_8px_20px_rgba(73,136,196,0.1)]"
                    : "bg-[#fcfcfd] border-slate-100 hover:border-slate-200 hover:bg-white",
                disabled && "opacity-50 pointer-events-none"
            )}
        >
            <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={cn(
                        "rounded-xl flex items-center justify-center transition-all duration-500 shrink-0",
                        isBespokeContext ? "w-10 h-10" : "w-12 h-12",
                        isActive
                            ? "bg-[#4988c4] text-white shadow-lg shadow-blue-100"
                            : "bg-white text-slate-300 border border-slate-100 group-hover:text-slate-400"
                    )}>
                        <Icon className={isBespokeContext ? "w-5 h-5" : "w-6 h-6"} />
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className={cn(
                                "text-xs font-black uppercase tracking-tight transition-colors truncate",
                                isActive ? "text-gray-900" : "text-slate-400"
                            )}>
                                {capability.name}
                            </span>
                            {isActive && <div className="h-1 w-1 rounded-full bg-emerald-500 shrink-0" />}
                        </div>

                        <div className="flex flex-col gap-1.5 pt-1">
                            <AnimatePresence mode="wait">
                                {isEditing ? (
                                    <motion.div
                                        key="editing"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex items-center gap-1.5"
                                    >
                                        <div className="relative">
                                            <Input
                                                autoFocus
                                                value={formatNumber(tempPrice)}
                                                onChange={(e) => onEditChange(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') onEditSave(capability.id);
                                                    if (e.key === 'Escape') onEditCancel();
                                                }}
                                                className="h-6 w-24 text-[10px] font-black pl-1.5 pr-5 rounded-md border-[#4988c4] bg-white p-0"
                                            />
                                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] font-black text-gray-300 pointer-events-none">₫</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button type="button" onClick={() => onEditSave(capability.id)} className="p-1 rounded bg-emerald-500 text-white"><Check className="w-2.5 h-2.5" /></button>
                                            <button type="button" onClick={() => onEditCancel()} className="p-1 rounded bg-slate-100 text-slate-400"><X className="w-2.5 h-2.5" /></button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="display"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center gap-1.5"
                                    >
                                        <span className={cn(
                                            "text-[9px] font-black transition-colors px-1.5 py-0.5 rounded-full border",
                                            isActive
                                                ? (capability.price || capability.multiplier ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-[#4988c4] border-blue-100")
                                                : "text-slate-300 border-transparent bg-transparent"
                                        )}>
                                            {capability.price
                                                ? `+${capability.price.toLocaleString()} ₫`
                                                : capability.multiplier
                                                    ? `×${capability.multiplier}`
                                                    : (isGlobal ? 'Global Setting' : `Included in ${capability.applicableType}`)}
                                        </span>

                                        {isActive && (
                                            <button
                                                type="button"
                                                onClick={() => onEditInit(capability.id, capability.price)}
                                                className="text-[8px] font-black text-slate-400 uppercase tracking-tighter hover:text-[#4988c4] transition-colors"
                                            >
                                                <Edit3 className="w-2.5 h-2.5 mr-0.5" />Edit
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <div className="flex items-center self-center">
                    <Switch
                        checked={isActive}
                        onCheckedChange={() => onToggle(capability.id, isActive)}
                        className="data-[state=checked]:bg-[#4988c4] scale-90"
                    />
                </div>
            </div>

            {isActive && (
                <div className="absolute -bottom-4 -right-4 p-1 opacity-[0.03] pointer-events-none rotate-12">
                    <Icon className={isBespokeContext ? "w-16 h-16" : "w-20 h-20"} />
                </div>
            )}
        </motion.div>
    );
});

/* ─── Main Component: VariantCustomization ─── */
export const VariantCustomization = memo(({
    pendingCustomizations,
    onPendingChange,
    disabled = false,
    productType
}: {
    pendingCustomizations?: { customizeTypeId: string; overridePrice: number | null; overrideMultiplier?: number | null }[];
    onPendingChange?: (customs: { customizeTypeId: string; overridePrice: number | null; overrideMultiplier?: number | null }[]) => void;
    disabled?: boolean;
    productType?: import("@/api/types/product.types").FullyCustomizedProductType;
}) => {
    const { data: availableData, isLoading } = useCustomizeTypes({ pageSize: 120 });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempPrice, setTempPrice] = useState<string>('');

    const isBespokeContext = useMemo(() => productType && productType !== 'None', [productType]);

    const allCapabilities = useMemo(() => {
        const productIsBasic = !productType || productType === 'None';
        const raw = availableData?.items || [];

        return raw.filter(item => {
            const type = getIconKey(item.name, item.category);
            const isGlobalBaseType = item.applicableProductType === 'None' && (type === 'color' || type === 'size');

            if (productIsBasic) {
                return item.applicableProductType === 'None';
            }
            
            // For Bespoke: show matching type OR global color/size types
            return item.applicableProductType === productType || isGlobalBaseType;
        }).filter(item => {
            if (!productIsBasic) return true;
            const type = getIconKey(item.name, item.category);
            return type === 'color' || type === 'size';
        }).map(item => ({
            id: item.id,
            name: item.name,
            summary: item.summary,
            category: item.category || 'Standard Settings',
            applicableType: item.applicableProductType,
            type: getIconKey(item.name, item.category),
            isAssigned: pendingCustomizations?.some(p => p.customizeTypeId === item.id) ?? false,
            price: pendingCustomizations?.find(p => p.customizeTypeId === item.id)?.overridePrice ?? null,
            multiplier: pendingCustomizations?.find(p => p.customizeTypeId === item.id)?.overrideMultiplier ?? null
        }));
    }, [availableData, pendingCustomizations, productType]);

    const groupedCapabilities = useMemo(() => {
        if (!isBespokeContext) return { 'Standard': allCapabilities };
        const groups: Record<string, CapabilityInfo[]> = {};
        allCapabilities.forEach(cap => {
            if (!groups[cap.category]) groups[cap.category] = [];
            groups[cap.category].push(cap);
        });
        return groups;
    }, [allCapabilities, isBespokeContext]);

    /* ─── Optimized Handlers ─── */
    const handleToggle = useCallback((id: string, active: boolean) => {
        if (!onPendingChange) return;
        const current = pendingCustomizations || [];
        const opt = allCapabilities.find(c => c.id === id);
        if (!opt) return;

        if (active) {
            // Turning OFF is always allowed
            onPendingChange(current.filter(p => p.customizeTypeId !== id));
        } else {
            // Turning ON: check for exclusives (Color & Size)
            let updated = [...current];
            const isExclusive = opt.type === 'color' || opt.type === 'size';

            if (isExclusive) {
                // Remove existing ones of the same type
                updated = updated.filter(p => {
                    const existing = allCapabilities.find(cap => cap.id === p.customizeTypeId);
                    return !existing || existing.type !== opt.type;
                });
            }

            onPendingChange([...updated, { customizeTypeId: id, overridePrice: null }]);
        }
    }, [pendingCustomizations, onPendingChange, allCapabilities]);

    const handleEditInit = useCallback((id: string, price: number | null) => {
        setEditingId(id);
        setTempPrice(price ? price.toString() : '');
    }, []);

    const handleEditSave = useCallback((id: string) => {
        if (!onPendingChange) return;
        const price = unformatNumber(tempPrice);
        onPendingChange((pendingCustomizations || []).map(p =>
            p.customizeTypeId === id ? { ...p, overridePrice: price === 0 ? null : price } : p
        ));
        setEditingId(null);
    }, [tempPrice, pendingCustomizations, onPendingChange]);

    if (isLoading) {
        return (
            <div className="py-12 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 animate-pulse">
                <Sparkles className="w-8 h-8 text-[#4988c4] animate-spin mb-3" />
            </div>
        );
    }

    if (allCapabilities.length === 0) {
        return (
            <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30">
                <Settings2 className="w-8 h-8 text-slate-200 mb-3" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-10 text-center">No options available for {productType || 'this product'}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-[#4988c4]/10 text-[#4988c4] shadow-sm">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-[14px] font-black text-gray-800 leading-none mb-1">Engine Configuration</h4>
                        <p className="text-[10px] text-gray-400 font-medium tracking-tight">Active parameters for the 3D Engine</p>
                    </div>
                </div>
                {isBespokeContext && (
                    <Badge className="bg-blue-500 text-white border-none h-5 text-[9px] font-black uppercase tracking-tighter rounded-lg shadow-sm">
                        {productType} Config
                    </Badge>
                )}
            </div>

            <div className="space-y-6">
                {Object.entries(groupedCapabilities).map(([category, items]) => (
                    <div key={category} className="space-y-4">
                        {isBespokeContext && (
                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-slate-100" />
                                <span className="text-[10px] font-black uppercase tracking-tighter text-slate-300 px-2">{category}</span>
                                <div className="h-px flex-1 bg-slate-100" />
                            </div>
                        )}
                        <div className={cn("grid gap-3", isBespokeContext ? "grid-cols-2" : "grid-cols-1")}>
                            {items.map((cap) => (
                                <CapabilityItem
                                    key={cap.id}
                                    capability={cap}
                                    isBespokeContext={isBespokeContext || false}
                                    disabled={disabled}
                                    editingId={editingId}
                                    tempPrice={tempPrice}
                                    onEditInit={handleEditInit}
                                    onEditCancel={() => setEditingId(null)}
                                    onEditSave={handleEditSave}
                                    onEditChange={setTempPrice}
                                    onToggle={handleToggle}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default VariantCustomization;

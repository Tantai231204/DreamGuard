// src/pages/admin/products/components/variant-dialog/VariantCustomization.tsx
import { useCallback, useState, useMemo, memo, forwardRef } from 'react';
import {
    useVariantCustomizeTypes,
    useAssignVariantCustomizeType,
    useUpdateVariantCustomizeTypePrice,
    useRemoveVariantCustomizeType
} from '@/hooks/queries/useProduct';
import { useCustomizeTypes } from '@/hooks/queries/useCustomizeType';
import {
    X,
    DollarSign,
    Check,
    Loader2,
    Ruler,
    Palette,
    Box,
    Layers
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { formatPrice, formatNumber, unformatNumber, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { VariantCustomizeTypeResponse } from '@/api';
import type { CustomizeOptionResponse } from '@/api/types/product.types';

type CustomResponse = VariantCustomizeTypeResponse | CustomizeOptionResponse;

const TYPE_ICONS: Record<string, LucideIcon> = {
    'size': Ruler,
    'color': Palette,
    'material': Layers,
    'default': Box
};

const getIconKey = (name: string): string => {
    const low = name.toLowerCase();
    if (low.includes('size') || low.includes('kích thước')) return 'size';
    if (low.includes('color') || low.includes('màu')) return 'color';
    if (low.includes('material') || low.includes('chất liệu')) return 'material';
    return 'default';
};

/* ─── Compact Capability Item ─── */
const CustomizationCapability = memo(forwardRef<HTMLDivElement, {
    name: string;
    originalPrice: number;
    overridePrice: number | null;
    isEnabled: boolean;
    isUpdating: boolean;
    onToggle: () => void;
    onUpdatePrice: (price: number) => void;
}>(({
    name,
    originalPrice,
    overridePrice,
    isEnabled,
    isUpdating,
    onToggle,
    onUpdatePrice
}, ref) => {
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [localPrice, setLocalPrice] = useState(overridePrice !== null ? String(overridePrice) : '');

    const iconKey = getIconKey(name);
    const Icon = TYPE_ICONS[iconKey];

    const handleSavePrice = () => {
        onUpdatePrice(Number(localPrice));
        setIsEditingPrice(false);
    };

    return (
        <motion.div
            ref={ref}
            layout
            className={cn(
                "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                isEnabled 
                    ? "bg-white border-blue-100 shadow-[0_4px_12px_rgba(73,136,196,0.08)]" 
                    : "bg-gray-50/50 border-slate-100/60 opacity-60"
            )}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                    isEnabled ? "bg-blue-50 text-[#4988c4]" : "bg-white text-slate-200"
                )}>
                    <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                    <h6 className={cn("text-[11px] font-black uppercase tracking-wider truncate", isEnabled ? "text-slate-900" : "text-slate-400")}>
                        {name}
                    </h6>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-slate-400">{formatPrice(overridePrice ?? originalPrice)}</span>
                         {overridePrice !== null && isEnabled && (
                            <div className="w-1 h-1 rounded-full bg-[#4988c4]" />
                         )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {isEnabled && !isEditingPrice && (
                    <button
                        type="button"
                         onClick={() => setIsEditingPrice(true)}
                        className="text-[10px] font-bold text-[#4988c4] hover:text-[#3a6fa0] underline underline-offset-4"
                    >
                        Adjust Price
                    </button>
                )}

                {isEditingPrice && (
                    <div className="flex items-center gap-1 animate-in slide-in-from-right-2 duration-300">
                        <div className="relative w-24">
                            <Input
                                 value={formatNumber(localPrice)}
                                onChange={(e) => setLocalPrice(String(unformatNumber(e.target.value)))}
                                className="h-7 pl-5 text-[10px] font-bold border-blue-100 focus:ring-0"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleSavePrice()}
                            />
                            <DollarSign className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-blue-300" />
                        </div>
                         <Button size="icon" className="h-7 w-7 bg-[#4988c4] hover:bg-[#3a6fa0]" onClick={handleSavePrice} disabled={isUpdating}>
                             <Check className="w-3 h-3 text-white" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsEditingPrice(false)}>
                            <X className="w-3 h-3 text-slate-400" />
                        </Button>
                    </div>
                )}

                <Switch checked={isEnabled} onCheckedChange={onToggle} disabled={isUpdating} className="scale-90" />
            </div>
             {isUpdating && <div className="absolute inset-0 bg-white/40 flex items-center justify-center rounded-2xl z-10"><Loader2 className="w-5 h-5 animate-spin text-[#4988c4]" /></div>}
        </motion.div>
    );
}));

/* ─── Main Component ─── */
interface VariantCustomizationProps {
    variantId?: string;
    pendingCustomizations?: { customizeTypeId: string; overridePrice: number | null }[];
    onPendingChange?: (customs: { customizeTypeId: string; overridePrice: number | null }[]) => void;
}

export default function VariantCustomization({ variantId, pendingCustomizations, onPendingChange }: VariantCustomizationProps) {
    // Queries
    const { data: serverAssigned = [], isLoading: isLoadingAssigned } = useVariantCustomizeTypes(variantId || '', !!variantId);
    const { data: availableData, isLoading: isLoadingAvailable } = useCustomizeTypes({ pageSize: 100 });

    // Model Mapping
    const assignedMap = useMemo(() => {
        const map = new Map<string, CustomResponse>();
        
        // 1. Prioritize pendingCustomizations (Form state) if available
        if (pendingCustomizations && availableData) {
            pendingCustomizations.forEach(p => {
                const opt = availableData.items.find(o => o.id === p.customizeTypeId);
                if (opt) {
                    map.set(p.customizeTypeId, {
                        customizeTypeId: p.customizeTypeId,
                        name: opt.name,
                        summary: opt.summary,
                        defaultPrice: opt.defaultPrice,
                        overridePrice: p.overridePrice ?? null,
                    } as CustomizeOptionResponse);
                }
            });
        } 
        // 2. Fallback to serverAssigned (Direct server state) if exists and no pending state logic
        else if (variantId && serverAssigned.length > 0) {
            serverAssigned.forEach(a => map.set(a.customizeTypeId, a));
        }
        
        return map;
    }, [variantId, serverAssigned, pendingCustomizations, availableData]);

    const allCapabilities = useMemo(() => {
        if (!availableData) return [];
        return availableData.items.map(opt => ({
            ...opt,
            isAssigned: assignedMap.has(opt.id),
            assignedData: assignedMap.get(opt.id)
        }));
    }, [availableData, assignedMap]);

    // Mutations
    const assignMutation = useAssignVariantCustomizeType();
    const updateMutation = useUpdateVariantCustomizeTypePrice();
    const removeMutation = useRemoveVariantCustomizeType();

    const handleToggle = useCallback((id: string, currentlyAssigned: boolean) => {
        if (onPendingChange) {
            // Priority 1: Form Session (Batch Save)
            if (currentlyAssigned) {
                onPendingChange((pendingCustomizations || []).filter(p => p.customizeTypeId !== id));
            } else {
                onPendingChange([...(pendingCustomizations || []), { customizeTypeId: id, overridePrice: null }]);
            }
            return;
        }

        // Fallback: Immediate Mutation (Standalone Mode)
        if (currentlyAssigned) {
            if (variantId) {
                removeMutation.mutate({ variantId, customizeTypeId: id });
            }
        } else if (variantId) {
            assignMutation.mutate({ variantId, data: { customizeTypeId: id } });
        }
    }, [variantId, pendingCustomizations, onPendingChange, assignMutation, removeMutation]);

    const handleUpdatePrice = useCallback((id: string, overridePrice: number) => {
        if (onPendingChange) {
            // Priority 1: Form Session
            onPendingChange((pendingCustomizations || []).map(p => p.customizeTypeId === id ? { ...p, overridePrice } : p));
            return;
        }

        // Fallback: Immediate Mutation
        if (variantId) {
            updateMutation.mutate({ variantId, customizeTypeId: id, data: { overridePrice } });
        }
    }, [variantId, pendingCustomizations, onPendingChange, updateMutation]);

    if ((isLoadingAssigned || isLoadingAvailable) && (variantId || !availableData)) {
        return <div className="space-y-2 mt-4"><div className="h-12 bg-slate-50 animate-pulse rounded-2xl" /><div className="h-12 bg-slate-50 animate-pulse rounded-2xl" /></div>;
    }

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
                <AnimatePresence mode="popLayout">
                    {allCapabilities.map((cap) => (
                        <CustomizationCapability
                            key={cap.id}
                            name={cap.name}
                            originalPrice={cap.defaultPrice}
                            overridePrice={(cap.assignedData as CustomResponse)?.overridePrice ?? null}
                            isEnabled={cap.isAssigned}
                            isUpdating={
                                (assignMutation.isPending && assignMutation.variables?.data.customizeTypeId === cap.id) ||
                                (removeMutation.isPending && removeMutation.variables?.customizeTypeId === cap.id) ||
                                (updateMutation.isPending && updateMutation.variables?.customizeTypeId === cap.id)
                            }
                            onToggle={() => handleToggle(cap.id, cap.isAssigned)}
                            onUpdatePrice={(p) => handleUpdatePrice(cap.id, p)}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {allCapabilities.length === 0 && (
                <div className="py-8 border border-dashed border-slate-100 rounded-2xl flex items-center justify-center">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No available options.</p>
                </div>
            )}
        </div>
    );
}

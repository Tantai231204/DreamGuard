import { memo, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid,
    Paintbrush,
    Ruler,
    Settings2,
    CheckCircle2,
    Edit3,
    Check,
    X,
} from 'lucide-react';
import { cn, formatNumber, unformatNumber } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCustomizeTypes } from '@/hooks/queries/useCustomizeType';
import { toast } from 'sonner';

interface VariantCustomizationProps {
    pendingCustomizations?: { customizeTypeId: string; overridePrice: number | null }[];
    onPendingChange?: (customs: { customizeTypeId: string; overridePrice: number | null }[]) => void;
    disabled?: boolean;
}

/* ─── Senior Visualization: Icon Map ─── */
const ICON_MAP = {
    color: Paintbrush,
    size: Ruler,
    other: Settings2,
};

const getIconKey = (name: string): keyof typeof ICON_MAP => {
    const n = name.toLowerCase();
    if (n.includes('color') || n.includes('màu')) return 'color';
    if (n.includes('size') || n.includes('kích thước')) return 'size';
    return 'other';
};

export const VariantCustomization = memo(({
    pendingCustomizations,
    onPendingChange,
    disabled = false
}: VariantCustomizationProps) => {
    const { data: availableData } = useCustomizeTypes({ pageSize: 100 });

    const [editingId, setEditingId] = useState<string | null>(null);
    const [tempPrice, setTempPrice] = useState<string>('');

    const allCapabilities = useMemo(() => {
        return (availableData?.items || [])
            .filter(item => {
                const type = getIconKey(item.name);
                return type === 'color' || type === 'size';
            })
            .map(item => ({
                id: item.id,
                name: item.name,
                type: getIconKey(item.name),
                isAssigned: pendingCustomizations?.some(p => p.customizeTypeId === item.id) ?? false,
                price: pendingCustomizations?.find(p => p.customizeTypeId === item.id)?.overridePrice ?? null
            }));
    }, [availableData, pendingCustomizations]);

    const handleToggle = (id: string, currentlyAssigned: boolean) => {
        if (!onPendingChange) return;

        const opt = allCapabilities.find(c => c.id === id);
        if (!opt) return;

        const currentPending = pendingCustomizations || [];

        if (currentlyAssigned) {
            // Turning OFF
            if (opt.type === 'size') {
                const hasColor = currentPending.some(p => {
                    const c = allCapabilities.find(cap => cap.id === p.customizeTypeId);
                    return c && c.type === 'color';
                });
                if (hasColor) {
                    toast.error("Size is required when Color is active", {
                        description: "You must disable Color customization first."
                    });
                    return;
                }
            }
            onPendingChange(currentPending.filter(p => p.customizeTypeId !== id));
        } else {
            // Turning ON
            if (opt.type === 'color') {
                const hasSize = currentPending.some(p => {
                    const c = allCapabilities.find(cap => cap.id === p.customizeTypeId);
                    return c && c.type === 'size';
                });

                if (!hasSize) {
                    const sizeOpt = allCapabilities.find(c => c.type === 'size');
                    if (sizeOpt) {
                        toast.success("Enabling Size automatically", {
                            description: "Color customization requires Size selection."
                        });
                        onPendingChange([
                            ...currentPending,
                            { customizeTypeId: id, overridePrice: null },
                            { customizeTypeId: sizeOpt.id, overridePrice: null }
                        ]);
                        return;
                    }
                }
            }
            onPendingChange([...currentPending, { customizeTypeId: id, overridePrice: null }]);
        }
    };

    const handleStartEdit = (id: string, currentPrice: number | null) => {
        setEditingId(id);
        setTempPrice(currentPrice ? currentPrice.toString() : '');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setTempPrice('');
    };

    const handleSavePrice = (id: string) => {
        const price = unformatNumber(tempPrice);

        if (onPendingChange) {
            onPendingChange((pendingCustomizations || []).map(p =>
                p.customizeTypeId === id ? { ...p, overridePrice: price === 0 ? null : price } : p
            ));
        }
        setEditingId(null);
        setTempPrice('');
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#4988c4]/10 text-[#4988c4]">
                        <LayoutGrid className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-[13px] font-bold text-gray-800 leading-none mb-1">Customization Engine</h4>
                        <p className="text-[10px] text-gray-400 font-medium tracking-tight">Select active parameters for this variant</p>
                    </div>
                </div>
                <Badge variant="outline" className="h-5 text-[9px] font-black uppercase tracking-widest bg-gray-50 border-gray-100">
                    {allCapabilities.filter(c => c.isAssigned).length} Active
                </Badge>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {allCapabilities.map((capability) => {
                    const Icon = ICON_MAP[capability.type as keyof typeof ICON_MAP] || Settings2;
                    const isActive = capability.isAssigned;

                    return (
                        <motion.div
                            key={capability.id}
                            initial={false}
                            animate={{
                                backgroundColor: isActive ? '#f8fafc' : '#ffffff',
                                borderColor: isActive ? '#4988c4' : '#f1f5f9'
                            }}
                            className={cn(
                                "group relative overflow-hidden rounded-2xl border-2 p-4 transition-all duration-300",
                                disabled && "opacity-50 pointer-events-none"
                            )}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500",
                                        isActive ? "bg-[#4988c4] text-white shadow-lg shadow-blue-100 rotate-6" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                                    )}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={cn(
                                                "text-[13px] font-black uppercase tracking-tight transition-colors",
                                                isActive ? "text-gray-900" : "text-gray-400"
                                            )}>
                                                {capability.name}
                                            </span>
                                            {isActive && (
                                                <Badge className="bg-emerald-500/10 text-emerald-600 border-none h-4 px-1.5 text-[8px] font-black uppercase animate-in zoom-in-50 duration-500">
                                                    Active
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 min-h-[24px]">
                                            <AnimatePresence mode="wait">
                                                {editingId === capability.id ? (
                                                    <motion.div
                                                        key="editing"
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 10 }}
                                                        className="flex items-center gap-1.5"
                                                    >
                                                        <div className="relative">
                                                            <Input
                                                                autoFocus
                                                                value={formatNumber(tempPrice)}
                                                                onChange={(e) => setTempPrice(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleSavePrice(capability.id);
                                                                    if (e.key === 'Escape') handleCancelEdit();
                                                                }}
                                                                className="h-7 w-28 text-[11px] font-black pl-2 pr-6 rounded-lg border-blue-200 focus:ring-0 focus:border-blue-400 shadow-sm bg-white"
                                                            />
                                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-300">₫</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); handleSavePrice(capability.id); }}
                                                                className="p-1 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                            >
                                                                <Check className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }}
                                                                className="p-1 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="display"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <span className={cn(
                                                            "text-[11px] font-black transition-colors",
                                                            capability.price ? "text-emerald-500" : "text-[#4988c4]"
                                                        )}>
                                                            {capability.price ? capability.price.toLocaleString() + ' ₫' : 'Global Price'}
                                                        </span>
                                                        {isActive && (
                                                            <>
                                                                <div className="w-1 h-1 rounded-full bg-gray-200" />
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); handleStartEdit(capability.id, capability.price); }}
                                                                    className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-tighter hover:text-[#4988c4] transition-colors group/edit"
                                                                >
                                                                    <Edit3 className="w-3 h-3 group-hover/edit:scale-110 transition-transform" />
                                                                    {capability.price ? "Adjust" : "Override"}
                                                                </button>
                                                            </>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={isActive}
                                        onCheckedChange={() => handleToggle(capability.id, isActive)}
                                        className="data-[state=checked]:bg-emerald-500 shadow-sm"
                                    />
                                </div>
                            </div>

                            {isActive && (
                                <div className="absolute -bottom-4 -left-4 p-1 opacity-[0.04] pointer-events-none">
                                    <CheckCircle2 className="w-20 h-20 text-[#4988c4] -rotate-12" />
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {allCapabilities.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                    <Settings2 className="w-8 h-8 text-gray-200 mb-3" />
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">No matching capabilities found</p>
                </div>
            )}
        </div>
    );
});

VariantCustomization.displayName = 'VariantCustomization';
export default VariantCustomization;

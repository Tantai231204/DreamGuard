import { memo, useDeferredValue } from 'react';
import { Ruler, Move3D, Settings2, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CustomizeTypeResponse } from '@/api/types/customizeType.types';
import type { VariantCustomizeTypeResponse } from '@/api/services/variantService';

interface CustomizationFormProps {
    isVisible: boolean;
    type: 'dimensions' | 'color' | 'full'; 
    // Dimension props
    length?: number;
    width?: number;
    thickness?: number;
    onDimensionChange?: (field: 'length' | 'width' | 'thickness', value: number) => void;
    // Color props
    colorHex?: string;
    onColorChange?: (hex: string) => void;
    // Customize Type props
    availableTypes?: CustomizeTypeResponse[];
    variantTypes?: VariantCustomizeTypeResponse[]; 
    selectedTypeId?: string | null;
    onTypeChange?: (id: string) => void;
    categoryName?: string;
}

export const CustomizationForm = memo(({ 
    isVisible, type, 
    length = 0, width = 0, thickness = 0, onDimensionChange,
    colorHex = "#FFFFFF", onColorChange,
    availableTypes = [], variantTypes = [], selectedTypeId, onTypeChange,
    categoryName = "Mattress"
}: CustomizationFormProps) => {
    const deferredLength = useDeferredValue(length);
    const deferredWidth = useDeferredValue(width);
    const deferredThickness = useDeferredValue(thickness);
    const deferredColorHex = useDeferredValue(colorHex);

    if (!isVisible) return null;

    const PREMIUM_COLORS = [
        { name: 'Royal Gold', hex: '#D4AF37' },
        { name: 'Pure Silk', hex: '#FFF5E1' },
        { name: 'Midnight Ash', hex: '#2C3E50' },
        { name: 'Deep Forest', hex: '#1B4D3E' },
        { name: 'Velvet Rose', hex: '#800020' },
    ];

    // Merge global types with variant overrides
    const displayTypes = availableTypes.map(gt => {
        const vt = variantTypes.find(v => v.customizeTypeId === gt.id);
        return {
            id: gt.id,
            name: gt.name,
            summary: gt.summary,
            price: vt ? vt.finalPrice : gt.defaultPrice,
            isOverride: !!vt?.overridePrice,
            originalPrice: gt.defaultPrice
        };
    });

    return (
        <div className="mt-6 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                        <Settings2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">
                            {type === 'dimensions' ? 'Custom Size Builder' : 'Custom Color Design'}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                            Built for your specific needs
                        </p>
                    </div>
                </div>
            </div>

            {type === 'dimensions' ? (
                <div className="space-y-8">
                    {/* Measurement Controls */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { id: 'length', label: 'Length', icon: Ruler, value: length, unit: 'cm' },
                            { id: 'width', label: 'Width', icon: Ruler, value: width, unit: 'cm' },
                            { id: 'thickness', label: 'Thickness', icon: Move3D, value: thickness, unit: 'cm' },
                        ].map(f => (
                            <div key={f.id} className="space-y-2 text-center">
                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                                    <f.icon className="w-3 h-3" />
                                    {f.label}
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={f.value}
                                        onChange={(e) => onDimensionChange?.(f.id as any, parseFloat(e.target.value) || 0)}
                                        className="h-12 w-full bg-slate-50 border-none rounded-xl font-black text-slate-900 focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all text-center pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase">{f.unit}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Simple Plan Selection Card Wrapper */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Choose Service Plan</span>
                            {displayTypes.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => onTypeChange?.(t.id)}
                                    className={cn(
                                        "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-4 group",
                                        selectedTypeId === t.id 
                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/[0.02]" 
                                            : "border-slate-50 bg-slate-50/50 hover:border-slate-100"
                                    )}
                                >
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{t.name}</span>
                                            {t.isOverride && <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 text-[8px] font-black uppercase h-4 px-1">Promo</Badge>}
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-bold tracking-tight line-clamp-1">{t.summary}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[12px] font-black text-[var(--color-primary)]">+{t.price.toLocaleString()}đ</div>
                                        {t.isOverride && (
                                            <div className="text-[8px] font-bold text-slate-300 line-through leading-none">{t.originalPrice.toLocaleString()}đ</div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Integrated Info Table */}
                        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-3">
                                    <Info className="w-3 h-3 text-[var(--color-primary)]" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Policy Spotlight</span>
                                </div>
                                <div className="grid grid-cols-1 gap-1.5">
                                    <div className="flex items-center justify-between text-[10px] font-bold py-1 px-2 bg-white rounded-lg border border-slate-50">
                                        <span className="text-slate-400 uppercase">{categoryName} base policy</span>
                                        <span className="text-[var(--color-primary)]">Priority Crafting</span>
                                    </div>
                                    <p className="text-[9px] text-slate-400 leading-relaxed px-2 font-medium">Standard dimensions are delivered within 3-5 days. Custom builds may require 7-10 business days for material sourcing.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Integrated Summary Bar */}
                    <div className="p-4 bg-slate-900 rounded-xl text-white flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Ruler className="w-3 h-3" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Calculated Area</span>
                            </div>
                            <span className="text-sm font-black tracking-tight">{deferredLength}×{deferredWidth}×{deferredThickness}<span className="text-[9px] text-slate-400 ml-1">cm</span></span>
                        </div>
                        <div className="text-right border-l border-slate-700 pl-4">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Build SKU</span>
                            <div className="text-[11px] font-mono font-bold text-[var(--color-primary)] tracking-tighter">VAR-C-{deferredLength}{deferredWidth}</div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-5 gap-3">
                        {PREMIUM_COLORS.map(c => (
                            <button
                                key={c.hex}
                                onClick={() => onColorChange?.(c.hex)}
                                className={cn(
                                    "aspect-square rounded-xl border-4 transition-all duration-300 relative group",
                                    colorHex === c.hex ? "border-[var(--color-primary)] scale-105 shadow-md" : "border-white hover:border-slate-100"
                                )}
                                style={{ backgroundColor: c.hex }}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-4 max-w-xs mx-auto">
                        <div className="flex-1 text-center space-y-2">
                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Custom Hex Signature</Label>
                            <div className="relative group">
                                <Input
                                    value={colorHex}
                                    onChange={(e) => onColorChange?.(e.target.value)}
                                    placeholder="#000000"
                                    className="h-12 bg-slate-50 border-none rounded-xl font-black text-slate-900 focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all pl-10 uppercase text-center"
                                />
                                <div 
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-slate-100 shadow-sm"
                                    style={{ backgroundColor: deferredColorHex }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

CustomizationForm.displayName = 'CustomizationForm';

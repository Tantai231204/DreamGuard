import { memo, useDeferredValue } from 'react';
import { Palette, Ruler, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { MATTRESS_LIMITS } from '../constants';

interface CustomizationFormProps {
    isVisible: boolean;
    type: 'dimensions' | 'color' | 'full';
    length?: number;
    width?: number;
    thickness?: number;
    onDimensionChange?: (field: 'length' | 'width' | 'thickness', value: number) => void;
    colorHex?: string;
    onColorChange?: (hex: string) => void;
    /** Surcharge added for this customization type */
    surchargePrice?: number;
}

const PRESET_COLORS = [
    { hex: '#1E293B', name: 'Midnight' }, { hex: '#DC2626', name: 'Ruby' }, 
    { hex: '#2563EB', name: 'Azure' }, { hex: '#16A34A', name: 'Emerald' }, 
    { hex: '#D97706', name: 'Amber' }, { hex: '#9333EA', name: 'Violet' },
    { hex: '#EC4899', name: 'Rosy' }, { hex: '#FFFFFF', name: 'Snow' },
];

export const CustomizationForm = memo(({
    isVisible, type,
    length = 190, width = 160, thickness = 15, onDimensionChange,
    colorHex = "#FFFFFF", onColorChange,
    surchargePrice = 0,
}: CustomizationFormProps) => {
    const deferredColorHex = useDeferredValue(colorHex);

    if (!isVisible) return null;

    const isDimensionValid = (field: keyof typeof MATTRESS_LIMITS, val: number) => {
        const { min, max } = MATTRESS_LIMITS[field];
        return val >= min && val <= max;
    };

    return (
        <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden rounded-2xl border-2 border-[#4988c4]/10 bg-gradient-to-b from-slate-50 to-white shadow-inner"
        >
            <div className="p-5 space-y-5">
                {type === 'dimensions' ? (
                    /* ── ADVANCED DIMENSION CUSTOMIZATION ── */
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Ruler className="w-4 h-4 text-[#4988c4]" />
                                <Label className="text-xs font-black text-slate-800 uppercase tracking-wider">Bespoke Dimensions</Label>
                            </div>
                            <Badge variant="outline" className={cn(
                                "text-[10px] font-bold border-[#4988c4]/20",
                                surchargePrice > 0 ? "text-[#4988c4] bg-[#4988c4]/5" : "text-slate-400 bg-slate-50"
                            )}>
                                {surchargePrice > 0 ? `Add-on: ${formatPrice(surchargePrice)}` : "No extra fee"}
                            </Badge>
                        </div>

                        {/* Price Table / Information Block */}
                        <div className="grid grid-cols-1 gap-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                            <div className="flex items-start gap-2">
                                <Info className="w-3.5 h-3.5 text-[#4988c4] mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-700">Business Constraints (Safety Rules):</p>
                                    <ul className="text-[9px] text-slate-500 grid grid-cols-2 gap-x-4 gap-y-1 ml-1">
                                        <li>• Width: {MATTRESS_LIMITS.width.min}-{MATTRESS_LIMITS.width.max}cm</li>
                                        <li>• Length: {MATTRESS_LIMITS.length.min}-{MATTRESS_LIMITS.length.max}cm</li>
                                        <li>• Depth: {MATTRESS_LIMITS.thickness.min}-{MATTRESS_LIMITS.thickness.max}cm</li>
                                        <li>• Lead Time: 7-10 Days</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Inputs Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            {(['length', 'width', 'thickness'] as const).map(f => {
                                const val = [length, width, thickness][['length', 'width', 'thickness'].indexOf(f)];
                                const isValid = isDimensionValid(f, val);
                                return (
                                    <div key={f} className="space-y-1.5">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">
                                            {MATTRESS_LIMITS[f].label}
                                        </Label>
                                        <div className="relative group">
                                            <Input
                                                type="number"
                                                inputMode="decimal"
                                                value={val === 0 ? '' : val}
                                                onChange={(e) => onDimensionChange?.(f, parseFloat(e.target.value) || 0)}
                                                className={cn(
                                                    "h-11 bg-white border-2 rounded-xl text-sm font-black text-slate-900 pr-10 pl-3 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                                    isValid 
                                                        ? "border-slate-100 focus:border-[#4988c4] focus:ring-4 focus:ring-[#4988c4]/5" 
                                                        : "border-rose-100 focus:border-rose-300 focus:ring-rose-50 ring-2 ring-rose-50"
                                                )}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 group-focus-within:text-[#4988c4] pointer-events-none select-none">cm</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Dynamic Warning/Success */}
                        <AnimatePresence mode="wait">
                            {(!isDimensionValid('length', length) || !isDimensionValid('width', width) || !isDimensionValid('thickness', thickness)) ? (
                                <motion.div 
                                    key="error"
                                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                    className="flex items-center gap-2 p-2.5 bg-rose-50 rounded-lg border border-rose-100"
                                >
                                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                                    <span className="text-[9px] font-bold text-rose-600 uppercase tracking-tight">Dimensions outside safety limits</span>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="success"
                                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                    className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-lg border border-emerald-100"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tight">Valid Custom Specification</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    /* ── ADVANCED COLOR CUSTOMIZATION ── */
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Palette className="w-4 h-4 text-[#4988c4]" />
                                <Label className="text-xs font-black text-slate-800 uppercase tracking-wider">Custom Color Palette</Label>
                            </div>
                            <Badge variant="outline" className={cn(
                                "text-[10px] font-bold border-[#4988c4]/20",
                                surchargePrice > 0 ? "text-[#4988c4] bg-[#4988c4]/5" : "text-slate-400 bg-slate-50"
                            )}>
                                {surchargePrice > 0 ? `Add-on: ${formatPrice(surchargePrice)}` : "No extra fee"}
                            </Badge>
                        </div>

                        {/* Presets Grid */}
                        <div className="grid grid-cols-4 gap-3">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c.hex}
                                    onClick={() => onColorChange?.(c.hex)}
                                    className={cn(
                                        "group relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200",
                                        colorHex.toUpperCase() === c.hex.toUpperCase()
                                            ? "bg-white shadow-md border-2 border-[#4988c4]/20 scale-105"
                                            : "hover:bg-white hover:shadow-sm"
                                    )}
                                >
                                    <div 
                                        className="w-8 h-8 rounded-lg shadow-inner border border-black/5"
                                        style={{ backgroundColor: c.hex }}
                                    />
                                    <span className={cn(
                                        "text-[8px] font-black uppercase tracking-tight",
                                        colorHex.toUpperCase() === c.hex.toUpperCase() ? "text-[#4988c4]" : "text-slate-400"
                                    )}>{c.name}</span>
                                    {colorHex.toUpperCase() === c.hex.toUpperCase() && (
                                        <div className="absolute -top-1 -right-1 bg-[#4988c4] rounded-full p-0.5 shadow-sm">
                                            <CheckCircle2 className="w-2 h-2 text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Professional Hex Input */}
                        <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm">
                            <div
                                className="w-12 h-12 rounded-xl border-2 border-slate-50 shadow-inner flex-shrink-0"
                                style={{ backgroundColor: deferredColorHex }}
                            />
                            <div className="flex-1 space-y-1">
                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Custom Hex Code</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={colorHex}
                                        onChange={(e) => onColorChange?.(e.target.value)}
                                        placeholder="#000000"
                                        maxLength={7}
                                        className="h-8 border-0 bg-slate-50 font-mono text-sm font-black text-slate-900 tracking-wider shadow-none focus-visible:ring-0 focus-visible:bg-white uppercase"
                                    />
                                    <Palette className="w-3.5 h-3.5 text-slate-200" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Footer Insight Grid */}
            <div className="bg-slate-100/50 grid grid-cols-2 divide-x divide-slate-100 py-2.5 border-t border-slate-100">
                <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Estimated Labor</span>
                    <span className="text-[10px] font-bold text-slate-600 italic">Handcrafted</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Quality Verified</span>
                    <span className="text-[10px] font-bold text-slate-600">Premium Grade</span>
                </div>
            </div>
        </motion.div>
    );
});

// Helper component for badges locally
interface BadgeProps {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "outline";
}

const Badge = ({ children, className, variant = "default" }: BadgeProps) => (
    <div className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap",
        variant === "outline" ? "border" : "bg-slate-100",
        className
    )}>
        {children}
    </div>
);

CustomizationForm.displayName = 'CustomizationForm';

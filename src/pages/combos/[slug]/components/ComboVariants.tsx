import { memo, useMemo } from 'react';
import { Check, Info } from 'lucide-react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Combo } from "../../types";

interface ComboVariantsProps {
    combo: Combo;
    activeCombo: Combo | null;
    selectedVariantId: string | null;
    onSelectVariant: (id: string) => void;
}

export const ComboVariants = memo(({ 
    combo, 
    activeCombo, 
    selectedVariantId, 
    onSelectVariant 
}: ComboVariantsProps) => {
    const allVariants = useMemo(() => {
        const variants = combo.childCombos || [];
        return [combo, ...variants];
    }, [combo]);

    // 1. Unique Colors
    const colorOptions = useMemo(() => {
        const colors = new Map<string, { label: string; value: string; hex: string }>();
        allVariants.forEach(v => {
            if (!colors.has(v.color)) {
                colors.set(v.color, { 
                    label: v.color, 
                    value: v.color, 
                    hex: v.color.toLowerCase() 
                });
            }
        });
        return Array.from(colors.values());
    }, [allVariants]);

    const currentColor = activeCombo?.color || combo.color;
    
    // 2. Available Sizes for current color
    const sizesForCurrentColor = useMemo(() => 
        allVariants.filter(v => v.color === currentColor),
    [allVariants, currentColor]);

    const handleColorChange = (colorValue: string) => {
        const firstOfColor = allVariants.find(v => v.color === colorValue);
        if (firstOfColor) onSelectVariant(firstOfColor.id);
    };

    if (allVariants.length <= 1) return null;

    return (
        <div className="space-y-8">
            {/* Color Selector */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Color Palette</label>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                        {currentColor}
                    </span>
                </div>
                <RadioGroup.Root
                    value={currentColor}
                    onValueChange={handleColorChange}
                    className="flex flex-wrap gap-3.5"
                >
                    {colorOptions.map((color) => {
                        const isActive = currentColor === color.value;
                        return (
                            <TooltipProvider key={color.value} delayDuration={300}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <RadioGroup.Item
                                            value={color.value}
                                            className={cn(
                                                "group relative h-10 w-10 rounded-full border-2 transition-all duration-300",
                                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                                isActive
                                                    ? "border-slate-900 ring-4 ring-slate-900/10 scale-110 shadow-lg"
                                                    : "border-white shadow-sm ring-1 ring-slate-200"
                                            )}
                                            style={{ backgroundColor: color.hex }}
                                            aria-label={color.label}
                                        >
                                            {isActive && (
                                                <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" strokeWidth={3} />
                                            )}
                                        </RadioGroup.Item>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-slate-900 text-white border-0 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg">
                                        {color.label}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )
                    })}
                </RadioGroup.Root>
            </div>

            {/* Size Selector */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Size</label>
                    <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                        <Info className="h-3.5 w-3.5" />
                        <span>Size Guide</span>
                    </button>
                </div>
                <RadioGroup.Root
                    value={selectedVariantId || ""}
                    onValueChange={onSelectVariant}
                    className="flex flex-wrap gap-3"
                >
                    {sizesForCurrentColor.map((v) => {
                        const isActive = selectedVariantId === v.id;
                        return (
                            <RadioGroup.Item
                                key={v.id}
                                value={v.id}
                                className={cn(
                                    "flex flex-col items-center justify-center min-w-[100px] border-2 px-6 py-4 rounded-2xl transition-all duration-300",
                                    isActive
                                        ? "border-slate-900 bg-slate-900 text-white shadow-xl scale-[1.02]"
                                        : "border-slate-100 bg-white text-slate-900 hover:border-slate-200"
                                )}
                            >
                                <span className="text-sm font-black uppercase tracking-tight">{v.size}</span>
                                <span className={cn(
                                    "text-[9px] font-bold uppercase tracking-widest mt-0.5",
                                    isActive ? "text-white/60" : "text-slate-400"
                                )}>
                                    Bundle Option
                                </span>
                            </RadioGroup.Item>
                        )
                    })}
                </RadioGroup.Root>
            </div>
        </div>
    );
});

ComboVariants.displayName = 'ComboVariants';

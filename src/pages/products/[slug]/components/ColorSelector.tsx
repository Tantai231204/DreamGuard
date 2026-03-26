import { memo } from 'react';
import { Check, Plus } from 'lucide-react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ColorOption } from '../types';

interface ColorSelectorProps {
    options: ColorOption[];
    selected: string;
    onChange: (value: string) => void;
    disabledValues?: string[];
    isCustomizable?: boolean;
    onCustomClick?: () => void;
    isCustomMode?: boolean;
}

export const ColorSelector = memo(({ options, selected, onChange, disabledValues, isCustomizable, onCustomClick, isCustomMode }: ColorSelectorProps) => {
    const selectedColor = options.find(c => c.value === selected);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-black text-primary-dark uppercase tracking-widest leading-none">Color Palette</label>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                    {selectedColor?.label}
                </span>
            </div>
            <RadioGroup.Root
                value={selected}
                onValueChange={onChange}
                className="flex flex-wrap gap-3.5"
            >
                {options.map((color) => {
                    const isDisabled = disabledValues?.includes(color.value);
                    const isActive = selected === color.value && !isCustomMode;

                    return (
                        <TooltipProvider key={color.value} delayDuration={300}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <RadioGroup.Item
                                            value={color.value}
                                            disabled={isDisabled}
                                            className={cn(
                                                "group relative h-10 w-10 rounded-full border-2 transition-all duration-300",
                                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                                isDisabled
                                                    ? "cursor-not-allowed border-slate-100 opacity-30"
                                                    : "hover:scale-105",
                                                !isDisabled && isActive
                                                    ? "border-slate-900 ring-4 ring-slate-900/10 scale-110 shadow-lg"
                                                    : !isDisabled
                                                        ? "border-white shadow-sm ring-1 ring-slate-200"
                                                        : "border-slate-100"
                                            )}
                                            style={{ backgroundColor: color.color }}
                                            aria-label={color.label}
                                        >
                                            {isActive && (
                                                <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" strokeWidth={3} />
                                            )}
                                        </RadioGroup.Item>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className={cn(
                                    "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border-none rounded-lg shadow-xl",
                                    isDisabled ? "bg-red-600 text-white" : "bg-primary-dark text-white"
                                )}>
                                    {color.label} {isDisabled && "(Sold Out)"}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )
                })}

                {isCustomizable && (
                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={onCustomClick}
                                    className={cn(
                                        "h-10 w-10 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-300",
                                        isCustomMode 
                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-lg scale-110" 
                                            : "border-slate-200 bg-white text-slate-400 hover:border-slate-400 hover:text-slate-600 shadow-sm"
                                    )}
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-primary-dark text-white border-none py-1.5 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                Manual Color Selection
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </RadioGroup.Root>
        </div>
    );
});

ColorSelector.displayName = 'ColorSelector';

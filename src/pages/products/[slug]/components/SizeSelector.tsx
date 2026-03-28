import { memo } from 'react';
import { Info, Plus } from 'lucide-react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { SizeOption } from '../types';

interface SizeSelectorProps {
    options: SizeOption[];
    selected: string;
    onChange: (value: string) => void;
    disabledValues?: string[];
    isCustomizable?: boolean;
    onCustomClick?: () => void;
    isCustomMode?: boolean;
}

export const SizeSelector = memo(({ options, selected, onChange, disabledValues, isCustomizable, onCustomClick, isCustomMode }: SizeSelectorProps) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-black text-primary-dark uppercase tracking-widest leading-none">Size</label>
                <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                                <Info className="h-3.5 w-3.5" />
                                <span>Size Guide</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent
                            className="rounded-lg bg-primary-dark border-primary-dark px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl"
                        >
                            View detailed size guide
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <RadioGroup.Root
                value={selected}
                onValueChange={onChange}
                className="flex flex-wrap gap-2.5"
            >
                {options.map((size) => {
                    const isDisabled = disabledValues?.includes(size.value);
                    const isActive = selected === size.value && !isCustomMode;

                    // Hide redundant 'Default' if it's the only option
                    if (options.length === 1 && (size.value.toLowerCase() === 'default' || size.label?.toLowerCase() === 'default' || !size.label)) {
                        return null;
                    }

                    return (
                        <TooltipProvider key={size.value} delayDuration={500}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <RadioGroup.Item
                                            value={size.value}
                                            className={cn(
                                                "group flex min-w-[100px] flex-col items-center rounded-2xl border-2 px-6 py-4 transition-all duration-300",
                                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                                isDisabled
                                                    ? "cursor-not-allowed border-slate-50 bg-slate-50 text-slate-300"
                                                    : "hover:border-slate-300",
                                                !isDisabled && isActive
                                                    ? "border-slate-900 bg-slate-900 text-white shadow-xl scale-[1.02]"
                                                    : !isDisabled
                                                        ? "border-slate-100 bg-white text-slate-900"
                                                        : ""
                                            )}
                                            disabled={isDisabled}
                                        >
                                            <span className="text-sm font-black uppercase tracking-tight">{size.label}</span>
                                            {size.description && (
                                                <span className={cn(
                                                    "text-[9px] font-bold uppercase tracking-widest transition-colors mt-0.5",
                                                    isActive ? "text-white/70" : "text-slate-400"
                                                )}>
                                                    {size.description}
                                                </span>
                                            )}
                                        </RadioGroup.Item>
                                    </div>
                                </TooltipTrigger>
                                {isDisabled && (
                                    <TooltipContent side="top" className="bg-red-600 text-white border-none py-1.5 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                        Sold Out
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    )
                })}

                {isCustomizable && (
                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <button
                                        type="button"
                                        onClick={onCustomClick}
                                        className={cn(
                                            "flex min-w-[100px] flex-col h-[78px] items-center justify-center rounded-2xl border-2 border-dashed px-6 py-4 transition-all duration-300 gap-1.5",
                                            isCustomMode 
                                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)] shadow-lg scale-[1.02]" 
                                                : "border-slate-200 bg-white text-slate-400 hover:border-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                                            isCustomMode 
                                                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)] scale-110" 
                                                : "border-slate-200"
                                        )}>
                                            <Plus className={cn("h-4 w-4", isCustomMode && "rotate-45")} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">Custom<br/>Size</span>
                                    </button>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-primary-dark text-white border-none py-1.5 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-transform">
                                Manual Size Input
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </RadioGroup.Root>
        </div>
    );
});

SizeSelector.displayName = 'SizeSelector';

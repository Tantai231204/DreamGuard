import { memo } from 'react';
import { Info } from 'lucide-react';
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
}

export const SizeSelector = memo(({ options, selected, onChange, disabledValues }: SizeSelectorProps) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900">Size</label>
                <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button className="flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
                                <Info className="h-3.5 w-3.5" />
                                <span>Size Guide</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent
                            className="rounded-lg bg-gray-900 border-gray-800 px-3 py-2 text-sm text-white shadow-lg"
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
                    return (
                        <TooltipProvider key={size.value} delayDuration={500}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <RadioGroup.Item
                                            value={size.value}
                                            className={cn(
                                                "group flex min-w-[90px] flex-col items-center rounded-lg border-2 px-4 py-3 transition-all duration-200",
                                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
                                                isDisabled
                                                    ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300 opacity-60"
                                                    : "hover:border-[var(--color-primary)]/50 hover:shadow-sm",
                                                !isDisabled && selected === size.value
                                                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-sm"
                                                    : !isDisabled
                                                        ? "border-gray-200 bg-white text-gray-700"
                                                        : ""
                                            )}
                                            disabled={isDisabled}
                                        >
                                            <span className="text-base font-semibold">{size.label}</span>
                                            {size.description && (
                                                <span className={cn(
                                                    "text-xs transition-colors",
                                                    selected === size.value ? "text-[var(--color-primary)]/70" : "text-gray-500"
                                                )}>
                                                    {size.description}
                                                </span>
                                            )}
                                        </RadioGroup.Item>
                                    </div>
                                </TooltipTrigger>
                                {isDisabled && (
                                    <TooltipContent side="top" className="bg-red-600 text-white border-none py-1.5 px-3 text-xs">
                                        Out of stock
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    )
                })}
            </RadioGroup.Root>
        </div>
    );
});

SizeSelector.displayName = 'SizeSelector';

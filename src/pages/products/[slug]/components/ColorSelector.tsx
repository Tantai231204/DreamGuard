import { memo } from 'react';
import { Check } from 'lucide-react';
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
}

export const ColorSelector = memo(({ options, selected, onChange, disabledValues }: ColorSelectorProps) => {
    const selectedColor = options.find(c => c.value === selected);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900">Color</label>
                <span className="text-sm text-gray-500">
                    {selectedColor?.label}
                </span>
            </div>
            <RadioGroup.Root
                value={selected}
                onValueChange={onChange}
                className="flex flex-wrap gap-2.5"
            >
                {options.map((color) => {
                    const isDisabled = disabledValues?.includes(color.value);
                    return (
                        <TooltipProvider key={color.value} delayDuration={300}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <RadioGroup.Item
                                            value={color.value}
                                            disabled={isDisabled}
                                            className={cn(
                                                "group relative h-12 w-12 rounded-full border-2 transition-all duration-200",
                                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
                                                isDisabled
                                                    ? "cursor-not-allowed border-gray-200 opacity-40 hover:scale-100"
                                                    : "hover:scale-105",
                                                !isDisabled && selected === color.value
                                                    ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 scale-105"
                                                    : !isDisabled
                                                        ? "border-gray-300 hover:border-gray-400"
                                                        : "border-gray-200"
                                            )}
                                            style={{ backgroundColor: color.color }}
                                            aria-label={color.label}
                                        >
                                            {selected === color.value && (
                                                <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" />
                                            )}
                                        </RadioGroup.Item>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className={cn(
                                    "px-3 py-1.5 text-xs font-medium border-none",
                                    isDisabled ? "bg-red-600 text-white" : "bg-gray-900 text-white"
                                )}>
                                    {color.label} {isDisabled && "(Out of stock)"}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )
                })}
            </RadioGroup.Root>
        </div>
    );
});

ColorSelector.displayName = 'ColorSelector';

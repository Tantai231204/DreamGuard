import { memo } from 'react';
import { Info } from 'lucide-react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import * as Tooltip from '@radix-ui/react-tooltip';
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
                <Tooltip.Provider delayDuration={300}>
                    <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                            <button className="flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
                                <Info className="h-3.5 w-3.5" />
                                <span>Size Guide</span>
                            </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                            <Tooltip.Content
                                className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white shadow-lg"
                                sideOffset={5}
                            >
                                View detailed size guide
                                <Tooltip.Arrow className="fill-gray-900" />
                            </Tooltip.Content>
                        </Tooltip.Portal>
                    </Tooltip.Root>
                </Tooltip.Provider>
            </div>
            <RadioGroup.Root
                value={selected}
                onValueChange={onChange}
                className="flex flex-wrap gap-2.5"
            >
                {options.map((size) => (
                    <RadioGroup.Item
                        key={size.value}
                        value={size.value}
                        className={cn(
                            "group flex min-w-[90px] flex-col items-center rounded-lg border-2 px-4 py-3 transition-all duration-200",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
                            disabledValues?.includes(size.value)
                                ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-60"
                                : "hover:border-[var(--color-primary)]/50 hover:shadow-sm",
                            !disabledValues?.includes(size.value) && selected === size.value
                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-sm"
                                : !disabledValues?.includes(size.value)
                                    ? "border-gray-200 bg-white text-gray-700"
                                    : ""
                        )}
                        disabled={disabledValues?.includes(size.value)}
                    >
                        <span className="text-base font-semibold">{size.label}</span>
                        <span className={cn(
                            "text-xs transition-colors",
                            selected === size.value ? "text-[var(--color-primary)]/70" : "text-gray-500"
                        )}>
                            {size.description}
                        </span>
                    </RadioGroup.Item>
                ))}
            </RadioGroup.Root>
        </div>
    );
});

SizeSelector.displayName = 'SizeSelector';

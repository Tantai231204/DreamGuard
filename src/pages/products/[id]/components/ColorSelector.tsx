import { memo } from 'react';
import { Check } from 'lucide-react';
import * as RadioGroup from '@radix-ui/react-radio-group';
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
                {options.map((color) => (
                    // A color is disabled when it's explicitly listed, meaning no variant
                    // with this color has available stock.
                    // Disabled items are visually dimmed and non-interactive.
                    <RadioGroup.Item
                        key={color.value}
                        value={color.value}
                        disabled={disabledValues?.includes(color.value)}
                        className={cn(
                            "group relative h-12 w-12 rounded-full border-2 transition-all duration-200",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2",
                            disabledValues?.includes(color.value)
                                ? "cursor-not-allowed border-gray-200 opacity-40 hover:scale-100"
                                : "hover:scale-105",
                            !disabledValues?.includes(color.value) && selected === color.value
                                ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 scale-105"
                                : !disabledValues?.includes(color.value)
                                    ? "border-gray-300 hover:border-gray-400"
                                    : "border-gray-200"
                        )}
                        style={{ backgroundColor: color.color }}
                        title={color.label}
                        aria-label={color.label}
                    >
                        {selected === color.value && (
                            <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" />
                        )}
                    </RadioGroup.Item>
                ))}
            </RadioGroup.Root>
        </div>
    );
});

ColorSelector.displayName = 'ColorSelector';

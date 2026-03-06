import { useState, useRef, useCallback, useMemo, memo } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Command } from 'cmdk';
import { cn } from '@/lib/utils';
import { Search, X, ChevronDown, Check, Shirt, Sparkles } from 'lucide-react';

const MATERIALS = [
    'Cotton',
    'Organic Cotton',
    'Bamboo Fiber',
    'Silk',
    'Linen',
    'Polyester',
    'Microfiber',
    'Tencel',
    'Memory Foam',
    'Latex',
    'Wool',
    'Satin',
] as const;

interface MaterialComboboxProps {
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
}

const MaterialCombobox = memo(function MaterialCombobox({
    value,
    onChange,
    disabled,
}: MaterialComboboxProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered = useMemo(
        () => MATERIALS.filter((m) => m.toLowerCase().includes(search.toLowerCase())),
        [search],
    );

    const showCustom = useMemo(
        () =>
            search.trim() !== '' &&
            !MATERIALS.some((m) => m.toLowerCase() === search.trim().toLowerCase()),
        [search],
    );

    const handleSelect = useCallback(
        (v: string) => {
            onChange(v);
            setSearch('');
            setOpen(false);
        },
        [onChange],
    );

    const handleClear = useCallback(() => {
        onChange('');
        setSearch('');
    }, [onChange]);

    return (
        <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
            <PopoverPrimitive.Trigger asChild disabled={disabled}>
                <button
                    type="button"
                    className={cn(
                        'flex h-11 w-full items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/50',
                        'px-3.5 py-2.5 text-sm ring-offset-white transition-all duration-200',
                        'hover:border-purple-300 hover:bg-white',
                        'focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        value ? 'text-gray-900' : 'text-gray-400',
                    )}
                >
                    <Shirt className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="flex-1 text-left truncate">
                        {value || 'Select or type material...'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                </button>
            </PopoverPrimitive.Trigger>

            <PopoverPrimitive.Portal>
                <PopoverPrimitive.Content
                    sideOffset={6}
                    align="start"
                    className={cn(
                        'z-[200] w-[var(--radix-popover-trigger-width)] overflow-hidden',
                        'rounded-xl border border-gray-200 bg-white shadow-xl shadow-black/10',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out',
                        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                        'data-[side=bottom]:slide-in-from-top-2',
                    )}
                >
                    <Command className="w-full" shouldFilter={false}>
                        <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5">
                            <Search className="h-4 w-4 text-gray-400 shrink-0" />
                            <Command.Input
                                ref={inputRef}
                                value={search}
                                onValueChange={setSearch}
                                placeholder="Search or type material..."
                                className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                            />
                            {value && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        <Command.List className="max-h-52 overflow-y-auto p-1.5">
                            <Command.Empty className="px-3 py-6 text-center text-sm text-gray-400">
                                No materials found
                            </Command.Empty>

                            {showCustom && (
                                <Command.Item
                                    value={`custom-${search}`}
                                    onSelect={() => handleSelect(search.trim())}
                                    className={cn(
                                        'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm cursor-pointer',
                                        'text-purple-700 bg-purple-50/50 mb-1',
                                        'hover:bg-purple-50 transition-colors',
                                    )}
                                >
                                    <Sparkles className="h-4 w-4" />
                                    <span>
                                        Use "<strong>{search.trim()}</strong>"
                                    </span>
                                </Command.Item>
                            )}

                            {filtered.map((mat) => (
                                <Command.Item
                                    key={mat}
                                    value={mat}
                                    onSelect={() => handleSelect(mat)}
                                    className={cn(
                                        'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm cursor-pointer',
                                        'text-gray-700 outline-none transition-colors',
                                        'hover:bg-purple-50 hover:text-purple-900',
                                        'data-[selected=true]:bg-purple-50 data-[selected=true]:text-purple-900',
                                    )}
                                >
                                    <Shirt className="h-3.5 w-3.5 text-gray-400" />
                                    <span className="flex-1">{mat}</span>
                                    {value === mat && (
                                        <Check className="h-4 w-4 text-purple-600" />
                                    )}
                                </Command.Item>
                            ))}
                        </Command.List>
                    </Command>
                </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
    );
});

export default MaterialCombobox;

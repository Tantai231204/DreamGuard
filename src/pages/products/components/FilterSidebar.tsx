import { useState, useCallback, useRef, useMemo, useEffect, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    SlidersHorizontal,
    RotateCcw,
    X,
    DollarSign,
    Palette,
    Baby,
    Ruler,
    ChevronDown,
} from 'lucide-react';
import type { FilterOptions } from '../types';
import { ageRanges } from '../data';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
    filters: FilterOptions;
    onFilterChange: (filters: FilterOptions) => void;
    onReset: () => void;
}

// Color options
interface ColorOption {
    value: string;
    label: string;
    color: string;
    border?: boolean;
}

const colorOptions: ColorOption[] = [
    { value: 'white', label: 'White', color: '#FFFFFF', border: true },
    { value: 'pink', label: 'Pink', color: '#F9A8D4' },
    { value: 'blue', label: 'Blue', color: '#93C5FD' },
    { value: 'cream', label: 'Cream', color: '#FEF3C7' },
    { value: 'mint', label: 'Mint', color: '#A7F3D0' },
    { value: 'grey', label: 'Grey', color: '#D1D5DB' },
];

const sizeOptions = ['Newborn', 'S (0-6M)', 'M (6-12M)', 'L (1-2Y)', 'XL (2Y+)'];

// Collapsible filter section component
function FilterSection({
    title,
    icon: Icon,
    children,
    defaultOpen = true,
    count,
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    defaultOpen?: boolean;
    count?: number;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="py-1">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between py-2.5 group"
            >
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                        <Icon className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                    </div>
                    <span className="text-[13px] font-semibold text-gray-800">{title}</span>
                    {count !== undefined && count > 0 && (
                        <Badge
                            variant="secondary"
                            className="h-5 min-w-5 px-1.5 text-[10px] font-bold bg-[var(--color-primary)] text-white border-0"
                        >
                            {count}
                        </Badge>
                    )}
                </div>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:text-gray-600",
                        isOpen && "rotate-180"
                    )}
                />
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="pb-2 pt-1">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export const FilterSidebar: FC<FilterSidebarProps> = ({
    filters,
    onFilterChange,
    onReset,
}) => {
    // Local price state for slider
    const [priceRange, setPriceRange] = useState<[number, number]>([
        filters.priceRange.min ?? 0,
        filters.priceRange.max ?? 1000,
    ]);

    // Debounce timer refs
    const filterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const priceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
            if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
        };
    }, []);

    // Toggle array filter with debounce
    const toggleArrayFilter = useCallback(
        (key: 'ages' | 'colors' | 'sizes', value: string) => {
            const currentArray = filters[key];
            const newArray = currentArray.includes(value)
                ? currentArray.filter((item) => item !== value)
                : [...currentArray, value];

            if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
            filterTimerRef.current = setTimeout(() => {
                onFilterChange({ ...filters, [key]: newArray });
            }, 150);
        },
        [filters, onFilterChange]
    );

    // Handle price slider change with debounce
    const handlePriceChange = useCallback(
        (value: number[]) => {
            setPriceRange([value[0], value[1]]);

            if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
            priceTimerRef.current = setTimeout(() => {
                onFilterChange({
                    ...filters,
                    priceRange: { min: value[0], max: value[1] },
                });
            }, 200);
        },
        [filters, onFilterChange]
    );

    // Handle min input change
    const handleMinInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = parseInt(e.target.value) || 0;
            const clamped = Math.min(Math.max(val, 0), priceRange[1] - 10);
            setPriceRange([clamped, priceRange[1]]);

            if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
            priceTimerRef.current = setTimeout(() => {
                onFilterChange({
                    ...filters,
                    priceRange: { min: clamped, max: priceRange[1] },
                });
            }, 400);
        },
        [filters, onFilterChange, priceRange]
    );

    // Handle max input change
    const handleMaxInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = parseInt(e.target.value) || 1000;
            const clamped = Math.max(Math.min(val, 1000), priceRange[0] + 10);
            setPriceRange([priceRange[0], clamped]);

            if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
            priceTimerRef.current = setTimeout(() => {
                onFilterChange({
                    ...filters,
                    priceRange: { min: priceRange[0], max: clamped },
                });
            }, 400);
        },
        [filters, onFilterChange, priceRange]
    );

    // Quick price presets
    const pricePresets = useMemo(
        () => [
            { label: 'Under $50', min: 0, max: 50 },
            { label: '$50–200', min: 50, max: 200 },
            { label: '$200–500', min: 200, max: 500 },
            { label: '$500+', min: 500, max: 1000 },
        ],
        []
    );

    const handlePreset = useCallback(
        (min: number, max: number) => {
            setPriceRange([min, max]);
            onFilterChange({ ...filters, priceRange: { min, max } });
        },
        [filters, onFilterChange]
    );

    const isPresetActive = useCallback(
        (min: number, max: number) => priceRange[0] === min && priceRange[1] === max,
        [priceRange]
    );

    const isSelected = useCallback(
        (key: 'ages' | 'colors' | 'sizes', value: string) =>
            filters[key].includes(value),
        [filters]
    );

    const activeFilterCount = useMemo(
        () =>
            filters.ages.length +
            filters.colors.length +
            filters.sizes.length +
            (filters.priceRange.min !== null && filters.priceRange.min !== 0 ? 1 : 0) +
            (filters.priceRange.max !== null && filters.priceRange.max !== 1000 ? 1 : 0),
        [filters]
    );

    const filteredAgeRanges = useMemo(() => ageRanges.filter((a) => a !== 'All'), []);

    const handleReset = useCallback(() => {
        setPriceRange([0, 1000]);
        onReset();
    }, [onReset]);

    // Collect all active pills
    const activePills = useMemo(() => {
        const pills: { key: 'ages' | 'colors' | 'sizes'; value: string; color: string }[] = [];
        filters.ages.forEach((v) => pills.push({ key: 'ages', value: v, color: 'amber' }));
        filters.colors.forEach((v) => pills.push({ key: 'colors', value: v, color: 'purple' }));
        filters.sizes.forEach((v) => pills.push({ key: 'sizes', value: v, color: 'rose' }));
        return pills;
    }, [filters]);

    const pillColorMap: Record<string, string> = {
        amber: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
        purple: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
        rose: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
    };

    return (
        <motion.aside
            className="w-full"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-primary)] shadow-sm">
                        <SlidersHorizontal className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-gray-900">Filters</h2>
                        {activeFilterCount > 0 && (
                            <p className="text-[11px] text-gray-500">
                                {activeFilterCount} active
                            </p>
                        )}
                    </div>
                </div>
                {activeFilterCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="h-8 gap-1.5 rounded-lg text-xs text-gray-500 hover:text-red-500 hover:bg-red-50"
                    >
                        <RotateCcw className="h-3 w-3" />
                        Clear all
                    </Button>
                )}
            </div>

            {/* Active Filter Pills */}
            <AnimatePresence>
                {activePills.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-wrap gap-1.5 pb-4">
                            {activePills.map((pill) => (
                                <motion.button
                                    key={`${pill.key}-${pill.value}`}
                                    type="button"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => toggleArrayFilter(pill.key, pill.value)}
                                    className={cn(
                                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                                        pillColorMap[pill.color]
                                    )}
                                >
                                    {pill.value}
                                    <X className="h-3 w-3 opacity-60" />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Separator className="bg-gray-100" />

            {/* Price Range */}
            <FilterSection
                title="Price Range"
                icon={DollarSign}
                count={
                    (filters.priceRange.min !== null && filters.priceRange.min !== 0 ? 1 : 0) +
                    (filters.priceRange.max !== null && filters.priceRange.max !== 1000 ? 1 : 0)
                }
            >
                <div className="space-y-5 px-0.5">
                    {/* Slider */}
                    <div className="px-1">
                        <Slider
                            min={0}
                            max={1000}
                            step={10}
                            value={priceRange}
                            onValueChange={handlePriceChange}
                            className="w-full"
                        />
                    </div>

                    {/* Editable Min / Max inputs */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">$</span>
                            <Input
                                type="number"
                                min={0}
                                max={priceRange[1] - 10}
                                value={priceRange[0]}
                                onChange={handleMinInput}
                                className="h-10 pl-7 pr-2 text-sm font-semibold text-gray-800 rounded-xl border-gray-200 bg-gray-50/80 text-center focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="absolute -bottom-4 left-0 text-[10px] text-gray-400">Min</span>
                        </div>
                        <div className="flex items-center gap-1 pt-0">
                            <div className="h-px w-3 bg-gray-300" />
                        </div>
                        <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">$</span>
                            <Input
                                type="number"
                                min={priceRange[0] + 10}
                                max={1000}
                                value={priceRange[1]}
                                onChange={handleMaxInput}
                                className="h-10 pl-7 pr-2 text-sm font-semibold text-gray-800 rounded-xl border-gray-200 bg-gray-50/80 text-center focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="absolute -bottom-4 right-0 text-[10px] text-gray-400">Max</span>
                        </div>
                    </div>

                    {/* Quick presets */}
                    <div className="grid grid-cols-2 gap-1.5 pt-2">
                        {pricePresets.map((preset) => (
                            <button
                                key={preset.label}
                                type="button"
                                onClick={() => handlePreset(preset.min, preset.max)}
                                className={cn(
                                    "rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all",
                                    isPresetActive(preset.min, preset.max)
                                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)]"
                                        : "border-gray-150 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                                )}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>
            </FilterSection>

            <Separator className="bg-gray-100" />

            {/* Color */}
            <FilterSection title="Color" icon={Palette} count={filters.colors.length}>
                <div className="grid grid-cols-3 gap-2">
                    {colorOptions.map((color) => {
                        const selected = isSelected('colors', color.value);
                        return (
                            <button
                                key={color.value}
                                type="button"
                                onClick={() => toggleArrayFilter('colors', color.value)}
                                className={cn(
                                    "group flex flex-col items-center gap-1.5 rounded-xl border-2 p-2.5 transition-all",
                                    selected
                                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-sm"
                                        : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                                )}
                            >
                                <div className="relative">
                                    <span
                                        className={cn(
                                            "block h-7 w-7 rounded-full shadow-sm transition-transform group-hover:scale-110",
                                            color.border && "border border-gray-200"
                                        )}
                                        style={{ backgroundColor: color.color }}
                                    />
                                    {selected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary)] text-white"
                                        >
                                            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </motion.div>
                                    )}
                                </div>
                                <span className={cn(
                                    "text-[11px] font-medium",
                                    selected ? "text-[var(--color-primary-dark)]" : "text-gray-500"
                                )}>
                                    {color.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </FilterSection>

            <Separator className="bg-gray-100" />

            {/* Age Range */}
            <FilterSection title="Age Range" icon={Baby} count={filters.ages.length}>
                <div className="space-y-1">
                    {filteredAgeRanges.map((age) => {
                        const selected = isSelected('ages', age);
                        return (
                            <label
                                key={age}
                                htmlFor={`age-${age}`}
                                className={cn(
                                    "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                                    selected
                                        ? "bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20"
                                        : "hover:bg-gray-50 border border-transparent"
                                )}
                            >
                                <Checkbox
                                    id={`age-${age}`}
                                    checked={selected}
                                    onChange={() => toggleArrayFilter('ages', age)}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <span
                                    className={cn(
                                        "text-[13px]",
                                        selected
                                            ? "font-semibold text-[var(--color-primary-dark)]"
                                            : "text-gray-600"
                                    )}
                                >
                                    {age}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </FilterSection>

            <Separator className="bg-gray-100" />

            {/* Size */}
            <FilterSection title="Size" icon={Ruler} count={filters.sizes.length}>
                <div className="grid grid-cols-2 gap-2">
                    {sizeOptions.map((size) => {
                        const selected = isSelected('sizes', size);
                        return (
                            <button
                                key={size}
                                type="button"
                                onClick={() => toggleArrayFilter('sizes', size)}
                                className={cn(
                                    "rounded-xl border-2 px-3 py-2 text-xs font-medium transition-all",
                                    selected
                                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary-dark)] shadow-sm"
                                        : "border-gray-100 text-gray-500 hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5 hover:text-[var(--color-primary-dark)]"
                                )}
                            >
                                {size}
                            </button>
                        );
                    })}
                </div>
            </FilterSection>
        </motion.aside>
    );
};

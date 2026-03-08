import { useState, useCallback, useRef, useEffect, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    SlidersHorizontal,
    RotateCcw,
    X,
    Palette,
    Baby,
    Ruler,
    ChevronDown,
    Zap
} from 'lucide-react';
import type { FilterOptions } from '../types';
import { ageRanges } from '../data';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
    filters: FilterOptions;
    onFilterChange: (filters: FilterOptions) => void;
    onReset: () => void;
}

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

function FilterSection({
    title,
    icon: Icon,
    children,
    defaultOpen = true,
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="py-2">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between py-6 group"
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300",
                        isOpen ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-950"
                    )}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-950">{title}</span>
                </div>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 text-gray-300 transition-transform duration-500",
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
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="pb-8 pt-2">{children}</div>
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
    const [priceRange, setPriceRange] = useState<[number, number]>([
        filters.priceRange.min ?? 0,
        filters.priceRange.max ?? 1000,
    ]);

    const filterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const priceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
            if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
        };
    }, []);

    const isSelected = useCallback(
        (key: 'ages' | 'colors' | 'sizes', value: string) => {
            return filters[key].includes(value);
        },
        [filters]
    );

    const toggleArrayFilter = useCallback(
        (key: 'ages' | 'colors' | 'sizes', value: string) => {
            const currentArray = filters[key];
            const newArray = currentArray.includes(value)
                ? currentArray.filter((item) => item !== value)
                : [...currentArray, value];

            if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
            filterTimerRef.current = setTimeout(() => {
                onFilterChange({ ...filters, [key]: newArray });
            }, 100);
        },
        [filters, onFilterChange]
    );

    const handlePriceChange = useCallback(
        (value: number[]) => {
            setPriceRange([value[0], value[1]]);
            if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
            priceTimerRef.current = setTimeout(() => {
                onFilterChange({
                    ...filters,
                    priceRange: { min: value[0], max: value[1] },
                });
            }, 150);
        },
        [filters, onFilterChange]
    );

    const handleMinInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = parseInt(e.target.value) || 0;
            const clamped = Math.min(Math.max(val, 0), priceRange[1] - 10);
            setPriceRange([clamped, priceRange[1]]);
            if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
            priceTimerRef.current = setTimeout(() => {
                onFilterChange({ ...filters, priceRange: { min: clamped, max: priceRange[1] } });
            }, 300);
        },
        [filters, onFilterChange, priceRange]
    );

    const handleMaxInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = parseInt(e.target.value) || 1000;
            const clamped = Math.max(Math.min(val, 1000), priceRange[0] + 10);
            setPriceRange([priceRange[0], clamped]);
            if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
            priceTimerRef.current = setTimeout(() => {
                onFilterChange({ ...filters, priceRange: { min: priceRange[0], max: clamped } });
            }, 300);
        },
        [filters, onFilterChange, priceRange]
    );

    const activeFilterCount = filters.ages.length +
        filters.colors.length +
        filters.sizes.length +
        (filters.priceRange.min !== null && filters.priceRange.min !== 0 ? 1 : 0) +
        (filters.priceRange.max !== null && filters.priceRange.max !== 1000 ? 1 : 0);

    const filteredAgeRanges = ageRanges.filter((a) => a !== 'All');

    const handleReset = () => {
        setPriceRange([0, 1000]);
        onReset();
    };

    const activePills = [
        ...filters.ages.map(v => ({ key: 'ages' as const, value: v })),
        ...filters.colors.map(v => ({ key: 'colors' as const, value: v })),
        ...filters.sizes.map(v => ({ key: 'sizes' as const, value: v })),
    ];

    return (
        <motion.aside
            className="w-full space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-3">
                    <SlidersHorizontal className="h-5 w-5 text-gray-950" />
                    <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-950">Filters</h2>
                </div>
                {activeFilterCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-950 transition-all p-0"
                    >
                        <RotateCcw className="h-3 w-3 mr-2" />
                        Reset
                    </Button>
                )}
            </div>

            <AnimatePresence>
                {activePills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pb-6">
                        {activePills.map((pill) => (
                            <motion.button
                                key={`${pill.key}-${pill.value}`}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={() => toggleArrayFilter(pill.key, pill.value)}
                                className="inline-flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-950 hover:bg-gray-100 transition-all"
                            >
                                {pill.value}
                                <X className="h-3 w-3 text-gray-400" />
                            </motion.button>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <div className="space-y-2">
                <FilterSection title="Price" icon={Zap}>
                    <div className="space-y-8 pt-2">
                        <Slider
                            min={0}
                            max={1000}
                            step={10}
                            value={priceRange}
                            onValueChange={handlePriceChange}
                            className="w-full"
                        />
                        <div className="flex items-center gap-4">
                            <Input
                                type="number"
                                value={priceRange[0]}
                                onChange={handleMinInput}
                                className="h-10 rounded-xl border-gray-100 bg-gray-50 text-center text-[10px] font-black uppercase focus:bg-white focus:ring-0 transition-all"
                            />
                            <span className="text-gray-200">—</span>
                            <Input
                                type="number"
                                value={priceRange[1]}
                                onChange={handleMaxInput}
                                className="h-10 rounded-xl border-gray-100 bg-gray-50 text-center text-[10px] font-black uppercase focus:bg-white focus:ring-0 transition-all"
                            />
                        </div>
                    </div>
                </FilterSection>

                <Separator className="bg-gray-100/50" />

                <FilterSection title="Colors" icon={Palette}>
                    <div className="grid grid-cols-3 gap-3">
                        {colorOptions.map((color) => {
                            const selected = isSelected('colors', color.value);
                            return (
                                <button
                                    key={color.value}
                                    onClick={() => toggleArrayFilter('colors', color.value)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 rounded-xl border p-3 transition-all",
                                        selected
                                            ? "border-gray-950 bg-gray-950 text-white"
                                            : "border-gray-50 bg-gray-50/50 hover:border-gray-200"
                                    )}
                                >
                                    <div
                                        className={cn("h-6 w-6 rounded-full border border-white/20", color.border && "border-gray-200")}
                                        style={{ backgroundColor: color.color }}
                                    />
                                    <span className="text-[8px] font-black uppercase tracking-widest">{color.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </FilterSection>

                <Separator className="bg-gray-100/50" />

                <FilterSection title="Age" icon={Baby}>
                    <div className="grid gap-2">
                        {filteredAgeRanges.map((age) => {
                            const selected = isSelected('ages', age);
                            return (
                                <label
                                    key={age}
                                    className={cn(
                                        "flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all",
                                        selected
                                            ? "border-gray-950 bg-gray-950 text-white"
                                            : "border-gray-50 bg-gray-50/50 hover:border-gray-100"
                                    )}
                                >
                                    <Checkbox
                                        checked={selected}
                                        onCheckedChange={() => toggleArrayFilter('ages', age)}
                                        className={cn("h-4 w-4 border-2", selected ? "border-white bg-white text-gray-950" : "border-gray-200")}
                                    />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{age}</span>
                                </label>
                            );
                        })}
                    </div>
                </FilterSection>

                <Separator className="bg-gray-100/50" />

                <FilterSection title="Sizes" icon={Ruler}>
                    <div className="grid grid-cols-2 gap-2">
                        {sizeOptions.map((size) => {
                            const selected = isSelected('sizes', size);
                            return (
                                <button
                                    key={size}
                                    onClick={() => toggleArrayFilter('sizes', size)}
                                    className={cn(
                                        "h-12 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                                        selected
                                            ? "border-gray-950 bg-gray-950 text-white"
                                            : "border-gray-50 bg-white hover:border-gray-950"
                                    )}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </FilterSection>
            </div>
        </motion.aside>
    );
};

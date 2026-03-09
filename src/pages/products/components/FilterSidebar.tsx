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
                className="flex w-full items-center justify-between py-5 group"
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300",
                        isOpen ? "bg-amber-100 text-amber-600 shadow-sm shadow-amber-100" : "bg-primary-light/50 text-primary group-hover:bg-amber-50 group-hover:text-amber-500"
                    )}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold text-primary-dark tracking-tight">{title}</span>
                </div>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 text-primary-light transition-transform duration-500",
                        isOpen && "rotate-180 text-amber-500"
                    )}
                />
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
        const filterTimer = filterTimerRef.current;
        const priceTimer = priceTimerRef.current;
        return () => {
            if (filterTimer) clearTimeout(filterTimer);
            if (priceTimer) clearTimeout(priceTimer);
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

            onFilterChange({ ...filters, [key]: newArray });
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
            }, 500);
        },
        [filters, onFilterChange]
    );

    const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value) || 0;
        const clamped = Math.min(Math.max(val, 0), priceRange[1] - 10);
        setPriceRange([clamped, priceRange[1]]);
        if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
        priceTimerRef.current = setTimeout(() => {
            onFilterChange({ ...filters, priceRange: { min: clamped, max: priceRange[1] } });
        }, 500);
    };

    const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value) || 1000;
        const clamped = Math.max(Math.min(val, 1000), priceRange[0] + 10);
        setPriceRange([priceRange[0], clamped]);
        if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
        priceTimerRef.current = setTimeout(() => {
            onFilterChange({ ...filters, priceRange: { min: priceRange[0], max: clamped } });
        }, 500);
    };

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
            <div className="flex items-center justify-between pb-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shadow-sm shadow-amber-100/50">
                        <SlidersHorizontal className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold text-primary-dark tracking-tight leading-none">Filters</h2>
                        <p className="text-[11px] text-primary-light mt-1 font-medium italic">Tailored for your baby</p>
                    </div>
                </div>
                {activeFilterCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="h-9 rounded-full text-xs font-bold text-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-all px-4"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                    </Button>
                )}
            </div>

            <AnimatePresence>
                {activePills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pb-4 border-b border-primary-light/40">
                        {activePills.map((pill) => (
                            <motion.button
                                key={`${pill.key}-${pill.value}`}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                onClick={() => toggleArrayFilter(pill.key, pill.value)}
                                className="inline-flex items-center gap-2 rounded-full bg-amber-50/70 border border-amber-100/50 px-4 py-2 text-[11px] font-bold text-amber-700 hover:bg-amber-100 transition-all shadow-sm"
                            >
                                {pill.value}
                                <X className="h-3 w-3 text-amber-400" />
                            </motion.button>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <div className="space-y-2">
                {/* Price Section */}
                <FilterSection title="Price Range" icon={Zap}>
                    <div className="space-y-8 px-1 pt-2">
                        <Slider
                            min={0}
                            max={1000}
                            step={10}
                            value={priceRange}
                            onValueChange={handlePriceChange}
                            className="w-full"
                        />
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-light text-xs font-bold">$</span>
                                <Input
                                    type="number"
                                    value={priceRange[0]}
                                    onChange={handleMinInput}
                                    className="h-11 pl-7 rounded-2xl border-primary-light/40 bg-primary-light/5 text-sm font-bold text-primary-dark focus:bg-white focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all shadow-inner"
                                />
                            </div>
                            <span className="text-primary-light">—</span>
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-light text-xs font-bold">$</span>
                                <Input
                                    type="number"
                                    value={priceRange[1]}
                                    onChange={handleMaxInput}
                                    className="h-11 pl-7 rounded-2xl border-primary-light/40 bg-primary-light/5 text-sm font-bold text-primary-dark focus:bg-white focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all shadow-inner"
                                />
                            </div>
                        </div>
                    </div>
                </FilterSection>

                <Separator className="bg-primary-light/30 my-2" />

                {/* Colors Section */}
                <FilterSection title="Color Palette" icon={Palette}>
                    <div className="grid grid-cols-2 gap-3">
                        {colorOptions.map((color) => {
                            const selected = isSelected('colors', color.value);
                            return (
                                <button
                                    key={color.value}
                                    onClick={() => toggleArrayFilter('colors', color.value)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-[1.2rem] border px-4 py-3 transition-all text-left group",
                                        selected
                                            ? "border-amber-400 bg-amber-50/50 text-amber-700 shadow-[0_4px_12px_rgba(251,191,36,0.1)]"
                                            : "border-primary-light/40 bg-primary-light/5 hover:border-amber-200 hover:bg-amber-50/20"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "h-7 w-7 rounded-full border-2 border-white shadow-sm ring-1 ring-primary-light/30 transition-transform group-hover:scale-110",
                                            selected && "ring-amber-300"
                                        )}
                                        style={{ backgroundColor: color.color }}
                                    />
                                    <span className="text-xs font-bold text-primary-dark">{color.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </FilterSection>

                <Separator className="bg-primary-light/30 my-2" />

                {/* Age Section */}
                <FilterSection title="Baby Age" icon={Baby}>
                    <div className="space-y-2.5">
                        {filteredAgeRanges.map((age) => {
                            const selected = isSelected('ages', age);
                            return (
                                <label
                                    key={age}
                                    className={cn(
                                        "flex items-center gap-4 rounded-[1.2rem] border px-4 py-4 cursor-pointer transition-all group",
                                        selected
                                            ? "border-amber-100 bg-amber-50/30 text-amber-700"
                                            : "border-transparent bg-transparent hover:bg-primary-light/5"
                                    )}
                                >
                                    <Checkbox
                                        checked={selected}
                                        onCheckedChange={() => toggleArrayFilter('ages', age)}
                                        className={cn(
                                            "h-6 w-6 rounded-lg",
                                            selected ? "border-amber-400 bg-amber-400" : "border-primary-light group-hover:border-amber-300"
                                        )}
                                    />
                                    <span className="text-sm font-bold text-primary-dark">{age}</span>
                                </label>
                            );
                        })}
                    </div>
                </FilterSection>

                <Separator className="bg-primary-light/30 my-2" />

                {/* Sizes Section */}
                <FilterSection title="Comfort Sizes" icon={Ruler}>
                    <div className="grid grid-cols-2 gap-2.5">
                        {sizeOptions.map((size) => {
                            const selected = isSelected('sizes', size);
                            return (
                                <button
                                    key={size}
                                    onClick={() => toggleArrayFilter('sizes', size)}
                                    className={cn(
                                        "h-12 rounded-[1.2rem] border text-xs font-bold transition-all",
                                        selected
                                            ? "border-amber-400 bg-amber-400 text-amber-900 shadow-lg shadow-amber-100"
                                            : "border-primary-light/40 bg-white hover:border-amber-200 hover:text-amber-600 text-primary-light shadow-sm"
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

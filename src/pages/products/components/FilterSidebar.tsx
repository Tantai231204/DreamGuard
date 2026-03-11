import { useState, useCallback, useRef, useEffect, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    SlidersHorizontal,
    X,
    ChevronDown,
    AlertCircle
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
    children,
    defaultOpen = true,
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-slate-100 last:border-0 last:pb-0">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between py-6 group"
            >
                <span className="text-sm font-black text-slate-800 uppercase tracking-[0.15em]">{title}</span>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 text-slate-300 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
                        isOpen && "rotate-180 text-primary"
                    )}
                />
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="pb-8 pt-1">{children}</div>
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

    const priceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
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

            onFilterChange({ ...filters, [key]: newArray });
        },
        [filters, onFilterChange]
    );

    const handlePriceChange = useCallback((value: number[]) => {
        setPriceRange([value[0], value[1]]);
        if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
        priceTimerRef.current = setTimeout(() => {
            onFilterChange({
                ...filters,
                priceRange: { min: value[0], max: value[1] },
            });
        }, 300);
    }, [filters, onFilterChange]);

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

    return (
        <aside className="w-full bg-white rounded-[2rem] border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/5 rounded-2xl flex items-center justify-center">
                        <SlidersHorizontal className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">FILTER BY</h2>
                </div>
                {activeFilterCount > 0 && (
                    <button
                        onClick={handleReset}
                        className="text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-full transition-all border border-rose-100"
                    >
                        Reset
                    </button>
                )}
            </div>

            <div className="space-y-2">
                {/* Price Range */}
                <FilterSection title="Price Range">
                    <div className="space-y-8 px-1">
                        <Slider
                            min={0}
                            max={1000}
                            step={10}
                            value={priceRange}
                            onValueChange={handlePriceChange}
                            className="w-full py-4 [&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:border-4 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-xl [&_[role=slider]]:bg-primary"
                        />
                        <div className="grid grid-cols-[1fr_20px_1fr] items-center gap-2">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300">$</span>
                                <Input
                                    type="number"
                                    value={priceRange[0]}
                                    readOnly
                                    className="h-12 pl-8 pr-4 rounded-xl border-none bg-slate-50 text-sm font-black text-slate-600 shadow-inner"
                                />
                            </div>
                            <Separator className="w-4 bg-slate-200 justify-self-center" />
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300">$</span>
                                <Input
                                    type="number"
                                    value={priceRange[1]}
                                    readOnly
                                    className="h-12 pl-8 pr-4 rounded-xl border-none bg-slate-50 text-sm font-black text-slate-600 shadow-inner"
                                />
                            </div>
                        </div>
                    </div>
                </FilterSection>

                {/* Categories / Age Section */}
                <FilterSection title="Baby Age">
                    <div className="space-y-2">
                        {filteredAgeRanges.map((age) => {
                            const selected = isSelected('ages', age);
                            return (
                                <button
                                    key={age}
                                    onClick={() => toggleArrayFilter('ages', age)}
                                    className={cn(
                                        "flex w-full items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
                                        selected
                                            ? "bg-slate-900 text-white shadow-xl translate-x-1"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
                                    )}
                                >
                                    <div className={cn(
                                        "h-2 w-2 rounded-full transition-all duration-500",
                                        selected ? "bg-primary scale-150 ring-4 ring-primary/20" : "bg-slate-200 group-hover:bg-primary/40"
                                    )} />
                                    <span className="text-[13px] font-bold tracking-tight">{age}</span>
                                    {selected && <X className="ml-auto h-3 w-3 text-slate-400" />}
                                </button>
                            );
                        })}
                    </div>
                </FilterSection>

                {/* Colors Section */}
                <FilterSection title="Colors">
                    <div className="grid grid-cols-4 gap-3">
                        {colorOptions.map((color) => {
                            const selected = isSelected('colors', color.value);
                            return (
                                <button
                                    key={color.value}
                                    onClick={() => toggleArrayFilter('colors', color.value)}
                                    title={color.label}
                                    className={cn(
                                        "group flex flex-col items-center gap-2 p-1 transition-all",
                                        selected ? "scale-105" : "hover:scale-105"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "h-10 w-10 rounded-2xl border-4 transition-all flex items-center justify-center relative",
                                            selected
                                                ? "border-primary shadow-lg ring-4 ring-primary/5"
                                                : "border-white shadow-md hover:border-slate-50 shadow-slate-200/50"
                                        )}
                                        style={{ backgroundColor: color.color }}
                                    >
                                        {selected && (
                                            <div className={cn(
                                                "h-2 w-2 rounded-full",
                                                color.value === 'white' ? "bg-slate-900" : "bg-white"
                                            )} />
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity",
                                        selected ? "opacity-100 text-primary" : "text-slate-400"
                                    )}>
                                        {color.value}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </FilterSection>

                {/* Sizes Section */}
                <FilterSection title="Comfort Sizes">
                    <div className="grid grid-cols-2 gap-2">
                        {sizeOptions.map((size) => {
                            const selected = isSelected('sizes', size);
                            return (
                                <button
                                    key={size}
                                    onClick={() => toggleArrayFilter('sizes', size)}
                                    className={cn(
                                        "px-4 py-3 rounded-2xl border-2 text-[11px] font-black transition-all text-center leading-tight",
                                        selected
                                            ? "bg-slate-900 border-slate-900 text-white shadow-xl"
                                            : "bg-white border-slate-50 text-slate-400 hover:border-slate-200 hover:text-slate-900 shadow-sm"
                                    )}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </FilterSection>
            </div>

            {/* Price Alert / Warning */}
            {priceRange[0] >= priceRange[1] && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3"
                >
                    <AlertCircle className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] font-bold text-rose-600 leading-relaxed">
                        Invalid price range. Minimum cannot exceed maximum.
                    </p>
                </motion.div>
            )}
        </aside>
    );
};

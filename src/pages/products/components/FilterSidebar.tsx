import { useState, useCallback, useRef, useMemo, useEffect, type FC } from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RotateCcw, X } from 'lucide-react';
import type { FilterOptions } from '../types';
import { categories, materials, ageRanges } from '../data';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
    filters: FilterOptions;
    onFilterChange: (filters: FilterOptions) => void;
    onReset: () => void;
}

// Animation variants - moved outside component to prevent recreation
const sidebarVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.4 }
    }
};

const sectionVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.3 }
    })
};

// Static data - moved outside component with proper typing
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

export const FilterSidebar: FC<FilterSidebarProps> = ({
    filters,
    onFilterChange,
    onReset,
}) => {
    // Local price state for immediate UI feedback
    const [priceMin, setPriceMin] = useState<string>(
        filters.priceRange.min?.toString() ?? ''
    );
    const [priceMax, setPriceMax] = useState<string>(
        filters.priceRange.max?.toString() ?? ''
    );

    // Debounce timer refs
    const filterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const priceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
            if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
        };
    }, []);

    // Toggle array filter with debounce
    const toggleArrayFilter = useCallback((
        key: 'categories' | 'materials' | 'ages' | 'colors' | 'sizes',
        value: string
    ) => {
        const currentArray = filters[key];
        const newArray = currentArray.includes(value)
            ? currentArray.filter(item => item !== value)
            : [...currentArray, value];

        if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
        filterTimerRef.current = setTimeout(() => {
            onFilterChange({ ...filters, [key]: newArray });
        }, 300);
    }, [filters, onFilterChange]);

    // Handle price change with debounce
    const handlePriceMinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPriceMin(value);

        if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
        priceTimerRef.current = setTimeout(() => {
            onFilterChange({
                ...filters,
                priceRange: {
                    ...filters.priceRange,
                    min: value ? parseFloat(value) : null
                }
            });
        }, 500);
    }, [filters, onFilterChange]);

    const handlePriceMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPriceMax(value);

        if (priceTimerRef.current) clearTimeout(priceTimerRef.current);
        priceTimerRef.current = setTimeout(() => {
            onFilterChange({
                ...filters,
                priceRange: {
                    ...filters.priceRange,
                    max: value ? parseFloat(value) : null
                }
            });
        }, 500);
    }, [filters, onFilterChange]);

    // Memoized check function
    const isSelected = useCallback((
        key: 'categories' | 'materials' | 'ages' | 'colors' | 'sizes',
        value: string
    ) => filters[key].includes(value), [filters]);

    // Memoized active filter count
    const activeFilterCount = useMemo(() => (
        filters.categories.length +
        filters.materials.length +
        filters.ages.length +
        filters.colors.length +
        filters.sizes.length +
        (filters.priceRange.min !== null ? 1 : 0) +
        (filters.priceRange.max !== null ? 1 : 0)
    ), [filters]);

    // Memoized filtered arrays
    const filteredCategories = useMemo(
        () => categories.filter(c => c !== 'All'),
        []
    );
    const filteredMaterials = useMemo(
        () => materials.filter(m => m !== 'All'),
        []
    );
    const filteredAgeRanges = useMemo(
        () => ageRanges.filter(a => a !== 'All'),
        []
    );

    // Handle reset
    const handleReset = useCallback(() => {
        setPriceMin('');
        setPriceMax('');
        onReset();
    }, [onReset]);

    return (
        <motion.aside
            className="w-full space-y-6"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[var(--color-primary-dark)]">
                        Filter
                    </h2>
                    {activeFilterCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-semibold text-white">
                            {activeFilterCount}
                        </span>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-8 gap-1.5 text-xs text-gray-500 hover:text-[var(--color-primary)]"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                </Button>
            </div>

            {/* Active Filters Pills */}
            {activeFilterCount > 0 && (
                <motion.div
                    className="flex flex-wrap gap-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    {filters.categories.map(cat => (
                        <span
                            key={`cat-${cat}`}
                            className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-light)] px-2.5 py-1 text-xs font-medium text-[var(--color-primary-dark)]"
                        >
                            {cat}
                            <button
                                onClick={() => toggleArrayFilter('categories', cat)}
                                className="ml-0.5 rounded-full p-0.5 hover:bg-[var(--color-primary)]/20"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                    {filters.materials.map(mat => (
                        <span
                            key={`mat-${mat}`}
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700"
                        >
                            {mat}
                            <button
                                onClick={() => toggleArrayFilter('materials', mat)}
                                className="ml-0.5 rounded-full p-0.5 hover:bg-emerald-200"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                    {filters.ages.map(age => (
                        <span
                            key={`age-${age}`}
                            className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700"
                        >
                            {age}
                            <button
                                onClick={() => toggleArrayFilter('ages', age)}
                                className="ml-0.5 rounded-full p-0.5 hover:bg-amber-200"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                    {filters.colors.map(color => (
                        <span
                            key={`color-${color}`}
                            className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700"
                        >
                            {color}
                            <button
                                onClick={() => toggleArrayFilter('colors', color)}
                                className="ml-0.5 rounded-full p-0.5 hover:bg-purple-200"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                    {filters.sizes.map(size => (
                        <span
                            key={`size-${size}`}
                            className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700"
                        >
                            {size}
                            <button
                                onClick={() => toggleArrayFilter('sizes', size)}
                                className="ml-0.5 rounded-full p-0.5 hover:bg-rose-200"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </motion.div>
            )}

            {/* Category Section */}
            <motion.div
                className="space-y-3"
                variants={sectionVariants}
                custom={0}
            >
                <h3 className="text-sm font-semibold text-gray-800">Category</h3>
                <div className="space-y-1">
                    {filteredCategories.map((category) => (
                        <label
                            key={category}
                            htmlFor={`category-${category}`}
                            className={cn(
                                "flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition-all",
                                isSelected('categories', category)
                                    ? "bg-[var(--color-primary-light)] border border-[var(--color-primary)]/30"
                                    : "hover:bg-gray-50 border border-transparent"
                            )}
                        >
                            <Checkbox
                                id={`category-${category}`}
                                checked={isSelected('categories', category)}
                                onChange={() => toggleArrayFilter('categories', category)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <span
                                className={cn(
                                    "text-sm",
                                    isSelected('categories', category)
                                        ? "font-medium text-[var(--color-primary-dark)]"
                                        : "text-gray-600"
                                )}
                            >
                                {category}
                            </span>
                        </label>
                    ))}
                </div>
            </motion.div>

            <div className="h-px bg-gray-100" />

            {/* Color Section */}
            <motion.div
                className="space-y-3"
                variants={sectionVariants}
                custom={1}
            >
                <h3 className="text-sm font-semibold text-gray-800">Color</h3>
                <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                        <motion.button
                            key={color.value}
                            type="button"
                            onClick={() => toggleArrayFilter('colors', color.value)}
                            className={cn(
                                "group relative flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                                isSelected('colors', color.value)
                                    ? "bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] ring-2 ring-[var(--color-primary)]"
                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span
                                className={cn(
                                    "h-4 w-4 rounded-full",
                                    color.border && "border border-gray-300"
                                )}
                                style={{ backgroundColor: color.color }}
                            />
                            {color.label}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            <div className="h-px bg-gray-100" />

            {/* Price Range Section */}
            <motion.div
                className="space-y-3"
                variants={sectionVariants}
                custom={2}
            >
                <h3 className="text-sm font-semibold text-gray-800">Price</h3>
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Input
                            type="number"
                            placeholder="Min"
                            value={priceMin}
                            onChange={handlePriceMinChange}
                            className="h-10 rounded-lg border-gray-200 pl-7 text-sm"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                    </div>
                    <span className="text-gray-300">—</span>
                    <div className="relative flex-1">
                        <Input
                            type="number"
                            placeholder="Max"
                            value={priceMax}
                            onChange={handlePriceMaxChange}
                            className="h-10 rounded-lg border-gray-200 pl-7 text-sm"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                    </div>
                </div>
            </motion.div>

            <div className="h-px bg-gray-100" />

            {/* Material Section */}
            <motion.div
                className="space-y-3"
                variants={sectionVariants}
                custom={3}
            >
                <h3 className="text-sm font-semibold text-gray-800">Material</h3>
                <div className="space-y-1">
                    {filteredMaterials.map((material) => (
                        <label
                            key={material}
                            htmlFor={`material-${material}`}
                            className={cn(
                                "flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition-all",
                                isSelected('materials', material)
                                    ? "bg-[var(--color-primary-light)] border border-[var(--color-primary)]/30"
                                    : "hover:bg-gray-50 border border-transparent"
                            )}
                        >
                            <Checkbox
                                id={`material-${material}`}
                                checked={isSelected('materials', material)}
                                onChange={() => toggleArrayFilter('materials', material)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <span
                                className={cn(
                                    "text-sm",
                                    isSelected('materials', material)
                                        ? "font-medium text-[var(--color-primary-dark)]"
                                        : "text-gray-600"
                                )}
                            >
                                {material}
                            </span>
                        </label>
                    ))}
                </div>
            </motion.div>

            <div className="h-px bg-gray-100" />

            {/* Age Range Section */}
            <motion.div
                className="space-y-3"
                variants={sectionVariants}
                custom={4}
            >
                <h3 className="text-sm font-semibold text-gray-800">Age Range</h3>
                <div className="space-y-1">
                    {filteredAgeRanges.map((age) => (
                        <label
                            key={age}
                            htmlFor={`age-${age}`}
                            className={cn(
                                "flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition-all",
                                isSelected('ages', age)
                                    ? "bg-[var(--color-primary-light)] border border-[var(--color-primary)]/30"
                                    : "hover:bg-gray-50 border border-transparent"
                            )}
                        >
                            <Checkbox
                                id={`age-${age}`}
                                checked={isSelected('ages', age)}
                                onChange={() => toggleArrayFilter('ages', age)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <span
                                className={cn(
                                    "text-sm",
                                    isSelected('ages', age)
                                        ? "font-medium text-[var(--color-primary-dark)]"
                                        : "text-gray-600"
                                )}
                            >
                                {age}
                            </span>
                        </label>
                    ))}
                </div>
            </motion.div>

            <div className="h-px bg-gray-100" />

            {/* Size Section */}
            <motion.div
                className="space-y-3"
                variants={sectionVariants}
                custom={5}
            >
                <h3 className="text-sm font-semibold text-gray-800">Size</h3>
                <div className="grid grid-cols-2 gap-2">
                    {sizeOptions.map((size) => (
                        <motion.button
                            key={size}
                            type="button"
                            onClick={() => toggleArrayFilter('sizes', size)}
                            className={cn(
                                "rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                                isSelected('sizes', size)
                                    ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]"
                                    : "border-gray-200 text-gray-600 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]/30 hover:text-[var(--color-primary-dark)]"
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {size}
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        </motion.aside>
    );
};

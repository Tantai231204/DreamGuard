import { useState, useCallback, useRef, useEffect, type FC } from 'react';
import { Slider } from '@/components/ui/slider';
import { SlidersHorizontal, ChevronDown, Check } from 'lucide-react';
import type { ComboFilterOptions } from '../types';
import { ageRanges } from '../../products/data'; // SYNC age ranges with products
import { cn } from '@/lib/utils';

interface ComboFilterSidebarProps {
    filters: ComboFilterOptions;
    onFilterChange: (filters: ComboFilterOptions) => void;
    onReset: () => void;
}

const colorOptions = [
    { value: 'white', label: 'White', hex: '#FFFFFF', border: true },
    { value: 'pink', label: 'Pink', hex: '#F9A8D4' },
    { value: 'blue', label: 'Blue', hex: '#93C5FD' },
    { value: 'cream', label: 'Cream', hex: '#FEF3C7' },
    { value: 'mint', label: 'Mint', hex: '#A7F3D0' },
    { value: 'grey', label: 'Grey', hex: '#D1D5DB' },
];

const sizeOptions = ['Newborn', 'S (0-6M)', 'M (6-12M)', 'L (1-2Y)', 'XL (2Y+)'];

function Section({ title, children, defaultOpen = true }: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="py-2">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between py-3 text-left group"
            >
                <span className="text-[12px] font-bold text-slate-800 uppercase tracking-wider group-hover:text-[#4988c4] transition-colors font-inter">
                    {title}
                </span>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 text-slate-300 transition-transform duration-300 ease-in-out",
                        open && "rotate-180 text-[#4988c4]"
                    )}
                />
            </button>
            {open && (
                <div className="pb-4 animate-in fade-in slide-in-from-top-1 duration-300">
                    {children}
                </div>
            )}
        </div>
    );
}

export const ComboFilterSidebar: FC<ComboFilterSidebarProps> = ({ filters, onFilterChange, onReset }) => {
    const [priceRange, setPriceRange] = useState<[number, number]>([
        filters.priceRange.min ?? 0,
        filters.priceRange.max ?? 500,
    ]);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

    const isSelected = useCallback(
        (key: 'ages' | 'colors' | 'sizes', value: string) => filters[key].includes(value),
        [filters]
    );

    const toggle = useCallback(
        (key: 'ages' | 'colors' | 'sizes', value: string) => {
            const arr = filters[key];
            onFilterChange({
                ...filters,
                [key]: arr.includes(value) ? arr.filter((v: string) => v !== value) : [...arr, value],
            });
        },
        [filters, onFilterChange]
    );

    const handlePrice = useCallback((value: number[]) => {
        setPriceRange([value[0], value[1]]);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            onFilterChange({ ...filters, priceRange: { min: value[0], max: value[1] } });
        }, 250);
    }, [filters, onFilterChange]);

    const handleReset = () => { setPriceRange([0, 500]); onReset(); };

    const activeCount =
        filters.ages.length +
        filters.colors.length +
        filters.sizes.length +
        (filters.priceRange.min ? 1 : 0) +
        (filters.priceRange.max && filters.priceRange.max !== 500 ? 1 : 0);

    const filteredAges = ageRanges.filter(a => a !== 'All');

    return (
        <aside className="w-full space-y-6">
            <div className="flex flex-col gap-1 px-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#4988c4]/10 rounded-lg">
                            <SlidersHorizontal className="h-4 w-4 text-[#4988c4]" />
                        </div>
                        <h2 className="text-[14px] font-black text-slate-900 uppercase tracking-widest font-inter">
                            Refine Bundles
                        </h2>
                    </div>
                    {activeCount > 0 && (
                        <button
                            onClick={handleReset}
                            className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-tighter px-2 py-1 bg-rose-50 rounded-md transition-colors"
                        >
                            Reset ({activeCount})
                        </button>
                    )}
                </div>
                <p className="text-[11px] text-slate-400 font-medium pl-10">
                    Find the perfect set for your baby
                </p>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-2 divide-y divide-slate-50">
                <Section title="Price Range">
                    <div className="space-y-6 px-1 pt-2">
                        <Slider
                            min={0}
                            max={500}
                            step={5}
                            value={priceRange}
                            onValueChange={handlePrice}
                            className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:border-4 [&_[role=slider]]:border-white [&_[role=slider]]:bg-[#4988c4] [&_[role=slider]]:shadow-lg active:[&_[role=slider]]:scale-90"
                        />
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 flex flex-col gap-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase pl-1">Min</span>
                                <div className="bg-slate-50 rounded-xl px-4 py-2 border border-slate-100 flex items-baseline gap-1 font-black">
                                    <span className="text-[14px] text-slate-700 tabular-nums">{priceRange[0]}.000</span>
                                    <span className="text-[10px] text-slate-300 font-bold">VNĐ</span>
                                </div>
                            </div>
                            <div className="pt-4 text-slate-200">—</div>
                            <div className="flex-1 flex flex-col gap-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase pl-1">Max</span>
                                <div className="bg-slate-50 rounded-xl px-4 py-2 border border-slate-100 flex items-baseline gap-1 font-black">
                                    <span className="text-[14px] text-slate-700 tabular-nums">{priceRange[1]}.000</span>
                                    <span className="text-[10px] text-slate-300 font-bold">VNĐ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>

                <Section title="Baby Age">
                    <div className="grid grid-cols-1 gap-1 pt-1">
                        {filteredAges.map((age) => {
                            const selected = isSelected('ages', age);
                            return (
                                <button
                                    key={age}
                                    onClick={() => toggle('ages', age)}
                                    className={cn(
                                        "flex w-full items-center justify-between px-3 py-2.5 rounded-xl text-[13px] transition-all group",
                                        selected
                                            ? "text-[#4988c4] bg-[#4988c4]/5 font-bold translate-x-1"
                                            : "text-slate-600 hover:bg-slate-50 hover:translate-x-1 font-medium"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-1.5 w-1.5 rounded-full transition-all",
                                            selected ? "bg-[#4988c4] scale-150 shadow-[0_0_8px_rgba(73,136,196,0.5)]" : "bg-slate-200"
                                        )} />
                                        <span>{age}</span>
                                    </div>
                                    {selected && <Check className="h-3.5 w-3.5 text-[#4988c4]" />}
                                </button>
                            );
                        })}
                    </div>
                </Section>

                <Section title="Bundle Color">
                    <div className="grid grid-cols-3 gap-2 pt-2">
                        {colorOptions.map((color) => {
                            const selected = isSelected('colors', color.value);
                            return (
                                <button
                                    key={color.value}
                                    onClick={() => toggle('colors', color.value)}
                                    className={cn(
                                        "flex items-center gap-2 p-1.5 rounded-xl border transition-all",
                                        selected
                                            ? "border-[#4988c4] bg-[#4988c4]/5 shadow-sm"
                                            : "border-slate-50 hover:border-slate-200 bg-white"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "h-5 w-5 rounded-full shadow-sm flex items-center justify-center",
                                            color.border && "border border-slate-100"
                                        )}
                                        style={{ backgroundColor: color.hex }}
                                    >
                                        {selected && <Check className="h-2.5 w-2.5 text-slate-800" strokeWidth={4} />}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-tighter truncate",
                                        selected ? "text-[#4988c4]" : "text-slate-400"
                                    )}>
                                        {color.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </Section>

                <Section title="Sizes">
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        {sizeOptions.map((size) => {
                            const selected = isSelected('sizes', size);
                            return (
                                <button
                                    key={size}
                                    onClick={() => toggle('sizes', size)}
                                    className={cn(
                                        "py-2.5 px-2 rounded-xl border-2 text-[11px] font-black tracking-tight text-center transition-all",
                                        selected
                                            ? "bg-slate-950 border-slate-950 text-white shadow-lg -translate-y-0.5"
                                            : "bg-white border-slate-50 text-slate-400 hover:border-slate-200 hover:text-slate-900 shadow-sm"
                                    )}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </Section>
            </div>
        </aside>
    );
};

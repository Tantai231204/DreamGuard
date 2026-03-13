import { Search, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { ComboFilterOptions } from '../types';

interface Props {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    filters: ComboFilterOptions;
    onFilterChange: (newFilters: ComboFilterOptions) => void;
    onSearch: (e: React.FormEvent) => void;
}

const sortOptions = [
    { label: 'Featured', value: 'default' },
    { label: 'Newest Arrivals', value: 'newest' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Top Rated', value: 'rating' },
];

export const ComboSearchBar = ({ searchQuery, setSearchQuery, filters, onFilterChange, onSearch }: Props) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-2 sm:p-3 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100"
        >
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-light/70 group-focus-within:text-amber-400 transition-colors" />
                <form onSubmit={onSearch}>
                    <Input
                        type="text"
                        placeholder="Search for exclusive bundles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-12 w-full border-0 bg-transparent pl-11 text-sm font-semibold tracking-tight focus-visible:ring-0 placeholder:text-primary-light/50 placeholder:font-medium text-primary-dark"
                    />
                </form>
            </div>

            <div className="flex items-center gap-4 px-2">
                <div className="h-8 w-[1px] bg-primary-light/20 hidden sm:block" />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-12 gap-3 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-[#4988c4] rounded-xl px-4 transition-all group">
                            <span className="text-slate-400 font-medium mr-1 group-hover:text-[#4988c4] transition-colors">Sort by:</span>
                            {sortOptions.find((opt) => opt.value === filters.sortBy)?.label || 'Featured'}
                            <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-data-[state=open]:rotate-180" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-2xl border-slate-100 bg-white/95 backdrop-blur-md">
                        {sortOptions.map((option) => (
                            <DropdownMenuItem
                                key={option.value}
                                onClick={() => onFilterChange({ ...filters, sortBy: option.value as ComboFilterOptions['sortBy'] })}
                                className={cn(
                                    "rounded-lg px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all mb-1 last:mb-0",
                                    filters.sortBy === option.value
                                        ? "bg-[#4988c4] text-white"
                                        : "text-slate-600 hover:bg-blue-50 hover:text-[#4988c4]"
                                )}
                            >
                                {option.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.div>
    );
};

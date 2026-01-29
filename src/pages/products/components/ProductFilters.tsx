import type { FC } from 'react';
import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { FilterOptions } from '../types';
import { categories, materials, ageRanges, sortOptions } from '../data';

interface ProductFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onSearch: (query: string) => void;
  totalResults: number;
}

export const ProductFilters: FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  onSearch,
  totalResults,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const updateFilter = (key: keyof FilterOptions, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </form>
        <Button
          type="button"
          variant="outline"
          onClick={handleSearchSubmit}
          className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Material Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[140px] justify-between">
              <span className="text-gray-600">
                {filters.material === 'All' ? 'Select Material' : filters.material}
              </span>
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[180px]">
            {materials.map((material) => (
              <DropdownMenuItem
                key={material}
                onClick={() => updateFilter('material', material)}
                className="cursor-pointer"
              >
                {material}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Age Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[140px] justify-between">
              <span className="text-gray-600">
                {filters.age === 'All' ? 'Select Age' : filters.age}
              </span>
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[180px]">
            {ageRanges.map((age) => (
              <DropdownMenuItem
                key={age}
                onClick={() => updateFilter('age', age)}
                className="cursor-pointer"
              >
                {age}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Category Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[160px] justify-between">
              <span className="text-gray-600">
                {filters.category === 'All' ? 'Select Category' : filters.category}
              </span>
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[180px]">
            {categories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => updateFilter('category', category)}
                className="cursor-pointer"
              >
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Advanced Filter Button */}
        <Button
          variant="outline"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Advance Filter</span>
        </Button>

        {/* Apply Filter Button */}
        <Button className="bg-blue-600 hover:bg-blue-700">Filter</Button>
      </div>

      {/* Sorting and Results Count */}
      <div className="flex items-center justify-between border-t pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[180px] justify-between">
              <span className="text-gray-600">
                {sortOptions.find((opt) => opt.value === filters.sortBy)?.label ||
                  'Default sorting'}
              </span>
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => updateFilter('sortBy', option.value)}
                className="cursor-pointer"
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <p className="text-sm text-gray-600">
          Showing 1-9 of {totalResults} results
        </p>
      </div>
    </div>
  );
};

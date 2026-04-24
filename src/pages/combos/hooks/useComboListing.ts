import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePublicCombos } from '@/hooks/queries/useCombo';
import { useDebounce } from '@/hooks/useDebounce';
import type { Combo, ComboFilterOptions } from '../types';

const ITEMS_PER_PAGE = 12;

const initialFilters: ComboFilterOptions = {
    ages: [],
    colors: [],
    sizes: [],
    priceRange: { min: 0, max: 100000000 }, // Use a high max value (e.g., 100M VND) to avoid filtering out all items by default
    sortBy: 'default',
};

export function useComboListing() {
    const [searchParams] = useSearchParams();
    const urlQuery = searchParams.get('q') || '';
    const [searchQuery, setSearchQuery] = useState(urlQuery);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<ComboFilterOptions>(initialFilters);
    
    // API Fetch - Fetch a large page to allow client-side filtering by attributes
    const { data: comboResponse, isLoading } = usePublicCombos({
        pageNumber: 1,
        pageSize: 1000,
    });

    const allCombos = useMemo(() => {
        // Handle different API response structures (direct items or nested data.items)
        const responseData = (comboResponse as unknown as { data?: typeof comboResponse })?.data || comboResponse;
        if (!responseData?.items) return [] as Combo[];
        return responseData.items as unknown as Combo[];
    }, [comboResponse]);

    const debouncedSearchQuery = useDebounce(searchQuery, 400);

    const filteredCombos = useMemo(() => {
        let result = [...allCombos];

        if (debouncedSearchQuery) {
            const query = debouncedSearchQuery.toLowerCase();
            result = result.filter(
                (combo) =>
                    combo.name.toLowerCase().includes(query) ||
                    combo.description?.toLowerCase().includes(query) ||
                    combo.color?.toLowerCase().includes(query) ||
                    combo.size?.toLowerCase().includes(query) ||
                    combo.category?.toLowerCase().includes(query) ||
                    combo.sku?.toLowerCase().includes(query)
            );
        }

        // Apply other filters (ages, colors, sizes, priceRange)
        if (filters.ages.length > 0) {
            result = result.filter(c => c.ageGroup && filters.ages.includes(c.ageGroup.toString()));
        }
        if (filters.colors.length > 0) {
            result = result.filter(c => c.color && filters.colors.includes(c.color));
        }
        if (filters.sizes.length > 0) {
            result = result.filter(c => c.size && filters.sizes.includes(c.size));
        }
        if (filters.priceRange.min !== null && filters.priceRange.min !== undefined) {
            result = result.filter(c => c.salePrice >= filters.priceRange.min!);
        }
        if (filters.priceRange.max !== null && filters.priceRange.max !== undefined) {
            result = result.filter(c => c.salePrice <= filters.priceRange.max!);
        }

        // Apply sorting
        switch (filters.sortBy) {
            case 'price-asc':
                result.sort((a, b) => a.salePrice - b.salePrice);
                break;
            case 'price-desc':
                result.sort((a, b) => b.salePrice - a.salePrice);
                break;
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'rating':
                result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
                break;
        }

        return result;
    }, [allCombos, debouncedSearchQuery, filters]);

    const totalPages = Math.max(1, Math.ceil(filteredCombos.length / ITEMS_PER_PAGE));
    const effectivePage = Math.min(currentPage, totalPages);

    const paginatedCombos = useMemo(() => {
        const start = (effectivePage - 1) * ITEMS_PER_PAGE;
        return filteredCombos.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredCombos, effectivePage]);

    const handleFilterChange = useCallback((newFilters: ComboFilterOptions) => {
        setFilters(newFilters);
        setCurrentPage(1);
    }, []);

    const handleResetFilters = useCallback(() => {
        setFilters(initialFilters);
        setSearchQuery('');
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    }, []);

    return {
        combos: paginatedCombos,
        totalCount: filteredCombos.length,
        totalPages,
        isLoading,
        searchQuery,
        setSearchQuery,
        currentPage: effectivePage,
        filters,
        handleFilterChange,
        handleResetFilters,
        handlePageChange,
        handleSearch
    };
}

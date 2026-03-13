import { useState, useMemo } from 'react';
import { usePublicCombos } from '@/hooks/queries/useCombo';
import type { Combo, ComboFilterOptions } from '../types';

const ITEMS_PER_PAGE = 12;

const initialFilters: ComboFilterOptions = {
    ages: [],
    colors: [],
    sizes: [],
    priceRange: { min: 0, max: 500 },
    sortBy: 'default',
};

export function useComboListing() {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<ComboFilterOptions>(initialFilters);
    
    // API Fetch
    const { data: comboResponse, isLoading } = usePublicCombos({
        pageNumber: currentPage,
        pageSize: ITEMS_PER_PAGE,
        name: searchQuery || undefined
    });

    const combos = useMemo(() => {
        if (!comboResponse?.items) return [] as Combo[];
        // Map the items to match our UI Combo type, allowing for missing fields in paginated results if any
        return comboResponse.items as unknown as Combo[];
    }, [comboResponse]);

    const handleFilterChange = (newFilters: ComboFilterOptions) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setFilters(initialFilters);
        setSearchQuery('');
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    return {
        combos,
        comboResponse,
        isLoading,
        searchQuery,
        setSearchQuery,
        currentPage,
        filters,
        handleFilterChange,
        handleResetFilters,
        handlePageChange,
        handleSearch
    };
}

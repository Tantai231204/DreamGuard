import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FilterSidebar } from './components/FilterSidebar';
import { ProductGrid } from './components/ProductGrid';
import { Pagination } from './components/Pagination';
import type { FilterOptions } from './types';
import { mockProducts, sortOptions } from './data';
import { useEffect } from 'react';
import { useBreadcrumb } from '@/components/common/breadcrumb/useBreadcrumb';

const ITEMS_PER_PAGE = 9;

// Default filter state
const defaultFilters: FilterOptions = {
    materials: [],
    ages: [],
    categories: [],
    colors: [],
    sizes: [],
    priceRange: { min: null, max: null },
    sortBy: 'default',
};

// Animation variants
const pageVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.4 }
    }
};

export default function ProductsPage() {
    const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let result = [...mockProducts];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (product) =>
                    product.name.toLowerCase().includes(query) ||
                    product.category.toLowerCase().includes(query)
            );
        }

        // Apply category filter (multi-select)
        if (filters.categories.length > 0) {
            result = result.filter((product) =>
                filters.categories.includes(product.category)
            );
        }

        // Apply material filter (multi-select)
        if (filters.materials.length > 0) {
            result = result.filter((product) =>
                product.material && filters.materials.includes(product.material)
            );
        }

        // Apply age filter (multi-select)
        if (filters.ages.length > 0) {
            result = result.filter((product) =>
                product.ageRange && filters.ages.includes(product.ageRange)
            );
        }

        // Apply price range filter
        if (filters.priceRange.min !== null) {
            result = result.filter((product) => product.price >= filters.priceRange.min!);
        }
        if (filters.priceRange.max !== null) {
            result = result.filter((product) => product.price <= filters.priceRange.max!);
        }

        // Apply sorting
        switch (filters.sortBy) {
            case 'price-asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
                break;
            case 'rating':
                result.sort((a, b) => b.rating - a.rating);
                break;
            default:
                break;
        }

        return result;
    }, [filters, searchQuery]);

    // Paginate products
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    // Handlers
    const handleFilterChange = useCallback((newFilters: FilterOptions) => {
        setFilters(newFilters);
        setCurrentPage(1);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddToCart = (productId: string) => {
        console.log('Add to cart:', productId);
    };

    const handleResetFilters = useCallback(() => {
        setFilters(defaultFilters);
        setSearchQuery('');
    }, []);

    const { setItems: setBreadcrumb } = useBreadcrumb();
    useEffect(() => {
        setBreadcrumb([
            { label: 'Home', href: '/' },
            { label: 'Products', active: true },
        ]);
        return () => setBreadcrumb([]);
    }, [setBreadcrumb]);
    return (
        <motion.div
            className="min-h-screen bg-gray-50/50"
            variants={pageVariants}
            initial="initial"
            animate="animate"
        >
            <div className="container mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Sidebar Filter */}
                    <aside className="hidden w-64 shrink-0 lg:block">
                        <div className="sticky top-24 rounded-2xl bg-white p-5 shadow-sm">
                            <FilterSidebar
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onReset={handleResetFilters}
                            />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {/* Header */}
                        <motion.div
                            className="mb-6"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-[var(--color-primary-dark)]">
                                        Baby Bedding
                                    </h1>
                                    <p className="mt-1 text-sm text-gray-500">
                                        <span className="font-medium text-[var(--color-primary)]">{filteredProducts.length}</span> products found
                                    </p>
                                </div>

                                {/* Sort Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="h-10 min-w-[160px] justify-between rounded-xl border-gray-200 px-4 bg-white"
                                        >
                                            <span className="text-sm text-gray-600">
                                                Sort by: <span className="font-medium text-gray-800">
                                                    {sortOptions.find((opt) => opt.value === filters.sortBy)?.label || 'Popular'}
                                                </span>
                                            </span>
                                            <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[180px] rounded-xl p-1.5">
                                        {sortOptions.map((option) => (
                                            <DropdownMenuItem
                                                key={option.value}
                                                onClick={() => handleFilterChange({ ...filters, sortBy: option.value as FilterOptions['sortBy'] })}
                                                className={`cursor-pointer rounded-lg px-3 py-2 text-sm ${filters.sortBy === option.value
                                                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]'
                                                    : ''
                                                    }`}
                                            >
                                                {option.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </motion.div>

                        {/* Search Bar - Mobile/Desktop */}
                        <motion.div
                            className="mb-6"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            <form onSubmit={handleSearch} className="relative">
                                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search baby mattresses, blankets, pillows..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-11 rounded-xl border-gray-200 bg-white pl-11 pr-4 text-sm shadow-sm transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                />
                            </form>
                        </motion.div>

                        {/* Products Grid */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <ProductGrid
                                products={paginatedProducts}
                                onAddToCart={handleAddToCart}
                                onResetFilters={handleResetFilters}
                            />
                        </motion.div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <motion.div
                                className="mt-10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </motion.div>
                        )}
                    </main>
                </div>
            </div>
        </motion.div>
    );
}

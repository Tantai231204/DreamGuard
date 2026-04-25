import { useState, useMemo, useCallback, useEffect } from 'react';
import { ChevronDown, Search, Sparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';

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
import { sortOptions } from './data';
import { useBreadcrumb } from '@/components/common/BreadcrumbNav';
import { useProductsByFilter, productKeys } from '@/hooks/queries/useProduct';
import { useCategories } from '@/hooks/queries/useCategory';
import type { ProductResponse } from '@/api/types/product.types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useQueries } from '@tanstack/react-query';
import { productService } from '@/api';

const ITEMS_PER_PAGE = 9;

const defaultFilters: FilterOptions = {
    ages: [],
    colors: [],
    sizes: [],
    priceRange: { min: null, max: null },
    sortBy: 'default',
};

import { mapToProduct, type ProductExtended } from './utils';

export default function ProductsPage() {
    const [searchParams] = useSearchParams();
    const urlCateId = searchParams.get('cateId');
    const urlCategoryName = searchParams.get('categoryName');
    const urlMaterialName = searchParams.get('materialName');
    const urlQuery = searchParams.get('q') || '';

    const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
    const [searchQuery, setSearchQuery] = useState(urlQuery);
    const [currentPage, setCurrentPage] = useState(1);

    const { data: categories = [] } = useCategories();

    // Flatten all category IDs (including children) to ensure we fetch everything
    const allCategoryIds = useMemo(() => {
        const ids = new Set<number>();
        categories.forEach(cat => {
            ids.add(cat.cateId);
            cat.childCategoryList?.forEach(child => ids.add(child.cateId));
        });
        return Array.from(ids);
    }, [categories]);

    // 1. Fetch products. If no cateId is provided, we fetch from all category IDs in parallel.
    const allCategoryQueries = useQueries({
        queries: allCategoryIds.map(id => ({
            queryKey: productKeys.byFilter({ cateId: id, pageSize: 200 }),
            queryFn: () => productService.getByFilter({ cateId: id, pageSize: 200 }),
            staleTime: 5 * 60 * 1000,
            enabled: !urlCateId && allCategoryIds.length > 0,
        }))
    });

    // 2. Fetch specific category products if cateId is provided
    const { data: specificCategoryProducts = [], isLoading: isLoadingSpecific } = useProductsByFilter(
        { cateId: urlCateId ? Number(urlCateId) : undefined, pageSize: 1000 },
        !!urlCateId
    );

    const isLoading = urlCateId ? isLoadingSpecific : (allCategoryQueries.some(q => q.isLoading) || categories.length === 0);

    const categoryName = useMemo(() => {
        if (!urlCateId) return null;
        const cat = categories.find(c => c.cateId === Number(urlCateId));
        return cat?.name || null;
    }, [urlCateId, categories]);

    const products: ProductExtended[] = useMemo(() => {
        let rawProducts: ProductResponse[] = [];
        
        if (urlCateId) {
            // Robust check for specific category response
            if (Array.isArray(specificCategoryProducts)) {
                rawProducts = specificCategoryProducts;
            } else {
                const responseObj = specificCategoryProducts as unknown as { items?: ProductResponse[] };
                rawProducts = responseObj?.items || [];
            }
        } else {
            // Merge all products from all categories
            const merged = allCategoryQueries.flatMap(q => {
                const data = q.data;
                if (!data) return [];
                if (Array.isArray(data)) return data;
                const responseObj = data as unknown as { items?: ProductResponse[] };
                return responseObj?.items || [];
            });
            
            // Deduplicate by ID
            const seen = new Set<string>();
            rawProducts = merged.filter(p => {
                if (!p?.id || seen.has(p.id)) return false;
                seen.add(p.id);
                return true;
            });
        }
        
        return rawProducts.map(mapToProduct);
    }, [urlCateId, specificCategoryProducts, allCategoryQueries]);

    const debouncedSearchQuery = useDebounce(searchQuery, 400);

    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (debouncedSearchQuery) {
            const query = debouncedSearchQuery.toLowerCase();
            result = result.filter(
                (product) =>
                    product.name.toLowerCase().includes(query) ||
                    product.category.toLowerCase().includes(query) ||
                    product.material?.toLowerCase().includes(query) ||
                    product.summary?.toLowerCase().includes(query) ||
                    product.ageRange?.toLowerCase().includes(query)
            );
        }

        if (filters.ages.length > 0) {
            result = result.filter((product) =>
                product.ageRange && filters.ages.includes(product.ageRange)
            );
        }

        if (filters.colors.length > 0) {
            result = result.filter((product) =>
                product.colors.some(c => filters.colors.map(fc => fc.toLowerCase()).includes(c.toLowerCase()))
            );
        }

        if (filters.sizes.length > 0) {
            result = result.filter((product) =>
                product.sizes.some(s => filters.sizes.includes(s))
            );
        }

        // Price range in filters is in "k" (e.g. 100 = 100,000)
        if (filters.priceRange.min !== null) {
            result = result.filter((product) => product.price >= filters.priceRange.min! * 1000);
        }
        if (filters.priceRange.max !== null) {
            result = result.filter((product) => product.price <= filters.priceRange.max! * 1000);
        }

        switch (filters.sortBy) {
            case 'price-asc':
                result.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'price-desc':
                result.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'newest':
                result.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0).getTime();
                    const dateB = new Date(b.createdAt || 0).getTime();
                    return dateB - dateA;
                });
                break;
            case 'rating':
                result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            default:
                // If default, we can just leave it as is or sort by a default field
                break;
        }

        return result;
    }, [products, filters, debouncedSearchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
    const effectivePage = Math.min(currentPage, totalPages);

    const paginatedProducts = useMemo(() => {
        const startIndex = (effectivePage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, effectivePage]);

    const handleFilterChange = useCallback((newFilters: FilterOptions) => {
        setFilters(newFilters);
        setCurrentPage(1);
    }, []);

    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleResetFilters = useCallback(() => {
        setFilters(defaultFilters);
        setSearchQuery('');
    }, []);

    const { setItems: setBreadcrumb } = useBreadcrumb();
    useEffect(() => {
        const displayCategory = urlCategoryName || categoryName;
        setBreadcrumb([
            { label: 'Home', href: '/' },
            { label: 'Products', ...(displayCategory || urlMaterialName ? { href: '/products' } : { active: true }) },
            ...(displayCategory ? [{ label: displayCategory, ...(urlMaterialName ? { href: `/products?cateId=${urlCateId}` } : { active: true as const }) }] : []),
            ...(urlMaterialName ? [{ label: urlMaterialName, active: true as const }] : []),
        ]);
        return () => setBreadcrumb([]);
    }, [setBreadcrumb, categoryName, urlCategoryName, urlMaterialName, urlCateId]);

    const pageTitle = useMemo(() => {
        const displayCategory = urlCategoryName || categoryName;
        if (urlMaterialName && displayCategory) return `${urlMaterialName} ${displayCategory}`;
        if (urlMaterialName) return urlMaterialName;
        if (displayCategory) return displayCategory;
        return 'Our Collection';
    }, [categoryName, urlCategoryName, urlMaterialName]);

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8 lg:py-12 lg:px-8 xl:max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                    {/* Sidebar Area */}
                    <aside className="w-full lg:w-[320px] shrink-0">
                        <div className="sticky top-28 space-y-10">
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4 px-1"
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4988c4]/10 text-[#4988c4] text-[10px] font-black uppercase tracking-widest shadow-sm">
                                    <Sparkles className="h-3 w-3" />
                                    Sweet Dreams Await
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                                        {pageTitle}
                                    </h1>
                                    <div className="flex items-center gap-2 text-[13px] text-slate-400 font-medium">
                                        <span>Discover</span>
                                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                                        <span>{filteredProducts.length} items found</span>
                                    </div>
                                </div>
                            </motion.div>

                            <FilterSidebar
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onReset={handleResetFilters}
                            />
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0 space-y-10">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-2 sm:p-3 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100"
                        >
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-light group-focus-within:text-amber-400 transition-colors" />
                                <form onSubmit={handleSearch}>
                                    <Input
                                        type="text"
                                        placeholder="Search by name, material..."
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
                                                onSelect={() => handleFilterChange({ ...filters, sortBy: option.value as FilterOptions['sortBy'] })}
                                                className={cn(
                                                    "rounded-lg px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all mb-1 last:mb-0 outline-none",
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

                        <ProductGrid
                            products={paginatedProducts}
                            isLoading={isLoading}
                            onResetFilters={handleResetFilters}
                        />

                        {totalPages > 1 && (
                            <div className="pt-10">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

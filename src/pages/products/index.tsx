import { useState, useMemo, useCallback, useEffect } from 'react';
import { ChevronDown, Search, Sparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

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
import type { FilterOptions, Product } from './types';
import { sortOptions } from './data';
import { useBreadcrumb } from '@/components/common/BreadcrumbNav';
import { useProductsByFilter } from '@/hooks/queries/useProduct';
import { useCategories } from '@/hooks/queries/useCategory';
import type { ProductResponse } from '@/api/types/product.types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 9;

const defaultFilters: FilterOptions = {
    ages: [],
    colors: [],
    sizes: [],
    priceRange: { min: null, max: null },
    sortBy: 'default',
};

function mapToProduct(p: ProductResponse): Product {
    const firstVariant = p.variants?.[0];
    const price = firstVariant?.salePrice || firstVariant?.basePrice || p.minPrice || 0;
    const originalPrice = firstVariant?.basePrice || p.maxPrice || undefined;
    const discount =
        originalPrice && originalPrice > price
            ? Math.round(((originalPrice - price) / originalPrice) * 100)
            : undefined;

    const firstImage = p.imageUrls?.[0] || p.assets?.[0]?.url;
    const isOutOfStock = p.status === 'OutOfStock';
    const isPublished = p.status === 'Published';

    return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        summary: p.summary || '',
        price,
        originalPrice: discount ? originalPrice : undefined,
        discount,
        rating: p.averageRating ?? 0,
        reviewCount: 0,
        image: firstImage || '/images/placeholder-product.svg',
        category: p.categoryName || '',
        material: p.material || '',
        ageRange: p.ageGroup?.toString() || '',
        inStock: isPublished && !isOutOfStock,
        isNew: firstVariant?.isNew || false,
        status: p.status,
    };
}

export default function ProductsPage() {
    const [searchParams] = useSearchParams();
    const urlCateId = searchParams.get('cateId');
    const urlCategoryName = searchParams.get('categoryName');
    const urlMaterialName = searchParams.get('materialName');

    const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const apiParams = useMemo(() => {
        const params: Record<string, unknown> = {};
        if (urlCateId) params.cateId = Number(urlCateId);
        params.pageNumber = 1;
        params.pageSize = 1000; // Get all for client-side filtering as per existing logic
        return params;
    }, [urlCateId]);

    const { data: apiProducts = [], isLoading } = useProductsByFilter(apiParams);
    const { data: categories = [] } = useCategories();

    const categoryName = useMemo(() => {
        if (!urlCateId) return null;
        const cat = categories.find(c => c.cateId === Number(urlCateId));
        return cat?.name || null;
    }, [urlCateId, categories]);

    const products: Product[] = useMemo(
        () => apiProducts.map(mapToProduct),
        [apiProducts]
    );

    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (product) =>
                    product.name.toLowerCase().includes(query) ||
                    product.category.toLowerCase().includes(query) ||
                    (product.material?.toLowerCase().includes(query))
            );
        }

        if (filters.ages.length > 0) {
            result = result.filter((product) =>
                product.ageRange && filters.ages.includes(product.ageRange)
            );
        }

        if (filters.priceRange.min !== null) {
            result = result.filter((product) => product.price >= filters.priceRange.min!);
        }
        if (filters.priceRange.max !== null) {
            result = result.filter((product) => product.price <= filters.priceRange.max!);
        }

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
    }, [products, filters, searchQuery]);

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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
        <div className="min-h-screen bg-[#FAFBFF]">
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
                                                onClick={() => handleFilterChange({ ...filters, sortBy: option.value as FilterOptions['sortBy'] })}
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

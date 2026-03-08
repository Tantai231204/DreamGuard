import { useState, useMemo, useCallback, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
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
import { useBreadcrumb } from '@/components/common/breadcrumb/useBreadcrumb';
import { useProductsByFilter } from '@/hooks/queries/useProduct';
import { useCategories } from '@/hooks/queries/useCategory';
import type { ProductResponse } from '@/api/types/product.types';
import { cn } from '@/lib/utils';

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

    const firstImage = p.assets?.[0]?.url;
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
        if (urlMaterialName && displayCategory) return `${urlMaterialName} – ${displayCategory}`;
        if (urlMaterialName) return urlMaterialName;
        if (displayCategory) return displayCategory;
        return 'All Products';
    }, [categoryName, urlCategoryName, urlMaterialName]);

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-12 lg:py-20 lg:px-8 xl:max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                    <aside className="w-full lg:w-[300px] shrink-0">
                        <div className="sticky top-10 space-y-12">
                            <div className="space-y-4">
                                <h1 className="text-4xl lg:text-6xl font-black text-gray-950 uppercase tracking-tighter leading-none">
                                    {pageTitle}
                                </h1>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {filteredProducts.length} items found
                                </p>
                            </div>

                            <FilterSidebar
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onReset={handleResetFilters}
                            />
                        </div>
                    </aside>

                    <main className="flex-1 min-w-0 space-y-12">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-gray-100 gap-6">
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                                <form onSubmit={handleSearch}>
                                    <Input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-10 w-full border-0 bg-transparent pl-8 text-[11px] font-black uppercase tracking-widest focus-visible:ring-0"
                                    />
                                </form>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-10 gap-4 text-[11px] font-black tracking-widest uppercase hover:bg-transparent px-0">
                                        Sort by: <span className="text-gray-400">
                                            {sortOptions.find((opt) => opt.value === filters.sortBy)?.label || 'Featured'}
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-2xl border-gray-100">
                                    {sortOptions.map((option) => (
                                        <DropdownMenuItem
                                            key={option.value}
                                            onClick={() => handleFilterChange({ ...filters, sortBy: option.value as FilterOptions['sortBy'] })}
                                            className={cn(
                                                "rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all",
                                                filters.sortBy === option.value ? "bg-gray-950 text-white" : "text-gray-400 hover:text-gray-950"
                                            )}
                                        >
                                            {option.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <ProductGrid
                            products={paginatedProducts}
                            isLoading={isLoading}
                            onResetFilters={handleResetFilters}
                        />

                        {totalPages > 1 && (
                            <div className="pt-20">
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

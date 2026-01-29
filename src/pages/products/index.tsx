import { useState, useMemo } from 'react';
import { ProductFilters } from './components/ProductFilters';
import { ProductGrid } from './components/ProductGrid';
import { Pagination } from './components/Pagination';
import type { FilterOptions } from './types';
import { mockProducts } from './data';

const ITEMS_PER_PAGE = 9;

export default function ProductsPage() {
    const [filters, setFilters] = useState<FilterOptions>({
        material: 'All',
        age: 'All',
        category: 'All',
        sortBy: 'default',
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [wishlistItems, setWishlistItems] = useState<string[]>([]);

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

        // Apply category filter
        if (filters.category !== 'All') {
            result = result.filter((product) => product.category === filters.category);
        }

        // Apply material filter
        if (filters.material !== 'All') {
            result = result.filter((product) => product.material === filters.material);
        }

        // Apply age filter
        if (filters.age !== 'All') {
            result = result.filter((product) => product.ageRange === filters.age);
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
                // Default sorting - keep original order
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
    const handleFilterChange = (newFilters: FilterOptions) => {
        setFilters(newFilters);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1); // Reset to first page when search changes
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddToCart = (productId: string) => {
        console.log('Add to cart:', productId);
        // TODO: Implement add to cart functionality
    };

    const handleToggleWishlist = (productId: string) => {
        setWishlistItems((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="border-b bg-white">
                <div className="container mx-auto px-4 py-4">
                    <nav className="flex items-center space-x-2 text-sm text-gray-600">
                        <a href="/" className="hover:text-blue-600">
                            Home
                        </a>
                        <span>/</span>
                        <span className="font-medium text-gray-900">Mattresses</span>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Filters Section */}
                <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
                    <ProductFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onSearch={handleSearch}
                        totalResults={filteredProducts.length}
                    />
                </div>

                {/* Products Grid */}
                <div className="mb-8">
                    <ProductGrid
                        products={paginatedProducts}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                        wishlistItems={wishlistItems}
                    />
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

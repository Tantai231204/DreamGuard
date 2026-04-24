import { useEffect } from 'react';
import { useBreadcrumb } from '@/components/common/BreadcrumbNav';
import { AppRoute } from '@/lib/constants';
import { Pagination } from '@/pages/products/components/Pagination';

// Components
import {
    ComboListHeader,
    ComboSearchBar,
    ComboGrid,
    ComboFilterSidebar
} from './components';

// Hooks
import { useComboListing } from './hooks/useComboListing';

export default function CombosPage() {
    const { setItems: setBreadcrumb } = useBreadcrumb();

    useEffect(() => {
        setBreadcrumb([
            { label: 'Home', href: AppRoute.HOME },
            { label: 'Combos', active: true },
        ]);
        return () => setBreadcrumb([]);
    }, [setBreadcrumb]);

    const {
        combos,
        totalCount,
        totalPages,
        isLoading,
        searchQuery,
        setSearchQuery,
        currentPage,
        filters,
        handleFilterChange,
        handleResetFilters,
        handlePageChange,
        handleSearch
    } = useComboListing();

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8 lg:py-12 lg:px-8 xl:max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                    {/* Sidebar Area */}
                    <aside className="w-full lg:w-[320px] shrink-0">
                        <div className="sticky top-28 space-y-10">
                            <ComboListHeader totalCount={totalCount} />
                            <ComboFilterSidebar
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onReset={handleResetFilters}
                            />
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0 space-y-10">
                        <ComboSearchBar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onSearch={handleSearch}
                        />

                        <ComboGrid
                            combos={combos}
                            isLoading={isLoading}
                            onResetFilters={handleResetFilters}
                        />

                        {/* Pagination */}
                        {!isLoading && totalPages > 1 && (
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

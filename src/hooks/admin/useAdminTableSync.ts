import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { PaginationState, Updater } from '@tanstack/react-table';
import { useDebounce } from '../useDebounce';

/**
 * useAdminTableSync - A high-performance hook for Administrative Management UI
 * 
 * Features:
 * 1. Synchronize TanStack Table Pagination (page, pageSize) with URL Search Params.
 * 2. Synchronize Global Search with URL Search Params + Debouncing.
 * 3. Atomic URL Updates to prevent race conditions during rapid filtering.
 */
export function useAdminTableSync(defaultPageSize = 10) {
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. Pagination State (Derived from URL)
    const pagination = useMemo<PaginationState>(() => ({
        pageIndex: Math.max(0, parseInt(searchParams.get('page') || '1') - 1),
        pageSize: parseInt(searchParams.get('pageSize') || String(defaultPageSize)),
    }), [searchParams, defaultPageSize]);

    // 2. Global Filter State (Derived from URL)
    const globalFilter = searchParams.get('search') || '';

    // 3. Debounced Filter (For API Calls)
    const debouncedFilter = useDebounce(globalFilter, 500);

    // 4. Update Handlers
    const setPagination = useCallback((updaterOrValue: Updater<PaginationState>) => {
        const next = typeof updaterOrValue === 'function' ? updaterOrValue(pagination) : updaterOrValue;

        // Performance & Stability: Avoid redundant navigation if values are already in sync
        const currentPage = parseInt(searchParams.get('page') || '1');
        const currentPageSize = parseInt(searchParams.get('pageSize') || String(defaultPageSize));

        if (next.pageIndex + 1 === currentPage && next.pageSize === currentPageSize) return;

        setSearchParams((prev) => {
            prev.set('page', String(next.pageIndex + 1));
            prev.set('pageSize', String(next.pageSize));
            return prev;
        }, { replace: true });
    }, [pagination, searchParams, setSearchParams, defaultPageSize]);

    const setGlobalFilter = useCallback((value: string) => {
        if (value === globalFilter) return;

        setSearchParams((prev) => {
            if (value) prev.set('search', value);
            else prev.delete('search');
            prev.set('page', '1'); // Reset to page 1 on search
            return prev;
        }, { replace: true });
    }, [globalFilter, setSearchParams]);

    // Helper for custom field filters (e.g., status)
    const setFieldFilter = useCallback((field: string, value: string | null) => {
        const current = searchParams.get(field) || 'all';
        if (value === current) return;

        setSearchParams((prev) => {
            if (value && value !== 'all') prev.set(field, value);
            else prev.delete(field);
            prev.set('page', '1');
            return prev;
        }, { replace: true });
    }, [searchParams, setSearchParams]);

    const getFieldFilter = useCallback((field: string, defaultValue = 'all') => {
        return searchParams.get(field) || defaultValue;
    }, [searchParams]);

    return {
        pagination,
        setPagination,
        globalFilter,
        debouncedFilter,
        setGlobalFilter,
        setFieldFilter,
        getFieldFilter,
        searchParams,
        setSearchParams
    };
}

import { useMemo, useCallback } from 'react';
import type { CategoryResponse } from '@/api';

export interface FlatCategory {
    cateId: number;
    name: string;
    slug: string;
    depth: number;
    parentId?: number;
}

const toSlug = (text: string) =>
    text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

export function useCategoryTree(categories: CategoryResponse[], cateId: string) {
    const flatCategories = useMemo(() => {
        const result: FlatCategory[] = [];
        const walk = (list: CategoryResponse[], depth = 0, parentId?: number) => {
            for (const cat of list) {
                result.push({ cateId: cat.cateId, name: cat.name, slug: cat.slug, depth, parentId });
                if (cat.childCategoryList?.length) walk(cat.childCategoryList, depth + 1, cat.cateId);
            }
        };
        walk(categories);
        return result;
    }, [categories]);

    const findTopLevelParent = useCallback((selectedCateId: string): string => {
        const cat = flatCategories.find(c => String(c.cateId) === selectedCateId);
        if (!cat || cat.depth === 0) return selectedCateId;
        let current = cat;
        while (current.parentId) {
            const parent = flatCategories.find(c => c.cateId === current.parentId);
            if (!parent) break;
            current = parent;
        }
        return String(current.cateId);
    }, [flatCategories]);

    const childCategories = useMemo(() => {
        if (!cateId) return [];
        const selectedCat = categories.find(c => String(c.cateId) === cateId);
        return selectedCat?.childCategoryList || [];
    }, [cateId, categories]);

    const buildSlug = useCallback(
        (productName: string, catId: string) => {
            const productSlug = toSlug(productName);
            if (!productSlug) return '';
            const cat = flatCategories.find(c => String(c.cateId) === catId);
            const catSlug = cat ? toSlug(cat.slug || cat.name) : '';
            return catSlug ? `${catSlug}-${productSlug}` : productSlug;
        },
        [flatCategories],
    );

    return { flatCategories, findTopLevelParent, childCategories, buildSlug };
}

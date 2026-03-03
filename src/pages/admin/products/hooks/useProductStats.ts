import { useMemo } from 'react';
import type { Product } from '../types';

export function useProductStats(products: Product[]) {
  return useMemo(() => {
    const total = products.length;
    const published = products.filter(p => p.status === 'Published').length;
    const outOfStock = products.filter(p => p.status === 'OutOfStock').length;
    const draft = products.filter(p => p.status === 'Draft').length;
    const hidden = products.filter(p => p.status === 'Hidden').length;

    const allVariants = products.flatMap(p => p.variants ?? []);
    const totalVariants = allVariants.length;
    const activeVariants = allVariants.filter(v => v.status === 'Active').length;

    return {
      total,
      published,
      outOfStock,
      draft,
      hidden,
      totalVariants,
      activeVariants,
    };
  }, [products]);
}

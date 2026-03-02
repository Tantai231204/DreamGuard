import { useMemo } from 'react';
import type { Product } from '../types';

export function useProductStats(products: Product[]) {
  return useMemo(() => {
    const total = products.length;
    const active = products.filter(p => p.status === 'Active').length;
    const inactive = products.filter(p => p.status === 'Inactive').length;
    const draft = products.filter(p => p.status === 'Draft').length;

    const allVariants = products.flatMap(p => p.variants ?? []);
    const totalVariants = allVariants.length;
    const activeVariants = allVariants.filter(v => v.status === 'Active').length;

    return {
      total,
      active,
      inactive,
      draft,
      totalVariants,
      activeVariants,
    };
  }, [products]);
}

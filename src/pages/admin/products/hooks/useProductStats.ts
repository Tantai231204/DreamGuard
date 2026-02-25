import { useMemo } from 'react';
import type { Product } from '../types';

export function useProductStats(products: Product[]) {
  return useMemo(() => {
    const total = products.length;
    const active = products.filter(p => p.status === 'active').length;
    const outOfStock = products.filter(p => p.status === 'out_of_stock').length;

    const allVariants = products.flatMap(p => p.variants);
    const totalVariants = allVariants.length;
    const lowStockVariants = allVariants.filter(v => v.status === 'low_stock').length;
    const outOfStockVariants = allVariants.filter(v => v.status === 'out_of_stock').length;
    const totalStock = allVariants.reduce((sum, v) => sum + v.stock, 0);
    const revenue = products.reduce((sum, p) => sum + (p.basePrice * p.sales), 0);

    return {
      total,
      active,
      outOfStock,
      totalVariants,
      lowStockVariants,
      outOfStockVariants,
      totalStock,
      revenue,
    };
  }, [products]);
}

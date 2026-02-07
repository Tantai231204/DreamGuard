import { useMemo } from 'react';
import type { Product } from '../types';

export function useProductStats(products: Product[]) {
  return useMemo(() => {
    const total = products.length;
    const active = products.filter(p => p.status === 'active').length;
    const outOfStock = products.filter(p => p.status === 'out_of_stock').length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const revenue = products.reduce((sum, p) => sum + (p.price * p.sales), 0);

    return {
      total,
      active,
      outOfStock,
      lowStock,
      totalValue,
      revenue,
    };
  }, [products]);
}

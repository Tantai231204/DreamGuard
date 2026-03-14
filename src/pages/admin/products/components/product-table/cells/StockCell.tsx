// Display total stock with low stock warning
import { useAdminProductVariants } from '@/hooks/queries/useProduct';
import { useMemo } from 'react';

interface StockCellProps {
  productId: string;
  variantCount: number;
}

export default function StockCell({ productId, variantCount }: StockCellProps) {
  const { data } = useAdminProductVariants(productId, { enabled: variantCount > 0 });

  const stockInfo = useMemo(() => {
    if (!data?.colorGroups?.length) return null;

    let totalStock = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    data.colorGroups.forEach((g) =>
      g.variants.forEach((v) => {
        totalStock += v.stockQuantity ?? 0;
        if (v.stockStatus === 'Low Stock') lowStockCount++;
        if (v.stockStatus === 'Out of Stock') outOfStockCount++;
      })
    );

    const hasLowStock = lowStockCount > 0 || outOfStockCount > 0;

    return {
      totalStock,
      hasLowStock,
      lowStockCount,
      outOfStockCount,
    };
  }, [data]);

  if (variantCount === 0 || !stockInfo) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  const isLow = stockInfo.hasLowStock;
  const isOutOfStock = stockInfo.totalStock === 0;

  return (
    <div className="space-y-0.5">
      {/* Total stock */}
      <div
        className={`text-2xl font-bold ${
          isOutOfStock ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-gray-900'
        }`}
      >
        {stockInfo.totalStock}
      </div>

      {/* Low stock warning */}
      {stockInfo.hasLowStock && (
        <div className="text-[10px] font-semibold text-orange-500">
          {stockInfo.outOfStockCount > 0
            ? `${stockInfo.outOfStockCount} out`
            : `${stockInfo.lowStockCount} low`}
        </div>
      )}
    </div>
  );
}

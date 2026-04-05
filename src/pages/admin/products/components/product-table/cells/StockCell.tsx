// Display total stock with low stock & defect warnings
import { useAdminProductVariants } from '@/hooks/queries/useProduct';
import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';

interface StockCellProps {
  productId: string;
  variantCount: number;
}

export default function StockCell({ productId, variantCount }: StockCellProps) {
  const { data } = useAdminProductVariants(productId, { enabled: variantCount > 0 });

  const stockInfo = useMemo(() => {
    if (!data?.colorGroups?.length) return null;

    let totalStock = 0;
    let totalDefect = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    data.colorGroups.forEach((g) =>
      g.variants.forEach((v) => {
        totalStock += v.stockQuantity ?? 0;
        totalDefect += v.defectQuantity ?? 0;
        if (v.stockStatus === 'Low Stock') lowStockCount++;
        if (v.stockStatus === 'Out of Stock') outOfStockCount++;
      })
    );

    return {
      totalStock,
      totalDefect,
      hasLowStock: lowStockCount > 0 || outOfStockCount > 0,
      lowStockCount,
      outOfStockCount,
    };
  }, [data]);

  if (variantCount === 0 || !stockInfo) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  const isOutOfStock = stockInfo.totalStock === 0;
  const isLow = stockInfo.hasLowStock;

  return (
    <div className="space-y-0.5">
      <div className={`text-2xl font-bold ${isOutOfStock ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-gray-900'}`}>
        {stockInfo.totalStock}
      </div>

      <div className="flex items-center gap-2">
        {stockInfo.hasLowStock && (
          <span className="text-[10px] font-semibold text-orange-500">
            {stockInfo.outOfStockCount > 0
              ? `${stockInfo.outOfStockCount} out`
              : `${stockInfo.lowStockCount} low`}
          </span>
        )}
        {stockInfo.totalDefect > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-rose-500">
            <AlertTriangle className="w-3 h-3" />
            {stockInfo.totalDefect} defect
          </span>
        )}
      </div>
    </div>
  );
}

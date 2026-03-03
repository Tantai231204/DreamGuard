// Display price range from variants
import { useAdminProductVariants } from '@/hooks/queries/useProduct';
import { useMemo } from 'react';

interface PriceRangeCellProps {
  productId: string;
  variantCount: number;
}

export default function PriceRangeCell({ productId, variantCount }: PriceRangeCellProps) {
  const { data } = useAdminProductVariants(productId, variantCount > 0);

  const priceInfo = useMemo(() => {
    if (!data?.colorGroups?.length) return null;

    const prices: number[] = [];
    const basePrices: number[] = [];
    let hasSale = false;

    data.colorGroups.forEach((g) =>
      g.variants.forEach((v) => {
        prices.push(v.salePrice);
        basePrices.push(v.basePrice);
        if (v.salePrice < v.basePrice) hasSale = true;
      })
    );

    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    return {
      minPrice,
      maxPrice,
      hasSale,
    };
  }, [data]);

  if (variantCount === 0 || !priceInfo || priceInfo.minPrice === 0) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  return (
    <div className="space-y-0.5">
      {/* Price range */}
      <div className="text-sm font-bold text-gray-900">
        {priceInfo.minPrice.toLocaleString('vi-VN')}
        {priceInfo.maxPrice > priceInfo.minPrice && (
          <>
            <span className="text-gray-400 mx-1">-</span>
            {priceInfo.maxPrice.toLocaleString('vi-VN')}
          </>
        )}
        đ
      </div>

      {/* Sale active badge */}
      {priceInfo.hasSale && (
        <div className="text-[10px] font-semibold text-red-500">Sale active</div>
      )}
    </div>
  );
}

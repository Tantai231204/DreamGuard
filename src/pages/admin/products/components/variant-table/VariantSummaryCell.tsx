import { useAdminProductVariants } from '@/hooks/queries/useProduct';
import { useMemo } from 'react';
import { Layers, AlertTriangle, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VariantSummaryCellProps {
    productId: string;
    variantCount: number;
}

const MAX_DOTS = 2; // 👈 chỉ hiện tối ₫a 2 màu

const colorMap: Record<string, string> = {
    white: '#f5f5f5',
    pink: '#ffc0cb',
    blue: '#add8e6',
    red: '#ff6b6b',
    green: '#90ee90',
    yellow: '#ffeb3b',
    orange: '#ffa500',
    purple: '#dda0dd',
    black: '#333333',
    gray: '#9e9e9e',
    grey: '#9e9e9e',
    brown: '#a0522d',
    beige: '#f5f5dc',
    mint: '#98ff98',
    default: '#e5e7eb',
};

function getColorHex(colorValue?: string) {
    if (!colorValue) return colorMap.default;
    if (colorValue.startsWith('#')) return colorValue;
    // If it's a 6-digit hex without #
    if (/^[0-9A-Fa-f]{6}$/.test(colorValue)) return `#${colorValue}`;
    return colorMap[colorValue.toLowerCase().trim()] || colorMap.default;
}

export default function VariantSummaryCell({
    productId,
    variantCount,
}: VariantSummaryCellProps) {
    const { data } = useAdminProductVariants(productId, variantCount > 0);

    const summary = useMemo(() => {
        if (!data?.colorGroups?.length) return null;

        const totalColors = data.colorGroups.length;
        const colors = data.colorGroups.slice(0, MAX_DOTS).map((g) => ({
            name: g.color,
            hex: g.hexColor || g.color
        }));
        const moreColors = totalColors > MAX_DOTS ? totalColors - MAX_DOTS : 0;

        const sizeSet = new Set<string>();
        let totalStock = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        const prices: number[] = [];

        data.colorGroups.forEach((g) =>
            g.variants.forEach((v) => {
                if (v.size) sizeSet.add(v.size);
                totalStock += v.stockQuantity ?? 0;
                if (v.stockStatus === 'Low Stock') lowStockCount++;
                if (v.stockStatus === 'Out of Stock') outOfStockCount++;
                prices.push(v.salePrice);
            })
        );

        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        const hasLowStock = lowStockCount > 0 || outOfStockCount > 0;

        return {
            colors,
            moreColors,
            sizeCount: sizeSet.size,
            totalStock,
            hasLowStock,
            lowStockCount,
            outOfStockCount,
            minPrice,
            maxPrice,
        };
    }, [data]);

    if (variantCount === 0) {
        return <span className="text-xs text-muted-foreground">—</span>;
    }

    return (
        <div className="space-y-1.5">
            {/* variants count */}
            <div className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-sm font-bold text-gray-900">
                    {variantCount}
                </span>
                <span className="text-xs text-gray-500">
                    variant{variantCount !== 1 ? 's' : ''}
                </span>
            </div>

            {summary && (
                <>
                    {/* colors + sizes */}
                    <div className="flex items-center gap-1.5">
                        {/* color dots */}
                        {summary.colors.map((color, idx) => (
                            <div
                                key={idx}
                                className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: getColorHex(color.hex) }}
                                title={color.name}
                            />
                        ))}

                        {/* +N colors */}
                        {summary.moreColors > 0 && (
                            <span className="text-xs text-gray-400 ml-0.5">
                                +{summary.moreColors}
                            </span>
                        )}

                        {/* divider */}
                        {summary.sizeCount > 0 && (
                            <>
                                <span className="text-gray-300 mx-1">|</span>
                                <span className="text-xs text-gray-500">
                                    {summary.sizeCount} size
                                    {summary.sizeCount !== 1 ? 's' : ''}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Stock info */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <Package className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-xs font-semibold text-gray-700">
                                {summary.totalStock}
                            </span>
                            <span className="text-xs text-gray-400">units</span>
                        </div>

                        {/* Low stock warning */}
                        {summary.hasLowStock && (
                            <Badge
                                variant="outline"
                                className="h-5 px-1.5 text-[10px] bg-orange-50 text-orange-600 border-orange-200 flex items-center gap-1"
                            >
                                <AlertTriangle className="h-3 w-3" />
                                {summary.outOfStockCount > 0 ? (
                                    <span>{summary.outOfStockCount} OOS</span>
                                ) : (
                                    <span>{summary.lowStockCount} low</span>
                                )}
                            </Badge>
                        )}
                    </div>

                    {/* Price range */}
                    {summary.minPrice > 0 && (
                        <div className="text-xs">
                            <span className="font-bold text-blue-600">
                                {summary.minPrice.toLocaleString('en-US')}₫
                            </span>
                            {summary.maxPrice > summary.minPrice && (
                                <>
                                    <span className="text-gray-400 mx-1">-</span>
                                    <span className="font-bold text-blue-600">
                                        {summary.maxPrice.toLocaleString('en-US')}₫
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
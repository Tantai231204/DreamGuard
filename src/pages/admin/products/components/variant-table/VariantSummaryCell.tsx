import { useRichAdminVariants } from '@/hooks/queries/useProduct';
import { Layers, AlertTriangle, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VariantSummaryCellProps {
    productId: string;
    variantCount: number;
}

const MAX_DOTS = 2; // 👈 chỉ hiện tối đa 2 màu

export default function VariantSummaryCell({
    productId,
    variantCount,
}: VariantSummaryCellProps) {
    // Leverage optimized hook
    const { data } = useRichAdminVariants(productId, variantCount > 0);

    if (variantCount === 0) {
        return <span className="text-xs text-muted-foreground">—</span>;
    }

    if (!data) return <div className="h-10 w-24 bg-gray-50 animate-pulse rounded-lg" />;

    const { colorGroups, totalVariants, pricing, stats, sizeCount } = data;

    return (
        <div className="space-y-1.5">
            {/* variants count */}
            <div className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-sm font-bold text-gray-900">
                    {totalVariants}
                </span>
                <span className="text-xs text-gray-500">
                    variant{totalVariants !== 1 ? 's' : ''}
                </span>
            </div>

            {/* colors + sizes */}
            <div className="flex items-center gap-1.5">
                {/* color dots - using high-precision logic from hook */}
                <div className="flex -space-x-1">
                    {colorGroups.slice(0, MAX_DOTS).map((g, idx) => (
                        <div
                            key={idx}
                            className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: g.colorHex }}
                            title={g.color}
                        />
                    ))}
                </div>

                {/* +N colors */}
                {colorGroups.length > MAX_DOTS && (
                    <span className="text-xs text-gray-400 ml-0.5">
                        +{colorGroups.length - MAX_DOTS}
                    </span>
                )}

                {/* divider */}
                {sizeCount > 0 && (
                    <>
                        <span className="text-gray-300 mx-1">|</span>
                        <span className="text-xs text-gray-500">
                            {sizeCount} size{sizeCount !== 1 ? 's' : ''}
                        </span>
                    </>
                )}
            </div>

            {/* Stock info */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                    <Package className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-xs font-semibold text-gray-700">
                        {stats.totalStock}
                    </span>
                    <span className="text-xs text-gray-400">units</span>
                </div>

                {/* Low stock warning */}
                {stats.hasIssue && (
                    <Badge
                        variant="outline"
                        className="h-5 px-1.5 text-[10px] bg-orange-50 text-orange-600 border-orange-200 flex items-center gap-1"
                    >
                        <AlertTriangle className="h-3 w-3" />
                        {stats.outOfStock > 0 ? (
                            <span>{stats.outOfStock} OOS</span>
                        ) : (
                            <span>{stats.lowStock} low</span>
                        )}
                    </Badge>
                )}
            </div>

            {/* Price range */}
            {pricing.minPrice > 0 && (
                <div className="text-xs">
                    <span className="font-bold text-blue-600">
                        {pricing.minPrice.toLocaleString('vi-VN')}đ
                    </span>
                    {pricing.hasRange && (
                        <>
                            <span className="text-gray-400 mx-1">-</span>
                            <span className="font-bold text-blue-600">
                                {pricing.maxPrice.toLocaleString('vi-VN')}đ
                            </span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
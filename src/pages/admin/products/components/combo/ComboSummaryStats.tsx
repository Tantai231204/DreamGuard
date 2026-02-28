interface ComboSummaryStatsProps {
    totalItems: number;
    productsCount: number;
    variantsCount: number;
    discount: number;
}

export default function ComboSummaryStats({
    totalItems,
    productsCount,
    variantsCount,
    discount,
}: ComboSummaryStatsProps) {
    return (
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 px-1">
            <span>
                Total items:{' '}
                <span className="font-bold text-gray-700">{totalItems}</span>
            </span>
            <span className="text-gray-300">|</span>
            <span>
                Products:{' '}
                <span className="font-bold text-purple-600">{productsCount}</span>
            </span>
            <span>
                Variants:{' '}
                <span className="font-bold text-blue-600">{variantsCount}</span>
            </span>
            <span>
                Discount:{' '}
                <span className="font-bold text-orange-600">{discount}%</span>
            </span>
        </div>
    );
}

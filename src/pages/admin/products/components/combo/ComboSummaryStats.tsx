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
        <div className="mt-4 flex items-center gap-4 text-[13px] text-gray-400 px-1 font-medium">
            <span>
                Total items:{' '}
                <span className="font-bold text-gray-900">{totalItems}</span>
            </span>
            <span className="text-gray-200">|</span>
            <span>
                Products:{' '}
                <span className="font-bold text-gray-900">{productsCount}</span>
            </span>
            <span className="text-gray-200">|</span>
            <span>
                Variants:{' '}
                <span className="font-bold text-gray-900">{variantsCount}</span>
            </span>
            <span className="text-gray-200">|</span>
            <span>
                Discount:{' '}
                <span className="font-bold text-orange-500">{discount}%</span>
            </span>
        </div>
    );
}

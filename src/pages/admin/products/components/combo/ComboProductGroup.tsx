import { Package } from 'lucide-react';
import ComboVariantRow from './ComboVariantRow';
import type { ComboItem } from '../../types';

interface ComboProductGroupProps {
    /** Short ID displayed on the right, e.g. "#PRD001" */
    productRef: string;
    productName: string;
    items: ComboItem[];
    onQuantityChange?: (itemKey: string, quantity: number) => void;
    onDelete?: (itemKey: string) => void;
}

export default function ComboProductGroup({
    productRef,
    productName,
    items,
    onQuantityChange,
    onDelete,
}: ComboProductGroupProps) {
    const variantCount = items.length;

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all hover:border-primary-500/40 hover:shadow-sm">
            {/* Product header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    <div className="h-[22px] w-[22px] rounded-md bg-primary-50 flex items-center justify-center flex-shrink-0">
                        <Package className="h-3 w-3 text-primary-600" />
                    </div>
                    <span className="text-[14px] font-bold text-gray-900">
                        {productName}
                    </span>
                    <span className="text-[12px] text-gray-400">
                        ({variantCount} {variantCount === 1 ? 'variant' : 'variants'})
                    </span>
                </div>
                <span className="text-[11px] font-mono text-gray-400 tracking-wider">
                    {productRef}
                </span>
            </div>

            {/* Variant rows */}
            <div className="divide-y divide-gray-50">
                {items.map((item, idx) => (
                    <ComboVariantRow
                        key={`${item.productId}-${item.variantId ?? idx}`}
                        item={item}
                        onQuantityChange={onQuantityChange}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
}

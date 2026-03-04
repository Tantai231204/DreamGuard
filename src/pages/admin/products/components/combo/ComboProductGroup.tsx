import { Package } from 'lucide-react';
import ComboVariantRow from './ComboVariantRow';
import type { ComboItem } from '../../types';

interface ComboProductGroupProps {
    productId: string;
    productName: string;
    items: ComboItem[];
    onQuantityChange?: (itemKey: string, quantity: number) => void;
    onDelete?: (itemKey: string) => void;
}

export default function ComboProductGroup({
    productId,
    productName,
    items,
    onQuantityChange,
    onDelete,
}: ComboProductGroupProps) {
    const variantCount = items.length;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4 transition-all hover:shadow-md hover:border-purple-200 group/product">
            {/* Product header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-md bg-purple-50 flex items-center justify-center">
                        <Package className="h-3.5 w-3.5 text-purple-600" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-[14px] font-bold text-gray-900 group-hover/product:text-purple-700 transition-colors">
                            {productName}
                        </span>
                        <span className="text-[12px] text-gray-400 font-medium">
                            ({variantCount} {variantCount === 1 ? 'variant' : 'variants'})
                        </span>
                    </div>
                </div>
                <span className="text-[11px] font-bold font-mono text-gray-300 tracking-wider">
                    #{productId}
                </span>
            </div>

            {/* Variants list */}
            <div className="bg-white">
                {items.map((item) => (
                    <ComboVariantRow
                        key={`${item.productId}-${item.variantId || 'default'}`}
                        item={item}
                        onQuantityChange={onQuantityChange}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
}

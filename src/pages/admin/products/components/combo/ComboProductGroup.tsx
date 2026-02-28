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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Product header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/80 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-semibold text-gray-800">{productName}</span>
                    <span className="text-xs text-gray-400">
                        ({variantCount} {variantCount === 1 ? 'variant' : 'variants'})
                    </span>
                </div>
                <span className="text-xs font-mono text-gray-400">#{productId}</span>
            </div>

            {/* Variants list */}
            <div className="divide-y divide-gray-50">{items.map((item) => (
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

import { motion } from 'framer-motion';
import { ComboHeader, ComboProductGroup, ComboSummaryStats } from './combo';
import type { ComboItem } from '../types';

interface ComboItemsTableProps {
    items: ComboItem[];
    comboName: string;
    discount: number;
}

export default function ComboItemsTable({ items, comboName, discount }: ComboItemsTableProps) {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    // Group items by product
    const productGroups = items.reduce<Record<string, ComboItem[]>>((acc, item) => {
        const key = item.productId;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    const handleQuantityChange = (itemKey: string, quantity: number) => {
        console.log('Update quantity:', itemKey, quantity);
        // TODO: Implement quantity update logic
    };

    const handleDelete = (itemKey: string) => {
        console.log('Delete item:', itemKey);
        // TODO: Implement delete logic
    };

    const handleAddItem = () => {
        console.log('Add item to combo');
        // TODO: Implement add item logic
    };
    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
        >
            <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30 border-t border-b border-gray-200 px-6 py-4">
                {/* Header */}
                <ComboHeader
                    comboName={comboName}
                    itemsCount={items.length}
                    discount={discount}
                    onAddItem={handleAddItem}
                />

                {/* Items grouped by product */}
                <div className="space-y-3">
                    {Object.entries(productGroups).map(([productId, productItems]) => (
                        <ComboProductGroup
                            key={productId}
                            productId={productId}
                            productName={productItems[0].productName}
                            items={productItems}
                            onQuantityChange={handleQuantityChange}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>

                {/* Summary footer */}
                <ComboSummaryStats
                    totalItems={totalItems}
                    productsCount={Object.keys(productGroups).length}
                    variantsCount={items.length}
                    discount={discount}
                />
            </div>
        </motion.div>
    );
}

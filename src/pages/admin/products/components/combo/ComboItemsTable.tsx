import { motion } from 'framer-motion';
import { useComboDetail } from '@/hooks/queries/useCombo';
import ComboHeader from './ComboHeader';
import ComboProductGroup from './ComboProductGroup';
import ComboSummaryStats from './ComboSummaryStats';
import { Skeleton } from '@/components/ui/skeleton';
import type { ComboItem } from '../../types';

interface ComboItemsTableProps {
    comboId: string;
    items: ComboItem[];
    comboName: string;
    discount: number;
}

export default function ComboItemsTable({ comboId, items: fallbackItems, comboName, discount }: ComboItemsTableProps) {
    // Fetch fresh detailed data for this combo
    const { data: comboDetail, isLoading, isError } = useComboDetail(comboId);

    // Use productItems from API if available, else fallback to initial items
    const displayItems = comboDetail?.productItems?.map(pi => ({
        productId: pi.productVariantId,
        productName: pi.productName,
        variantId: pi.sku,
        variantLabel: pi.sku, // Use SKU since variantLabel might not be in productItems
        quantity: pi.quantity,
        basePrice: pi.basePrice,
        salePrice: pi.salePrice,
    })) || fallbackItems;

    const totalItems = displayItems.reduce((sum, item) => sum + item.quantity, 0);

    // Group items by productName to show consistent UI
    const productGroups = displayItems.reduce<Record<string, any[]>>((acc, item) => {
        const key = item.productName;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    const handleQuantityChange = (itemKey: string, quantity: number) => {
        console.log('Update quantity:', itemKey, quantity);
    };

    const handleDelete = (itemKey: string) => {
        console.log('Delete item:', itemKey);
    };

    const handleAddItem = () => {
        console.log('Add item to combo');
    };

    if (isLoading) {
        return (
            <div className="p-10 space-y-4 bg-[#fcfcff] border-y border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <Skeleton className="h-10 w-10 rounded-lg bg-slate-200" />
                    <Skeleton className="h-6 w-48 bg-slate-200" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-40 w-full bg-slate-100 rounded-2xl" />
                    <Skeleton className="h-40 w-full bg-slate-100 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (isError && !fallbackItems.length) {
        return (
            <div className="p-10 text-center bg-[#fcfcff] border-y border-gray-100">
                <p className="text-sm text-red-500 font-medium tracking-tight">Failed to load combo items detail.</p>
                <p className="text-xs text-slate-400 mt-1">Please try again or contact support.</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
        >
            <div className="bg-[#fcfcff] border-t border-b border-gray-100 px-10 py-8">
                {/* Header */}
                <ComboHeader
                    comboName={comboName}
                    itemsCount={displayItems.length}
                    discount={discount}
                    onAddItem={handleAddItem}
                />

                {/* Items grouped by product */}
                <div className="space-y-3">
                    {Object.entries(productGroups).map(([productName, pItems]) => (
                        <ComboProductGroup
                            key={productName}
                            productId={pItems[0].productId.split('-')[0].toUpperCase()} // Mock ID display
                            productName={productName}
                            items={pItems}
                            onQuantityChange={handleQuantityChange}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>

                {/* Summary footer */}
                <ComboSummaryStats
                    totalItems={totalItems}
                    productsCount={Object.keys(productGroups).length}
                    variantsCount={displayItems.length}
                    discount={discount}
                />
            </div>
        </motion.div>
    );
}

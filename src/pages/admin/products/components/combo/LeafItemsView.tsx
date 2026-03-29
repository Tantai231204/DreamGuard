import { useUpdateComboItems } from '@/hooks/queries/useCombo';
import ComboVariantRow from './ComboVariantRow';
import type { ComboItem } from '../../types';

interface LeafItemsViewProps {
    comboId: string;
    items: ComboItem[];
}

export default function LeafItemsView({
    comboId,
    items,
}: LeafItemsViewProps) {
    const updateItemsMutation = useUpdateComboItems();

    const handleUpdateQuantity = async (itemKey: string, newQty: number) => {
        if (newQty < 1) return;
        const [pId, vId] = itemKey.split('|');
        const updatedItems = items.map(i => {
            const matches = i.productId === pId && (i.variantId || 'default') === vId;
            if (matches) return { ...i, quantity: newQty };
            return i;
        });

        const itemsUpdate = updatedItems.map(i => ({
            productVariantId: i.variantId || i.productId,
            quantity: i.quantity
        }));

        try {
            await updateItemsMutation.mutateAsync({ id: comboId, items: itemsUpdate });
        } catch {
            // Handled via toast in hook
        }
    };

    const handleDeleteItem = async (itemKey: string) => {
        if (!confirm('Remove this item from combo?')) return;
        const [pId, vId] = itemKey.split('|');
        const updatedItems = items.filter(i => {
            const matches = i.productId === pId && (i.variantId || 'default') === vId;
            return !matches;
        });

        const itemsUpdate = updatedItems.map(i => ({
            productVariantId: i.variantId || i.productId,
            quantity: i.quantity
        }));

        try {
            await updateItemsMutation.mutateAsync({ id: comboId, items: itemsUpdate });
        } catch {
            // Handled via toast in hook
        }
    };

    if (!items.length) {
        return (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-400 italic">No product items found in this combo.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-[1fr_120px_100px_80px] gap-4 px-8 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50 border-b border-gray-100">
                <div>Product / Variant</div>
                <div className="text-right">Price</div>
                <div className="text-center">Quantity</div>
                <div className="text-right">Actions</div>
            </div>
            <div className="divide-y divide-gray-50">
                {items.map((item) => {
                    const itemKey = `${item.productId}|${item.variantId ?? 'default'}`;
                    return (
                        <ComboVariantRow
                            key={itemKey}
                            item={item}
                            onQuantityChange={handleUpdateQuantity}
                            onDelete={handleDeleteItem}
                            isLoading={updateItemsMutation.isPending}
                        />
                    );
                })}
            </div>
        </div>
    );
}

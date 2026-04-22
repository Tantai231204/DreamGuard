import { useState } from 'react';
import { useUpdateComboItems } from '@/hooks/queries/useCombo';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import ComboVariantRow from './ComboVariantRow';
import { toast } from 'sonner';
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
    const [deleteItemKey, setDeleteItemKey] = useState<string | null>(null);

    // Optimistic UI state
    const [localItems, setLocalItems] = useState<ComboItem[]>(items);
    const [lastPropsItems, setLastPropsItems] = useState<ComboItem[]>(items);

    // Sync props to local state safely during render
    if (items !== lastPropsItems) {
        setLastPropsItems(items);
        setLocalItems(items);
    }

    const handleUpdateQuantity = async (targetId: string, newQty: number) => {
        if (newQty < 1) return;
        
        // Optimistic Update
        const optimistic = localItems.map(i => {
            const id = i.variantId || i.productId;
            if (id === targetId) return { ...i, quantity: newQty };
            return i;
        });
        setLocalItems(optimistic);

        const itemsUpdate = optimistic.map(i => ({
            productVariantId: i.variantId || i.productId,
            quantity: i.quantity
        }));

        try {
            await updateItemsMutation.mutateAsync({ id: comboId, items: itemsUpdate });
        } catch {
            // Revert on error
            setLocalItems(items);
        }
    };

    const handleDeleteItem = async (itemKey: string) => {
        setDeleteItemKey(itemKey);
    };

    const confirmDelete = async () => {
        if (!deleteItemKey || !comboId) return;
        
        // Optimistic Deletion
        const optimistic = localItems.filter(item => {
            const id = String(item.variantId || item.productId);
            return id !== String(deleteItemKey);
        });
        setLocalItems(optimistic);

        const itemsUpdate = optimistic.map(item => ({
            productVariantId: String(item.variantId || item.productId),
            quantity: item.quantity
        }));

        try {
            await updateItemsMutation.mutateAsync({ 
                id: comboId, 
                items: itemsUpdate 
            });
            toast.success("Item removed from combo.");
        } catch (error) {
            console.error("Deletion failed:", error);
            setLocalItems(items); // Revert
        } finally {
            setDeleteItemKey(null);
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
                {localItems.map((item) => {
                    const itemKey = item.variantId || item.productId || 'default';
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

            <ConfirmDialog
                open={!!deleteItemKey}
                onOpenChange={(open) => !open && setDeleteItemKey(null)}
                title="Remove Item?"
                description="Are you sure you want to remove this product from the combo? This will update the combo structure immediately."
                onConfirm={confirmDelete}
                confirmText="Remove Item"
                variant="danger"
                isLoading={updateItemsMutation.isPending}
            />
        </div>
    );
}

import { ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useComboDetail, useUpdateComboItems } from '@/hooks/queries/useCombo';
import { toComboItems } from './combo-utils';
import ComboVariantRow from './ComboVariantRow';
import type { Combo } from '../../types';

interface ChildComboItemsProps {
    childId: string;
    childName: string;
    parentChildData?: Combo;
    isDense?: boolean;
}

export default function ChildComboItems({
    childId,
    childName,
    parentChildData,
    isDense = false
}: ChildComboItemsProps) {
    const { data: detail, isLoading } = useComboDetail(childId, true);
    const updateItemsMutation = useUpdateComboItems();

    const items = toComboItems(detail || parentChildData);

    const handleUpdateQuantity = async (itemKey: string, newQty: number) => {
        if (!detail || newQty < 1) return;
        const [pId] = itemKey.split('|'); // pId is productVariantId

        const updatedItems = detail.productItems?.map(i => {
            if (i.productVariantId === pId) {
                return { ...i, quantity: newQty };
            }
            return i;
        }) || [];

        const itemsUpdate = updatedItems.map(i => ({
            productVariantId: i.productVariantId,
            quantity: i.quantity
        }));

        try {
            await updateItemsMutation.mutateAsync({ id: childId, items: itemsUpdate });
        } catch (e) {
            // Error is handled via hook's toast & rollback
        }
    };

    const handleDeleteItem = async (itemKey: string) => {
        if (!detail || !confirm('Remove this item from combo?')) return;
        const [pId] = itemKey.split('|'); // pId is productVariantId

        const updatedItems = detail.productItems?.filter(i =>
            i.productVariantId !== pId
        ) || [];

        const itemsUpdate = updatedItems.map(i => ({
            productVariantId: i.productVariantId,
            quantity: i.quantity
        }));
        await updateItemsMutation.mutateAsync({ id: childId, items: itemsUpdate });
    };

    if (isLoading && !detail) {
        return (
            <div className="p-8 space-y-4">
                <div className="flex items-center justify-between mb-4 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <Skeleton className="h-6 w-1/3 bg-slate-100" />
                    <Skeleton className="h-4 w-1/4 bg-slate-100" />
                </div>
                <Skeleton className="h-14 w-full bg-slate-100/50 rounded-xl" />
                <Skeleton className="h-14 w-full bg-slate-100/50 rounded-xl" />
                <Skeleton className="h-14 w-full bg-slate-100/50 rounded-xl" />
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-100">
                <ShoppingBag className="h-10 w-10 text-gray-200 mb-3" />
                <p className="text-sm text-gray-400 font-medium">No constituent components found for: <br /><span className="text-gray-600 font-bold">{childName}</span></p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className={`grid grid-cols-[1fr_120px_100px_80px] gap-4 px-8 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50 border-b border-gray-100 ${isDense ? 'py-2 px-6' : ''}`}>
                <div>Constituent Component</div>
                <div className="text-right">Value</div>
                <div className="text-center">Qty</div>
                <div className="text-right">Action</div>
            </div>
            <div className="divide-y divide-gray-50">
                {items.map((item, i) => (
                    <ComboVariantRow
                        key={`${item.productId}|${item.variantId ?? i}`}
                        item={item}
                        onQuantityChange={handleUpdateQuantity}
                        onDelete={handleDeleteItem}
                        isLoading={updateItemsMutation.isPending}
                        isDense={isDense}
                    />
                ))}
            </div>
        </div>
    );
}

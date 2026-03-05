import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';

interface ComboHeaderProps {
    comboName: string;
    itemsCount: number;
    discount: number;
    onAddItem?: () => void;
}

export default function ComboHeader({ comboName, itemsCount, discount, onAddItem }: ComboHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-5 px-1">
            <div className="flex items-center gap-3">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                    <Package className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-gray-800">
                        Items in <span className="text-purple-600 font-extrabold">{comboName}</span>
                    </span>
                    <Badge variant="outline" className="h-6 px-2 text-[11px] font-medium bg-gray-50 text-gray-600 border-gray-200 rounded-full">
                        {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                    </Badge>
                    <Badge variant="outline" className="h-6 px-2 text-[11px] font-bold bg-orange-50 text-orange-600 border-orange-100 rounded-full uppercase tracking-tight">
                        {discount}% OFF
                    </Badge>
                </div>
            </div>
            <Button
                size="sm"
                className="h-9 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold gap-2 rounded-xl shadow-sm transition-all active:scale-95"
                onClick={onAddItem}
            >
                <Plus className="h-4 w-4" />
                Add Item
            </Button>
        </div>
    );
}

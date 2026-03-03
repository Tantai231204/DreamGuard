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
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold text-gray-700">
                    Items in <span className="text-purple-600">{comboName}</span>
                </span>
                <Badge variant="outline" className="text-xs bg-white">
                    {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                </Badge>
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                    {discount}% OFF
                </Badge>
            </div>
            <Button
                size="sm"
                className="h-8 bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 rounded-lg"
                onClick={onAddItem}
            >
                <Plus className="h-3.5 w-3.5" />
                Add Item
            </Button>
        </div>
    );
}

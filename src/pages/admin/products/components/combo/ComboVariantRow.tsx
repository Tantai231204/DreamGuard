import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Save, X as XIcon } from 'lucide-react';
import type { ComboItem } from '../../types';

interface ComboVariantRowProps {
    item: ComboItem;
    onQuantityChange?: (itemKey: string, quantity: number) => void;
    onDelete?: (itemKey: string) => void;
}

// Helper to parse variant label into color and size
const parseVariantLabel = (label: string) => {
    const parts = label.split(/[-/,]/).map(p => p.trim());
    if (parts.length >= 2) {
        return { color: parts[0], size: parts[1] };
    }
    return { color: label, size: null };
};

// Color mapping for visualization
const getColorHex = (colorName: string): string => {
    const colorMap: Record<string, string> = {
        'Red': '#EF4444',
        'Blue': '#3B82F6',
        'Green': '#10B981',
        'Yellow': '#FBBF24',
        'Purple': '#A855F7',
        'Pink': '#EC4899',
        'Orange': '#F97316',
        'Black': '#1F2937',
        'White': '#FFFFFF',
        'Gray': '#9CA3AF',
        'Grey': '#9CA3AF',
        'Brown': '#92400E',
        'Beige': '#E5D4C1',
        'Navy': '#1E3A8A',
        'Teal': '#14B8A6',
        'Lavender': '#C4B5FD',
        'Cyan': '#06B6D4',
        'Indigo': '#6366F1',
        'Lime': '#84CC16',
        'Emerald': '#10B981',
    };
    return colorMap[colorName] || '#9CA3AF';
};

export default function ComboVariantRow({ item, onQuantityChange, onDelete }: ComboVariantRowProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editQuantity, setEditQuantity] = useState(item.quantity);

    const itemKey = `${item.productId}-${item.variantId || 'default'}`;
    const variantInfo = item.variantLabel ? parseVariantLabel(item.variantLabel) : null;
    const colorHex = variantInfo?.color ? getColorHex(variantInfo.color) : '#9CA3AF';

    const handleEditStart = () => {
        setIsEditing(true);
        setEditQuantity(item.quantity);
    };

    const handleSave = () => {
        onQuantityChange?.(itemKey, editQuantity);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditQuantity(item.quantity);
        setIsEditing(false);
    };

    return (
        <div className="flex items-center gap-4 px-4 py-3 hover:bg-blue-50/30 transition-colors group">
            {/* Color Indicator */}
            {variantInfo && (
                <div className="flex items-center gap-2 w-32 flex-shrink-0">
                    <div
                        className="h-5 w-5 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: colorHex }}
                        title={variantInfo.color}
                    />
                    <span className="text-sm font-semibold text-gray-800">{variantInfo.color}</span>
                </div>
            )}

            {/* Size */}
            <div className="w-20 flex-shrink-0">
                {variantInfo?.size ? (
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-gray-100 text-xs font-bold text-gray-700 min-w-[60px]">
                        {variantInfo.size}
                    </span>
                ) : (
                    <span className="text-xs text-gray-400">—</span>
                )}
            </div>

            {/* SKU / Variant ID */}
            <div className="w-32 flex-shrink-0">
                {item.variantId ? (
                    <span className="font-mono text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                        {item.variantId}
                    </span>
                ) : (
                    <span className="text-xs text-gray-400">Base</span>
                )}
            </div>

            {/* Quantity */}
            <div className="w-28 flex-shrink-0">
                {isEditing ? (
                    <Input
                        type="number"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(Number(e.target.value))}
                        className="h-8 text-center text-xs font-semibold"
                        min={1}
                        autoFocus
                    />
                ) : (
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">Qty:</span>
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded bg-purple-100 text-xs font-bold text-purple-700 min-w-[40px]">
                            {item.quantity}
                        </span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                {isEditing ? (
                    <>
                        <Button
                            size="sm"
                            className="h-7 w-7 p-0 rounded-md bg-green-600 hover:bg-green-700"
                            onClick={handleSave}
                        >
                            <Save className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 rounded-md"
                            onClick={handleCancel}
                        >
                            <XIcon className="h-3.5 w-3.5" />
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 rounded-md hover:bg-blue-100 hover:text-blue-700"
                            onClick={handleEditStart}
                        >
                            <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 rounded-md hover:bg-red-100 hover:text-red-700"
                            onClick={() => onDelete?.(itemKey)}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

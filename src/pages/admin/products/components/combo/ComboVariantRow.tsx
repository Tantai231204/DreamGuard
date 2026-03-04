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
    if (!label) return { color: 'Standard', size: 'Base' };

    // Split by common separators
    const parts = label.split(/[-/,]/).map(p => p.trim());
    if (parts.length >= 2) {
        return { color: parts[0], size: parts[1] };
    }

    // Fallback for SKU like BABY-BEDD-N-V001 (not perfect but better than nothing)
    if (label.includes('-V')) {
        return { color: label, size: 'Variant' };
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
        <div className="flex items-center gap-6 px-8 py-5 hover:bg-gray-50/50 transition-colors group relative">
            {/* Color Indicator */}
            {variantInfo && (
                <div className="flex items-center gap-3 min-w-[140px] flex-shrink-0">
                    <div
                        className="h-6 w-6 rounded-full border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: colorHex }}
                        title={variantInfo.color}
                    />
                    <span className="text-[14px] font-bold text-gray-700">{variantInfo.color}</span>
                </div>
            )}

            {/* Size */}
            <div className="min-w-[80px] flex-shrink-0">
                {variantInfo?.size ? (
                    <span className="inline-flex items-center justify-center h-7 px-4 rounded-full bg-gray-100 text-[11px] font-black text-gray-600 uppercase tracking-tighter">
                        {variantInfo.size}
                    </span>
                ) : (
                    <span className="text-xs text-gray-300">—</span>
                )}
            </div>

            {/* SKU / Variant ID (Tiny mono box) */}
            <div className="min-w-[100px] flex-shrink-0">
                {item.variantId ? (
                    <span className="font-mono text-[9px] font-bold text-gray-300 border border-gray-100 px-2 py-1 rounded-md uppercase">
                        {item.variantId}
                    </span>
                ) : (
                    <span className="text-[10px] text-gray-300 font-bold uppercase">Base</span>
                )}
            </div>

            {/* Quantity */}
            <div className="min-w-[120px] flex-shrink-0">
                {isEditing ? (
                    <Input
                        type="number"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(Number(e.target.value))}
                        className="h-8 w-20 text-center text-xs font-bold border-purple-200 focus-visible:ring-purple-500"
                        min={1}
                        autoFocus
                    />
                ) : (
                    <div className="flex items-baseline gap-2">
                        <span className="text-[12px] font-bold text-gray-400">Qty:</span>
                        <div className="inline-flex items-center justify-center h-8 px-4 rounded-lg bg-purple-50 text-[14px] font-black text-purple-700 min-w-[48px]">
                            {item.quantity}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                {isEditing ? (
                    <>
                        <Button
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                            onClick={handleSave}
                        >
                            <Save className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100"
                            onClick={handleCancel}
                        >
                            <XIcon className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            onClick={handleEditStart}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                            onClick={() => onDelete?.(itemKey)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Edit,
    Trash2,
    Plus,
    Layers,
    Package,
    Save,
    X as XIcon,
} from 'lucide-react';
import type { ComboItem } from '../types';

interface ComboItemsTableProps {
    items: ComboItem[];
    comboName: string;
    discount: number;
}

// Helper to parse variant label into color and size
const parseVariantLabel = (label: string) => {
    // Expected format: "Color - Size" or "Color/Size" etc.
    const parts = label.split(/[-/,]/).map(p => p.trim());
    if (parts.length >= 2) {
        return { color: parts[0], size: parts[1] };
    }
    return { color: label, size: null };
};

// Color mapping for visualization - Enhanced visibility
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

export default function ComboItemsTable({ items, comboName, discount }: ComboItemsTableProps) {
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editQuantity, setEditQuantity] = useState<number>(1);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    // Group items by product
    const productGroups = items.reduce<Record<string, ComboItem[]>>((acc, item) => {
        const key = item.productId;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    const handleEditStart = (item: ComboItem) => {
        setEditingItem(`${item.productId}-${item.variantId || 'default'}`);
        setEditQuantity(item.quantity);
    };

    const handleEditSave = () => {
        console.log('Save quantity:', editQuantity);
        setEditingItem(null);
    };

    const handleEditCancel = () => {
        setEditingItem(null);
    };
    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
        >
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50/30 border-t border-b border-purple-200 px-6 py-4">
                {/* Header - Simple */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-semibold text-gray-700">
                            Items in <span className="text-purple-600">{comboName}</span>
                        </span>
                        <Badge variant="outline" className="text-xs bg-white border-purple-200">
                            {items.length} items
                        </Badge>
                        <Badge className="text-xs bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                            {discount}% OFF
                        </Badge>
                    </div>
                    <Button
                        size="sm"
                        className="h-8 bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 rounded-lg"
                        onClick={() => console.log('Add item to combo')}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Item
                    </Button>
                </div>

                {/* Items grouped by product */}
                <div className="space-y-3">
                    {Object.entries(productGroups).map(([productId, productItems], groupIndex) => {
                        const productName = productItems[0].productName;
                        const variantCount = productItems.length;

                        return (
                            <div key={productId} className="bg-white rounded-xl border border-purple-200 shadow-sm overflow-hidden">
                                {/* Product header */}
                                <div className="flex items-center justify-between px-4 py-2.5 bg-purple-50/50 border-b border-purple-100">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                                            {groupIndex + 1}
                                        </span>
                                        <Package className="h-4 w-4 text-purple-500" />
                                        <span className="text-sm font-semibold text-gray-800">{productName}</span>
                                        <Badge variant="outline" className="text-[10px] bg-white border-purple-200 text-purple-600">
                                            {variantCount} {variantCount === 1 ? 'variant' : 'variants'}
                                        </Badge>
                                    </div>
                                    <div className="text-[10px] font-mono text-gray-400">
                                        ID: {productId}
                                    </div>
                                </div>

                                {/* Variants list */}
                                <div className="divide-y divide-gray-50">
                                    <AnimatePresence mode="popLayout">
                                        {productItems.map((item, variantIndex) => {
                                            const itemKey = `${item.productId}-${item.variantId || 'default'}`;
                                            const isEditing = editingItem === itemKey;
                                            const variantInfo = item.variantLabel ? parseVariantLabel(item.variantLabel) : null;
                                            const colorHex = variantInfo?.color ? getColorHex(variantInfo.color) : '#9CA3AF';

                                            return (
                                                <motion.div
                                                    key={itemKey}
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ delay: variantIndex * 0.02 }}
                                                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50/20 transition-colors group"
                                                >
                                                    {/* Variant Info - Color and Size */}
                                                    <div className="flex-1 min-w-0">
                                                        {variantInfo ? (
                                                            <div className="flex items-center gap-2.5">
                                                                {/* Color circle */}
                                                                <div className="relative flex-shrink-0">
                                                                    <div
                                                                        className="h-8 w-8 rounded-full border-2 border-gray-300 shadow-sm ring-1 ring-gray-100"
                                                                        style={{ backgroundColor: colorHex }}
                                                                        title={variantInfo.color}
                                                                    />
                                                                </div>
                                                                {/* Color and Size badges */}
                                                                <div className="flex items-center gap-1.5">
                                                                    <Badge variant="outline" className="text-xs font-semibold bg-white text-gray-700 border-gray-300">
                                                                        {variantInfo.color}
                                                                    </Badge>
                                                                    {variantInfo.size && (
                                                                        <Badge variant="outline" className="text-xs font-semibold bg-blue-50 text-blue-700 border-blue-300">
                                                                            {variantInfo.size}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
                                                                    <Package className="h-3.5 w-3.5 text-gray-400" />
                                                                </div>
                                                                <span className="text-xs text-gray-500 font-medium">Base product</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Variant ID */}
                                                    {item.variantId && (
                                                        <div className="w-24 flex-shrink-0">
                                                            <span className="font-mono text-[10px] text-gray-400">
                                                                V:{item.variantId}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Quantity */}
                                                    <div className="w-20 flex-shrink-0 text-center">
                                                        {isEditing ? (
                                                            <Input
                                                                type="number"
                                                                value={editQuantity}
                                                                onChange={(e) => setEditQuantity(Number(e.target.value))}
                                                                className="h-7 w-16 text-center text-xs font-bold border-2 border-purple-300"
                                                                min={1}
                                                            />
                                                        ) : (
                                                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-purple-100 text-xs font-bold text-purple-700 min-w-[45px]">
                                                                ×{item.quantity}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className={`flex items-center gap-1 flex-shrink-0 transition-opacity ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                                        }`}>
                                                        {isEditing ? (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    className="h-7 w-7 p-0 rounded-md bg-green-500 hover:bg-green-600 text-white"
                                                                    onClick={handleEditSave}
                                                                >
                                                                    <Save className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 w-7 p-0 rounded-md hover:bg-gray-100"
                                                                    onClick={handleEditCancel}
                                                                >
                                                                    <XIcon className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 w-7 p-0 rounded-md hover:bg-purple-100 hover:text-purple-700"
                                                                    onClick={() => handleEditStart(item)}
                                                                >
                                                                    <Edit className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 w-7 p-0 rounded-md hover:bg-red-100 hover:text-red-700"
                                                                    onClick={() => console.log('Delete', item)}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary footer - Simple */}
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 px-1">
                    <span>
                        Total items:{' '}
                        <span className="font-bold text-gray-700">{totalItems}</span>
                    </span>
                    <span className="text-gray-300">|</span>
                    <span>
                        Unique products:{' '}
                        <span className="font-bold text-purple-600">{Object.keys(productGroups).length}</span>
                    </span>
                    <span className="text-gray-300">|</span>
                    <span>
                        Total variants:{' '}
                        <span className="font-bold text-blue-600">{items.length}</span>
                    </span>
                    <span className="text-gray-300">|</span>
                    <span>
                        Combo discount:{' '}
                        <span className="font-bold text-orange-600">{discount}%</span>
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

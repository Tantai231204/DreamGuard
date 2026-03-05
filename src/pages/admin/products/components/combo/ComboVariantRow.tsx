import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, X as XIcon } from 'lucide-react';
import type { ComboItem } from '../../types';

/* ─── Color helpers ─────────────────────────────────────── */
const COLOR_MAP: Record<string, string> = {
    white: '#f5f5f5', pink: '#ffc0cb', blue: '#add8e6', red: '#ff6b6b',
    green: '#90ee90', yellow: '#ffeb3b', orange: '#ffa500', purple: '#dda0dd',
    black: '#333333', gray: '#9e9e9e', grey: '#9e9e9e', brown: '#a0522d',
    beige: '#f5f5dc', navy: '#001f3f', cream: '#fffdd0', mint: '#98ff98',
    lavender: '#c4b5fd', teal: '#14b8a6', cyan: '#06b6d4', indigo: '#6366f1',
};

function getColorHex(name: string | undefined): string {
    if (!name) return '#e5e7eb';
    if (name.startsWith('#')) return name;
    return COLOR_MAP[name.toLowerCase().trim()] ?? '#e5e7eb';
}

/* ─── Parse "White / S" or "White-S" → {color, size} ───── */
function parseVariantLabel(label: string): { color: string; size: string | null } {
    if (!label) return { color: '—', size: null };
    const parts = label.split(/[/\-,]/).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) return { color: parts[0], size: parts[1] };
    return { color: parts[0] ?? label, size: null };
}

interface ComboVariantRowProps {
    item: ComboItem & { basePrice?: number; salePrice?: number };
    onQuantityChange?: (itemKey: string, qty: number) => void;
    onDelete?: (itemKey: string) => void;
}

export default function ComboVariantRow({ item, onQuantityChange, onDelete }: ComboVariantRowProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editQty, setEditQty] = useState(item.quantity);

    const itemKey = `${item.productId}-${item.variantId ?? 'default'}`;
    const { color, size } = item.variantLabel
        ? parseVariantLabel(item.variantLabel)
        : { color: '—', size: null };
    const colorHex = getColorHex(color);
    const sku = item.variantId ?? null;

    const handleSave = () => {
        onQuantityChange?.(itemKey, editQty);
        setIsEditing(false);
    };

    return (
        <div className="flex items-center gap-5 px-5 py-3.5 hover:bg-gray-50/60 transition-colors group">
            {/* Color dot + name */}
            <div className="flex items-center gap-2.5 min-w-[120px]">
                <span
                    className="h-5 w-5 rounded-full border border-gray-200 shadow-sm flex-shrink-0"
                    style={{ backgroundColor: colorHex }}
                    title={color}
                />
                <span className="text-[13px] font-semibold text-gray-700">
                    {color !== '—' ? color : <span className="text-gray-300">—</span>}
                </span>
            </div>

            {/* Size badge */}
            <div className="min-w-[70px]">
                {size ? (
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-gray-100 text-[11px] font-bold text-gray-600">
                        {size}
                    </span>
                ) : (
                    <span className="text-xs text-gray-300">—</span>
                )}
            </div>

            {/* SKU */}
            <div className="min-w-[80px]">
                {sku ? (
                    <span className="font-mono text-[11px] text-gray-400">
                        {sku}
                    </span>
                ) : (
                    <span className="text-[11px] text-gray-300">—</span>
                )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-2">
                <span className="text-[12px] text-gray-400 font-medium">Qty:</span>
                {isEditing ? (
                    <Input
                        type="number"
                        value={editQty}
                        onChange={(e) => setEditQty(Number(e.target.value))}
                        className="h-7 w-16 text-center text-xs font-bold border-purple-300 focus-visible:ring-purple-400"
                        min={1}
                        autoFocus
                    />
                ) : (
                    <span
                        className="inline-flex items-center justify-center h-7 px-3 rounded-md bg-indigo-50 text-[13px] font-black text-indigo-700 min-w-[36px] cursor-pointer hover:bg-indigo-100 transition-colors"
                        onClick={() => { setIsEditing(true); setEditQty(item.quantity); }}
                        title="Click to edit"
                    >
                        {item.quantity}
                    </span>
                )}
                {isEditing && (
                    <>
                        <Button size="sm" className="h-7 w-7 p-0 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md" onClick={handleSave}>
                            <Save className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-md hover:bg-gray-100" onClick={() => setIsEditing(false)}>
                            <XIcon className="h-3.5 w-3.5" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

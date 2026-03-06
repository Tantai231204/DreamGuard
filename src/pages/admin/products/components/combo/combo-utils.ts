import type { ComboItem } from '../../types';

/**
 * Normalizes color values. If it starts with # it's hex,
 * otherwise it returns the color as-is (supporting CSS color names) or a default.
 */
export function getColorHex(color: string | undefined): string {
    if (!color) return '#e5e7eb'; // Default gray
    if (color.startsWith('#')) return color;
    return color.toLowerCase().trim();
}

/**
 * Parses variant labels like "White / S" or "White-S" into color and size.
 */
export function parseVariantLabel(label: string): { color: string; size: string | null } {
    if (!label) return { color: '—', size: null };
    const parts = label.split(/[/\-,]/).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) return { color: parts[0], size: parts[1] };
    return { color: parts[0] ?? label, size: null };
}

/**
 * Maps raw combo data from various API formats to the internal ComboItem interface.
 */
export function toComboItems(combo: any): ComboItem[] {
    if (!combo) return [];

    // Prioritize productItems (returned by detailed getById API)
    const productItems = combo.productItems || [];
    if (Array.isArray(productItems) && productItems.length > 0) {
        return productItems.map((pi: any) => ({
            productId: pi.productVariantId || pi.productId || '',
            productName: pi.productName || 'Unknown',
            variantId: pi.sku || pi.variantId || '',
            variantLabel: pi.variantLabel || '',
            quantity: pi.quantity || 1,
            basePrice: pi.basePrice || 0,
            salePrice: pi.salePrice || 0,
        }));
    }

    // Fallback to standard items array
    const items = combo.items || [];
    if (Array.isArray(items) && items.length > 0) {
        return items.map((pi: any) => ({
            productId: pi.productId || '',
            productName: pi.productName || 'Unknown',
            variantId: pi.variantId || '',
            variantLabel: pi.variantLabel || '',
            quantity: pi.quantity || 1,
        }));
    }

    return [];
}

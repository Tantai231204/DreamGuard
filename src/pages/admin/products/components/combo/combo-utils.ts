import type { ComboItem } from '../../types';
import type { ComboResponse, ProductItemResponse, ComboItemResponse } from '@/api/services/comboService';

import { getColorHex } from '@/utils/color-utils';
export { getColorHex };

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
export function toComboItems(combo?: ComboResponse | null): ComboItem[] {
    if (!combo) return [];

    // Prioritize standard items array (matched with backend ComboItemResponse schema)
    const items = combo.items || [];
    if (Array.isArray(items) && items.length > 0) {
        return items.map((pi: ComboItemResponse) => ({
            productId: pi.productId || '',
            productName: pi.productName || 'Unknown',
            variantId: pi.variantId || '',
            variantLabel: pi.variantLabel || '',
            quantity: pi.quantity || 1,
        }));
    }

    // Fallback to deprecated productItems if needed
    const productItems = combo.productItems || [];
    if (Array.isArray(productItems) && productItems.length > 0) {
        return productItems.map((pi: ProductItemResponse) => ({
            productId: pi.productVariantId || '',
            productName: pi.productName || 'Unknown',
            variantId: pi.sku || '',
            variantLabel: '',
            quantity: pi.quantity || 1,
            basePrice: pi.basePrice || 0,
            salePrice: pi.salePrice || 0,
        }));
    }

    return [];
}

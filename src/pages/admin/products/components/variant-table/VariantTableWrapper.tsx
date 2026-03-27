import { useMemo, useCallback } from 'react';
import { useAdminProductVariants } from '@/hooks/queries/useProduct';
import VariantTable from './VariantTable';
import type { ProductVariant, VariantStatus, VariantAttributes } from '../../types';
import { getColorHex } from '@/pages/admin/products/utils/variant-utils'; // Added import

interface VariantTableWrapperProps {
    productId: string;
    productName: string;
    onAddVariant: () => void;
    onEditVariant: (variant: ProductVariant) => void;
    onDeleteVariant: (variant: ProductVariant) => void;
}

/**
 * Parse size string "WxLxT" into width/length/thickness numbers.
 * E.g. "20x20x20" → { width: 20, length: 20, thickness: 20 }
 */
function parseSizeDimensions(size?: string): { width?: number; length?: number; thickness?: number } {
    if (!size || !size.includes('x')) return {};
    const parts = size.split('x').map(Number);
    const result: { width?: number; length?: number; thickness?: number } = {};
    if (parts[0] && !isNaN(parts[0])) result.width = parts[0];
    if (parts[1] && !isNaN(parts[1])) result.length = parts[1];
    if (parts[2] && !isNaN(parts[2])) result.thickness = parts[2];
    return result;
}


export default function VariantTableWrapper({
    productId,
    productName,
    onAddVariant,
    onEditVariant,
    onDeleteVariant,
}: VariantTableWrapperProps) {
    // Use admin endpoint — returns ALL statuses (Draft, OutOfStock, Published...)
    const { data: adminData } = useAdminProductVariants(productId);

    // Build a map of ProductVariant by ID, reconstructing attributes from group + size
    const variantMap = useMemo(() => {
        const map = new Map<string, ProductVariant>();
        if (!adminData?.colorGroups) return map;

        for (const group of adminData.colorGroups) {
            for (const v of group.variants) {
                // Parse dimensions from size field
                const dims = parseSizeDimensions(v.size);

                // Build a unified attributes object taking from variant first, falling back to group properties.
                const attributes: VariantAttributes = {};

                if (dims.width) attributes.width = dims.width;
                if (dims.length) attributes.length = dims.length;
                if (dims.thickness) attributes.thickness = dims.thickness;

                // Safely merge API attributes BEFORE color resolution to ensure variant-specific colors win.
                if (v.attributes) {
                    Object.assign(attributes, v.attributes);
                }

                // Fallback coloring to Group if the variant doesn't explicitly store color overrides.
                if (!attributes.color && group.color) {
                    attributes.color = group.color;
                }
                if (!attributes.hexColor) {
                    if (group.hexColor) {
                        attributes.hexColor = group.hexColor;
                    } else if (attributes.color) {
                        attributes.hexColor = getColorHex(attributes.color);
                    }
                }
                if (dims.length) attributes.length = dims.length;
                if (dims.thickness) attributes.thickness = dims.thickness;

                const variant: ProductVariant = {
                    id: v.id,
                    sku: v.sku,
                    basePrice: v.basePrice,
                    salePrice: v.salePrice,
                    weight: v.weight,
                    attributes: Object.keys(attributes).length > 0 ? attributes : null,
                    status: (v.status || 'Published') as VariantStatus,
                    createdAt: v.createdAt || '',
                    isNew: v.isNew ?? false,
                    isCustomizable: v.isCustomizable ?? false,
                    customizeLabel: v.customizeLabel,
                    customizeTypes: v.customizeTypes,
                    customizeOptions: v.customizeOptions,
                    productId,
                    stockQuantity: v.stockQuantity,
                    stockStatus: v.stockStatus,
                };
                map.set(v.id, variant);
            }
        }
        return map;
    }, [adminData, productId]);

    // Adapt edit callback: lookup full variant by ID
    const handleEditVariant = useCallback((variantId: string) => {
        const variant = variantMap.get(variantId);
        if (variant) {
            onEditVariant(variant);
        } else {
            console.warn(`[VariantTableWrapper] Variant ${variantId} not found in admin data`);
        }
    }, [variantMap, onEditVariant]);

    // Adapt delete callback: lookup full variant by ID
    const handleDeleteVariant = useCallback((variantId: string) => {
        const variant = variantMap.get(variantId);
        if (variant) {
            onDeleteVariant(variant);
        } else {
            console.warn(`[VariantTableWrapper] Variant ${variantId} not found in admin data`);
        }
    }, [variantMap, onDeleteVariant]);

    return (
        <VariantTable
            productId={productId}
            productName={productName}
            onAddVariant={onAddVariant}
            onEditVariant={handleEditVariant}
            onDeleteVariant={handleDeleteVariant}
        />
    );
}

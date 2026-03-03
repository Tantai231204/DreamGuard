import { useMemo, useCallback } from 'react';
import { useProductVariants } from '@/hooks/queries/useProduct';
import VariantTable from './VariantTable';
import type { ProductVariant, VariantStatus } from '../../types';
import { INT_TO_VARIANT_STATUS } from '../../types';

interface VariantTableWrapperProps {
    productId: string;
    productName: string;
    onAddVariant: () => void;
    onEditVariant: (variant: ProductVariant) => void;
    onDeleteVariant: (variant: ProductVariant) => void;
}

export default function VariantTableWrapper({
    productId,
    productName,
    onAddVariant,
    onEditVariant,
    onDeleteVariant,
}: VariantTableWrapperProps) {
    // Fetch full variant data for lookup when editing
    const { data: apiVariants } = useProductVariants(productId);

    // Build a map of variants by ID for quick lookup
    const variantMap = useMemo(() => {
        const map = new Map<string, ProductVariant>();
        if (!apiVariants) return map;
        apiVariants.forEach((v) => {
            const variant: ProductVariant = {
                ...v,
                status: (INT_TO_VARIANT_STATUS[v.status] || 'Active') as VariantStatus,
                attributes: v.attributes as ProductVariant['attributes'],
            };
            map.set(v.id, variant);
        });
        return map;
    }, [apiVariants]);

    // Adapt edit callback: lookup full variant by ID
    const handleEditVariant = useCallback((variantId: string) => {
        const variant = variantMap.get(variantId);
        if (variant) {
            onEditVariant(variant);
        }
    }, [variantMap, onEditVariant]);

    // Adapt delete callback: lookup full variant by ID
    const handleDeleteVariant = useCallback((variantId: string) => {
        const variant = variantMap.get(variantId);
        if (variant) {
            onDeleteVariant(variant);
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

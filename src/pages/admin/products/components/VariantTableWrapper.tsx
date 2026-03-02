import { useMemo } from 'react';
import { useProductVariants } from '@/hooks/queries/useProduct';
import VariantTable from './VariantTable';
import type { ProductVariant, VariantStatus } from '../types';
import { INT_TO_VARIANT_STATUS } from '../types';

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
    const { data: apiVariants } = useProductVariants(productId);

    // Map API response to ProductVariant type with proper status conversion
    const variants: ProductVariant[] = useMemo(() => {
        if (!apiVariants) return [];
        return apiVariants.map((v) => ({
            ...v,
            status: (INT_TO_VARIANT_STATUS[v.status] || 'Active') as VariantStatus,
            attributes: v.attributes as ProductVariant['attributes'],
        }));
    }, [apiVariants]);

    if (variants.length === 0) {
        return (
            <div className="bg-gray-50 border-t border-b border-gray-200 px-6 py-8 text-center">
                <p className="text-sm text-gray-500 mb-3">No variants found for this product.</p>
                <button
                    onClick={onAddVariant}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    + Add New Variant
                </button>
            </div>
        );
    }

    return (
        <VariantTable
            variants={variants}
            productName={productName}
            onAddVariant={onAddVariant}
            onEditVariant={onEditVariant}
            onDeleteVariant={onDeleteVariant}
        />
    );
}

import { useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Loader2 } from 'lucide-react';
import type { ProductVariant, VariantStatus, VariantAttributes, ExtendedProductVariant } from '../../types';
import { useVariantDetail } from '@/hooks/queries/useProduct';
import VariantDialogForm from './VariantDialogForm';

export interface VariantSubmitData {
    productid: string;
    sku: string;
    baseprice: number;
    saleprice: number;
    weight: number;
    status: VariantStatus;
    stockStatus: string;
    stockQuantity: number;
    attributes: VariantAttributes | null;
    color?: string;
    hexColor?: string;
    colorHex?: string;
    isNew: boolean;
    isCustomizable: boolean;
    customizeLabel?: string;
    pendingCustoms?: { customizeTypeId: string; overridePrice: number | null }[];
    customizeTypeIds?: string[];
}

interface VariantDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    variant?: ProductVariant | null;
    productId: string;
    productName: string;
    productSlug?: string;
    variantCount?: number;
    onSubmit: (data: VariantSubmitData) => void;
    isLoading?: boolean;
    productType?: import("@/api/types/product.types").FullyCustomizedProductType;
}

export default function VariantDialog({
    open,
    onOpenChange,
    variant,
    productId,
    productName,
    productSlug,
    variantCount,
    onSubmit,
    isLoading,
    productType,
}: VariantDialogProps) {
    const isEdit = Boolean(variant);

    const { data: fullData, isLoading: isLoadingDetail } = useVariantDetail(
        variant?.id || '',
        open && isEdit
    );

    const resolvedVariant = useMemo(() => {
        if (!variant) return null;
        if (!fullData) return variant;
        
        const typedDetail = fullData as ExtendedProductVariant;
        
        return {
            ...variant,
            ...typedDetail,
            weight: typedDetail.weight ?? variant.weight,
            isNew: typedDetail.isNew ?? variant.isNew,
            attributes: typedDetail.attributes ?? variant.attributes,
            status: (typedDetail.status || variant.status) as VariantStatus,
            isCustomizable: typedDetail.isCustomizable ?? variant.isCustomizable,
            customizeLabel: typedDetail.customizeLabel ?? variant.customizeLabel,
            customizeTypes: typedDetail.customizeTypes ?? variant.customizeTypes,
            customizeOptionGroups: typedDetail.customizeOptionGroups ?? (variant as ExtendedProductVariant).customizeOptionGroups,
        } as ProductVariant;
    }, [variant, fullData]);

    const showLoading = isEdit && isLoadingDetail && !fullData;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[740px] w-[95vw] min-h-[600px] h-[90vh] max-h-[850px] flex flex-col rounded-2xl p-0 gap-0 overflow-hidden border-slate-100 shadow-2xl">
                <VisuallyHidden>
                    <DialogTitle>
                        {isEdit ? 'Configure Variant' : 'New Creation'}
                    </DialogTitle>
                </VisuallyHidden>

                {showLoading ? (
                    <div className="flex-1 flex items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-[#4988c4]" />
                    </div>
                ) : (
                    <VariantDialogForm
                        key={resolvedVariant?.id ? `${resolvedVariant.id}-${!!fullData}` : 'new-variant'}
                        variant={resolvedVariant as ExtendedProductVariant}
                        productId={productId}
                        productName={productName}
                        productSlug={productSlug}
                        variantCount={variantCount}
                        onOpenChange={onOpenChange}
                        onSubmit={onSubmit}
                        isLoading={isLoading}
                        productType={productType}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

import { useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Loader2 } from 'lucide-react';
import type { ProductVariant, VariantStatus, VariantAttributes } from '../../types';
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
    isNew: boolean;
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
}: VariantDialogProps) {
    const isEdit = Boolean(variant);

    const { data: fullData, isLoading: isLoadingDetail } = useVariantDetail(
        variant?.id || '', 
        open && isEdit
    );

    const resolvedVariant = useMemo(() => {
        if (!variant) return null;
        if (!fullData) return variant;
        return {
            ...variant,
            ...fullData,
            weight: fullData.weight ?? variant.weight,
            isNew: fullData.isNew ?? variant.isNew,
            attributes: fullData.attributes ?? variant.attributes,
            status: (fullData.status || variant.status) as VariantStatus,
        } as ProductVariant;
    }, [variant, fullData]);

    const showLoading = isEdit && isLoadingDetail && !fullData;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[740px] w-full min-h-[600px] h-[90vh] max-h-[850px] rounded-2xl p-7 gap-0 overflow-hidden border-slate-100 shadow-2xl">
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
                        variant={resolvedVariant}
                        productId={productId}
                        productName={productName}
                        productSlug={productSlug}
                        variantCount={variantCount}
                        onOpenChange={onOpenChange}
                        onSubmit={onSubmit}
                        isLoading={isLoading}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

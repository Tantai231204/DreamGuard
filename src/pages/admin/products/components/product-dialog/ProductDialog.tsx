import { useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useProductDetail } from '@/hooks/queries/useProduct';
import type { Product, CreateProductRequest } from '../../types';
import { INT_TO_STATUS } from '../../types';
import type { CategoryResponse } from '@/api';
import ProductDialogForm from './ProductDialogForm';

interface ProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: Product | null;
    onSubmit: (data: CreateProductRequest) => void | Promise<void>;
    isLoading?: boolean;
    categories?: CategoryResponse[];
}

export default function ProductDialog({
    open,
    onOpenChange,
    product,
    onSubmit,
    isLoading,
    categories,
}: ProductDialogProps) {
    const isEdit = !!product;

    // Fetch full product detail from API when editing
    const { data: productDetail, isLoading: isLoadingDetail } = useProductDetail(
        product?.id ?? '',
        open && isEdit, // only fetch when dialog is open & editing
    );

    // Merge API response into local Product type (status int → string)
    const resolvedProduct = useMemo<Product | null>(() => {
        if (!product) return null;
        if (!productDetail) return product; // fallback to list data while loading
        // Exclude `variants` from API response to avoid type mismatch
        // (ProductVariantResponse.status is number, ProductVariant.status is VariantStatus)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { variants: _v, ...detail } = productDetail;
        return {
            ...product,
            ...detail,
            status: INT_TO_STATUS[productDetail.status] ?? product.status,
        };
    }, [product, productDetail]);

    const showLoading = isEdit && isLoadingDetail && !productDetail;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[740px] rounded-2xl p-7 gap-0">
                {showLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    </div>
                ) : (
                    <ProductDialogForm
                        key={resolvedProduct?.id ?? 'new'}
                        product={resolvedProduct}
                        onOpenChange={onOpenChange}
                        onSubmit={onSubmit}
                        isLoading={isLoading}
                        categories={categories}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

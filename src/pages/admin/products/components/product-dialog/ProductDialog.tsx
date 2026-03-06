import { useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Loader2 } from "lucide-react";
import { useProductDetail } from "@/hooks/queries/useProduct";

import type {
    Product,
    CreateProductRequest,
    ProductStatus,
} from "../../types";

import type { CategoryResponse } from "@/api";

import ProductDialogForm from "./ProductDialogForm";

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
    const isEdit = Boolean(product);

    /**
     * Fetch product detail only when:
     * - dialog open
     * - editing product
     */
    const { data: productDetail, isLoading: isLoadingDetail } =
        useProductDetail(product?.id ?? "", open && isEdit);

    /**
     * Merge product list item + product detail
     * Transform API fields → UI types
     */
    const resolvedProduct = useMemo<Product | null>(() => {
        if (!product) return null;
        if (!productDetail) return product;

        const mappedVariants =
            productDetail.variants?.map((v) => ({
                ...v,
                status: v.status as ProductStatus,
            })) ?? undefined;

        return {
            ...product,
            ...productDetail,

            status:
                (productDetail.status as ProductStatus) ??
                product.status,

            ageGroup:
                productDetail.ageGroup !== null
                    ? String(productDetail.ageGroup)
                    : null,

            variants: mappedVariants,
        };
    }, [product, productDetail]);

    /**
     * Show loading spinner only when editing
     */
    const showLoading =
        isEdit && isLoadingDetail && !productDetail;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[740px] rounded-2xl p-7 gap-0">
                <VisuallyHidden>
                    <DialogTitle>
                        {isEdit ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                </VisuallyHidden>
                {showLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    </div>
                ) : (
                    <ProductDialogForm
                        key={resolvedProduct?.id ?? "create-product"}
                        product={resolvedProduct}
                        onSubmit={onSubmit}
                        onOpenChange={onOpenChange}
                        isLoading={isLoading}
                        categories={categories}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
import { useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Loader2 } from "lucide-react";
import { useProductDetail } from "@/hooks/queries/useProduct";
import { useProductCertificates } from "@/hooks/queries/useCertificate";

import type {
    Product,
    CreateProductRequest,
    ProductStatus,
} from "../../types";

import type { CategoryResponse } from "@/api";

interface ProductWithCerts extends Product {
    certificateIds?: string[];
}

import ProductDialogForm from "./ProductDialogForm";

interface ProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: Product | null;
    onSubmit: (data: CreateProductRequest) => void | Promise<void>;
    isLoading?: boolean;
    categories?: CategoryResponse[];
    certificates?: import('../../types').Certificate[];
}

export default function ProductDialog({
    open,
    onOpenChange,
    product,
    onSubmit,
    isLoading,
    categories,
    certificates,
}: ProductDialogProps) {
    const isEdit = Boolean(product);

    /**
     * Senior Optimization: Hybrid Fetching
     * 1. Fetch Product Core Detail (Variants, Basic Info)
     * 2. Fetch Assigned Certificates specifically for this Product ID
     */
    const { data: productDetail, isLoading: isLoadingDetail } =
        useProductDetail(product?.id ?? "", open && isEdit);

    const { data: assignedCerts, isLoading: isLoadingCerts } =
        useProductCertificates(product?.id ?? "");

    /**
     * Merge product list item + product detail
     * Transform API fields → UI types
     */
    const resolvedProduct = useMemo<Product | null>(() => {
        if (!product) return null;
        if (isEdit && !productDetail) return product;

        const mappedVariants =
            productDetail?.variants?.map((v) => ({
                ...v,
                status: v.status as ProductStatus,
            })) ?? undefined;

        // Collect certificate IDs from all possible API sources
        const certIds = [
            ...(productDetail?.CertificateIds || []),
            ...((productDetail as ProductWithCerts)?.certificateIds || []),
            ...(assignedCerts?.map(c => c.id) || [])
        ];

        // Remove duplicates
        const uniqueCertIds = Array.from(new Set(certIds));

        return {
            ...product,
            ...(productDetail || {}),
            status: (productDetail?.status as ProductStatus) ?? product.status,
            ageGroup: productDetail?.ageGroup != null ? String(productDetail.ageGroup) : null,
            variants: mappedVariants,
            CertificateIds: uniqueCertIds,
        };
    }, [product, productDetail, assignedCerts, isEdit]);

    /**
     * Show loading spinner only when editing
     */
    const showLoading = isEdit && (isLoadingDetail || isLoadingCerts) && !productDetail;

    /**
     * Senior Optimization: Key-based State Invalidation
     * We include the certificate list in the key to force-remount the form
     * when the hybrid cache is updated. This prevents stale state during edit.
     */
    const formKey = useMemo(() => {
        if (!resolvedProduct) return "create-product";
        const certsString = resolvedProduct.CertificateIds?.join(',') || 'empty';
        return `${resolvedProduct.id}-${certsString}`;
    }, [resolvedProduct]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[740px] h-[800px] max-h-[90vh] flex flex-col rounded-2xl p-7 gap-0">
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
                        key={formKey}
                        product={resolvedProduct}
                        onSubmit={onSubmit}
                        onOpenChange={onOpenChange}
                        isLoading={isLoading}
                        categories={categories}
                        certificates={certificates}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
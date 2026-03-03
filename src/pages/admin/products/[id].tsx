import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Star, Layers, Upload, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { useProductDetail, useUploadProductImage, useDeleteProductImage, productKeys } from '@/hooks/queries/useProduct';
import { useQueryClient } from '@tanstack/react-query';
import { AGE_GROUPS, INT_TO_STATUS } from './types';
import { DetailSkeleton, ImageLightbox, ProductInfoCard, ProductImagesCard, QuickInfoCard } from './components/detail';
import ImageUploadDialog from './components/ImageUploadDialog';
/* ─── Helpers ─────────────────────────────────────────── */
function resolveStatus(raw: unknown): string {
    if (typeof raw === 'string') return raw;
    if (typeof raw === 'number') return INT_TO_STATUS[raw] ?? 'Unknown';
    return 'Unknown';
}

function formatDate(iso: string) {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
}

import { PRODUCT_STATUS_VARIANT } from './types';

/* ─── Page ─────────────────────────────────────────────── */
export default function AdminProductDetailPage() {
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: product, isLoading, isError } = useProductDetail(id ?? '');

    const uploadMutation = useUploadProductImage();
    const deleteMutation = useDeleteProductImage();

    const [copiedSlug, setCopiedSlug] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    /* ── Loading ── */
    if (isLoading) return <DetailSkeleton />;

    /* ── Error ── */
    if (isError || !product) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-gray-400">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 border border-gray-100">
                    <Package size={28} className="text-gray-300" />
                </div>
                <div className="text-center">
                    <p className="text-base font-semibold text-gray-600">Product not found</p>
                    <p className="mt-1 text-sm text-gray-400">The product may have been deleted or moved.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => navigate('/admin/products')}
                    className="mt-2 gap-2 rounded-xl"
                >
                    <ArrowLeft size={15} />
                    Back to products
                </Button>
            </div>
        );
    }

    /* ── Data ── */
    const status = resolveStatus(product.status);
    const statusVariant = PRODUCT_STATUS_VARIANT[status as keyof typeof PRODUCT_STATUS_VARIANT] ?? 'outline';
    const ageGroupLabel = product.ageGroup != null ? AGE_GROUPS[product.ageGroup] : null;
    const assets = product.assets ?? [];

    const handleCopySlug = () => {
        navigator.clipboard.writeText(product.slug);
        setCopiedSlug(true);
        setTimeout(() => setCopiedSlug(false), 2000);
    };

    return (
        <div className="flex flex-col h-full">
            {/* ── Header ── */}
            <AdminPageHeader
                title={product.name}
                description={product.slug}
                icon={Package}
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'Products', href: '/admin/products' },
                    { label: product.name },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={statusVariant}
                            className="text-sm px-3 py-1 font-semibold"
                        >
                            {status}
                        </Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 rounded-xl hover:bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20 text-[var(--color-primary)]"
                            onClick={() => navigate('/admin/products')}
                        >
                            <Pencil size={14} />
                            Edit
                        </Button>
                    </div>
                }
                stats={[
                    { label: 'Variants', value: product.variantCount ?? 0, icon: Layers },
                    { label: 'Rating', value: product.averageRating?.toFixed(1) ?? '0.0', icon: Star },
                    { label: 'Images', value: assets.length, icon: Upload },
                ]}
            />

            {/* ── Content ── */}
            <div className="flex-1 overflow-auto bg-[#f8f9fb]">
                <div className="p-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left — main info */}
                        <div className="lg:col-span-2">
                            <ProductInfoCard
                                product={{
                                    name: product.name,
                                    slug: product.slug,
                                    ageGroupLabel,
                                    material: product.material,
                                    averageRating: product.averageRating,
                                    createdAt: product.createdAt,
                                    warrantyPolicyDay: product.warrantyPolicyDay ?? undefined,
                                    returnPolicyDay: product.returnPolicyDay ?? undefined,
                                    summary: product.summary,
                                    description: product.description,
                                }}
                                copiedSlug={copiedSlug}
                                onCopySlug={handleCopySlug}
                                formatDate={formatDate}
                            />
                        </div>

                        {/* Right — sidebar */}
                        <div className="space-y-4">
                            <ProductImagesCard
                                assets={assets}
                                productName={product.name}
                                onOpenLightbox={setLightboxIndex}
                                onOpenUploadDialog={() => setShowUploadDialog(true)}
                                onDeleteImage={async (assetId) => {
                                    setDeletingAssetId(assetId);
                                    try {
                                        await deleteMutation.mutateAsync(assetId);
                                        // Refetch product detail to update images
                                        queryClient.invalidateQueries({ queryKey: productKeys.detail(product.id) });
                                    } finally {
                                        setDeletingAssetId(null);
                                    }
                                }}
                                isDeleting={deleteMutation.isPending}
                                deletingAssetId={deletingAssetId}
                            />
                            <QuickInfoCard
                                status={status}
                                statusVariant={statusVariant}
                                cateId={product.cateId ?? undefined}
                                variantCount={product.variantCount}
                                minPrice={product.minPrice}
                                maxPrice={product.maxPrice}
                                productId={product.id}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Lightbox ── */}
            {lightboxIndex !== null && assets.length > 0 && (
                <ImageLightbox
                    images={assets}
                    currentIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onPrev={() => setLightboxIndex((p) => (p! - 1 + assets.length) % assets.length)}
                    onNext={() => setLightboxIndex((p) => (p! + 1) % assets.length)}
                />
            )}

            {/* ── Upload Dialog ── */}
            <ImageUploadDialog
                open={showUploadDialog}
                onOpenChange={setShowUploadDialog}
                productId={product.id}
                productName={product.name}
                onUpload={async (productId, files) => {
                    await uploadMutation.mutateAsync({ productId, files });
                    // Refetch product detail to update images
                    queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
                }}
                isUploading={uploadMutation.isPending}
            />
        </div>
    );
}
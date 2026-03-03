import { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Package, Star, Layers, Upload, Pencil, ArrowLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    useProductDetail,
    useUploadProductImage,
    useDeleteProductImage,
    productKeys,
} from '@/hooks/queries/useProduct';
import { useCategories } from '@/hooks/queries/useCategory';
import { useQueryClient } from '@tanstack/react-query';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { AGE_GROUPS, INT_TO_STATUS, PRODUCT_STATUS_VARIANT } from './types';
import type { ProductStatus } from './types';
import {
    DetailSkeleton,
    ImageLightbox,
    ProductInfoCard,
    ProductImagesCard,
    QuickInfoCard,
} from './components/detail';
import { ImageUploadDialog } from './components/dialogs';

/* ─── Constants ───────────────────────────────────────── */
const STATUS_STYLES: Record<string, { dot: string; bg: string; text: string }> = {
    Draft: { dot: 'bg-amber-400', bg: 'bg-amber-50', text: 'text-amber-700' },
    Published: { dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    OutOfStock: { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
    Hidden: { dot: 'bg-gray-400', bg: 'bg-gray-100', text: 'text-gray-600' },
};

const STATUS_LABELS: Record<string, string> = {
    Draft: 'Draft',
    Published: 'Published',
    OutOfStock: 'Out of Stock',
    Hidden: 'Hidden',
};

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

/* ─── Page ─────────────────────────────────────────────── */
export default function AdminProductDetailPage() {
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
    const [copiedSlug, setCopiedSlug] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: product, isLoading, isError } = useProductDetail(id ?? '');

    const uploadMutation = useUploadProductImage();
    const deleteMutation = useDeleteProductImage();
    const { data: categories } = useCategories();

    /* ── Clipboard helpers ── */
    const handleCopySlug = useCallback(() => {
        if (!product) return;
        navigator.clipboard.writeText(product.slug);
        setCopiedSlug(true);
        setTimeout(() => setCopiedSlug(false), 2000);
    }, [product]);

    /* ── Category name lookup ── */
    const categoryName = useMemo(() => {
        if (product?.categoryName) return product.categoryName;
        if (!product?.cateId || !categories) return null;
        const findCategory = (cats: typeof categories): string | null => {
            for (const cat of cats) {
                if (cat.cateId === product.cateId) return cat.name;
                const found = findCategory(cat.childCategoryList ?? []);
                if (found) return found;
            }
            return null;
        };
        return findCategory(categories);
    }, [product?.categoryName, product?.cateId, categories]);

    /* ── Keyboard shortcut: Escape to go back ── */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && lightboxIndex === null) navigate('/admin/products');
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [navigate, lightboxIndex]);

    /* ── Loading ── */
    if (isLoading) return <DetailSkeleton />;

    /* ── Error / Not Found ── */
    if (isError || !product) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-gray-400">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm"
                >
                    <Package size={32} className="text-gray-300" />
                </motion.div>
                <div className="text-center">
                    <p className="text-lg font-semibold text-gray-700">Product not found</p>
                    <p className="mt-1 text-sm text-gray-400 max-w-xs">
                        The product may have been deleted or the link is incorrect.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => navigate('/admin/products')}
                    className="gap-2 rounded-xl px-5"
                >
                    <ArrowLeft size={15} />
                    Back to Products
                </Button>
            </div>
        );
    }

    /* ── Data ── */
    const status = resolveStatus(product.status);
    const statusVariant = PRODUCT_STATUS_VARIANT[status as ProductStatus] ?? 'outline';
    const statusStyle = STATUS_STYLES[status] ?? STATUS_STYLES.Hidden;
    const ageGroupLabel = product.ageGroup != null ? AGE_GROUPS[product.ageGroup] : null;
    const assets = product.assets ?? [];

    const handleDeleteImage = async (assetId: string) => {
        setDeletingAssetId(assetId);
        try {
            await deleteMutation.mutateAsync(assetId);
            queryClient.invalidateQueries({ queryKey: productKeys.detail(product.id) });
        } finally {
            setDeletingAssetId(null);
        }
    };

    const handleUpload = async (productId: string, files: File[]) => {
        await uploadMutation.mutateAsync({ productId, files });
        queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
    };

    return (
        <div className="flex flex-col h-full">
            {/* ── Header (same style as other admin pages) ── */}
            <AdminPageHeader
                title={product.name}
                description={product.slug}
                icon={Package}
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'Products', href: '/admin/products' },
                    { label: product.name },
                ]}
                stats={[
                    { label: 'Variants', value: product.variantCount ?? 0, icon: Layers },
                    { label: 'Rating', value: product.averageRating?.toFixed(1) ?? '0.0', icon: Star },
                    { label: 'Images', value: assets.length, icon: Upload },
                ]}
                actions={
                    <>
                        <Badge
                            variant="outline"
                            className={`${statusStyle.bg} ${statusStyle.text} border-0 text-sm px-3 py-1 font-semibold`}
                        >
                            <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${statusStyle.dot}`} />
                            {STATUS_LABELS[status] ?? status}
                        </Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 hover:bg-gray-50"
                            onClick={() => navigate('/admin/products')}
                        >
                            <Pencil className="h-4 w-4" />
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            className="gap-2 bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:from-[var(--color-primary-hover)] hover:to-blue-700 shadow-sm"
                            onClick={() => setShowUploadDialog(true)}
                        >
                            <Upload className="h-4 w-4" />
                            Upload
                        </Button>
                    </>
                }
            />

            {/* ── Content with Tabs ── */}
            <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
                <div className="px-6 pt-5 pb-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
                        <TabsList className="bg-white border border-gray-200 shadow-sm rounded-xl p-1 h-auto">
                            <TabsTrigger
                                value="overview"
                                className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--color-primary)] data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                            >
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="images"
                                className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-[var(--color-primary)] data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
                            >
                                Images
                                {assets.length > 0 && (
                                    <span className="ml-1.5 text-[10px] font-bold bg-gray-200 data-[state=active]:bg-white/20 text-gray-500 data-[state=active]:text-white/80 px-1.5 py-0.5 rounded-md tabular-nums">
                                        {assets.length}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        {/* ── Overview Tab ── */}
                        <TabsContent value="overview" className="mt-0">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                                <div className="space-y-5">
                                    <QuickInfoCard
                                        status={status}
                                        statusVariant={statusVariant}
                                        categoryName={categoryName ?? undefined}
                                        variantCount={product.variantCount}
                                        minPrice={product.minPrice}
                                        maxPrice={product.maxPrice}
                                        productId={product.id}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* ── Images Tab ── */}
                        <TabsContent value="images" className="mt-0">
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25 }}
                                className="max-w-3xl"
                            >
                                <ProductImagesCard
                                    assets={assets}
                                    productName={product.name}
                                    onOpenLightbox={setLightboxIndex}
                                    onOpenUploadDialog={() => setShowUploadDialog(true)}
                                    onDeleteImage={handleDeleteImage}
                                    isDeleting={deleteMutation.isPending}
                                    deletingAssetId={deletingAssetId}
                                />
                            </motion.div>
                        </TabsContent>
                    </Tabs>
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
                onUpload={handleUpload}
                isUploading={uploadMutation.isPending}
            />
        </div>
    );
}

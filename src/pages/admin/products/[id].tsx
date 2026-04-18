import { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Package, ArrowLeft, Upload, Copy, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProductDescriptionCard from './components/detail/ProductDescriptionCard';
import ProductDialog from './components/product-dialog';
import { TemplateDialog } from '../templates/components/TemplateDialog';
import { Badge } from '@/components/ui/badge';
import { Layers } from 'lucide-react';
import {
    useProductDetail,
    useUploadProductImage,
    useDeleteProductImage,
    useUpdateProduct,
    productKeys,
} from '@/hooks/queries/useProduct';
import type { UpdateProductRequest } from '@/api';
import { useProductCertificates } from '@/hooks/queries/useCertificate';
import { useCategories } from '@/hooks/queries/useCategory';
import { useQueryClient } from '@tanstack/react-query';
import { AdminStatusBadge } from '@/components/admin';
import { formatDate } from '@/lib/utils';
import { AGE_GROUPS } from './types';
import { UserRole } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';
import {
    DetailSkeleton,
    ImageLightbox,
    ProductInfoCard,
    ProductImagesCard,
    QuickInfoCard,
    ProductCertificatesCard,
    ProductReviewsCard,
} from './components/detail';
import VariantTableWrapper from './components/variant-table/VariantTableWrapper';
import { ImageUploadDialog } from './components/dialogs';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function AdminProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const role = useAuthStore((s) => s.role);
    const canManageCertificates = role !== UserRole.MANAGER;

    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
    const [copiedSlug, setCopiedSlug] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const activeTab = searchParams.get('tab') || 'overview';
    const effectiveActiveTab = !canManageCertificates && activeTab === 'certificates' ? 'overview' : activeTab;
    const setActiveTab = useCallback((tab: string) => {
        setSearchParams((prev) => {
            prev.set('tab', tab);
            return prev;
        });
    }, [setSearchParams]);

    useEffect(() => {
        if (!canManageCertificates && activeTab === 'certificates') {
            setActiveTab('overview');
        }
    }, [activeTab, canManageCertificates, setActiveTab]);

    useEffect(() => {
        // Force body scroll lock to prevent double scrollbars
        const htmlElement = document.documentElement;
        const originalOverflow = htmlElement.style.overflow;
        htmlElement.style.setProperty('overflow', 'hidden', 'important');

        return () => {
            htmlElement.style.overflow = originalOverflow;
        };
    }, []);

    const { data: product, isLoading, isError } = useProductDetail(id ?? '');
    const { data: certificates, isLoading: isLoadingCerts } = useProductCertificates(id ?? '', {
        enabled: canManageCertificates,
    });
    const uploadMutation = useUploadProductImage();
    const deleteMutation = useDeleteProductImage();
    const updateProductMutation = useUpdateProduct();
    const { data: categories } = useCategories();

    const handleCopySlug = useCallback(() => {
        if (!product) return;
        navigator.clipboard.writeText(product.slug);
        setCopiedSlug(true);
        setTimeout(() => setCopiedSlug(false), 2000);
    }, [product]);

    const handleEditClick = useCallback(() => {
        setShowEditDialog(true);
    }, []);

    const handleEditSubmit = async (data: Partial<UpdateProductRequest>) => {
        if (!id) return;
        await updateProductMutation.mutateAsync({ id, ...data } as UpdateProductRequest);
        queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
        setShowEditDialog(false);
    };

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

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && lightboxIndex === null) navigate('/admin/products');
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [navigate, lightboxIndex]);

    const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

    const handleDeleteImage = useCallback(async (assetId: string) => {
        setAssetToDelete(assetId);
    }, []);

    const handleConfirmDeleteImage = async () => {
        if (!assetToDelete) return;
        setDeletingAssetId(assetToDelete);
        try {
            await deleteMutation.mutateAsync(assetToDelete);
            queryClient.invalidateQueries({ queryKey: productKeys.detail(id ?? product!.id) });
            setAssetToDelete(null);
        } finally {
            setDeletingAssetId(null);
        }
    };

    const handleUpload = async (productId: string, files: File[]) => {
        await uploadMutation.mutateAsync({ productId, files });
        queryClient.invalidateQueries({ queryKey: productKeys.detail(id ?? productId) });
    };

    if (isLoading) return <DetailSkeleton />;

    if (isError || !product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-6">
                <div className="w-20 h-20 rounded-[2rem] bg-white shadow-xl shadow-slate-200 flex items-center justify-center">
                    <Package size={32} className="text-slate-200" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Resource Missing</h2>
                    <p className="text-xs text-slate-400 font-medium">This product signature could not be verified.</p>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => navigate(`/admin/products/${id}?tab=reviews`)}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900"
                >
                    Return to Safe Zone
                </Button>
            </div>
        );
    }

    const ageGroupLabel = product.ageGroup != null ? AGE_GROUPS[product.ageGroup.toString()] ?? null : null;
    const assets = product.assets ?? [];

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30">
            {/* ── Header ── */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg h-8 px-2.5 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-2"
                        onClick={() => navigate('/admin/products')}
                    >
                        <ArrowLeft size={14} className="text-slate-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Return</span>
                    </Button>
                    <div className="h-4 w-px bg-slate-200" />
                    <div className="flex items-center gap-3">
                        <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">
                            {product.name}
                        </h1>
                        <AdminStatusBadge status={product.status as string} dot={true} />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg h-9 px-4 text-[10px] font-black uppercase tracking-widest bg-slate-50 hover:bg-slate-100 text-slate-500 gap-2 transition-all border border-slate-100"
                        onClick={handleCopySlug}
                    >
                        {copiedSlug ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-slate-400" />}
                        {product.slug}
                    </Button>
                    <Button
                        size="sm"
                        className="rounded-lg h-9 px-5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5"
                        onClick={() => setShowUploadDialog(true)}
                    >
                        <Upload size={14} />
                        Add Media
                    </Button>
                </div>
            </div>

            <main className="flex-1 overflow-hidden p-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col"
                >
                    <Tabs value={effectiveActiveTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                        <div className="px-8 py-3 border-b bg-white">
                            <TabsList className="h-10 p-1 bg-slate-100/50 rounded-lg">
                                <TabsTrigger
                                    value="overview"
                                    className="rounded-md px-8 h-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[var(--color-primary)] data-[state=active]:shadow-sm transition-all relative"
                                >
                                    Overview
                                    {effectiveActiveTab === 'overview' && (
                                        <motion.div
                                            layoutId="active-nav-underline"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]"
                                        />
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="images"
                                    className="rounded-md px-8 h-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[var(--color-primary)] data-[state=active]:shadow-sm transition-all flex items-center gap-3 relative"
                                >
                                    Media
                                    {assets.length > 0 && (
                                        <Badge variant="secondary" className="bg-blue-50 text-[var(--color-primary)] hover:bg-blue-50 border-none px-1.5 h-4.5 text-[9px] relative z-10">
                                            {assets.length}
                                        </Badge>
                                    )}
                                    {effectiveActiveTab === 'images' && (
                                        <motion.div
                                            layoutId="active-nav-underline"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]"
                                        />
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="variants"
                                    className="rounded-md px-8 h-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[var(--color-primary)] data-[state=active]:shadow-sm transition-all flex items-center gap-3 relative"
                                >
                                    Variants
                                    {product.variantCount != null && product.variantCount > 0 && (
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none px-1.5 h-4.5 text-[9px] relative z-10">
                                            {product.variantCount}
                                        </Badge>
                                    )}
                                    {effectiveActiveTab === 'variants' && (
                                        <motion.div
                                            layoutId="active-nav-underline"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]"
                                        />
                                    )}
                                </TabsTrigger>
                                {canManageCertificates && (
                                    <TabsTrigger
                                        value="certificates"
                                        className="rounded-md px-8 h-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[var(--color-primary)] data-[state=active]:shadow-sm transition-all flex items-center gap-3 relative"
                                    >
                                        Certifications
                                        {certificates && certificates.length > 0 && (
                                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none px-1.5 h-4.5 text-[9px] relative z-10">
                                                {certificates.length}
                                            </Badge>
                                        )}
                                        {effectiveActiveTab === 'certificates' && (
                                            <motion.div
                                                layoutId="active-nav-underline"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]"
                                            />
                                        )}
                                    </TabsTrigger>
                                )}
                                <TabsTrigger
                                    value="description"
                                    className="rounded-md px-8 h-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[var(--color-primary)] data-[state=active]:shadow-sm transition-all flex items-center gap-3 relative"
                                >
                                    Description Content
                                    {effectiveActiveTab === 'description' && (
                                        <motion.div
                                            layoutId="active-nav-underline"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]"
                                        />
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="reviews"
                                    className="rounded-md px-8 h-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[var(--color-primary)] data-[state=active]:shadow-sm transition-all flex items-center gap-3 relative"
                                >
                                    Customer Reviews
                                    {effectiveActiveTab === 'reviews' && (
                                        <motion.div
                                            layoutId="active-nav-underline"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]"
                                        />
                                    )}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <AnimatePresence mode="wait">
                                <TabsContent value="overview" key="overview" className="mt-0 outline-none p-10 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        <div className="grid grid-cols-1 gap-16 lg:grid-cols-3 items-start">
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
                                                        isTradeInEligible: product.isTradeInEligible,
                                                        minTradeInPrice: product.minTradeInPrice,
                                                        depositAmount: product.depositAmount,
                                                    }}
                                                    copiedSlug={copiedSlug}
                                                    onCopySlug={handleCopySlug}
                                                />
                                            </div>

                                            <aside className="space-y-12">
                                                <QuickInfoCard
                                                    status={product.status as string}
                                                    categoryName={categoryName ?? undefined}
                                                    variantCount={product.variantCount}
                                                    minPrice={product.minPrice}
                                                    maxPrice={product.maxPrice}
                                                    productId={product.id}
                                                />

                                                <section className="space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_rgba(73,136,196,0.5)]" />
                                                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Administrative Trail</h4>
                                                    </div>
                                                    <div className="space-y-4 pt-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entry ID</span>
                                                            <span className="text-[10px] font-mono text-slate-900">{product.id.slice(0, 8)}...</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</span>
                                                            <span className="text-[10px] font-black text-slate-900 uppercase">{formatDate(product.createdAt)}</span>
                                                        </div>
                                                        <div className="h-px bg-slate-100" />
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visibility</span>
                                                            <Badge variant="outline" className="border-emerald-100 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest px-2 py-0">Active</Badge>
                                                        </div>
                                                    </div>
                                                </section>
                                            </aside>
                                        </div>
                                    </motion.div>
                                </TabsContent>

                                <TabsContent value="images" key="images" className="mt-0 outline-none p-10 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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

                                <TabsContent value="variants" key="variants" className="mt-0 outline-none ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                        className="p-10"
                                    >
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                                <Layers className="text-[var(--color-primary)] h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Inventory Variants</h3>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Manage stock, SKU and specific attributes</p>
                                            </div>
                                        </div>

                                        <VariantTableWrapper
                                            productId={product.id}
                                            productName={product.name}
                                            onAddVariant={() => navigate(`/admin/products?tab=single&addVariant=${product.id}`)}
                                            onEditVariant={(v) => navigate(`/admin/products?tab=single&editVariant=${v.id}`)}
                                            onDeleteVariant={(v) => navigate(`/admin/products?tab=single&deleteVariant=${v.id}`)}
                                            isTemplate={!!product.fullyCustomizedProductType && product.fullyCustomizedProductType !== 'None'}
                                        />
                                    </motion.div>
                                </TabsContent>

                                {canManageCertificates && (
                                    <TabsContent value="certificates" key="certificates" className="mt-0 outline-none ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                        >
                                            <ProductCertificatesCard
                                                certificates={certificates || []}
                                                isLoading={isLoadingCerts}
                                            />
                                        </motion.div>
                                    </TabsContent>
                                )}

                                <TabsContent value="description" key="description" className="mt-0 outline-none ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        <ProductDescriptionCard 
                                            product={{
                                                name: product.name,
                                                summary: product.summary,
                                                description: product.description
                                            }}
                                            onEdit={() => handleEditClick()}
                                        />
                                    </motion.div>
                                </TabsContent>

                                <TabsContent value="reviews" key="reviews" className="mt-0 outline-none ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        <ProductReviewsCard productId={product.id} />
                                    </motion.div>
                                </TabsContent>
                            </AnimatePresence>
                        </div>
                    </Tabs>
                </motion.div>
            </main>

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

            {/* ── Delete Image Confirmation ── */}
            <ConfirmDialog
                open={!!assetToDelete}
                onOpenChange={(open) => { if (!open) setAssetToDelete(null); }}
                title="Delete Media Asset?"
                description="Are you sure you want to remove this image from the product gallery? This action cannot be reversed."
                confirmText="Remove Asset"
                onConfirm={handleConfirmDeleteImage}
                variant="danger"
                isLoading={deleteMutation.isPending}
            />

            {/* ── Edit Dialogs ── */}
            {showEditDialog && product.fullyCustomizedProductType === 'None' && (
                <ProductDialog
                    open={showEditDialog}
                    onOpenChange={setShowEditDialog}
                    product={{
                        ...product,
                        ageGroup: product.ageGroup != null ? String(product.ageGroup) : null,
                        status: product.status as import('./types').ProductStatus
                    } as import('./types').Product}
                    onSubmit={handleEditSubmit}
                    isLoading={updateProductMutation.isPending}
                    categories={categories || []}
                    certificates={certificates || []}
                />
            )}

            {showEditDialog && product.fullyCustomizedProductType !== 'None' && (
                <TemplateDialog
                    open={showEditDialog}
                    onOpenChange={setShowEditDialog}
                    product={{
                        ...product,
                        fullyCustomizedProductType: product.fullyCustomizedProductType as import('@/api/types/product.types').FullyCustomizedProductType
                    } as unknown as import('@/api').FullyCustomizedProductResponse}
                    onSubmit={handleEditSubmit}
                    isSubmitting={updateProductMutation.isPending}
                />
            )}
        </div>
    );
}

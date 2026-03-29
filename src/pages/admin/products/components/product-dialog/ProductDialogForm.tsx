import { useCallback, useEffect, useState, useMemo, memo } from 'react';
import { useForm, useWatch, type Resolver, type Control, type FieldErrors, type UseFormSetValue } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Product, CreateProductRequest, ProductStatus } from '../../types';
import type { CategoryResponse } from '@/api';
import { useCategoryTree, type FlatCategory } from './useCategoryTree';
import DialogHeader from './DialogHeader';
import DialogFooter from './DialogFooter';
import GeneralSection from './GeneralSection';
import ClassificationSection from './ClassificationSection';
import PolicyStatusSection from './PolicyStatusSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, LayoutGrid, ShieldCheck, AlertCircle } from 'lucide-react';
import { productSchema, type ProductFormValues } from './productSchema';

interface ProductWithSubCate extends Product {
    subCateId?: number | null;
    certificateIds?: string[];
}

interface ProductDialogFormProps {
    product?: ProductWithSubCate | null;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateProductRequest) => void | Promise<void>;
    isLoading?: boolean;
    categories?: CategoryResponse[];
    certificates?: import('../../types').Certificate[];
}

// ── Shared Sub-Components (Outside Render) ──
const ErrorMsg = memo(({ error }: { error?: { message?: string } }) => {
    if (!error) return null;
    return (
        <p className="text-[10px] text-red-500 font-bold mt-1.5 animate-in fade-in slide-in-from-top-1 flex items-center gap-1 px-1">
            <AlertCircle className="h-3 w-3" />
            {error.message}
        </p>
    );
});
ErrorMsg.displayName = 'ErrorMsg';

/* ── Optimized Section Wrappers ── */

const GeneralTabContent = memo(({
    control,
    isLoading,
    onNameChange,
    setValue,
    errors
}: {
    control: Control<ProductFormValues>;
    isLoading: boolean;
    onNameChange: (v: string) => void;
    setValue: UseFormSetValue<ProductFormValues>;
    errors: FieldErrors<ProductFormValues>;
}) => {
    const name = useWatch({ control, name: 'name' });
    const slug = useWatch({ control, name: 'slug' });
    const summary = useWatch({ control, name: 'summary' });
    const description = useWatch({ control, name: 'description' });

    const handleSlugChange = useCallback((v: string) => setValue('slug', v, { shouldValidate: true }), [setValue]);
    const handleSummaryChange = useCallback((v: string) => setValue('summary', v, { shouldValidate: true }), [setValue]);
    const handleDescriptionChange = useCallback((v: string) => setValue('description', v, { shouldValidate: true }), [setValue]);

    return (
        <TabsContent value="general" className="mt-0 outline-none space-y-6 animate-in fade-in-50 duration-300">
            <GeneralSection
                name={name || ''}
                slug={slug || ''}
                summary={summary || ''}
                description={description || ''}
                isLoading={isLoading}
                onNameChange={onNameChange}
                onSlugChange={handleSlugChange}
                onSummaryChange={handleSummaryChange}
                onDescriptionChange={handleDescriptionChange}
                errors={errors}
            />
        </TabsContent>
    );
});
GeneralTabContent.displayName = 'GeneralTabContent';

const ClassificationTabContent = memo(({
    control,
    isLoading,
    flatCategories,
    childCategories,
    onCateChange,
    onSubCateIdChange,
    onCertificatesChange,
    allCertificates,
    setValue,
    errors
}: {
    control: Control<ProductFormValues>;
    isLoading: boolean;
    flatCategories: FlatCategory[];
    childCategories: CategoryResponse[];
    onCateChange: (v: string | number) => void;
    onSubCateIdChange: (v: string | number) => void;
    onCertificatesChange: (v: string[]) => void;
    allCertificates: import('../../types').Certificate[];
    setValue: UseFormSetValue<ProductFormValues>;
    errors: FieldErrors<ProductFormValues>;
}) => {
    const cateId = useWatch({ control, name: 'cateId' });
    const ageGroup = useWatch({ control, name: 'ageGroup' });
    const subCateId = useWatch({ control, name: 'subCateId' });
    const material = useWatch({ control, name: 'material' });
    const CertificateIds = useWatch({ control, name: 'CertificateIds' });

    const handleAgeGroupChange = useCallback((v: string) => setValue('ageGroup', String(v || ''), { shouldValidate: true }), [setValue]);
    const handleMaterialChange = useCallback((v: string) => setValue('material', v, { shouldValidate: true }), [setValue]);

    return (
        <TabsContent value="classification" className="mt-0 outline-none animate-in fade-in-50 duration-300">
            <ClassificationSection
                cateId={String(cateId || '')}
                ageGroup={ageGroup || ''}
                subCateId={String(subCateId || '')}
                material={material || ''}
                certificateIds={CertificateIds || []}
                flatCategories={flatCategories}
                childCategories={childCategories}
                allCertificates={allCertificates}
                isLoading={isLoading}
                onCateChange={onCateChange}
                onAgeGroupChange={handleAgeGroupChange}
                onSubCateIdChange={onSubCateIdChange}
                onMaterialChange={handleMaterialChange}
                onCertificatesChange={onCertificatesChange}
            />
            <div className="space-y-2 px-1">
                <ErrorMsg error={errors.cateId} />
                <ErrorMsg error={errors.material} />
            </div>
        </TabsContent>
    );
});
ClassificationTabContent.displayName = 'ClassificationTabContent';

const PolicyTabContent = memo(({
    control,
    isLoading,
    isPublishingWithoutVariants,
    setValue
}: {
    control: Control<ProductFormValues>;
    isLoading: boolean;
    isPublishingWithoutVariants: boolean;
    setValue: UseFormSetValue<ProductFormValues>;
}) => {
    const warrantyPolicyDay = useWatch({ control, name: 'warrantyPolicyDay' });
    const returnPolicyDay = useWatch({ control, name: 'returnPolicyDay' });

    const handleWarrantyChange = useCallback((v: string | number) => setValue('warrantyPolicyDay', Number(v), { shouldValidate: true }), [setValue]);
    const handleReturnChange = useCallback((v: string | number) => setValue('returnPolicyDay', Number(v), { shouldValidate: true }), [setValue]);

    return (
        <TabsContent value="policy" className="mt-0 outline-none animate-in fade-in-50 duration-300">
            {isPublishingWithoutVariants && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-black text-rose-700 uppercase">Warning: Publishing Guard</p>
                        <p className="text-xs text-rose-600 font-medium leading-relaxed">
                            This product has <strong>0 variants</strong>. You cannot set it to <strong>Published</strong> until at least one size/color option is created.
                        </p>
                    </div>
                </div>
            )}
            <PolicyStatusSection
                warrantyPolicyDay={warrantyPolicyDay || 0}
                returnPolicyDay={returnPolicyDay || 0}
                isLoading={isLoading}
                onWarrantyChange={handleWarrantyChange}
                onReturnChange={handleReturnChange}
            />
        </TabsContent>
    );
});
PolicyTabContent.displayName = 'PolicyTabContent';

export default function ProductDialogForm({
    product,
    onOpenChange,
    onSubmit,
    isLoading = false,
    categories = [],
    certificates = [],
}: ProductDialogFormProps) {
    const isEdit = !!product;
    const [activeTab, setActiveTab] = useState("general");

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as unknown as Resolver<ProductFormValues>,
        defaultValues: {
            name: product?.name || '',
            slug: product?.slug || '',
            summary: product?.summary || '',
            description: product?.description || '',
            cateId: product?.cateId || 0,
            subCateId: product?.subCateId || null,
            material: product?.material || '',
            ageGroup: product?.ageGroup || '',
            warrantyPolicyDay: product?.warrantyPolicyDay || 0,
            returnPolicyDay: product?.returnPolicyDay || 0,
            status: product?.status || 'Draft',
            CertificateIds: product?.CertificateIds || product?.certificateIds || [],
        },
        mode: 'onChange'
    });

    const { errors } = form.formState;

    const hasGeneralErrors = !!(errors.name || errors.slug || errors.summary || errors.description);
    const hasClassificationErrors = !!(errors.cateId || errors.material);
    const hasPolicyErrors = !!(errors.warrantyPolicyDay || errors.returnPolicyDay);

    /* ── Reactive watchers for top-level logic only ── */
    const watchStatus = useWatch({ control: form.control, name: 'status' });
    const watchCateId = useWatch({ control: form.control, name: 'cateId' });
    const watchName = useWatch({ control: form.control, name: 'name' });
    const watchDescription = useWatch({ control: form.control, name: 'description' });
    const watchSubCateId = useWatch({ control: form.control, name: 'subCateId' });

    /* ── Variant Count Check ── */
    const variantCount = useMemo(() => {
        if (!product) return 0;
        return product.variantCount ?? product.variants?.length ?? 0;
    }, [product]);

    /* ── Category tree hook ── */
    const { flatCategories, findTopLevelParent, childCategories, buildSlug } =
        useCategoryTree(categories, String(watchCateId || ''));

    // ── Senior Logic: Initial Data Patching ──
    useEffect(() => {
        if (!isEdit || !product || categories.length === 0) return;

        const currentCateId = product.cateId ? Number(product.cateId) : null;
        if (!currentCateId) return;

        // Find where this ID sits in the tree
        const node = flatCategories.find(c => c.cateId === currentCateId);
        if (!node) return;

        if (node.depth > 0) {
            // It's a subcategory (Leaf Node)
            const topId = findTopLevelParent(String(currentCateId));
            form.setValue('cateId', Number(topId), { shouldDirty: false });
            form.setValue('subCateId', currentCateId, { shouldDirty: false });
            form.setValue('material', node.name, { shouldDirty: false });
        } else {
            // It's a top-level category
            form.setValue('cateId', currentCateId, { shouldDirty: false });
            form.setValue('subCateId', null, { shouldDirty: false });

            // If it has material string but no subCateId matching it, keep material
            if (product.material) {
                form.setValue('material', product.material, { shouldDirty: false });
            }
        }

        // Sync Certificates - check both casing variants from API
        const certs = product.CertificateIds || product.certificateIds || [];
        form.setValue('CertificateIds', certs, { shouldDirty: false });
    }, [isEdit, product, categories.length, flatCategories, findTopLevelParent, form]);

    /* ── Handlers ── */
    const handleNameChange = useCallback(
        (value: string) => {
            form.setValue('name', value, { shouldValidate: true });
            if (!isEdit) {
                const newSlug = buildSlug(value, String(form.getValues('cateId') || ''));
                form.setValue('slug', newSlug, { shouldValidate: true });
            }
        },
        [isEdit, buildSlug, form],
    );

    const handleCateChange = useCallback(
        (selectedCateId: string | number) => {
            const idStr = String(selectedCateId);
            const selectedCat = flatCategories.find(c => String(c.cateId) === idStr);

            if (selectedCat && selectedCat.depth > 0) {
                const topLevelParentId = findTopLevelParent(idStr);
                form.setValue('cateId', Number(topLevelParentId), { shouldValidate: true });
                form.setValue('subCateId', Number(idStr), { shouldValidate: true });
                form.setValue('material', selectedCat.name, { shouldValidate: true });
                if (!isEdit && form.getValues('name').trim()) {
                    form.setValue('slug', buildSlug(form.getValues('name'), topLevelParentId), { shouldValidate: true });
                }
            } else {
                form.setValue('cateId', Number(idStr), { shouldValidate: true });
                form.setValue('subCateId', null, { shouldValidate: true });
                form.setValue('material', '', { shouldValidate: true });
                if (!isEdit && form.getValues('name').trim()) {
                    form.setValue('slug', buildSlug(form.getValues('name'), idStr), { shouldValidate: true });
                }
            }
        },
        [isEdit, buildSlug, flatCategories, findTopLevelParent, form],
    );

    const handleSubCateIdChange = useCallback(
        (selectedSubCateId: string | number) => {
            const idStr = String(selectedSubCateId);
            form.setValue('subCateId', Number(idStr), { shouldValidate: true });
            const selectedSubCat = childCategories.find(c => String(c.cateId) === idStr);
            form.setValue('material', selectedSubCat?.name ?? '', { shouldValidate: true });
        },
        [childCategories, form]
    );

    /* ── Validation ── */
    const isPublishingWithoutVariants = watchStatus === 'Published' && variantCount === 0;
    const isValid = form.formState.isValid && !isPublishingWithoutVariants;

    const onFormSubmit = (values: ProductFormValues) => {
        if (isPublishingWithoutVariants) return;

        // Senior Guard: Final CateID is always the leaf-most selection
        const submissionCateId = values.subCateId || values.cateId;

        const payload = {
            name: values.name.trim(),
            slug: values.slug.trim(),
            summary: values.summary.trim(),
            description: values.description.trim(),
            material: values.material?.trim() || "",
            status: values.status,
            ageGroup: String(values.ageGroup || "0"),
            warrantyPolicyDay: Number(values.warrantyPolicyDay || 0),
            returnPolicyDay: Number(values.returnPolicyDay || 0),
            cateId: submissionCateId > 0 ? submissionCateId : null,
            CertificateIds: values.CertificateIds || []
        };

        onSubmit(payload as unknown as CreateProductRequest);
    };

    // Calculate Form Completion %
    const completionScore = useMemo(() => {
        let score = 0;
        if (watchName?.trim()) score += 20;
        if (watchDescription?.trim()) score += 20;
        if (watchCateId) score += 20;
        if (watchSubCateId) score += 20;
        if (watchStatus !== 'Draft') score += 20;
        return score;
    }, [watchName, watchDescription, watchCateId, watchSubCateId, watchStatus]);

    return (
        <div className="flex flex-col min-h-0 h-full flex-1">
            <DialogHeader
                isEdit={isEdit}
                status={(watchStatus as ProductStatus) || 'Draft'}
                completionScore={completionScore}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4 flex-1 flex flex-col min-h-0">
                <TabsList className="grid grid-cols-3 w-full h-12 bg-gray-100/50 p-1 rounded-xl border border-gray-200/50 shrink-0">
                    <TabsTrigger value="general" className="relative rounded-lg data-[state=active]:bg-[#4988c4] data-[state=active]:text-white data-[state=active]:shadow-sm text-xs font-bold gap-2 transition-all">
                        <Info className="h-4 w-4" /> General
                        {hasGeneralErrors && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="classification" className="relative rounded-lg data-[state=active]:bg-[#4988c4] data-[state=active]:text-white data-[state=active]:shadow-sm text-xs font-bold gap-2 transition-all">
                        <LayoutGrid className="h-4 w-4" /> Attributes
                        {hasClassificationErrors && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="policy" className="relative rounded-lg data-[state=active]:bg-[#4988c4] data-[state=active]:text-white data-[state=active]:shadow-sm text-xs font-bold gap-2 transition-all">
                        <ShieldCheck className="h-4 w-4" /> Policies
                        {hasPolicyErrors && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
                        )}
                        {isPublishingWithoutVariants && <AlertCircle className="h-3 w-3 text-rose-500 ml-0.5" />}
                    </TabsTrigger>
                </TabsList>

                <form
                    id="product-form"
                    onSubmit={form.handleSubmit(onFormSubmit)}
                    className="py-6 flex-1 overflow-y-auto px-1 no-scrollbar"
                >
                    <GeneralTabContent
                        control={form.control}
                        isLoading={isLoading}
                        onNameChange={handleNameChange}
                        setValue={form.setValue}
                        errors={errors}
                    />

                    <ClassificationTabContent
                        control={form.control}
                        isLoading={isLoading}
                        flatCategories={flatCategories}
                        childCategories={childCategories}
                        allCertificates={certificates}
                        onCateChange={handleCateChange}
                        onSubCateIdChange={handleSubCateIdChange}
                        onCertificatesChange={(v) => form.setValue('CertificateIds', v, { shouldValidate: true })}
                        setValue={form.setValue}
                        errors={errors}
                    />

                    <PolicyTabContent
                        control={form.control}
                        isLoading={isLoading}
                        isPublishingWithoutVariants={isPublishingWithoutVariants}
                        setValue={form.setValue}
                    />
                </form>
            </Tabs>

            <DialogFooter
                isEdit={isEdit}
                isLoading={isLoading}
                isValid={isValid}
                onCancel={() => onOpenChange(false)}
            />
        </div>
    );
}

import { useCallback, useReducer, useEffect, useState, useMemo } from 'react';
import type { Product, CreateProductRequest } from '../../types';
import type { CategoryResponse } from '@/api';
import { formReducer, getInitialFormState, type FormState } from './productFormReducer';
import { useCategoryTree } from './useCategoryTree';
import DialogHeader from './DialogHeader';
import DialogFooter from './DialogFooter';
import GeneralSection from './GeneralSection';
import ClassificationSection from './ClassificationSection';
import PolicyStatusSection from './PolicyStatusSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, LayoutGrid, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ProductDialogFormProps {
    product?: Product | null;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateProductRequest) => void | Promise<void>;
    isLoading?: boolean;
    categories?: CategoryResponse[];
}

export default function ProductDialogForm({
    product,
    onOpenChange,
    onSubmit,
    isLoading = false,
    categories = [],
}: ProductDialogFormProps) {
    const isEdit = !!product;
    const [form, dispatch] = useReducer(formReducer, getInitialFormState(product));
    const [activeTab, setActiveTab] = useState("general");

    /* ── Generic field setter ── */
    const setField = useCallback(
        (field: keyof FormState, value: string) =>
            dispatch({ type: field, payload: value }),
        [],
    );

    /* ── Variant Count Check ── */
    const variantCount = useMemo(() => {
        if (!product) return 0;
        return product.variantCount ?? product.variants?.length ?? 0;
    }, [product]);

    /* ── Category tree hook ── */
    const { flatCategories, findTopLevelParent, childCategories, buildSlug } =
        useCategoryTree(categories, form.cateId);

    // Load initial category hierarchy if editing
    useEffect(() => {
        if (isEdit && product?.cateId && flatCategories.length > 0) {
            const currentId = String(product.cateId);
            const foundCat = flatCategories.find(c => String(c.cateId) === currentId);

            if (foundCat && foundCat.depth > 0) {
                const parentId = findTopLevelParent(currentId);
                dispatch({
                    type: 'SET_ALL',
                    payload: {
                        cateId: parentId,
                        subCateId: currentId
                    }
                });
            } else if (foundCat && foundCat.depth === 0 && product.material) {
                const parentCat = categories.find(c => String(c.cateId) === currentId);
                const children = parentCat?.childCategoryList ?? [];
                const matchedChild = children.find(
                    child => child.name.toLowerCase() === product.material.toLowerCase()
                );
                if (matchedChild) {
                    dispatch({
                        type: 'SET_ALL',
                        payload: {
                            cateId: currentId,
                            subCateId: String(matchedChild.cateId),
                        }
                    });
                }
            }
        }
    }, [isEdit, product?.id, product?.cateId, product?.material, flatCategories, findTopLevelParent, categories]);

    /* ── Handlers ── */
    const handleNameChange = useCallback(
        (value: string) => {
            setField('name', value);
            if (!isEdit) setField('slug', buildSlug(value, form.cateId));
        },
        [isEdit, form.cateId, buildSlug, setField],
    );

    const handleCateChange = useCallback(
        (selectedCateId: string) => {
            const selectedCat = flatCategories.find(c => String(c.cateId) === selectedCateId);

            if (selectedCat && selectedCat.depth > 0) {
                const topLevelParentId = findTopLevelParent(selectedCateId);
                setField('cateId', topLevelParentId);
                setField('subCateId', selectedCateId);
                setField('material', selectedCat.name);
                if (!isEdit && form.name.trim()) setField('slug', buildSlug(form.name, topLevelParentId));
            } else {
                setField('cateId', selectedCateId);
                setField('subCateId', '');
                setField('material', '');
                if (!isEdit && form.name.trim()) setField('slug', buildSlug(form.name, selectedCateId));
            }
        },
        [isEdit, form.name, buildSlug, flatCategories, findTopLevelParent, setField],
    );

    const handleSubCateIdChange = useCallback(
        (selectedSubCateId: string) => {
            setField('subCateId', selectedSubCateId);
            const selectedSubCat = childCategories.find(c => String(c.cateId) === selectedSubCateId);
            setField('material', selectedSubCat?.name ?? '');
        },
        [childCategories, setField]
    );

    /* ── Validation ── */
    const hasSubcategories = childCategories.length > 0;
    const materialOrSubcateValid = hasSubcategories ? form.subCateId !== '' : form.material.trim() !== '';

    // Strict Rule: Cannot publish without variants
    const isPublishingWithoutVariants = form.status === 'Published' && variantCount === 0;

    const isValid =
        form.name.trim() !== '' &&
        form.slug.trim() !== '' &&
        form.summary.trim() !== '' &&
        form.description.trim() !== '' &&
        materialOrSubcateValid &&
        !isPublishingWithoutVariants;

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            if (isPublishingWithoutVariants) {
                toast.error("Cannot publish product. Please add at least one variant first.", {
                    description: "Switch status to Draft or add variants to proceed.",
                    icon: <AlertCircle className="w-4 h-4 text-rose-500" />
                });
                return;
            }

            if (!isValid) return;

            onSubmit({
                name: form.name.trim(),
                slug: form.slug.trim(),
                summary: form.summary.trim(),
                description: form.description.trim(),
                material: form.material.trim(),
                ageGroup: form.ageGroup || null,
                warrantyPolicyDay: form.warrantyPolicyDay ? Number(form.warrantyPolicyDay) : null,
                returnPolicyDay: form.returnPolicyDay ? Number(form.returnPolicyDay) : null,
                status: form.status,
                cateId: form.cateId ? Number(form.cateId) : null,
            });
        },
        [form, isValid, isPublishingWithoutVariants, onSubmit],
    );

    // Calculate Form Completion %
    const completionScore = useMemo(() => {
        let score = 0;
        if (form.name.trim()) score += 20;
        if (form.description.trim()) score += 20;
        if (form.cateId) score += 20;
        if (form.material.trim()) score += 20;
        if (form.status !== 'Draft') score += 20;
        return score;
    }, [form]);

    return (
        <>
            <DialogHeader
                isEdit={isEdit}
                status={form.status}
                completionScore={completionScore}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
                <TabsList className="grid grid-cols-3 w-full h-12 bg-gray-100/50 p-1 rounded-xl border border-gray-200/50">
                    <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-[#4988c4] data-[state=active]:text-white data-[state=active]:shadow-sm text-xs font-bold gap-2">
                        <Info className="h-4 w-4" /> General
                    </TabsTrigger>
                    <TabsTrigger value="classification" className="rounded-lg data-[state=active]:bg-[#4988c4] data-[state=active]:text-white data-[state=active]:shadow-sm text-xs font-bold gap-2">
                        <LayoutGrid className="h-4 w-4" /> Attributes
                    </TabsTrigger>
                    <TabsTrigger value="policy" className="rounded-lg data-[state=active]:bg-[#4988c4] data-[state=active]:text-white data-[state=active]:shadow-sm text-xs font-bold gap-2">
                        <ShieldCheck className="h-4 w-4" /> {isPublishingWithoutVariants ? <span className="text-rose-500">Policies *</span> : "Policies"}
                    </TabsTrigger>
                </TabsList>

                <form
                    id="product-form"
                    onSubmit={handleSubmit}
                    className="py-6 min-h-[400px] max-h-[50vh] overflow-y-auto px-1"
                >
                    <TabsContent value="general" className="mt-0 outline-none space-y-6 animate-in fade-in-50 duration-300">
                        <GeneralSection
                            name={form.name}
                            slug={form.slug}
                            summary={form.summary}
                            description={form.description}
                            isLoading={isLoading}
                            onNameChange={handleNameChange}
                            onSlugChange={(v) => setField('slug', v)}
                            onSummaryChange={(v) => setField('summary', v)}
                            onDescriptionChange={(v) => setField('description', v)}
                        />
                    </TabsContent>

                    <TabsContent value="classification" className="mt-0 outline-none animate-in fade-in-50 duration-300">
                        <ClassificationSection
                            cateId={form.cateId}
                            ageGroup={form.ageGroup}
                            subCateId={form.subCateId}
                            material={form.material}
                            flatCategories={flatCategories}
                            childCategories={childCategories}
                            isLoading={isLoading}
                            onCateChange={handleCateChange}
                            onAgeGroupChange={(v) => setField('ageGroup', v)}
                            onSubCateIdChange={handleSubCateIdChange}
                            onMaterialChange={(v) => setField('material', v)}
                        />
                    </TabsContent>

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
                            warrantyPolicyDay={form.warrantyPolicyDay}
                            returnPolicyDay={form.returnPolicyDay}
                            status={form.status}
                            isLoading={isLoading}
                            isEdit={isEdit}
                            onWarrantyChange={(v) => setField('warrantyPolicyDay', v)}
                            onReturnChange={(v) => setField('returnPolicyDay', v)}
                            onStatusChange={(v) => setField('status', v)}
                        />
                    </TabsContent>
                </form>
            </Tabs>

            <DialogFooter
                isEdit={isEdit}
                isLoading={isLoading}
                isValid={isValid}
                onCancel={() => onOpenChange(false)}
            />
        </>
    );
}

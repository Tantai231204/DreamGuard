import { useCallback, useReducer } from 'react';
import type { Product, CreateProductRequest, ProductStatus } from '../../types';
import { STATUS_TO_INT } from '../../types';
import type { CategoryResponse } from '@/api';
import { formReducer, getInitialFormState, type FormState } from './productFormReducer';
import { useCategoryTree } from './useCategoryTree';
import DialogHeader from './DialogHeader';
import DialogFooter from './DialogFooter';
import GeneralSection from './GeneralSection';
import ClassificationSection from './ClassificationSection';
import PolicyStatusSection from './PolicyStatusSection';

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

    /* ── Generic field setter ── */
    const setField = useCallback(
        (field: keyof FormState, value: string) =>
            dispatch({ type: field, payload: value }),
        [],
    );

    /* ── Category tree hook ── */
    const { flatCategories, findTopLevelParent, childCategories, buildSlug } =
        useCategoryTree(categories, form.cateId);

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

    // Handler for subcategory change: sets both subCateId and material
    const handleSubCateIdChange = useCallback(
        (selectedSubCateId: string) => {
            setField('subCateId', selectedSubCateId);
            const selectedSubCat = childCategories.find(c => String(c.cateId) === selectedSubCateId);
            setField('material', selectedSubCat?.name ?? '');
        },
        [childCategories, setField]
    );

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const hasSub = childCategories.length > 0;
            const validMaterial = form.material.trim();
            const validSubCate = form.subCateId;

            if (!form.name.trim() || !form.slug.trim() || !form.summary.trim() || !form.description.trim() || (hasSub ? !validSubCate : !validMaterial)) return;

            onSubmit({
                name: form.name.trim(),
                slug: form.slug.trim(),
                summary: form.summary.trim(),
                description: form.description.trim(),
                material: form.material.trim(),
                ageGroup: form.ageGroup ? Number(form.ageGroup) : null,
                warrantyPolicyDay: form.warrantyPolicyDay ? Number(form.warrantyPolicyDay) : null,
                returnPolicyDay: form.returnPolicyDay ? Number(form.returnPolicyDay) : null,
                status: STATUS_TO_INT[form.status as ProductStatus],
                cateId: form.cateId ? Number(form.cateId) : null,
            });
        },
        [form, childCategories, onSubmit],
    );

    /* ── Validation ── */
    const hasSubcategories = childCategories.length > 0;
    const materialOrSubcateValid = hasSubcategories ? form.subCateId !== '' : form.material.trim() !== '';
    const isValid =
        form.name.trim() !== '' &&
        form.slug.trim() !== '' &&
        form.summary.trim() !== '' &&
        form.description.trim() !== '' &&
        materialOrSubcateValid;

    return (
        <>
            <DialogHeader isEdit={isEdit} />

            <form
                id="product-form"
                onSubmit={handleSubmit}
                className="space-y-7 py-6 max-h-[62vh] overflow-y-auto px-1 will-change-transform [contain:layout_paint]"
            >
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

                <PolicyStatusSection
                    warrantyPolicyDay={form.warrantyPolicyDay}
                    returnPolicyDay={form.returnPolicyDay}
                    status={form.status}
                    isLoading={isLoading}
                    onWarrantyChange={(v) => setField('warrantyPolicyDay', v)}
                    onReturnChange={(v) => setField('returnPolicyDay', v)}
                    onStatusChange={(v) => setField('status', v)}
                />
            </form>

            <DialogFooter
                isEdit={isEdit}
                isLoading={isLoading}
                isValid={isValid}
                onCancel={() => onOpenChange(false)}
            />
        </>
    );
}

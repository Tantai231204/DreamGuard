import { useCallback, useEffect, useMemo } from 'react';
import { useForm, useWatch, type UseFormReturn, type Path, type PathValue } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useComboDetail, useComboParents } from '@/hooks/queries/useCombo';
import { useAllVariantOptions, type VariantOption } from '@/hooks/queries/useProduct';
import { comboSchema } from './comboSchema';
import type { Combo } from '../../types';
import type { CreateComboRequest, ComboItemRequest } from '@/api/services/comboService';
import { toSlug, getInitialState, type ComboFormValues } from './index';

interface UseComboFormProps {
    open: boolean;
    combo: Combo | null;
    mode: 'parent' | 'variant' | null;
    defaultParentId?: string;
    onSubmit: (data: CreateComboRequest) => void | Promise<void>;
}

export function useComboForm({
    open,
    combo,
    mode,
    defaultParentId,
    onSubmit,
}: UseComboFormProps) {
    const isEdit = !!combo;

    const { data: comboResp, isLoading: isLoadingDetail } = useComboDetail(
        combo?.id || '',
        open && isEdit
    );

    const form = useForm<ComboFormValues>({
        resolver: zodResolver(comboSchema),
        defaultValues: useMemo(() => getInitialState(comboResp || combo), [comboResp, combo]),
        mode: 'onTouched'
    });

    // Explicitly typed form for generic stability - casting through unknown to ensure safety
    const typedForm = form as unknown as UseFormReturn<ComboFormValues>;

    // Reset form when detail is loaded - Senior Smart Merge
    useEffect(() => {
        if (comboResp && isEdit) {
            const detailState = getInitialState(comboResp);
            const tableState = getInitialState(combo);

            // If the detail API is missing the status (returns Draft by default),
            // preserve the status from the table which we know is accurate.
            if (detailState.status === 'Draft' && tableState.status !== 'Draft') {
                detailState.status = tableState.status;
            }

            typedForm.reset(detailState);
        }
    }, [comboResp, isEdit, combo, typedForm]);

    // Apply defaultParentId if in variant mode and creating
    useEffect(() => {
        if (!isEdit && mode === 'variant' && defaultParentId) {
            typedForm.setValue('comboParentId', defaultParentId);
        }
    }, [isEdit, mode, defaultParentId, typedForm]);


    // Selective Watching for reactive logic
    const watchName = useWatch({ control: typedForm.control, name: 'name' });
    const watchDescription = useWatch({ control: typedForm.control, name: 'description' });
    const watchBasePrice = useWatch({ control: typedForm.control, name: 'basePrice' });
    const watchSalePrice = useWatch({ control: typedForm.control, name: 'salePrice' });
    const watchStatus = useWatch({ control: typedForm.control, name: 'status' });
    const watchImageUrl = useWatch({ control: typedForm.control, name: 'imageUrl' });
    const watchComboParentId = useWatch({ control: typedForm.control, name: 'comboParentId' });
    const watchItems = useWatch({ control: typedForm.control, name: 'items' });
    const watchImagePublicId = useWatch({ control: typedForm.control, name: 'imagePublicId' });
    const watchColor = useWatch({ control: typedForm.control, name: 'color' });
    const watchSize = useWatch({ control: typedForm.control, name: 'size' });
    const watchAgeGroup = useWatch({ control: typedForm.control, name: 'ageGroup' });

    // Senior Logic: Automatic Price Synchronization
    // Calculates total market value from items and updates basePrice automatically
    useEffect(() => {
        if (!watchItems || watchItems.length === 0) return;

        const totalMarketValue = watchItems.reduce((sum, item) => {
            return sum + (Number(item.salePrice || 0) * Number(item.quantity || 0));
        }, 0);

        if (totalMarketValue > 0) {
            // Update basePrice if it differs from market value
            if (watchBasePrice !== totalMarketValue) {
                typedForm.setValue('basePrice', totalMarketValue, { shouldValidate: true });
            }

            // Critical UX: If totalMarketValue drops below salePrice, or creating new
            // ensure the form stays valid (salePrice <= basePrice)
            if (totalMarketValue < (watchSalePrice || 0) || (!isEdit && (watchSalePrice === 0 || watchSalePrice === undefined))) {
                typedForm.setValue('salePrice', totalMarketValue, { shouldValidate: true });
            }
        }
    }, [watchItems, isEdit, typedForm, watchBasePrice, watchSalePrice]);

    const completionScore = useMemo(() => {
        let score = 0;
        if ((watchName?.trim().length || 0) >= 3) score += 15;
        if (watchAgeGroup !== undefined) score += 10;
        if ((watchBasePrice || 0) > 0) score += 10;
        if ((watchSalePrice || 0) > 0) score += 10;
        if ((watchDescription?.trim().length || 0) >= 5) score += 15;
        if (watchStatus) score += 10;
        if (watchImageUrl) score += 10;
        if (mode === 'variant') {
            if (watchComboParentId) score += 10;
            if (watchItems?.some(i => i.productVariantId)) score += 10;
        } else {
            // Parent score logic: doesn't need items/parentId
            score += 20;
        }
        return Math.min(score, 100);
    }, [watchName, watchAgeGroup, watchBasePrice, watchSalePrice, watchDescription, watchStatus, watchImageUrl, mode, watchComboParentId, watchItems]);

    // Global queries (cached by React Query)
    const { data: parentsResp } = useComboParents(open && mode === 'variant');
    const { data: variantsResp, isLoading: isLoadingVariants } = useAllVariantOptions(open && mode === 'variant');

    const comboParents = useMemo(() => {
        const list = (parentsResp || []) as { id: string; name: string; imageUrl?: string; sku?: string }[];
        return list.map(c => ({
            id: c.id,
            label: c.name,
            imageUrl: c.imageUrl,
            sku: c.sku
        }));
    }, [parentsResp]);

    const handleNameChange = useCallback((val: string) => {
        typedForm.setValue('name', val, { shouldValidate: true });
        if (!isEdit) {
            typedForm.setValue('slug', toSlug(val), { shouldValidate: true });
        }
    }, [isEdit, typedForm]);

    const setField = useCallback(<K extends Path<ComboFormValues>>(field: K, value: PathValue<ComboFormValues, K>) => {
        // Enforced strict path-value coupling for 100% type safety
        typedForm.setValue(field, value, { shouldValidate: true });
    }, [typedForm]);

    const onFormSubmit = (values: ComboFormValues) => {
        const payload: CreateComboRequest = {
            name: values.name.trim(),
            slug: values.slug.trim(),
            ageGroup: Number(values.ageGroup),
            color: values.color || "",
            size: values.size || "",
            basePrice: mode === 'parent' ? 0 : Number(values.basePrice || 0),
            salePrice: mode === 'parent' ? 0 : Number(values.salePrice || 0),
            description: (values.description || "").trim(),
            imageUrl: values.imageUrl || "",
            imagePublicId: values.imagePublicId || "",
            // Variants don't have a status selector, default to parent's published state.
            // Parents DO have a selector again, so we use their selected value.
            status: mode === 'parent' ? (values.status || "Published") : "Published",
            comboParentId: mode === 'variant' ? values.comboParentId : undefined,
            items: mode === 'variant'
                ? (values.items || [])
                    .filter(i => i.productVariantId)
                    .map(item => ({
                        productVariantId: item.productVariantId,
                        quantity: item.quantity
                    } as ComboItemRequest))
                : []
        };
        onSubmit(payload);
    };

    const rawChildren = useMemo(() => {
        if (mode !== 'parent' || !combo) return [];
        const rawCombo = combo as unknown as Record<string, unknown>;
        return (rawCombo.subRows || rawCombo.childCombos || []) as Record<string, unknown>[];
    }, [mode, combo]);

    const hasChildCombos = rawChildren.length > 0;

    const parentPriceRange = useMemo(() => {
        if (!hasChildCombos) return null;

        const childPrices = rawChildren.map(c => Number(c.baseSalePrice ?? c.salePrice ?? 0)).filter(p => p > 0);
        if (childPrices.length === 0) return null;

        const min = Math.min(...childPrices);
        const max = Math.max(...childPrices);
        if (min === max) return `${min.toLocaleString("en-US")}₫`;
        return `${min.toLocaleString("en-US")}₫ - ${max.toLocaleString("en-US")}₫`;
    }, [hasChildCombos, rawChildren]);

    return {
        form: typedForm,
        register: typedForm.register,
        errors: typedForm.formState.errors,
        isValid: typedForm.formState.isValid,
        isLoadingDetail,
        isLoadingVariants,
        parentPriceRange,
        hasChildCombos,
        comboParents,
        variantOptions: (variantsResp || []) as VariantOption[],
        handleNameChange,
        setField,
        completionScore,
        handleSubmit: typedForm.handleSubmit(onFormSubmit),
        // Selective Watch exports
        watchValues: useMemo(() => ({
            name: watchName,
            description: watchDescription,
            basePrice: watchBasePrice,
            salePrice: watchSalePrice,
            status: watchStatus,
            imageUrl: watchImageUrl,
            comboParentId: watchComboParentId,
            items: (watchItems || []) as ComboFormValues['items'],
            imagePublicId: watchImagePublicId,
            color: watchColor,
            size: watchSize,
            ageGroup: watchAgeGroup
        }), [
            watchName, watchDescription, watchBasePrice, watchSalePrice, watchStatus, 
            watchImageUrl, watchComboParentId, watchItems, watchImagePublicId, 
            watchColor, watchSize, watchAgeGroup
        ])
    };
}

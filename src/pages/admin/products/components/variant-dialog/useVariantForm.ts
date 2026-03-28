import { useCallback, useMemo, useEffect } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ProductVariant, VariantStatus, VariantAttributes } from '../../types';
import type { VariantSubmitData } from './VariantDialog';
import { useRichAdminVariants } from '@/hooks/queries/useProduct';
import { useCustomizeTypes } from '@/hooks/queries/useCustomizeType';
import { variantSchema, type VariantFormValues } from './variantSchema';

export interface ExtendedProductVariant extends ProductVariant {
    pendingCustoms?: { customizeTypeId: string; overridePrice: number | null }[];
    is_customizable?: boolean;
    customizeOptions?: (import('@/api').VariantCustomizeTypeResponse | import('@/api/types/product.types').CustomizeOptionResponse)[];
}

interface UseVariantFormProps {
    variant: ProductVariant | null;
    productId: string;
    productSlug: string;
    variantCount: number;
    onSubmit: (data: VariantSubmitData) => void;
    isEdit: boolean;
}

export function useVariantForm({
    variant,
    productId,
    productSlug,
    variantCount,
    onSubmit,
    isEdit
}: UseVariantFormProps) {
    const form = useForm<VariantFormValues>({
        resolver: zodResolver(variantSchema) as unknown as Resolver<VariantFormValues>,
        defaultValues: {
            sku: variant?.sku || '',
            basePrice: variant?.basePrice || 0,
            salePrice: variant?.salePrice || 0,
            weight: variant?.weight || 0,
            stockQuantity: variant?.stockQuantity || 0,
            status: variant?.status || 'Draft',
            isNew: !!(variant?.isNew),
            isCustomizable: !!(variant?.isCustomizable),
            customizeLabel: variant?.customizeLabel || '',
            width: variant?.attributes?.width || 0,
            length: variant?.attributes?.length || 0,
            thickness: variant?.attributes?.thickness || 0,
            colorName: variant?.attributes?.color || '',
            colorHex: variant?.attributes?.colorHex || '',
        },
        mode: 'onChange',
    });

    // ── Performance: Selective Watching ────────────────────────────────
    // We only watch values that trigger UI logic/blocks
    const isCustomizable = useWatch({ control: form.control, name: 'isCustomizable' });
    const colorName = useWatch({ control: form.control, name: 'colorName' });
    const colorHex = useWatch({ control: form.control, name: 'colorHex' });
    
    // ── Data Fetching ──────────────────────────────────────────────────
    const { data: allVariantsData } = useRichAdminVariants(productId);
    const { data: customizationMeta } = useCustomizeTypes({ pageSize: 100 });

    // ── Senior Logic: Customization Detection ──────────────────────────
    const pendingCustoms = (variant as ExtendedProductVariant)?.pendingCustoms || [];

    const { isCustomColor, isCustomSize } = useMemo(() => {
        if (!isCustomizable || !customizationMeta) {
            return { isCustomColor: false, isCustomSize: false };
        }
        const activeVariants = customizationMeta.items || [];
        const hasColor = activeVariants.some(t => t.name.toLowerCase().includes('color'));
        const hasSize = activeVariants.some(t => t.name.toLowerCase().includes('size'));
        
        return { isCustomColor: hasColor, isCustomSize: hasSize };
    }, [isCustomizable, customizationMeta]);

    // ── Senior Logic: Enforce "Only 1 Full Custom Variant per product" ───
    const { hasExistingFullCustom, existingFullCustomSku } = useMemo(() => {
        if (!allVariantsData?.colorGroups) return { hasExistingFullCustom: false };

        for (const group of allVariantsData.colorGroups) {
            for (const v of group.variants) {
                if (isEdit && v.id === variant?.id) continue;
                
                const ev = v as unknown as ExtendedProductVariant;
                const vIsCustomizable = !!(ev.isCustomizable || ev.is_customizable || (ev.customizeTypes?.length ?? 0) > 0);
                if (!vIsCustomizable) continue;

                const vCustomTypes = ev.customizeTypes || ev.customizeOptions || [];
                const hasColor = vCustomTypes.some((t: { name?: string; customizeTypeName?: string }) => 
                    (t.name || t.customizeTypeName || '').toLowerCase().includes('color')
                );
                const hasSize = vCustomTypes.some((t: { name?: string; customizeTypeName?: string }) => 
                    (t.name || t.customizeTypeName || '').toLowerCase().includes('size')
                );

                if (hasColor && hasSize) return { hasExistingFullCustom: true, existingFullCustomSku: ev.sku };
            }
        }
        return { hasExistingFullCustom: false };
    }, [allVariantsData, isEdit, variant?.id]);

    const isFullCustomBlocked = isCustomColor && isCustomSize && hasExistingFullCustom;

    // ── Methods ─────────────────────────────────────────────────────────
    const handleRegenerateSku = useCallback(() => {
        if (isEdit) return;
        const color = form.getValues('colorName');
        const base = productSlug.trim().toUpperCase() || 'PRODUCT';
        const colorPart = color ? `-${color.toUpperCase()}` : '';
        const count = String(variantCount + 1).padStart(2, '0');
        form.setValue('sku', `${base}${colorPart}-V${count}`, { shouldValidate: true });
    }, [isEdit, productSlug, variantCount, form]);

    const handleColorChange = useCallback((name: string, hex: string) => {
        form.setValue('colorName', name, { shouldValidate: true });
        form.setValue('colorHex', hex, { shouldValidate: true });
    }, [form]);

    const onFormSubmit = (values: VariantFormValues) => {
        if (isFullCustomBlocked) return;

        const submitData: VariantSubmitData = {
            productid: productId,
            sku: values.sku.toUpperCase(),
            baseprice: values.basePrice,
            saleprice: values.salePrice,
            weight: values.weight || 0,
            status: values.status as VariantStatus,
            stockStatus: values.stockQuantity > 0 ? 'In Stock' : 'Out of Stock',
            stockQuantity: values.stockQuantity,
            isNew: !!values.isNew,
            isCustomizable: !!values.isCustomizable,
            customizeLabel: values.customizeLabel,
            pendingCustoms: pendingCustoms,
            customizeTypeIds: [],
            attributes: {
                width: values.width || undefined,
                length: values.length || undefined,
                thickness: values.thickness || undefined,
                color: values.colorName || undefined,
                hexColor: values.colorHex || undefined,
            } as VariantAttributes
        };

        onSubmit(submitData);
    };

    // Auto-clear values logic if customizable
    useEffect(() => {
        if (isCustomColor) {
            form.setValue('colorName', '', { shouldValidate: true });
            form.setValue('colorHex', '', { shouldValidate: true });
        }
    }, [isCustomColor, form]);

    useEffect(() => {
        if (isCustomSize) {
            form.setValue('width', 0, { shouldValidate: true });
            form.setValue('length', 0, { shouldValidate: true });
            form.setValue('thickness', 0, { shouldValidate: true });
            form.setValue('weight', 0, { shouldValidate: true });
        }
    }, [isCustomSize, form]);

    return {
        form,
        register: form.register,
        errors: form.formState.errors,
        isValid: form.formState.isValid && !isFullCustomBlocked,
        handleRegenerateSku,
        handleColorChange,
        handleSubmit: form.handleSubmit(onFormSubmit),
        isCustomColor,
        isCustomSize,
        isFullCustomBlocked,
        existingFullCustomSku,
        isEdit,
        // Watching selective values for top-level logic
        isCustomizable,
        colorName,
        colorHex
    };
}

import { useCallback, useMemo, useEffect } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toSlug } from '@/lib/utils';
import type { VariantStatus, VariantAttributes, ExtendedProductVariant } from '../../types';
import type { VariantSubmitData } from './VariantDialog';
import { useRichAdminVariants } from '@/hooks/queries/useProduct';
import { useCustomizeTypes } from '@/hooks/queries/useCustomizeType';
import { variantSchema, type VariantFormValues } from './variantSchema';

interface UseVariantFormProps {
    variant: ExtendedProductVariant | null;
    productId: string;
    productName: string;
    productSlug: string;
    variantCount: number;
    onSubmit: (data: VariantSubmitData) => void;
    isEdit: boolean;
}

export function useVariantForm({
    variant,
    productId,
    productName,
    productSlug,
    variantCount,
    onSubmit,
    isEdit
}: UseVariantFormProps) {
    const mappedCustoms = useMemo(() => {
        if (!variant) return [];
        if (variant.pendingCustoms?.length) return variant.pendingCustoms;

        const allOpts = [
            ...(variant.customizeTypes || []),
            ...(variant.customizeOptions || []),
            ...(variant.customizeOptionGroups?.flatMap(g => g.options || []) || [])
        ];

        // Deduplicate by ID to avoid form issues
        const seenIds = new Set();
        return allOpts.reduce((acc: { customizeTypeId: string; overridePrice: number | null; overrideMultiplier?: number | null }[], o) => {
            if (!o || !o.customizeTypeId || seenIds.has(o.customizeTypeId)) return acc;
            seenIds.add(o.customizeTypeId);
            acc.push({
                customizeTypeId: o.customizeTypeId,
                overridePrice: (o as { overridePrice?: number | null }).overridePrice ?? null,
                overrideMultiplier: (o as { overrideMultiplier?: number | null }).overrideMultiplier ?? null
            });
            return acc;
        }, []);
    }, [variant]);

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
            isCustomizable: !!(variant?.isCustomizable || variant?.is_customizable),
            customizeLabel: variant?.customizeLabel || '',
            width: variant?.attributes?.width || 0,
            length: variant?.attributes?.length || 0,
            thickness: variant?.attributes?.thickness || 0,
            colorName: variant?.attributes?.color || '',
            colorHex: variant?.attributes?.colorHex || '',
            pendingCustoms: mappedCustoms,
        },
        mode: 'onChange',
        reValidateMode: 'onChange',
    });

    const [isCustomizable, basePrice, salePrice, watchCustoms] = useWatch({
        control: form.control,
        name: ['isCustomizable', 'basePrice', 'salePrice', 'pendingCustoms']
    });
    const pendingCustoms = useMemo(() => watchCustoms || [], [watchCustoms]);

    // ── Business Logic: Auto-trigger cross-field validation ──────────
    useEffect(() => {
        const bp = Number(basePrice) || 0;
        const sp = Number(salePrice) || 0;

        // Convenience: If sale price is 0 or matches base price, sync them when base price changes
        // This helps user when they "don't want to discount"
        if (!isEdit && bp > 0 && (sp === 0 || sp === bp)) {
            form.setValue('salePrice', bp, { shouldValidate: true });
        }

        if (bp > 0 || sp > 0) {
            form.trigger(['basePrice', 'salePrice']);
        }
    }, [basePrice, salePrice, form, isEdit]);

    // ── Senior Logic: Reactive Form Synchronization ───────────────────
    useEffect(() => {
        if (isEdit && variant) {
            form.reset({
                sku: variant.sku || '',
                basePrice: variant.basePrice || 0,
                salePrice: variant.salePrice || 0,
                weight: variant.weight || 0,
                stockQuantity: variant.stockQuantity || 0,
                status: variant.status || 'Draft',
                isNew: !!(variant.isNew),
                isCustomizable: !!(variant.isCustomizable || variant.is_customizable),
                customizeLabel: variant.customizeLabel || '',
                width: variant.attributes?.width || 0,
                length: variant.attributes?.length || 0,
                thickness: variant.attributes?.thickness || 0,
                colorName: variant.attributes?.color || '',
                colorHex: variant.attributes?.colorHex || '',
                pendingCustoms: mappedCustoms,
            });
        }
    }, [variant, mappedCustoms, isEdit, form]);

    // ── Queries ────────────────────────────────────────────────────────
    const { data: variantsData } = useRichAdminVariants(productId);
    const { data: customizationMeta } = useCustomizeTypes({ pageSize: 100 });

    const getOptionType = useCallback((id: string) => {
        const opt = customizationMeta?.items?.find(o => o.id === id);
        if (!opt) return 'other';
        const name = opt.name.toLowerCase();
        if (name.includes('color') || name.includes('màu')) return 'color';
        if (name.includes('size') || name.includes('kích thước')) return 'size';
        return 'other';
    }, [customizationMeta]);

    const { isCustomColor, isCustomSize } = useMemo(() => {
        return {
            isCustomColor: pendingCustoms.some(p => getOptionType(p.customizeTypeId) === 'color'),
            isCustomSize: pendingCustoms.some(p => getOptionType(p.customizeTypeId) === 'size')
        };
    }, [pendingCustoms, getOptionType]);


    const { hasAttributeCollision, collidingSku } = useMemo(() => {
        if (!variantsData) return { hasAttributeCollision: false, collidingSku: undefined };

        const allVariants = variantsData?.colorGroups?.flatMap(g => g.variants) || [];
        const currentIsFullBespoke = isCustomColor && isCustomSize;

        // 🔥 Senior Logic Update: Per user requirement, we ONLY block collisions for Full Bespoke variants.
        // For standard or partial custom variants, we allow them to have overlapping attributes (uniqueness is handled by SKU).
        if (!currentIsFullBespoke) return { hasAttributeCollision: false, collidingSku: undefined };

        const found = allVariants.find(v => {
            // Self-exclusion on edit
            if (isEdit && (v.id === variant?.id || v.sku === variant?.sku)) return false;

            // Rule: Only ONE "Full: Color, Size" (Bespoke) variant per product
            return !!v.isFullBespoke;
        });

        return {
            hasAttributeCollision: !!found,
            collidingSku: found?.sku
        };
    }, [isEdit, variant, isCustomColor, isCustomSize, variantsData]);

    const isColorWithoutSize = isCustomColor && !isCustomSize;


    // ── Methods ─────────────────────────────────────────────────────────
    const handleRegenerateSku = useCallback(() => {
        if (isEdit) return;
        const color = form.getValues('colorName');
        // 🔥 Senior Fix: Use name-based slug to avoid redundant category prefixes often present in URL slugs
        const nameSlug = toSlug(productName).toUpperCase();
        const base = nameSlug || productSlug.trim().toUpperCase() || 'PRODUCT';
        
        let colorPart = '';
        if (color) {
            const slugColor = toSlug(color).toUpperCase();
            // Only append color if it's not already part of the base name
            if (!base.includes(slugColor)) {
                colorPart = `-${slugColor}`;
            }
        }

        const count = String(variantCount + 1).padStart(2, '0');
        form.setValue('sku', `${base}${colorPart}-V${count}`, { shouldValidate: true });
    }, [isEdit, productName, productSlug, variantCount, form]);

    const handleColorChange = useCallback((name: string, hex: string) => {
        form.setValue('colorName', name, { shouldValidate: true });
        form.setValue('colorHex', hex, { shouldValidate: true });
    }, [form]);

    const onFormSubmit = (data: VariantFormValues) => {
        if (hasAttributeCollision || isColorWithoutSize) return;

        const submitData: VariantSubmitData = {
            productid: productId,
            sku: data.sku.toUpperCase(),
            baseprice: data.basePrice,
            saleprice: data.salePrice,
            weight: data.weight || 0,
            status: data.status as VariantStatus,
            stockStatus: data.stockQuantity > 0 ? 'In Stock' : 'Out of Stock',
            stockQuantity: data.stockQuantity,
            isNew: !!data.isNew,
            isCustomizable: !!data.isCustomizable,
            customizeLabel: data.customizeLabel,
            pendingCustoms: data.pendingCustoms || [],
            customizeTypeIds: [],
            attributes: {
                width: data.width || undefined,
                length: data.length || undefined,
                thickness: data.thickness || undefined,
                color: data.colorName || undefined,
                hexColor: data.colorHex || undefined,
            } as VariantAttributes
        };

        onSubmit(submitData);
    };

    // Auto-clear logic
    useEffect(() => {
        if (isCustomColor) {
            form.setValue('colorName', '', { shouldDirty: true });
            form.setValue('colorHex', '', { shouldDirty: true });
        }
    }, [isCustomColor, form]);

    useEffect(() => {
        if (isCustomSize) {
            form.setValue('width', 0, { shouldDirty: true });
            form.setValue('length', 0, { shouldDirty: true });
            form.setValue('thickness', 0, { shouldDirty: true });
        }
    }, [isCustomSize, form]);

    const [colorName, colorHex] = useWatch({
        control: form.control,
        name: ['colorName', 'colorHex']
    });

    const pendingCustomsMemo = useMemo(() => pendingCustoms || [], [pendingCustoms]);

    return {
        form,
        register: form.register,
        errors: form.formState.errors,
        isValid: form.formState.isValid &&
            Object.keys(form.formState.errors).length === 0 &&
            !hasAttributeCollision &&
            !isColorWithoutSize,
        isDirty: form.formState.isDirty,
        handleRegenerateSku,
        handleColorChange,
        handleSubmit: form.handleSubmit(onFormSubmit),
        isCustomColor,
        isCustomSize,
        hasAttributeCollision,
        isColorWithoutSize,
        collidingSku,
        isEdit,
        isCustomizable,
        colorName,
        colorHex,
        pendingCustoms: pendingCustomsMemo
    };
}

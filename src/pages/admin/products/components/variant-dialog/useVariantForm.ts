import { useCallback, useMemo, useEffect } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ProductVariant, VariantStatus, VariantAttributes } from '../../types';
import type { VariantSubmitData } from './VariantDialog';
import { useRichAdminVariants } from '@/hooks/queries/useProduct';
import { useCustomizeTypes } from '@/hooks/queries/useCustomizeType';
import { variantSchema, type VariantFormValues } from './variantSchema';

interface SimpleCustomizeType {
    customizeTypeId: string;
    name?: string;
    summary?: string;
    defaultPrice?: number;
    overridePrice?: number | null;
    customizeTypeName?: string;
    customizeType?: { name: string };
}

export interface ExtendedProductVariant extends Omit<ProductVariant, 'customizeTypes' | 'customizeOptions'> {
    pendingCustoms?: { customizeTypeId: string; overridePrice: number | null }[];
    is_customizable?: boolean;
    customizeOptions?: SimpleCustomizeType[];
    customizeTypes?: SimpleCustomizeType[];
    customizeOptionGroups?: { category: string; options: SimpleCustomizeType[] }[];
}

interface UseVariantFormProps {
    variant: ExtendedProductVariant | null;
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
    const mappedCustoms = useMemo(() => {
        if (!variant) return [];
        if (variant.pendingCustoms?.length) return variant.pendingCustoms;

        const allOpts = [
            ...(variant.customizeTypes || []),
            ...(variant.customizeOptions || []),
            ...(variant.customizeOptionGroups?.flatMap(g => g.options || []) || [])
        ];

        return allOpts.map(o => ({
            customizeTypeId: o.customizeTypeId,
            overridePrice: o.overridePrice ?? o.defaultPrice ?? null
        }));
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

    const isCustomizable = useWatch({ control: form.control, name: 'isCustomizable' });
    const basePrice = useWatch({ control: form.control, name: 'basePrice' });
    const salePrice = useWatch({ control: form.control, name: 'salePrice' });
    const watchCustoms = useWatch({ control: form.control, name: 'pendingCustoms' });
    const pendingCustoms = useMemo(() => watchCustoms || [], [watchCustoms]);

    // ── Business Logic: Auto-trigger cross-field validation ──────────
    useEffect(() => {
        const bp = Number(basePrice) || 0;
        const sp = Number(salePrice) || 0;
        if (bp > 0 || sp > 0) {
            form.trigger(['basePrice', 'salePrice']);
        }
    }, [basePrice, salePrice, form]);

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

    // ── Senior Optimization: Targeted Watchers ──────────────────────
    const [wVal, lVal, tVal, cVal] = useWatch({
        control: form.control,
        name: ['width', 'length', 'thickness', 'colorName']
    });

    const { hasAttributeCollision, collidingSku } = useMemo(() => {
        if (!variantsData) return { hasAttributeCollision: false, collidingSku: undefined };

        const allVariants = variantsData?.colorGroups?.flatMap(g => g.variants) || [];
        const currentIsFullBespoke = isCustomColor && isCustomSize;

        const cw = Number(wVal || 0);
        const cl = Number(lVal || 0);
        const ct = Number(tVal || 0);
        const cc = String(cVal || '').trim().toLowerCase();

        const found = allVariants.find(v => {
            // Self-exclusion on edit
            if (isEdit && (v.id === variant?.id || v.sku === variant?.sku)) return false;

            // Rule 1: Only ONE "Full: Color, Size" variant per product
            if (currentIsFullBespoke && v.isFullBespoke) return true;

            // If we are making a Full Bespoke, it doesn't collide on attributes with any other type.
            if (currentIsFullBespoke) return false;

            // Rule 2: Attribute Collision (Standard & Partial Custom)
            // They must have the exact same customization strategy to collide
            const vHasC = !!v.isVariantCustomizable && !v.isCustomSize && !v.isFullBespoke;
            const vHasS = !!v.isCustomSize && !v.isFullBespoke;
            const currentHasC = isCustomColor && !isCustomSize;
            const currentHasS = isCustomSize && !isCustomColor;

            if (vHasC !== currentHasC || vHasS !== currentHasS) return false;

            const attr = v.attributes || {};
            const w = Number(attr.width || 0);
            const l = Number(attr.length || 0);
            const t = Number(attr.thickness || 0);
            const c = String(attr.color || '').trim().toLowerCase();

            // Ignore 0/empty fields in comparison if they are the customized fields
            const colorMatch = currentHasC || (c === cc);
            const dimMatch = currentHasS || (w === cw && l === cl && t === ct);

            // Block if both fixed dimensions match
            return colorMatch && dimMatch;
        });

        return {
            hasAttributeCollision: !!found,
            collidingSku: found?.sku
        };
    }, [isEdit, variant, wVal, lVal, tVal, cVal, isCustomColor, isCustomSize, variantsData]);

    const isColorWithoutSize = isCustomColor && !isCustomSize;

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

    const colorName = useWatch({ control: form.control, name: 'colorName' });
    const colorHex = useWatch({ control: form.control, name: 'colorHex' });

    const pendingCustomsMemo = useMemo(() => pendingCustoms || [], [pendingCustoms]);

    return {
        form,
        register: form.register,
        errors: form.formState.errors,
        isValid: form.formState.isValid &&
            Object.keys(form.formState.errors).length === 0 &&
            !hasAttributeCollision &&
            !isColorWithoutSize,
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

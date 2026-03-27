import { useReducer, useCallback, useMemo, useEffect } from 'react';
import type { ProductVariant } from '../../types';
import { variantFormReducer, createInitialState, type VariantFormState, type VariantFormAction } from './variantFormReducer';
import type { VariantSubmitData } from './VariantDialog';
import { useCustomizeTypes } from '@/hooks/queries/useCustomizeType';

interface UseVariantFormProps {
    variant: ProductVariant | null;
    productId: string;
    productSlug: string;
    variantCount: number;
    onSubmit: (data: VariantSubmitData) => void;
    isEdit: boolean;
}

/** ─── Senior Optimization: Identify Customization Category ─── */
const getCustomCategory = (name: string): 'size' | 'color' | 'other' => {
    const low = (name || '').toLowerCase();
    if (low.includes('size') || low.includes('kích thước')) return 'size';
    if (low.includes('color') || low.includes('màu')) return 'color';
    return 'other';
};

export function useVariantForm({
    variant,
    productId,
    productSlug,
    variantCount,
    onSubmit,
    isEdit
}: UseVariantFormProps) {
    const [state, dispatch] = useReducer(variantFormReducer, variant, createInitialState);

    // Fetch available customization types to help identify their categories
    const { data: customizationMeta } = useCustomizeTypes({ pageSize: 100 });

    /** ─── Senior Logic: Field Disabling based on Customization ─── */
    const { isCustomColor, isCustomSize, customizeTypeIds } = useMemo(() => {
        if (!state.isCustomizable || !state.pendingCustoms.length || !customizationMeta) {
            return { isCustomColor: false, isCustomSize: false, customizeTypeIds: [] };
        }

        const idsSet = new Set(state.pendingCustoms.map(p => p.customizeTypeId));
        const activeCustomTypes = customizationMeta.items.filter(item => idsSet.has(item.id));

        return {
            isCustomColor: activeCustomTypes.some(t => getCustomCategory(t.name) === 'color'),
            isCustomSize: activeCustomTypes.some(t => getCustomCategory(t.name) === 'size'),
            customizeTypeIds: Array.from(idsSet)
        };
    }, [state.isCustomizable, state.pendingCustoms, customizationMeta]);

    const setField = useCallback(<K extends keyof VariantFormState>(field: K, value: VariantFormState[K]) => {
        dispatch({ type: 'SET_FIELD', field, value } as VariantFormAction);
    }, []);

    // ──────────────────────────────────────────────────────────
    // Senior Performance: Atomic State Syncing
    // ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (variant) {
            dispatch({ type: 'RESET', payload: createInitialState(variant) });
        }
    }, [variant]);

    // ─── Senior Optimization: Clear manual values when customization is active ───
    useEffect(() => {
        if (isCustomColor) {
            dispatch({ type: 'SET_COLOR', payload: { name: '', hex: '' } });
        }
    }, [isCustomColor]);

    useEffect(() => {
        if (isCustomSize) {
            setField('width', '');
            setField('length', '');
            setField('thickness', '');
            setField('weight', '');
        }
    }, [isCustomSize, setField]);

    const handleRegenerateSku = useCallback(() => {
        if (isEdit) return;
        const base = productSlug.trim().toUpperCase() || 'PRODUCT';

        // Use a more professional pattern: PRODUCT-V001 or PRODUCT-RED-V001
        const colorPart = !isCustomColor && state.colorName ? `-${state.colorName.toUpperCase()}` : '';
        const count = String(variantCount + 1).padStart(2, '0');
        setField('sku', `${base}${colorPart}-V${count}`);
    }, [isEdit, productSlug, variantCount, setField, isCustomColor, state.colorName]);

    const handleColorChange = useCallback((name: string, hex: string) => {
        dispatch({ type: 'SET_COLOR', payload: { name, hex } });
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        const toNum = (val: string) => {
            const n = parseFloat(val);
            return isNaN(n) ? 0 : n;
        };

        const submitData: VariantSubmitData = {
            productid: productId,
            sku: state.sku.trim().toUpperCase(),
            baseprice: toNum(state.basePrice),
            saleprice: state.salePrice ? toNum(state.salePrice) : 0,
            weight: toNum(state.weight),
            status: state.status,
            stockStatus: state.stockStatus,
            stockQuantity: toNum(state.stockQuantity),
            isNew: state.isNew,
            isCustomizable: state.isCustomizable,
            customizeLabel: state.customizeLabel,
            pendingCustoms: state.pendingCustoms,
            customizeTypeIds: state.isCustomizable ? customizeTypeIds : [],
            // ── Top-level color (backend compatibility) ──
            color: isCustomColor ? undefined : (state.colorName || undefined),
            hexColor: isCustomColor ? undefined : (state.colorHex || undefined),
            colorHex: isCustomColor ? undefined : (state.colorHex || undefined),
            attributes: {
                // If custom size is active, we don't send individual dimensions
                width: isCustomSize ? undefined : (toNum(state.width) || undefined),
                length: isCustomSize ? undefined : (toNum(state.length) || undefined),
                thickness: isCustomSize ? undefined : (toNum(state.thickness) || undefined),
                // If custom color is active, we don't send color info
                color: isCustomColor ? undefined : (state.colorName || undefined),
                hexColor: isCustomColor ? undefined : (state.colorHex || undefined),
                colorHex: isCustomColor ? undefined : (state.colorHex || undefined),
            }
        };

        onSubmit(submitData);
    }, [productId, state, onSubmit, isCustomColor, isCustomSize, customizeTypeIds]);

    // ──────────────────────────────────────────────────────────
    // Validation & UX Score Logic
    // ──────────────────────────────────────────────────────────
    const isValid = useMemo(() => {
        const base = parseFloat(state.basePrice) || 0;
        const sale = parseFloat(state.salePrice) || 0;

        const hasValidSku = state.sku.trim().length >= 3;
        const hasValidBasePrice = base > 0;
        const hasValidSalePrice = sale === 0 || sale <= base;

        return hasValidSku && hasValidBasePrice && hasValidSalePrice;
    }, [state.sku, state.basePrice, state.salePrice]);

    const completionScore = useMemo(() => {
        let score = 0;
        const price = parseFloat(state.basePrice) || 0;
        const hasDims = isCustomSize || (parseFloat(state.width) > 0 || parseFloat(state.length) > 0 || parseFloat(state.thickness) > 0);

        if (state.sku.trim().length >= 3) score += 25;
        if (price > 0) score += 25;
        if (hasDims || toNum(state.weight) > 0) score += 25;
        if (isCustomColor || state.colorName || state.colorHex) score += 25;

        return score;

        function toNum(val: string) {
            const n = parseFloat(val);
            return isNaN(n) ? 0 : n;
        }
    }, [state, isCustomColor, isCustomSize]);

    return {
        state,
        setField,
        handleRegenerateSku,
        handleColorChange,
        handleSubmit,
        isValid,
        completionScore,
        isCustomColor,
        isCustomSize
    };
}

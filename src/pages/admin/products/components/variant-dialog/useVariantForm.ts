import { useReducer, useCallback, useMemo, useEffect } from 'react';
import type { ProductVariant } from '../../types';
import { variantFormReducer, createInitialState, type VariantFormState, type VariantFormAction } from './variantFormReducer';
import type { VariantSubmitData } from './VariantDialog';

interface UseVariantFormProps {
    variant: ProductVariant | null;
    productId: string;
    productSlug: string;
    variantCount: number;
    onSubmit: (data: VariantSubmitData) => void;
    isEdit: boolean;
}

/** ─── Senior Optimization: Data Mapping Helper ─── */
const mapStateToSubmitData = (state: VariantFormState, productId: string): VariantSubmitData => {
    // Utility for safe number conversion (senior-level sanitization)
    const toNum = (val: string) => {
        const n = parseFloat(val);
        return isNaN(n) ? 0 : n;
    };

    return {
        productid: productId,
        sku: state.sku.trim().toUpperCase(),
        baseprice: toNum(state.basePrice),
        saleprice: state.salePrice ? toNum(state.salePrice) : 0,
        weight: toNum(state.weight),
        status: state.status,
        stockStatus: state.stockStatus,
        stockQuantity: toNum(state.stockQuantity),
        isNew: state.isNew,
        attributes: {
            width: toNum(state.width) || undefined,
            length: toNum(state.length) || undefined,
            thickness: toNum(state.thickness) || undefined,
            color: state.colorName,
            hexColor: state.colorHex,
        }
    };
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

    // ──────────────────────────────────────────────────────────
    // Senior Performance: Atomic State Syncing
    // ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (variant) {
            dispatch({ type: 'RESET', payload: createInitialState(variant) });
        }
    }, [variant]);

    const setField = useCallback(<K extends keyof VariantFormState>(field: K, value: VariantFormState[K]) => {
        dispatch({ type: 'SET_FIELD', field, value } as VariantFormAction);
    }, []);

    const handleRegenerateSku = useCallback(() => {
        if (isEdit) return;
        const base = productSlug.trim().toUpperCase() || 'PRODUCT';
        const count = String(variantCount + 1).padStart(3, '0');
        setField('sku', `${base}-V${count}`);
    }, [isEdit, productSlug, variantCount, setField]);

    const handleColorChange = useCallback((name: string, hex: string) => {
        // Atomic update to avoid double re-renders in older React versions/contexts
        dispatch({ type: 'SET_COLOR', payload: { name, hex } });
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        const submitData = mapStateToSubmitData(state, productId);
        onSubmit(submitData);
    }, [productId, state, onSubmit]);

    // ──────────────────────────────────────────────────────────
    // Validation & UX Score Logic
    // ──────────────────────────────────────────────────────────
    const isValid = useMemo(() => {
        const base = toNum(state.basePrice);
        const sale = toNum(state.salePrice);
        
        // Validation rules
        const hasValidSku = state.sku.trim().length >= 3;
        const hasValidBasePrice = base > 0;
        const hasValidSalePrice = sale === 0 || sale <= base;

        return hasValidSku && hasValidBasePrice && hasValidSalePrice;
    }, [state.sku, state.basePrice, state.salePrice]);

    function toNum(val: string) {
        const n = parseFloat(val);
        return isNaN(n) ? 0 : n;
    }

    const completionScore = useMemo(() => {
        let score = 0;
        const price = toNum(state.basePrice);
        const hasDims = toNum(state.width) > 0 || toNum(state.length) > 0 || toNum(state.thickness) > 0 || toNum(state.weight) > 0;
        
        if (state.sku.trim().length >= 3) score += 25;
        if (price > 0) score += 25;
        if (hasDims) score += 25;
        if (state.colorName || state.colorHex) score += 25;
        
        return score;
    }, [state]);

    return {
        state,
        setField,
        handleRegenerateSku,
        handleColorChange,
        handleSubmit,
        isValid,
        completionScore
    };
}

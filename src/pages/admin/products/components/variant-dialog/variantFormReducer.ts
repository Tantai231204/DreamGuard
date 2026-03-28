import type { ProductVariant, VariantStatus } from '../../types';

export interface VariantFormState {
    sku: string;
    status: VariantStatus;
    basePrice: string;
    salePrice: string;
    weight: string;
    width: string;
    length: string;
    thickness: string;
    colorName: string;
    colorHex: string;
    isNew: boolean;
    isCustomizable: boolean;
    customizeLabel: string;
    pendingCustoms: { customizeTypeId: string; overridePrice: number | null }[];
    stockQuantity: string;
    stockStatus: string;
}

export type VariantFormAction =
    | { [K in keyof VariantFormState]: { type: 'SET_FIELD'; field: K; value: VariantFormState[K] } }[keyof VariantFormState]
    | { type: 'SET_COLOR'; payload: { name: string; hex: string } }
    | { type: 'RESET'; payload: VariantFormState };

export const createInitialState = (variant: ProductVariant | null): VariantFormState => {
    const isNew = !variant;
    
    // 🔥 Senior Dev Optimization: Check if variant has color but NO size attributes
    // This allows auto-triggering the "Custom Size" UI logic requested by the user.
    const hasColor = !!variant?.attributes?.color || !!variant?.attributes?.hexColor;
    const hasSize = !!variant?.attributes?.width || !!variant?.attributes?.length || !!variant?.attributes?.thickness;
    const isNoSizeButHasColor = !!variant && hasColor && !hasSize;

    return {
        sku: variant?.sku || '',
        status: variant?.status || 'Draft',
        basePrice: variant?.basePrice?.toString() || '',
        salePrice: variant?.salePrice?.toString() || '',
        weight: variant?.weight?.toString() || (isNew ? '5' : ''),
        width: variant?.attributes?.width?.toString() || (isNew ? '100' : ''),
        length: variant?.attributes?.length?.toString() || (isNew ? '200' : ''),
        thickness: variant?.attributes?.thickness?.toString() || (isNew ? '20' : ''),
        colorName: variant?.attributes?.color?.toString() || (isNew ? 'White' : ''),
        colorHex: variant?.attributes?.hexColor?.toString() || (isNew ? '#f5f5f5' : ''),
        isNew: variant?.isNew ?? true,
        // Auto-enable if it's a bespoke variant (color only, no size)
        isCustomizable: variant?.isCustomizable ?? isNoSizeButHasColor,
        customizeLabel: variant?.customizeLabel ?? '',
        pendingCustoms: (variant?.customizeTypes || variant?.customizeOptions)?.map((c: { customizeTypeId?: string; id?: string; overridePrice?: number | null }) => ({
            customizeTypeId: c.customizeTypeId || c.id || '',
            overridePrice: c.overridePrice || null
        })) || [],
        stockQuantity: variant?.stockQuantity?.toString() || '0',
        stockStatus: variant?.stockStatus || 'InStock',
    };
};

export function variantFormReducer(state: VariantFormState, action: VariantFormAction): VariantFormState {
    switch (action.type) {
        case 'SET_FIELD':
            return { ...state, [action.field]: action.value };
        case 'SET_COLOR':
            return {
                ...state,
                colorName: action.payload.name,
                colorHex: action.payload.hex
            };
        case 'RESET':
            return action.payload;
        default:
            return state;
    }
}

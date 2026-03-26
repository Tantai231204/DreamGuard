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
    stockQuantity: string;
    stockStatus: string;
    pendingCustoms: { customizeTypeId: string; overridePrice: number | null }[];
}

export type VariantFormAction =
    | { [K in keyof VariantFormState]: { type: 'SET_FIELD'; field: K; value: VariantFormState[K] } }[keyof VariantFormState]
    | { type: 'SET_COLOR'; payload: { name: string; hex: string } }
    | { type: 'RESET'; payload: VariantFormState };

export const createInitialState = (variant: ProductVariant | null): VariantFormState => ({
    sku: variant?.sku || '',
    status: variant?.status || 'Draft',
    basePrice: variant?.basePrice?.toString() || '',
    salePrice: variant?.salePrice?.toString() || '',
    weight: variant?.weight?.toString() || '',
    width: variant?.attributes?.width?.toString() || '',
    length: variant?.attributes?.length?.toString() || '',
    thickness: variant?.attributes?.thickness?.toString() || '',
    colorName: variant?.attributes?.color?.toString() || '',
    colorHex: variant?.attributes?.hexColor?.toString() || '',
    isNew: variant?.isNew ?? true,
    isCustomizable: variant?.isCustomizable ?? false,
    customizeLabel: variant?.customizeLabel || '',
    stockQuantity: variant?.stockQuantity?.toString() || '0',
    stockStatus: variant?.stockStatus || 'In Stock',
    pendingCustoms: []
});

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

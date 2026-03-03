import type { ProductStatus } from '../../types';

export type FormState = {
    name: string;
    slug: string;
    summary: string;
    description: string;
    material: string;
    ageGroup: string;
    warrantyPolicyDay: string;
    returnPolicyDay: string;
    status: ProductStatus;
    cateId: string;
    subCateId: string;
};

type FormAction =
    | { type: 'SET_ALL'; payload: Partial<FormState> }
    | { type: 'RESET'; payload?: undefined }
    | { type: keyof FormState; payload: string };

export function getInitialFormState(product?: { 
    name?: string; slug?: string; summary?: string; description?: string;
    material?: string; ageGroup?: number | null; warrantyPolicyDay?: number | null;
    returnPolicyDay?: number | null; status?: ProductStatus; cateId?: number | null;
} | null): FormState {
    return {
        name: product?.name ?? '',
        slug: product?.slug ?? '',
        summary: product?.summary ?? '',
        description: product?.description ?? '',
        material: product?.material ?? '',
        ageGroup: product?.ageGroup != null ? String(product.ageGroup) : '',
        warrantyPolicyDay: product?.warrantyPolicyDay != null ? String(product.warrantyPolicyDay) : '',
        returnPolicyDay: product?.returnPolicyDay != null ? String(product.returnPolicyDay) : '',
        status: product?.status || 'Draft',
        cateId: product?.cateId != null ? String(product.cateId) : '',
        subCateId: '',
    };
}

export function formReducer(state: FormState, action: FormAction): FormState {
    switch (action.type) {
        case 'SET_ALL':
            return { ...state, ...action.payload };
        case 'RESET':
            return getInitialFormState(undefined);
        default:
            return state[action.type] === action.payload
                ? state // bail out – same value → no re-render
                : { ...state, [action.type]: action.payload };
    }
}

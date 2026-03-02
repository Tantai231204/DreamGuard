// src/api/services/variantService.ts
import apiClient from '../../lib/api';

export interface CreateVariantRequest {
    productId: string;
    sku: string;
    size: string;
    basePrice: number;
    salePrice: number;
    weight: number | null;
    isNew: boolean;
    status: number;
    attributes: Record<string, unknown> | null;
}

export interface UpdateVariantRequest {
    sku: string;
    size: string;
    basePrice: number;
    salePrice: number;
    weight: number | null;
    isNew: boolean;
    status: number;
    attributes: Record<string, unknown> | null;
}

export interface VariantResponse {
    id: string;
    sku: string;
    basePrice: number;
    salePrice: number;
    weight: number | null;
    attributes: Record<string, unknown> | null;
    size: string;
    status: number;
    createdAt: string;
    isNew: boolean;
    productId: string;
}

const variantService = {
    /** Create new variant */
    create: (data: CreateVariantRequest): Promise<VariantResponse> =>
        apiClient.post('/variants', data).then((res) => res.data),

    /** Update variant */
    update: (id: string, data: UpdateVariantRequest): Promise<VariantResponse> =>
        apiClient.put(`/variants/${id}`, data).then((res) => res.data),

    /** Delete variant */
    delete: (id: string): Promise<void> =>
        apiClient.delete(`/variants/${id}`).then((res) => res.data),

    /** Get variant by ID */
    getById: (id: string): Promise<VariantResponse> =>
        apiClient.get(`/variants/${id}`).then((res) => res.data),

    /** Get all variants by product ID */
    getByProductId: (productId: string): Promise<VariantResponse[]> =>
        apiClient.get(`/variants/product/${productId}`).then((res) => res.data),
};

export default variantService;

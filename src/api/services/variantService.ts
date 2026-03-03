// src/api/services/variantService.ts
import apiClient from "../../lib/api";

export interface VariantAttributes {
  width?: number;
  length?: number;
  thickness?: number;
  color?: string;
  [key: string]: unknown;
}

export interface CreateVariantRequest {
  productId: string;
  sku: string;
  basePrice: number;
  salePrice: number;
  weight: number | null;
  isNew: boolean;
  status: number;
  attributes: VariantAttributes | null;
}

export interface UpdateVariantRequest {
  sku: string;
  basePrice: number;
  salePrice: number;
  weight: number | null;
  isNew: boolean;
  status: number;
  attributes: VariantAttributes | null;
}

export interface VariantResponse {
  id: string;
  sku: string;
  basePrice: number;
  salePrice: number;
  weight: number | null;
  attributes: VariantAttributes | null;
  status: number;
  createdAt: string;
  isNew: boolean;
  productId: string;
}

// Admin API response types
export interface AdminVariantItem {
  id: string;
  size: string;
  sku: string;
  salePrice: number;
  basePrice: number;
  stockQuantity: number;
  stockStatus: string;
  status: string;
}

export interface AdminColorGroup {
  color: string;
  variants: AdminVariantItem[];
}

export interface AdminVariantsByProductResponse {
  productId: string;
  productName: string;
  totalVariants: number;
  colorGroups: AdminColorGroup[];
}

const variantService = {
  /** Create new variant */
  create: (data: CreateVariantRequest): Promise<VariantResponse> =>
    apiClient.post("/variants", data).then((res) => res.data),

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

  /** Get variants grouped by color for admin */
  getAdminByProductId: (productId: string): Promise<AdminVariantsByProductResponse> =>
    apiClient.get(`/variants/admin/product/${productId}`).then((res) => res.data),
};

export default variantService;

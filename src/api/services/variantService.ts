// src/api/services/variantService.ts
import apiClient from "../../lib/api";

export interface VariantAttributes {
  width?: number;
  length?: number;
  thickness?: number;
  color?: string;    // Color Name (e.g. "Crimson")
  hexColor?: string; // Hex Code (e.g. "#DC143C")
  [key: string]: unknown;
}

export interface CreateVariantRequest {
  sku: string;
  baseprice: number;
  saleprice: number;
  weight: number;
  attributes: VariantAttributes | null;
  productid: string;
}

export interface UpdateVariantRequest {
  sku: string;
  baseprice: number;
  saleprice: number;
  weight: number;
  attributes: VariantAttributes | null;
  productid: string;
}

export interface UpdateVariantStatusParams {
  variantId: string;
  status: string;
}


export interface VariantResponse {
  id: string;
  sku: string;
  basePrice: number;
  salePrice: number;
  weight: number | null;
  attributes: VariantAttributes | null;
  size: string;
  status: string;
  createdAt: string;
  isNew: boolean;
  productId: string;
  stockQuantity?: number;
  stockStatus?: string;
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
  color: string;    // Color Name
  hexColor?: string; // Hex Code
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

  /** Update variant info */
  update: (id: string, data: UpdateVariantRequest): Promise<VariantResponse> =>
    apiClient.put(`/variants/${id}`, data).then((res) => res.data),

  /** Update variant status */
  updateStatus: ({ variantId, status }: UpdateVariantStatusParams): Promise<void> =>
    apiClient.patch(`/variants/${variantId}/status`, null, { params: { status } }).then((res) => res.data),


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

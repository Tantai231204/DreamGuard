// src/api/services/variantService.ts
import apiClient from "../../lib/api";

export interface VariantAttributes {
  width?: number;      // Width in cm
  length?: number;     // Length in cm  
  thickness?: number;  // Thickness in cm
  color?: string;      // Color Name (e.g. "Crimson")
  hexColor?: string;   // Hex Code (e.g. "#DC143C") - Legacy name
  colorHex?: string;   // Hex Code (e.g. "#DC143C") - Alternative name
  [key: string]: unknown;
}

export interface CreateVariantRequest {
  sku: string;
  basePrice: number;
  salePrice: number;
  weight: number;
  attributes: VariantAttributes | null;
  productId: string;
  color?: string;
  hexColor?: string;
  colorHex?: string;
  isNew?: boolean;
  isCustomizable?: boolean;
  customizeLabel?: string;
}

export interface UpdateVariantRequest {
  sku: string;
  basePrice: number;
  salePrice: number;
  weight: number;
  attributes: VariantAttributes | null;
  productId: string;
  color?: string;
  hexColor?: string;
  colorHex?: string;
  isNew?: boolean;
  isCustomizable?: boolean;
  customizeLabel?: string;
}

export interface UpdateVariantStatusParams {
  variantId: string;
  status: string;
}

export interface CreateVariantWithCustomizeRequest {
  sku: string;
  basePrice: number;
  salePrice: number;
  weight: number;
  attributes: VariantAttributes | null;
  productId: string;
  color?: string;
  hexColor?: string;
  colorHex?: string;
  isNew?: boolean;
  isCustomizable?: boolean;
  customizeLabel?: string;
  customizeTypeIds: string[];
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
  isCustomizable?: boolean;
  is_customizable?: boolean;
  customizeLabel?: string;
  stockQuantity?: number;
  stockStatus?: string;
  customizeTypes?: VariantCustomizeTypeResponse[];
  customizeOptionGroups?: import("../types/product.types").CustomizeOptionGroupResponse[];
}

export interface AdminVariantItem {
  id: string;
  size: string;
  sku: string;
  salePrice: number;
  basePrice: number;
  stockQuantity: number;
  stockStatus: string;
  status: string;
  weight: number | null;
  attributes: VariantAttributes | null;
  isNew?: boolean;
  isCustomizable?: boolean;
  is_customizable?: boolean; // Snake_case fallback from API
  customizeTypes?: VariantCustomizeTypeResponse[];
  customizeOptions?: VariantCustomizeTypeResponse[];
  customizeOptionGroups?: { category: string; options: VariantCustomizeTypeResponse[] }[];
  customizeLabel?: string;
  createdAt?: string;
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

/* ─── Variant Customization Types ────────────────────────── */

export interface VariantCustomizeTypeResponse {
  variantId: string;
  customizeTypeId: string;
  customizeTypeName: string;
  originalPrice: number;
  overridePrice: number | null;
  finalPrice: number; // originalPrice or overridePrice
}

export interface AssignVariantCustomizeTypeRequest {
  customizeTypeId: string;
  overridePrice?: number;
  overrideMultiplier?: number;
}

export interface UpdateVariantCustomizeTypePriceRequest {
  overridePrice: number;
  overrideMultiplier?: number;
}

const variantService = {
  /** Create new variant */
  create: (data: CreateVariantRequest): Promise<VariantResponse> =>
    apiClient.post("/variants", data).then((res) => res.data),

  /** Create new variant with customization - calls /api/variants/with-customize */
  createWithCustomize: (data: CreateVariantWithCustomizeRequest): Promise<VariantResponse> =>
    apiClient.post("/variants/with-customize", data).then((res) => res.data),

  /** Update variant info */
  update: (id: string, data: UpdateVariantRequest): Promise<VariantResponse> =>
    apiClient.put(`/variants/${id}`, data).then((res) => res.data),

  /** Update variant status */
  updateStatus: ({ variantId, status }: UpdateVariantStatusParams): Promise<void> =>
    apiClient.patch(`/variants/${variantId}/status`, {}, { params: { status } }).then((res) => res.data),

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

  /* ─── Variant Customization Methods ─── */

  /** Fetch customization types assigned to this variant - extracts from flat and nested groups */
  getCustomizeTypes: (variantId: string): Promise<VariantCustomizeTypeResponse[]> =>
    apiClient.get(`/variants/${variantId}`).then((res) => {
      const data = res.data;
      if (!data) return [];

      const flat = (data.customizeTypes || []) as VariantCustomizeTypeResponse[];
      const opts = (data.customizeOptions || []) as VariantCustomizeTypeResponse[];
      const grouped = (data.customizeOptionGroups?.flatMap((g: { options?: VariantCustomizeTypeResponse[] }) => g.options || []) || []) as VariantCustomizeTypeResponse[];

      // Merge all, filter out nulls, and deduplicate by customizeTypeId
      const all = [...flat, ...opts, ...grouped].filter(Boolean);
      const seen = new Set<string>();
      return all.filter(item => {
        if (!item.customizeTypeId || seen.has(item.customizeTypeId)) return false;
        seen.add(item.customizeTypeId);
        return true;
      });
    }),

  /** Link a customization type to a variant */
  assignCustomizeType: (variantId: string, data: AssignVariantCustomizeTypeRequest): Promise<void> =>
    apiClient.post(`/variants/${variantId}/customize-types`, data).then((res) => res.data),

  /** Update existing override price for a customization type on a variant */
  updateCustomizeTypePrice: (variantId: string, customizeTypeId: string, data: UpdateVariantCustomizeTypePriceRequest): Promise<void> =>
    apiClient.put(`/variants/${variantId}/customize-types/${customizeTypeId}/price`, data).then((res) => res.data),

  /** Remove a customization type from a variant */
  removeCustomizeType: (variantId: string, customizeTypeId: string): Promise<void> =>
    apiClient.delete(`/variants/${variantId}/customize-types/${customizeTypeId}`).then((res) => res.data),
};

export default variantService;

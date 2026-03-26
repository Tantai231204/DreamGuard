// src/api/types/product.types.ts

export interface AssetResponse {
  id: string;
  url: string;
  type: string;
  publicId: string;
  productId: string;
}

export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  material: string;
  ageGroup: string | number | null;
  warrantyPolicyDay: number | null;
  returnPolicyDay: number | null;
  status: string;  // .NET enum might serialize as string or int
  createdAt: string;
  averageRating: number;
  cateId: number | null;
  categoryName?: string;
  variants?: ProductVariantResponse[];
  // Admin-only computed fields
  variantCount?: number;
  maxPrice?: number;
  minPrice?: number;
  assets?: AssetResponse[];
  imageUrls?: string[];
}

export interface AdminProductPageResponse {
  items: ProductResponse[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminProductParams {
  pageNumber?: number;
  pageSize?: number;
  name?: string;
}

/** Public product query params – matches GET /api/product */
export interface ProductParams {
  cateId?: number;
  pageNumber?: number;
  color?: string;
  maxPrice?: number;
  maxAgeGroup?: number;
  key?: string;
}

export interface ProductVariantResponse {
  id: string;
  sku: string;
  basePrice: number;
  salePrice: number;
  weight: number | null;
  attributes: Record<string, unknown> | null;
  size: string;
  status: string;
  createdAt: string;
  isNew: boolean;
  isCustomizable?: boolean;
  productId: string;
  customizeLabel?: string;
  // Optional stock fields (may be present on some endpoints)
  stockQuantity?: number;
  stockStatus?: string;
}

export interface CreateProductRequest {
  name: string;
  slug: string;
  summary: string;
  description: string;
  material: string;
  ageGroup: string | null;
  warrantyPolicyDay: number | null;
  returnPolicyDay: number | null;
  status: string;
  cateId: number | null;
}

export interface UpdateProductRequest {
  id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  material?: string;
  status?: string;
  ageGroup: string | null;
  warrantyPolicyDay: number | null;
  returnPolicyDay: number | null;
  cateId: number | null;
}

export interface UpdateProductStatusParams {
  productId: string;
  status: string;
}

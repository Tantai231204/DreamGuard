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
  ageGroup: number | null;
  warrantyPolicyDay: number | null;
  returnPolicyDay: number | null;
  status: number;  // .NET enum serializes as int
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

export interface ProductVariantResponse {
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

export interface CreateProductRequest {
  name: string;
  slug: string;
  summary: string;
  description: string;
  material: string;
  ageGroup: number | null;
  warrantyPolicyDay: number | null;
  returnPolicyDay: number | null;
  status: number;
  cateId: number | null;
}

export type UpdateProductRequest = CreateProductRequest;

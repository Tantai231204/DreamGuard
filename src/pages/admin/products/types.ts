// ── Product ──────────────────────────────────────────────
export type ProductStatus = "Active" | "Inactive" | "Draft";
export type VariantStatus = "Active" | "Inactive";

export const AGE_GROUPS: Record<number, string> = {
  0: "Newborn (0–1 year)",
  1: "Toddler (1–3 years)",
  2: "Preschool (3–6 years)",
  3: "School Age (6–12 years)",
};

export const PRODUCT_STATUSES: { value: ProductStatus; label: string }[] = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Draft", label: "Draft" },
];

/** Map string status → .NET enum int value */
export const STATUS_TO_INT: Record<ProductStatus, number> = {
  Active: 0,
  Inactive: 1,
  Draft: 2,
};

/** Map .NET enum int → string status */
export const INT_TO_STATUS: Record<number, ProductStatus> = {
  0: "Active",
  1: "Inactive",
  2: "Draft",
};

export const VARIANT_STATUS_TO_INT: Record<VariantStatus, number> = {
  Active: 0,
  Inactive: 1,
};

export const INT_TO_VARIANT_STATUS: Record<number, VariantStatus> = {
  0: "Active",
  1: "Inactive",
};

export interface Product {
  id: string; // UUID
  name: string;
  slug: string;
  summary: string;
  description: string;
  material: string;
  ageGroup: number | null;
  warrantyPolicyDay: number | null;
  returnPolicyDay: number | null;
  status: ProductStatus;
  createdAt: string;
  averageRating: number;
  cateId: number | null;
  // Joined / computed (from admin endpoint)
  categoryName?: string;
  variantCount?: number;
  maxPrice?: number;
  minPrice?: number;
  variants?: ProductVariant[];
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

// ── Product Variant ──────────────────────────────────────
export interface ProductVariant {
  id: string; // UUID
  sku: string;
  basePrice: number;
  salePrice: number;
  weight: number | null;
  attributes: Record<string, unknown> | null;
  size: string;
  status: VariantStatus;
  createdAt: string;
  isNew: boolean;
  productId: string;
}

// ── Combo (kept for combo tab) ──────────────────────────
export interface ComboItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantLabel?: string;
  quantity: number;
}

export interface Combo {
  id: string;
  name: string;
  sku: string;
  type: "combo";
  category: string;
  basePrice: number;
  baseSalePrice?: number;
  totalStock: number;
  status: "Active" | "Inactive";
  images: string[];
  description: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  sales: number;
  items: ComboItem[];
  discount: number;
}

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

// ── Size Options ─────────────────────────────────────────
export const SIZE_OPTIONS = [
  { value: "60x120cm", label: "60 × 120 cm", description: "Cũi / Baby Crib" },
  { value: "70x130cm", label: "70 × 130 cm", description: "Cũi lớn" },
  { value: "80x160cm", label: "80 × 160 cm", description: "Junior" },
  { value: "90x190cm", label: "90 × 190 cm", description: "Single / 1 người" },
  { value: "100x200cm", label: "100 × 200 cm", description: "Single XL" },
  { value: "120x200cm", label: "120 × 200 cm", description: "Super Single" },
  { value: "140x200cm", label: "140 × 200 cm", description: "Double / 2 người" },
  { value: "160x200cm", label: "160 × 200 cm", description: "Queen" },
  { value: "180x200cm", label: "180 × 200 cm", description: "King" },
  { value: "200x200cm", label: "200 × 200 cm", description: "Super King" },
] as const;

// ── Preset Colors ────────────────────────────────────────
export const PRESET_COLORS = [
  { name: "White", code: "#f5f5f5" },
  { name: "Pink", code: "#ffc0cb" },
  { name: "Blue", code: "#add8e6" },
  { name: "Red", code: "#ff6b6b" },
  { name: "Green", code: "#90ee90" },
  { name: "Yellow", code: "#ffeb3b" },
  { name: "Orange", code: "#ffa500" },
  { name: "Purple", code: "#dda0dd" },
  { name: "Black", code: "#333333" },
  { name: "Gray", code: "#9e9e9e" },
  { name: "Brown", code: "#a0522d" },
  { name: "Beige", code: "#f5f5dc" },
  { name: "Navy", code: "#001f3f" },
  { name: "Cream", code: "#fffdd0" },
  { name: "Light Blue", code: "#87ceeb" },
  { name: "Mint", code: "#98ff98" },
] as const;

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
export interface VariantAttributes {
  color?: string;
  colorCode?: string; // hex color code
  [key: string]: unknown;
}

export interface ProductVariant {
  id: string; // UUID
  sku: string;
  basePrice: number;
  salePrice: number;
  weight: number | null;
  attributes: VariantAttributes | null;
  size: string;
  status: VariantStatus;
  createdAt: string;
  isNew: boolean;
  productId: string;
  // Inventory (from joined table or computed)
  stockQuantity?: number;
}

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

export type UpdateVariantRequest = Omit<CreateVariantRequest, 'productId'>;

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

// ── Product ──────────────────────────────────────────────
export type ProductStatus = "Draft" | "Published" | "OutOfStock" | "Hidden";
export type VariantStatus = ProductStatus;

export const AGE_GROUPS: Record<string, string> = {
  "0": "Newborn",
  "6": "6 months",
  "12": "12 months",
  "24": "24 months",
  "48": "4 years",
};

/** Formats age group number (months) to readable text */
export function formatAgeGroup(age?: string | number | null): string {
  if (age === null || age === undefined || age === "") return "—";
  const n = Number(age);
  if (isNaN(n)) return String(age);
  if (n === 0) return "Newborn";
  if (n < 12) return `${n} months`;
  if (n % 12 === 0) return `${n / 12} years`;
  return `${n} months`;
}

export const PRODUCT_STATUSES: { value: ProductStatus; label: string }[] = [
  { value: "Draft", label: "Draft" },
  { value: "Published", label: "Published" },
  { value: "OutOfStock", label: "Out of Stock" },
  { value: "Hidden", label: "Hidden" },
];

export const STOCK_STATUS_OPTIONS = [
  { value: "In Stock", label: "In Stock" },
  { value: "Low Stock", label: "Low Stock" },
  { value: "Out of Stock", label: "Out of Stock" },
];

export const VARIANT_STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: "Draft", label: "Draft" },
  { value: "Published", label: "Published" },
  { value: "Hidden", label: "Hidden" },
];


/** Badge variant for each product status */
export const PRODUCT_STATUS_VARIANT: Record<ProductStatus, 'success' | 'warning' | 'outline' | 'danger'> = {
  Draft: 'warning',
  Published: 'success',
  OutOfStock: 'danger',
  Hidden: 'outline',
};

/** Color classes for each product status */
export const PRODUCT_STATUS_COLORS: Record<ProductStatus, string> = {
  Draft: 'bg-amber-400',
  Published: 'bg-emerald-500',
  OutOfStock: 'bg-red-500',
  Hidden: 'bg-gray-400',
};

// ── Status Helpers ─────────────────────────────────────

export function normalizeStatus(status: unknown): ProductStatus {
    if (status === null || status === undefined) return "Draft";

    // Handle string format (case-insensitive and aliases)
    if (typeof status === 'string') {
        const s = status.toLowerCase().trim();
        if (s === 'draft' || s === '0') return 'Draft';
        if (s === 'published' || s === 'active' || s === '1') return 'Published';
        if (s === 'outofstock' || s === '2') return 'OutOfStock';
        if (s === 'hidden' || s === '3') return 'Hidden';

        // Direct match with PascalCase
        const validStatuses: ProductStatus[] = ['Draft', 'Published', 'OutOfStock', 'Hidden'];
        const found = validStatuses.find(vs => vs.toLowerCase() === s);
        if (found) return found;
    }

    // Handle number format
    if (typeof status === 'number') {
        if (status === 0) return 'Draft';
        if (status === 1) return 'Published';
        if (status === 2) return 'OutOfStock';
        if (status === 3) return 'Hidden';
    }

    return "Draft" as ProductStatus;
}

/**
 * Defines allowed status transitions for products/combos.
 * Real-world logic: 
 * - From Draft: Can move to Published or Hidden.
 * - From Published: Can move to OutOfStock, Hidden, or back to Draft (for rework).
 * - From Hidden: Can move to Published or Draft.
 * - From OutOfStock: Can move to Published (restocked) or Hidden.
 */
export function getAllowedStatusTransitions(currentStatus: string): ProductStatus[] {
    switch (currentStatus) {
        case 'Draft':
            return ['Draft', 'Published', 'Hidden'];
        case 'Published':
            return ['Published', 'OutOfStock', 'Hidden', 'Draft'];
        case 'Hidden':
            return ['Hidden', 'Published', 'Draft'];
        case 'OutOfStock':
            return ['OutOfStock', 'Published', 'Hidden', 'Draft'];
        default:
            return ['Draft', 'Published', 'Hidden', 'OutOfStock'];
    }
}


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
  ageGroup: string | null;
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

// ── Product Variant ──────────────────────────────────────
export interface VariantAttributes {
  width?: number;      // Width in cm
  length?: number;     // Length in cm  
  thickness?: number;  // Thickness in cm
  color?: string;      // Color Name (e.g. "Crimson")
  hexColor?: string;   // Hex Code (e.g. "#DC143C")
  [key: string]: unknown;
}

export interface ProductVariant {
  id: string; // UUID
  sku: string;
  basePrice: number;
  salePrice: number;
  weight: number | null;
  attributes: VariantAttributes | null;
  status: VariantStatus;
  createdAt: string;
  isNew: boolean;
  isCustomizable?: boolean;
  productId: string;
  customizeLabel?: string;
  // Inventory (from joined table or computed)
  stockQuantity?: number;
  stockStatus?: string;
}

export interface CreateVariantRequest {
  sku: string;
  baseprice: number;
  saleprice: number;
  weight: number;
  attributes: VariantAttributes | null;
  productid: string;
  isCustomizable?: boolean;
  customizeLabel?: string;
}

export interface UpdateVariantRequest {
  sku: string;
  baseprice: number;
  saleprice: number;
  weight: number;
  attributes: VariantAttributes | null;
  productid: string;
  isCustomizable?: boolean;
  customizeLabel?: string;
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
  slug: string;
  sku: string;
  type?: "combo";
  category: string;
  ageGroup: number | null;
  basePrice: number;
  baseSalePrice?: number;
  salePrice: number;
  totalStock: number;
  status: ProductStatus;
  images: string[] | null;
  imageUrl: string;
  imagePublicId: string;
  description: string;
  featured: boolean;
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
  sales: number;
  items: import('@/api/services/comboService').ComboItemResponse[];
  productItems?: import('@/api/services/comboService').ProductItemResponse[] | null;
  discount: number;
  comboParentId?: string | null;
  /** Color/size for combo variants (children) */
  color: string;
  size: string;
  /** Virtual: child combos grouped under this parent */
  children?: Combo[];
  childCombos?: Combo[] | null;
  /** TanStack Table sub-rows — populated by mapCombosToSubRows() */
  subRows?: Combo[];
}

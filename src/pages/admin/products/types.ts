import type { CreateComboRequest } from "@/api/services/comboService";
import type { ComboDialogMode } from "./components/combo-dialog";
import type { SortingState, ColumnFiltersState, RowSelectionState, ExpandedState, PaginationState } from "@tanstack/react-table";

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
    // In this app, '1' maps to Warning/Pending in AdminStatusBadge, so it's not Published
    if (s === 'draft' || s === '0' || s === 'pending' || s === '1') return 'Draft';
    // '5' and '6' map to Success/Active in AdminStatusBadge
    if (s === 'published' || s === 'active' || s === 'enabled' || s === 'success' || s === '5' || s === '6') return 'Published';
    if (s === 'outofstock' || s === '2') return 'OutOfStock';
    if (s === 'hidden' || s === '3' || s === 'archived') return 'Hidden';

    // Flexible match with PascalCase
    const validStatuses: ProductStatus[] = ['Draft', 'Published', 'OutOfStock', 'Hidden'];
    const found = validStatuses.find(vs => vs.toLowerCase() === s);
    if (found) return found;
  }

  // Handle boolean format (active/inactive)
  if (typeof status === 'boolean') {
    return status ? 'Published' : 'Draft';
  }

  // Handle number format (common mapping)
  if (typeof status === 'number') {
    // 0=Draft, 1=Pending/Warning, 2=Info, 5/6=Published/Success
    if (status === 0 || status === 1) return 'Draft';
    if (status === 5 || status === 6) return 'Published';
    if (status === 2) return 'OutOfStock';
    if (status === 3) return 'Hidden';
  }

  // Final fallback: if truthy and looks like an active keyword, assume Published
  if (status && (status === 'active' || status === 'ACTIVE' || status === 'Published' || status === 'true' || status === 'True')) return 'Published';

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

export interface Certificate {
  id: string; // UUID
  name: string;
  summary: string;
  description: string;
  isActive: boolean;
  organization?: string;
  scope?: string;
  createdAt?: string;
}

export interface CreateCertificateRequest {
  name: string;
  summary: string;
  organization: string;
  description: string;
  scope?: string;
}

export interface CertificateParams {
  pageNumber?: number;
  pageSize?: number;
  name?: string;
}

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
  CertificateIds?: string[];
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
  CertificateIds?: string[];
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
  CertificateIds?: string[];
}

// ── Product Variant ──────────────────────────────────────
export interface VariantAttributes {
  width?: number;      // Width in cm
  length?: number;     // Length in cm  
  thickness?: number;  // Thickness in cm
  color?: string;      // Color Name (e.g. "Crimson")
  hexColor?: string;   // Hex Code (e.g. "#DC143C")
  colorHex?: string;   // Hex Code (e.g. "#DC143C")
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
  customizeTypes?: (import('@/api').VariantCustomizeTypeResponse | import('@/api/types/product.types').CustomizeOptionResponse)[];
  customizeOptions?: (import('@/api').VariantCustomizeTypeResponse | import('@/api/types/product.types').CustomizeOptionResponse)[];
}

export interface CreateVariantRequest {
  sku: string;
  baseprice: number;
  saleprice: number;
  weight: number;
  attributes: VariantAttributes | null;
  productid: string;
  color?: string;
  hexColor?: string;
  colorHex?: string;
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

export interface VariantSubmitData {
  sku: string;
  status: ProductStatus;
  baseprice: number;
  saleprice: number;
  weight: number;
  attributes: VariantAttributes | null;
  productid: string;
  color?: string;
  hexColor?: string;
  colorHex?: string;
  isNew: boolean;
  isCustomizable: boolean;
  customizeLabel?: string;
  stockQuantity: number;
  stockStatus: string;
  customizeTypeIds?: string[];
  pendingCustoms?: { customizeTypeId: string; overridePrice: number | null }[];
}

export interface StatusChangeData {
  id: string;
  name: string;
  type: 'product' | 'combo' | 'variant';
  currentStatus: ProductStatus;
  newStatus: ProductStatus;
}

export interface AdminProductState {
  activeTab: 'single' | 'combo' | 'certificate';
  setActiveTab: (tab: 'single' | 'combo' | 'certificate') => void;

  // Products Table State
  sorting: SortingState;
  setSorting: (s: SortingState | ((prev: SortingState) => SortingState)) => void;
  globalFilter: string;
  setGlobalFilter: (f: string) => void;
  columnFilters: ColumnFiltersState;
  setColumnFilters: (c: ColumnFiltersState | ((prev: ColumnFiltersState) => ColumnFiltersState)) => void;
  rowSelection: RowSelectionState;
  setRowSelection: (r: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => void;
  expanded: ExpandedState;
  setExpanded: (e: ExpandedState | ((prev: ExpandedState) => ExpandedState)) => void;
  pagination: PaginationState;
  setPagination: (p: PaginationState | ((prev: PaginationState) => PaginationState)) => void;

  // Combo Table State
  comboSorting: SortingState;
  setComboSorting: (s: SortingState | ((prev: SortingState) => SortingState)) => void;
  comboGlobalFilter: string;
  setComboGlobalFilter: (f: string) => void;
  comboRowSelection: RowSelectionState;
  setComboRowSelection: (r: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => void;
  comboExpanded: ExpandedState;
  setComboExpanded: (e: ExpandedState | ((prev: ExpandedState) => ExpandedState)) => void;
  comboPagination: PaginationState;
  setComboPagination: (p: PaginationState | ((prev: PaginationState) => PaginationState)) => void;

  // Certificate Table State
  certSorting: SortingState;
  setCertSorting: (s: SortingState | ((prev: SortingState) => SortingState)) => void;
  certGlobalFilter: string;
  setCertGlobalFilter: (f: string) => void;
  certPagination: PaginationState;
  setCertPagination: (p: PaginationState | ((prev: PaginationState) => PaginationState)) => void;
  certRowSelection: RowSelectionState;
  setCertRowSelection: (r: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => void;

  // Data
  products: Product[];
  productPageData: { totalPages: number; totalCount: number } | undefined;
  isLoadingProducts: boolean;
  refetchProducts: () => void;
  combos: Combo[];
  comboPageData: { totalPages: number; totalCount: number } | undefined;
  isLoadingCombos: boolean;
  refetchCombos: () => void;
  certificates: Certificate[];
  certPageData: { totalPages: number; totalCount: number } | undefined;
  isLoadingCerts: boolean;
  refetchCerts: () => void;

  // Dialogs
  dialogOpen: boolean;
  setDialogOpen: (o: boolean) => void;
  editingProduct: Product | null;
  setEditingProduct: (p: Product | null) => void;
  variantDialogOpen: boolean;
  setVariantDialogOpen: (o: boolean) => void;
  editingVariant: ProductVariant | null;
  setEditingVariant: (v: ProductVariant | null) => void;
  variantProductId: string;
  setVariantProductId: (id: string) => void;
  variantProductName: string;
  setVariantProductName: (n: string) => void;
  variantProductSlug: string;
  setVariantProductSlug: (s: string) => void;
  variantCount: number;
  setVariantCount: (c: number) => void;
  comboDialogOpen: boolean;
  setComboDialogOpen: (o: boolean) => void;
  editingCombo: Combo | null;
  setEditingCombo: (c: Combo | null) => void;
  comboDialogMode: ComboDialogMode | null;
  setComboDialogMode: (m: ComboDialogMode | null) => void;
  comboDialogKey: number;
  setComboDialogKey: (k: number | ((prev: number) => number)) => void;
  comboDefaultParentId?: string;
  setComboDefaultParentId: (id: string | undefined) => void;
  certDialogOpen: boolean;
  setCertDialogOpen: (o: boolean) => void;
  editingCert: Certificate | null;
  setEditingCert: (c: Certificate | null) => void;
  deleteCert: Certificate | null;
  setDeleteCert: (c: Certificate | null) => void;
  successDialogOpen: boolean;
  setSuccessDialogOpen: (o: boolean) => void;
  createdProductId: string;
  setCreatedProductId: (id: string) => void;
  createdProductName: string;
  setCreatedProductName: (n: string) => void;
  imageUploadOpen: boolean;
  setImageUploadOpen: (o: boolean) => void;
  uploadProductId: string;
  setUploadProductId: (id: string) => void;
  uploadProductName: string;
  setUploadProductName: (n: string) => void;
  comboIsCurrentUpload: boolean;
  setComboIsCurrentUpload: (b: boolean) => void;
  uploadProductIdRef: React.MutableRefObject<string>;
  deleteProduct: Product | null;
  setDeleteProduct: (p: Product | null) => void;
  deleteCombo: Combo | null;
  setDeleteCombo: (c: Combo | null) => void;
  deleteVariant: ProductVariant | null;
  setDeleteVariant: (v: ProductVariant | null) => void;
  bulkDeleteData: { ids: string[]; type: 'single' | 'combo' | 'certificate' } | null;
  setBulkDeleteData: (d: { ids: string[]; type: 'single' | 'combo' | 'certificate' } | null) => void;
  statusChangeData: StatusChangeData | null;
  setStatusChangeData: (d: StatusChangeData | null) => void;
  handleAddImagesFromSuccess: () => void;
  handleSkipImages: () => void;
  categories: import('@/api').CategoryResponse[];
  isLoadingCategories: boolean;
}

export interface AdminProductMutations {
  handleSubmit: (data: CreateProductRequest) => Promise<void>;
  handleVariantSubmit: (formData: VariantSubmitData) => void | Promise<void>;
  handleComboSubmit: (data: CreateComboRequest) => void | Promise<void>;
  handleCertSubmit: (data: CreateCertificateRequest) => Promise<void>;
  handleUploadImages: (productId: string, files: File[]) => Promise<void>;
  handleBulkDelete: (table: import('@tanstack/react-table').Table<Product | Combo | Certificate>, tab: 'single' | 'combo' | 'certificate') => void;
  handleConfirmBulkDelete: () => Promise<void>;
  handleExport: (tab: string, products: Product[], combos: Combo[], certificates?: Certificate[]) => void;
  handleConfirmDelete: (id: string) => void;
  handleConfirmDeleteVariant: (id: string) => void;
  handleConfirmDeleteCombo: (id: string) => void;
  handleConfirmDeleteCert: (id: string) => void;
  handleStatusChangeRequest: (data: StatusChangeData) => void;
  handleConfirmStatusChange: () => Promise<void>;
  createMutation: { isPending: boolean };
  updateMutation: { isPending: boolean };
  updateVariantMutation: { isPending: boolean };
  createVariantMutation: { isPending: boolean };
  createVariantWithCustomizeMutation: { isPending: boolean };
  createComboMutation: { isPending: boolean };
  updateComboMutation: { isPending: boolean };
  updateComboItemsMutation: { isPending: boolean };
  createCertMutation: { isPending: boolean };
  updateCertMutation: { isPending: boolean };
  uploadImagesMutation: { isPending: boolean };
  uploadComboImageMutation: { isPending: boolean };
  deleteMutation: { isPending: boolean };
  deleteVariantMutation: { isPending: boolean };
  deleteComboMutation: { isPending: boolean };
  deleteCertMutation: { isPending: boolean };
  updateProductStatusMutation: { isPending: boolean };
  updateVariantStatusMutation: { isPending: boolean };
  updateComboStatusMutation: { isPending: boolean };
}

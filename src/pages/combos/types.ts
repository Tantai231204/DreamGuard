import type { ComboResponse, ComboItemResponse, ProductItemResponse } from "@/api/services/comboService";
import type { VariantResponse } from "@/api/services/variantService";

/**
 * The Combo interface used throughout the UI.
 * Extends ComboResponse to include UI-specific fields and ensure compatibility.
 */
export interface Combo extends Omit<ComboResponse, 'childCombos'> {
  // Overriding childCombos to use the recursive Combo type
  childCombos?: Combo[];
  
  // UI derived fields
  isNew?: boolean;
  reviewCount?: number;
}

export interface RichComboItem extends Partial<ComboItemResponse>, Partial<ProductItemResponse> {
  productId?: string;
  productName?: string;
  variantId?: string;
  variantLabel?: string;
  quantity: number;
  imageUrl?: string;
  enrichedDetail?: VariantResponse | null;
  // Keep original fields for safety
  productVariantId?: string;
  sku?: string;
}

export interface ComboFilterOptions {
  ages: string[];
  colors: string[];
  sizes: string[];
  priceRange: { min: number | null; max: number | null };
  sortBy: "default" | "price-asc" | "price-desc" | "newest" | "rating";
}

export interface ComboDetailState {
  selectedColor: string;
  selectedSize: string;
  quantity: number;
  selectedImage: string;
  isWishlisted: boolean;
}

export interface ComboSpec {
  label: string;
  value: string;
}

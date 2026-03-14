import type { ComboResponse } from "@/api/services/comboService";

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

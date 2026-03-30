export type EmbroideryPosition =
  // Crib positions (khắc gỗ)
  | "front-rail"
  | "side-rail"
  | "headboard"
  // Pillow positions (thêu vải)
  | "center"
  | "corner"
  | "bottom-edge";

export interface DesignConfig {
  size: string;
  baseColor: string;
  pattern: string;
  embroideryText: string;
  embroideryPosition: EmbroideryPosition;
  material: string;
  customImage?: string;
  imageMode: "print" | "wrap";
}

export interface CustomizableProduct {
  id: string;
  name: string;
  description: string;
  icon: string;
  basePrice: number;
  availableSizes: { id: string; label: string; priceAdd: number }[];
}

export interface MaterialOption {
  id: string;
  name: string;
  description: string;
  priceMultiplier: number;
  badge?: string;
}

export interface PatternOption {
  id: string;
  name: string;
  emoji: string;
  cssPattern: string;
}

export interface CustomizationState {
  product: CustomizableProduct | null;
  design: DesignConfig;
}

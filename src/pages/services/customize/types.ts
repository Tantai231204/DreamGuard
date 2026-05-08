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
  customSizeLabel?: string;
  baseColor: string;
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
  salePrice: number;
  availableSizes: { id: string; label: string; priceAdd: number }[];
  type: string;
  image: string;
}

export interface MaterialOption {
  id: string;
  name: string;
  description: string;
  priceMultiplier: number;
  priceAdd: number;
  badge?: string;
}


export interface CustomizationState {
  product: CustomizableProduct | null;
  design: DesignConfig;
}

export interface ProductVariant {
  id: string;
  sku: string;
  color: string;
  colorCode: string;
  dimensions: string;
  salePrice: number;
  basePrice: number;
}

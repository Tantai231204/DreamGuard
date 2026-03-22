export type AgeGroup = "newborn" | "infant" | "toddler";

export interface ChildProfile {
  ageGroup: AgeGroup;
  allergies: string[];
  skinSensitivity: number; // 1 = Normal, 2 = Sensitive, 3 = Very Sensitive
  healthConditions: string[];
}

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
  safeFor: string[];
  sensitivityMax: number;
  badge?: string;
}

export interface PatternOption {
  id: string;
  name: string;
  emoji: string;
  cssPattern: string;
}

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  tailwind: string;
}

export interface CustomizationState {
  product: CustomizableProduct | null;
  childProfile: ChildProfile;
  design: DesignConfig;
}

// Global UI Asset Definitions
export const ProductAssetIcons = {
  BABY_SLEEP: "/images/baby-sleep.png",
  BLANKET: "/images/blanket.svg",
  FOLDING: "/images/folding.svg",
  CRIB: "/images/crib.svg",
  PRODUCT_CATEGORIES: "/images/product-categories.svg",
} as const;

export type ProductAssetIconKey = keyof typeof ProductAssetIcons;

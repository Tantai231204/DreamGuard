import type { CustomizableProduct, MaterialOption, PatternOption } from "./types";

/* ===== Customizable Products ===== */
export const customizableProducts: CustomizableProduct[] = [
  {
    id: "crib_bedding_set",
    type: "crib_bedding_set",
    name: "Crib Bedding Set",
    description: "Complete set: fitted sheet, flat sheet, blanket & pillowcase",
    icon: "🛏️",
    image: "/images/placeholder-product.svg",
    basePrice: 850000,
    salePrice: 850000,
    availableSizes: [
      { id: "cradle_40x90", label: "Cradle - 40 × 90 cm", priceAdd: -150000 },
      { id: "std_60x120", label: "Standard - 60 × 120 cm", priceAdd: 0 },
      { id: "mini_50x100", label: "Mini Crib - 50 × 100 cm", priceAdd: -50000 },
      { id: "large_70x140", label: "Large Crib - 70 × 140 cm", priceAdd: 120000 },
      { id: "toddler_90x190", label: "Toddler Bed - 90 × 190 cm", priceAdd: 350000 },
    ],
  },
  {
    id: "pillow",
    type: "pillow",
    name: "Baby Pillow",
    description: "Ergonomic pillow designed for safe, comfortable sleep",
    icon: "☁️",
    image: "/images/placeholder-product.svg",
    basePrice: 280000,
    salePrice: 280000,
    availableSizes: [
      { id: "newborn_20x30", label: "Newborn - 20 × 30 cm", priceAdd: -30000 },
      { id: "std_25x35", label: "Standard - 25 × 35 cm", priceAdd: 0 },
      { id: "toddler_35x50", label: "Toddler - 35 × 50 cm", priceAdd: 65000 },
      { id: "contour_30x40", label: "Contour - 30 × 40 cm", priceAdd: 80000 },
    ],
  },
  {
    id: "mattress",
    type: "mattress",
    name: "Organic Baby Mattress",
    description: "High-density foam with breathable organic cover",
    icon: "💤",
    image: "/images/placeholder-product.svg",
    basePrice: 1250000,
    salePrice: 1250000,
    availableSizes: [
      { id: "matt_60x120x5", label: "60 × 120 × 5 cm", priceAdd: 0 },
      { id: "matt_70x130x10", label: "70 × 130 × 10 cm", priceAdd: 450000 },
      { id: "matt_70x140x10", label: "70 × 140 × 10 cm", priceAdd: 550000 },
    ],
  },
];

/* ===== Materials ===== */
export const materialOptions: MaterialOption[] = [
  {
    id: "organic_cotton",
    name: "Organic Cotton",
    description: "GOTS-certified, pesticide-free, ultra-breathable",
    priceMultiplier: 1.0,
    priceAdd: 0,
    badge: "Recommended",
  },
  {
    id: "bamboo_fiber",
    name: "Bamboo Fiber",
    description: "Naturally antibacterial, silky-soft, thermoregulating",
    priceMultiplier: 1.25,
    priceAdd: 0,
    badge: "Premium",
  },
  {
    id: "hypoallergenic_silk",
    name: "Hypoallergenic Silk",
    description: "Medical-grade silk, ideal for extreme sensitivity",
    priceMultiplier: 1.6,
    priceAdd: 0,
    badge: "Luxury",
  },
  {
    id: "muslin",
    name: "Muslin",
    description: "Lightweight, breathable muslin weave, gets softer with wash",
    priceMultiplier: 1.1,
    priceAdd: 0,
  },
];

/* ===== Patterns ===== */
export const patternOptions: PatternOption[] = [
  { id: "solid", name: "Solid", emoji: "⬜", cssPattern: "" },
  { id: "stars", name: "Stars", emoji: "⭐", cssPattern: "radial-gradient(circle, currentColor 1px, transparent 1px)" },
  { id: "stripes", name: "Stripes", emoji: "📏", cssPattern: "repeating-linear-gradient(45deg, transparent, transparent 8px, currentColor 8px, currentColor 10px)" },
  { id: "clouds", name: "Clouds", emoji: "☁️", cssPattern: "radial-gradient(ellipse 30px 20px, currentColor 0%, transparent 70%)" },
  { id: "dots", name: "Polka Dots", emoji: "🔵", cssPattern: "radial-gradient(circle 4px, currentColor 100%, transparent 100%)" },
];

/* ===== Helper: calculate total price ===== */
export function calculateCustomPrice(
  basePrice: number,
  sizeAdd: number,
  colorAdd: number,
  materialAdd: number,
  materialMultiplier: number,
  hasEmbroidery: boolean
): number {
  const embroideryFee = hasEmbroidery ? 80000 : 0;
  // Công thức: (Base * Hệ số) + Size + Màu + MaterialAddon + Thêu
  return Math.round(basePrice * materialMultiplier + materialAdd) + sizeAdd + colorAdd + embroideryFee;
}

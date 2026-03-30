import type { CustomizableProduct, MaterialOption, PatternOption } from "./types";

/* ===== Customizable Products ===== */
export const customizableProducts: CustomizableProduct[] = [
  {
    id: "crib_bedding_set",
    name: "Crib Bedding Set",
    description: "Complete set: fitted sheet, flat sheet, blanket & pillowcase",
    icon: "🛏️",
    basePrice: 850000,
    availableSizes: [
      { id: "standard_crib", label: "Standard Crib (60×120)", priceAdd: 0 },
      { id: "mini_crib", label: "Mini Crib (50×100)", priceAdd: -100000 },
      { id: "large_crib", label: "Large Crib (70×140)", priceAdd: 150000 },
    ],
  },
  {
    id: "pillow",
    name: "Baby Pillow",
    description: "Ergonomic pillow designed for safe, comfortable sleep",
    icon: "☁️",
    basePrice: 280000,
    availableSizes: [
      { id: "flat", label: "Flat (25×35cm)", priceAdd: 0 },
      { id: "contour", label: "Contour (30×40cm)", priceAdd: 50000 },
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
    badge: "Recommended",
  },
  {
    id: "bamboo_fiber",
    name: "Bamboo Fiber",
    description: "Naturally antibacterial, silky-soft, thermoregulating",
    priceMultiplier: 1.25,
    badge: "Premium",
  },
  {
    id: "hypoallergenic_silk",
    name: "Hypoallergenic Silk",
    description: "Medical-grade silk, ideal for extreme sensitivity",
    priceMultiplier: 1.6,
    badge: "Luxury",
  },
  {
    id: "cotton_blend",
    name: "Cotton Blend",
    description: "Durable cotton-poly blend, easy-care and long-lasting",
    priceMultiplier: 0.85,
  },
  {
    id: "muslin",
    name: "Muslin",
    description: "Lightweight, breathable muslin weave, gets softer with wash",
    priceMultiplier: 1.1,
  },
];

/* ===== Patterns ===== */
export const patternOptions: PatternOption[] = [
  { id: "solid", name: "Solid", emoji: "⬜", cssPattern: "" },
  { id: "stars", name: "Stars", emoji: "⭐", cssPattern: "radial-gradient(circle, currentColor 1px, transparent 1px)" },
  { id: "stripes", name: "Stripes", emoji: "📏", cssPattern: "repeating-linear-gradient(45deg, transparent, transparent 8px, currentColor 8px, currentColor 10px)" },
  { id: "clouds", name: "Clouds", emoji: "☁️", cssPattern: "radial-gradient(ellipse 30px 20px, currentColor 0%, transparent 70%)" },
  { id: "dots", name: "Polka Dots", emoji: "🔵", cssPattern: "radial-gradient(circle 4px, currentColor 100%, transparent 100%)" },
  { id: "animals", name: "Animals", emoji: "🐻", cssPattern: "" },
  { id: "floral", name: "Floral", emoji: "🌿", cssPattern: "" },
];

/* ===== Helper: calculate total price ===== */
export function calculateCustomPrice(
  basePrice: number,
  sizeAdd: number,
  materialMultiplier: number,
  hasEmbroidery: boolean
): number {
  const embroideryFee = hasEmbroidery ? 80000 : 0;
  return Math.round((basePrice + sizeAdd) * materialMultiplier + embroideryFee);
}

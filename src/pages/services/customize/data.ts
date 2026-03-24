import type { CustomizableProduct, MaterialOption, PatternOption, ColorOption } from "./types";

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

/* ===== Allergies & Health Conditions ===== */
export const allergyOptions = [
  { id: "dust_mites", label: "Dust Mites", emoji: "🦠" },
  { id: "latex", label: "Latex", emoji: "🧤" },
  { id: "wool", label: "Wool", emoji: "🐑" },
  { id: "synthetic", label: "Synthetic Fibers", emoji: "🧵" },
  { id: "fragrance", label: "Fragrances", emoji: "🌸" },
  { id: "none", label: "No Known Allergies", emoji: "✅" },
];

export const healthConditionOptions = [
  { id: "eczema", label: "Eczema", emoji: "🩹" },
  { id: "asthma", label: "Asthma", emoji: "🫁" },
  { id: "sensitive_skin", label: "Chronic Sensitive Skin", emoji: "🧴" },
  { id: "none", label: "None", emoji: "💚" },
];

/* ===== Materials ===== */
export const materialOptions: MaterialOption[] = [
  {
    id: "organic_cotton",
    name: "Organic Cotton",
    description: "GOTS-certified, pesticide-free, ultra-breathable",
    priceMultiplier: 1.0,
    safeFor: ["dust_mites", "latex", "synthetic", "fragrance", "none"],
    sensitivityMax: 3,
    badge: "Recommended",
  },
  {
    id: "bamboo_fiber",
    name: "Bamboo Fiber",
    description: "Naturally antibacterial, silky-soft, thermoregulating",
    priceMultiplier: 1.25,
    safeFor: ["dust_mites", "latex", "wool", "synthetic", "fragrance", "none"],
    sensitivityMax: 3,
    badge: "Premium",
  },
  {
    id: "hypoallergenic_silk",
    name: "Hypoallergenic Silk",
    description: "Medical-grade silk, ideal for extreme sensitivity",
    priceMultiplier: 1.6,
    safeFor: ["dust_mites", "latex", "wool", "synthetic", "fragrance", "none"],
    sensitivityMax: 3,
    badge: "Luxury",
  },
  {
    id: "cotton_blend",
    name: "Cotton Blend",
    description: "Durable cotton-poly blend, easy-care and long-lasting",
    priceMultiplier: 0.85,
    safeFor: ["dust_mites", "latex", "fragrance", "none"],
    sensitivityMax: 1,
  },
  {
    id: "muslin",
    name: "Muslin",
    description: "Lightweight, breathable muslin weave, gets softer with wash",
    priceMultiplier: 1.1,
    safeFor: ["dust_mites", "latex", "synthetic", "fragrance", "none"],
    sensitivityMax: 2,
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

/* ===== Colors ===== */
export const colorOptions: ColorOption[] = [
  { id: "ivory", name: "Ivory White", hex: "#FFFFF0", tailwind: "bg-[#FFFFF0]" },
  { id: "blush", name: "Soft Blush", hex: "#FFE4E1", tailwind: "bg-[#FFE4E1]" },
  { id: "sky", name: "Sky Blue", hex: "#B0D4F1", tailwind: "bg-[#B0D4F1]" },
  { id: "sage", name: "Sage Green", hex: "#B2C9AB", tailwind: "bg-[#B2C9AB]" },
  { id: "lavender", name: "Lavender", hex: "#DCD0FF", tailwind: "bg-[#DCD0FF]" },
  { id: "peach", name: "Peach", hex: "#FFDAB9", tailwind: "bg-[#FFDAB9]" },
  { id: "lemon", name: "Lemon", hex: "#FFFACD", tailwind: "bg-[#FFFACD]" },
  { id: "grey", name: "Warm Grey", hex: "#D3CFC9", tailwind: "bg-[#D3CFC9]" },
];

/* ===== Helper: filter materials by child profile ===== */
export function getRecommendedMaterials(
  allergies: string[],
  skinSensitivity: number
): MaterialOption[] {
  return materialOptions.filter((mat) => {
    const allergySafe = allergies.includes("none") || allergies.every((a) => mat.safeFor.includes(a));
    const sensitivityOk = mat.sensitivityMax >= skinSensitivity;
    return allergySafe && sensitivityOk;
  });
}

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

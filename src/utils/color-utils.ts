// src/utils/color-utils.ts
import { colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';

extend([namesPlugin]);

const DEFAULT_HEX = '#E5E7EB';

/**
 * 🎨 Senior Supplemental Color Library
 * Industrial-grade mapping of common ecommerce/brand color names to Hex codes.
 * This extends beyond standard CSS definitions to include mattresses/furniture textures.
 */
const BRAND_COLORS: Record<string, string> = {
  'cobaltblue': '#0047AB',
  'firebrick': '#B22222',
  'charcoal': '#36454F',
  'ash': '#B2BEB5',
  'denim': '#1560BD',
  'emerald': '#50C878',
  'ivory': '#FFFFF0',
  'mustard': '#FFDB58',
  'peach': '#FFE5B4',
  'ruby': '#E0115F',
  'sapphire': '#0F52BA',
  'scarlet': '#FF2400',
  'silver': '#C0C0C0',
  'slate': '#708090',
  'turquoise': '#40E0D0',
  'wheat': '#F5DEB3',
  'cream': '#FFFDD0',
  'beige': '#F5F5DC',
  'burgundy': '#800020',
  'maroon': '#800000',
  'rose': '#FF007F',
  'mint': '#3EB489',
  'pearl': '#F0EAD6',
  'titanium': '#878681',
  'platinum': '#E5E4E2',
  'bronze': '#CD7F32',
  'sand': '#C2B280',
  'khaki': '#F0E68C',
  'champagne': '#F7E7CE',
  'midnight': '#191970',
  'cloud': '#F8F8FF',
  'obsidian': '#0B0B0B',
  'black': '#1E1E1E',
  'trắng': '#FFFFFF',
  'đen': '#1E1E1E',
  'đỏ': '#EF4444',
  'xanh dương': '#3B82F6',
  'xanh lá': '#22C55E',
  'vàng': '#EAB308',
  'xám': '#6B7280',
  'hồng': '#F472B6',
  'tím': '#A855F7',
};

// Internal Cache for Performance Optimization
const colorCache = new Map<string, string>();

/**
 * 🎨 Senior Color Resolution Engine
 * Industry-standard hex resolution from color names or unformatted hex strings.
 * Backed by colord and a supplemental brand dictionary.
 */
export function getColorHex(colorValue?: string): string {
  if (!colorValue) return DEFAULT_HEX;
  const raw = colorValue.trim();
  const normalizedKey = raw.toLowerCase();

  // 0. High-speed cache lookup
  if (colorCache.has(normalizedKey)) return colorCache.get(normalizedKey)!;

  // 1. Direct Hex/RGB
  if (raw.startsWith('#') || raw.startsWith('rgb')) return raw;
  if (/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(raw)) return `#${raw}`;

  // 2. Brand/Supplemental Dictionary match (Slugified)
  const slugified = normalizedKey.replace(/[^a-z]/g, '');
  if (BRAND_COLORS[slugified]) {
    colorCache.set(normalizedKey, BRAND_COLORS[slugified]);
    return BRAND_COLORS[slugified];
  }

  // 3. Colord standard lookup (CSS Names)
  const c = colord(raw);
  if (c.isValid()) {
    const hex = c.toHex();
    colorCache.set(normalizedKey, hex);
    return hex;
  }

  // 4. Case-insensitive slugged lookup (e.g. "SteelBlue" -> "steelblue")
  const c2 = colord(slugified);
  if (c2.isValid()) {
    const hex = c2.toHex();
    colorCache.set(normalizedKey, hex);
    return hex;
  }

  return DEFAULT_HEX;
}

/**
 * Extracts a human-friendly color name from a hex code.
 * Optimized for Picker displays using the closest standard CSS name.
 */
export function getColorName(hex: string): string {
    const c = colord(hex);
    if (!c.isValid()) return 'Custom';
    return c.toName({ closest: true }) || 'Custom';
}

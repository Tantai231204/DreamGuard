import type { AdminVariantsByProductResponse, AdminVariantItem } from '@/api/services/variantService';

/* ─── Shared Color Map ──────────────────────────────────── */
export const COLOR_MAP: Record<string, string> = {
  white: '#ffffff',
  pink: '#ffc0cb',
  blue: '#2196f3',
  red: '#f44336',
  green: '#4caf50',
  yellow: '#ffeb3b',
  orange: '#ff9800',
  purple: '#9c27b0',
  black: '#000000',
  gray: '#9e9e9e',
  grey: '#9e9e9e',
  brown: '#795548',
  beige: '#f5f5dc',
  mint: '#98ff98',
  peru: '#cd853f',
  firebrick: '#b22222',
  palevioletred: '#db7093',
  crimson: '#dc143c',
  lavender: '#e6e6fa',
  salmon: '#fa8072',
  teal: '#008080',
  navy: '#000080',
  gold: '#ffd700',
  silver: '#c0c0c0',
  default: '#e5e7eb',
};

export function getColorHex(colorValue?: string): string {
  if (!colorValue) return COLOR_MAP.default;
  const trimmed = colorValue.trim();
  
  // 1. Direct Hex matches
  if (trimmed.startsWith('#')) return trimmed;
  if (/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(trimmed)) return `#${trimmed}`;

  // 2. Normalized match in our map
  const normalized = trimmed.toLowerCase();
  if (COLOR_MAP[normalized]) return COLOR_MAP[normalized];

  // 3. Remove all spaces and special chars (e.g. "Pale Violet Red" -> "palevioletred")
  const slugified = normalized.replace(/[^a-z]/g, '');
  if (COLOR_MAP[slugified]) return COLOR_MAP[slugified];

  // 4. If it's just letters/spaces, a browser might know it (like "RebeccaPurple")
  if (/^[a-z\s-]+$/i.test(trimmed)) return normalized;

  return COLOR_MAP.default;
}

/**
 * Formats dimensions from variant attributes or size string.
 * Output format: AxBxC (e.g. 20x20x20)
 */
export function formatVariantDimensions(variant: AdminVariantItem): string {
  const attr = variant.attributes;
  if (attr && attr.width && attr.length) {
    let dim = `${attr.width}x${attr.length}`;
    if (attr.thickness) dim += `x${attr.thickness}`;
    return dim;
  }
  return variant.size || 'N/A';
}

/**
 * Rich UI-ready transformation of the admin variant response.
 * Centralizes stock logic, price ranges, and formatting.
 */
export function transformAdminVariants(data: AdminVariantsByProductResponse) {
  if (!data?.colorGroups) return null;

  const colorGroups = data.colorGroups;
  const totalVariants = data.totalVariants || 0;
  
  const sizeSet = new Set<string>();
  const prices: number[] = [];
  
  let totalStock = 0;
  let inStock = 0;
  let lowStock = 0;
  let outOfStock = 0;

  const transformedGroups = colorGroups.map((group) => {
    // Determine group color hex
    // Priority:
    // 1. group.hexColor (from backend)
    // 2. Search for any hexColor in variants' attributes
    // 3. group.color (name)
    let groupHex = group.hexColor;

    if (!groupHex || groupHex === '') {
      const variantWithHex = group.variants.find(v => v.attributes && typeof v.attributes.hexColor === 'string' && v.attributes.hexColor.startsWith('#'));
      if (variantWithHex?.attributes?.hexColor) {
        groupHex = variantWithHex.attributes.hexColor;
      }
    }

    if (!groupHex || groupHex === '') {
      groupHex = group.color;
    }

    // Process through resolver
    const resolvedHex = getColorHex(groupHex);

    const transformedVariants = group.variants.map((v) => {
      const dim = formatVariantDimensions(v);
      sizeSet.add(dim);
      prices.push(v.salePrice);
      
      const stock = v.stockQuantity ?? 0;
      totalStock += stock;

      // Normalize status logic
      const isLow = v.stockStatus === 'Low Stock';
      const isOOS = v.stockStatus === 'Out of Stock' || v.status === 'OutOfStock' || (v.stockQuantity !== undefined && v.stockQuantity <= 0);

      if (isOOS) outOfStock++;
      else if (isLow) lowStock++;
      else inStock++;

      return {
        ...v,
        dimensions: dim,
        isOutOfStock: isOOS,
        isLowStock: isLow,
      };
    });

    return {
      ...group,
      colorHex: resolvedHex,
      variants: transformedVariants,
      groupStock: transformedVariants.reduce((sum, v) => sum + (v.stockQuantity ?? 0), 0),
    };
  });

  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  return {
    productId: data.productId,
    productName: data.productName || 'Unknown Product',
    totalVariants,
    colorGroups: transformedGroups,
    stats: {
      totalStock,
      inStock,
      lowStock,
      outOfStock,
      hasIssue: lowStock > 0 || outOfStock > 0,
    },
    pricing: {
      minPrice,
      maxPrice,
      hasRange: maxPrice > minPrice,
    },
    sizeCount: sizeSet.size,
    uniqueSizes: Array.from(sizeSet),
  };
}

export type TransformedAdminVariants = ReturnType<typeof transformAdminVariants>;

import type { AdminVariantsByProductResponse, AdminVariantItem } from '@/api/services/variantService';

/* ─── Browser-native Color Resolver ─────────────────────── */

// Reuse a single off-screen canvas for color resolution
let _ctx: CanvasRenderingContext2D | null = null;
function getCanvasCtx(): CanvasRenderingContext2D | null {
  if (!_ctx) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    _ctx = canvas.getContext('2d');
  }
  return _ctx;
}

/**
 * Use the browser's CSS engine to convert ANY valid color (name, hex, rgb, hsl…)
 * to a 6-digit hex string.  e.g. "Saddle Brown" → "#8b4513"
 */
function cssColorToHex(color: string): string | null {
  const ctx = getCanvasCtx();
  if (!ctx) return null;

  ctx.fillStyle = '#000000';       // reset to known value
  ctx.fillStyle = color;           // let the browser parse
  const parsed = ctx.fillStyle;    // returns "#rrggbb" if valid

  // If browser couldn't parse, fillStyle stays "#000000"
  if (parsed === '#000000' && color.toLowerCase().replace(/\s/g, '') !== 'black') {
    return null;
  }
  return parsed;
}

const DEFAULT_HEX = '#e5e7eb';

export function getColorHex(colorValue?: string): string {
  if (!colorValue) return DEFAULT_HEX;
  const trimmed = colorValue.trim();

  // 1. Already a hex value → return as-is
  if (trimmed.startsWith('#')) return trimmed;
  if (/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(trimmed)) return `#${trimmed}`;

  // 2. Let the browser resolve the color name (handles "Saddle Brown", "rebeccapurple", etc.)
  //    CSS named colors have no spaces, so try both original and slugified versions
  const slugified = trimmed.toLowerCase().replace(/[^a-z]/g, '');
  const resolved = cssColorToHex(slugified) ?? cssColorToHex(trimmed);
  if (resolved) return resolved;

  return DEFAULT_HEX;
}

// Keep backward-compat export for any code that imports COLOR_MAP
export const COLOR_MAP: Record<string, string> = new Proxy({} as Record<string, string>, {
  get(_target, prop: string) {
    if (prop === 'default') return DEFAULT_HEX;
    return getColorHex(prop);
  },
});

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
    const isAnyCustomizable = group.variants.some(v => {
      const hasExplicitFlag = v.isCustomizable || v.is_customizable || !!v.customizeLabel;
      const hasTypes = (v.customizeTypes?.length ?? 0) > 0 || (v.customizeOptions?.length ?? 0) > 0;

      // Bespoke detection: No physical dimensions in attributes often implies it's a template for customization
      const isBespoke = !v.attributes?.width && !v.attributes?.length && !v.size;

      return hasExplicitFlag || hasTypes || isBespoke;
    });

    let groupLabel = group.color;

    // Standardize labels
    const isMissingLabel = !groupLabel || groupLabel.toLowerCase() === 'unknown' || groupLabel.trim() === '';
    if (isMissingLabel) {
      groupLabel = isAnyCustomizable ? 'Bespoke / Customizable' : 'Base Product';
    }

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

    const resolvedHex = getColorHex(groupHex);

    const transformedVariants = group.variants.map((v) => {
      const dim = formatVariantDimensions(v);
      sizeSet.add(dim);
      prices.push(v.salePrice);

      const stock = v.stockQuantity ?? 0;
      totalStock += stock;

      // Status logic: A variant can be both in stock AND low stock.
      // OOS is a hard status. Low stock is a warning.
      const isOOS = v.stockStatus === 'Out of Stock' || v.status === 'OutOfStock' || stock <= 0;
      const isLow = v.stockStatus === 'Low Stock' || (stock > 0 && stock <= 5); // Fallback threshold

      if (isOOS) outOfStock++;
      else {
        inStock++; // It is in stock if not OOS
        if (isLow) lowStock++;
      }

      return {
        ...v,
        dimensions: dim,
        isOutOfStock: isOOS,
        isLowStock: isLow,
      };
    });

    return {
      ...group,
      color: groupLabel,
      colorHex: resolvedHex,
      variants: transformedVariants,
      groupStock: transformedVariants.reduce((sum, v) => sum + (v.stockQuantity ?? 0), 0),
    };
  });

  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  return {
    productId: data.productId,
    productName: data.productName || 'Catalog Item',
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

import { type AdminVariantItem, type AdminVariantsByProductResponse } from '@/api/services/variantService';
import { getColorHex } from '@/utils/color-utils';

/**
 * 🕵️ Senior Performance: Formats dimensions into 'WxLxT' string.
 * Optimized for O(1) attribute access.
 */
export function formatVariantDimensions(variant: AdminVariantItem): string {
  const attr = variant.attributes;
  if (!attr) return variant.size || 'N/A';

  // index access to support both camel (type key-prop) and Pascal (index-key)
  const w = (attr.width ?? attr['Width']) as number | undefined;
  const l = (attr.length ?? attr['Length']) as number | undefined;
  const t = (attr.thickness ?? attr['Thickness']) as number | undefined;

  return (w && l) ? `${w}x${l}${t ? `x${t}` : ''}` : (variant.size || 'N/A');
}

/**
 * 🕵️ Industrial-grade Data Transformation Layer.
 * Batch processes raw API responses into UI-ready states.
 * - Single-pass normalization (O(N)).
 * - Automated classification (Physical vs Bespoke).
 * - Advanced stock/pricing aggregation.
 */
export function transformAdminVariants(data: AdminVariantsByProductResponse | null) {
  if (!data?.colorGroups) return null;

  let totalStock = 0;
  let inStock = 0;
  let lowStock = 0;
  let outOfStock = 0;
  let totalDefects = 0;
  const sizeSet = new Set<string>();
  const prices: number[] = [];

  const transformedGroups = data.colorGroups.map((group) => {
    const normalizedVariants = group.variants.map((v) => {
      let attr = v.attributes as unknown;

      if (typeof attr === 'string' && attr.trim().startsWith('{')) {
        try { attr = JSON.parse(attr); } catch { /* ignore malformed */ }
      }

      if (attr && typeof attr === 'object' && !Array.isArray(attr)) {
        const norm: Record<string, unknown> = {};
        const obj = attr as Record<string, unknown>;
        Object.keys(obj).forEach(k => norm[k.charAt(0).toLowerCase() + k.slice(1)] = obj[k]);
        attr = norm;
      }
      return { ...v, attributes: attr as AdminVariantItem['attributes'] };
    });

    const findHex = () => normalizedVariants.find(v => {
      const a = v.attributes;
      return a?.colorHex || a?.hexColor || a?.['colorHex'] || a?.['hexColor'];
    })?.attributes;

    const at = findHex();
    const hexSource = (group.hexColor || (at?.colorHex || at?.hexColor || at?.['colorHex'] || at?.['hexColor']) || group.color) as string;

    const { color: rawColor } = group;

    // 🕵️ Determine if the group itself represents a generic/placeholder state
    const rawColorLow = (rawColor || '').toLowerCase().trim();
    const isGenericColor = !rawColor ||
      ['unknown', 'default', 'mặc định', 'chưa xác định', 'none', 'n/a', ''].includes(rawColorLow) ||
      rawColorLow.includes('mặc định');

    let groupStock = 0;
    let groupDefects = 0;
    let hasGroupBespoke = false;

    const variants = normalizedVariants.map((v) => {
      // 🕵️ Advanced Bespoke Sensing (Catching items even when API flags are missing)
      const hasOptions = (v.customizeTypes?.length ?? 0) > 0 ||
        (v.customizeOptions?.length ?? 0) > 0 ||
        (v.customizeOptionGroups?.length ?? 0) > 0;

      let dim = formatVariantDimensions(v);
      const dimLow = (dim || '').toLowerCase().trim();
      const isPlaceholderSize = !dim || dimLow === 'n/a' || dimLow === 'unknown' || dimLow === 'default' || dimLow === 'chưa xác định';

      const isCustomVal = !!(
        v.isCustomizable ||
        v.is_customizable ||
        v.customizeLabel ||
        hasOptions ||
        isPlaceholderSize
      );

      const opts = [
        ...(v.customizeTypes || []),
        ...(v.customizeOptions || []),
        ...(v.customizeOptionGroups?.flatMap(g => g.options || []) || [])
      ].filter(Boolean);

      // 🕵️ Professional Dimension Branding
      if (isPlaceholderSize && isCustomVal) {
        dim = 'Customizable Size';
      }
      sizeSet.add(dim);

      // Specific color/size custom flags
      const hasC = opts.some(o => (o.customizeTypeName || "").toLowerCase().includes('màu')) ||
        (v.isCustomizable && v.customizeLabel?.toLowerCase().includes('màu')) ||
        (v.customizeLabel?.toLowerCase().includes('màu')) ||
        (isGenericColor && (isCustomVal || isPlaceholderSize));

      const hasS = opts.some(o => (o.customizeTypeName || "").toLowerCase().includes('size')) ||
        dim === 'Customizable Size' ||
        (v.isCustomizable && v.customizeLabel?.toLowerCase().includes('size')) ||
        (v.customizeLabel?.toLowerCase().includes('size')) ||
        isPlaceholderSize;

      const isBespoke = hasC && hasS;
      if (isBespoke || isCustomVal) hasGroupBespoke = true;

      const q = v.stockQuantity ?? 0;
      const isOOS = q <= 0;
      const isLow = !isOOS && q <= 5;

      if (isOOS) outOfStock++;
      else if (isLow) lowStock++;
      else inStock++;

      totalStock += q;
      groupStock += q;
      const d = v.defectQuantity ?? 0;
      groupDefects += d;
      totalDefects += d;
      const displayPrice = v.salePrice > 0 ? v.salePrice : (v.basePrice || 0);
      prices.push(displayPrice);

      // 🕵️ Senior Logic: Generate descriptive type names even if API metadata is missing
      let typeNames = opts.map(o => o.customizeTypeName).filter(Boolean).join(', ');
      if (!typeNames && isCustomVal) {
        if (isBespoke) typeNames = 'Color, Size';
        else if (hasS) typeNames = 'Size';
        else if (hasC) typeNames = 'Color';
        else typeNames = 'Custom';
      }

      return {
        ...v,
        dimensions: dim,
        isOutOfStock: isOOS,
        isLowStock: isLow,
        isFullBespoke: isBespoke,
        isCustomSize: hasS,
        isVariantCustomizable: isCustomVal,
        typeNames
      };
    });

    const colorLabel = (isGenericColor && hasGroupBespoke)
      ? 'Customizable BESPOKE'
      : (rawColor || 'Unknown');

    return {
      ...group,
      color: colorLabel,
      colorHex: getColorHex(hexSource),
      variants,
      variantCount: variants.length,
      groupStock,
      groupDefects,
    };
  });

  return {
    colorGroups: transformedGroups,
    totalVariants: data.totalVariants,
    sizeCount: sizeSet.size,
    pricing: {
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
      hasRange: prices.length > 1 && Math.max(...prices) > Math.min(...prices)
    },
    stats: {
      totalStock,
      inStock,
      lowStock,
      outOfStock,
      totalDefects,
      hasIssue: lowStock > 0 || outOfStock > 0 || totalDefects > 0
    }
  };
}

export type TransformedAdminVariants = ReturnType<typeof transformAdminVariants>;

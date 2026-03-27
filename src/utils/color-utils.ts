// src/utils/color-utils.ts

let _ctx: CanvasRenderingContext2D | null = null;
function getCanvasCtx(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
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

  ctx.fillStyle = '#123456';       // reset to known non-black value
  ctx.fillStyle = color;           // let the browser parse
  const parsed = ctx.fillStyle;    // returns "#rrggbb" if valid

  // If browser couldn't parse, fillStyle stays "#123456"
  if (parsed === '#123456') {
    return null;
  }
  return parsed;
}

const COMMON_COLORS: Record<string, string> = {
  black: '#1E1E1E', // Match a sleek black
  white: '#FFFFFF',
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#22C55E',
  yellow: '#EAB308',
  gray: '#6B7280',
  pink: '#F472B6',
  purple: '#A855F7',
  indigo: '#6366F1',
  cream: '#F5F5DC',
  silver: '#C0C0C0',
  gold: '#D4AF37',
  beige: '#F5F5DC',
  transparent: 'transparent',
  // Vietnamese names
  'đen': '#1E1E1E',
  'trắng': '#FFFFFF',
  'đỏ': '#EF4444',
  'xanh dương': '#3B82F6',
  'xanh lá': '#22C55E',
  'vàng': '#EAB308',
  'xám': '#6B7280',
  'hồng': '#F472B6',
  'tím': '#A855F7',
};

const DEFAULT_HEX = '#e5e7eb';

export function getColorHex(colorValue?: string): string {
  if (!colorValue) return DEFAULT_HEX;
  const trimmed = colorValue.trim();

  // 1. Already a hex or rgb value → return as-is
  if (trimmed.startsWith('#') || trimmed.startsWith('rgb')) return trimmed;
  
  // 2. Explicit hex check (3 or 6 chars)
  if (/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(trimmed)) return `#${trimmed}`;

  const lower = trimmed.toLowerCase();
  const slugified = lower.replace(/[^a-z]/g, '');

  // 3. Fast lookup for common colors
  if (COMMON_COLORS[lower]) return COMMON_COLORS[lower];
  if (COMMON_COLORS[slugified]) return COMMON_COLORS[slugified];

  // 4. Try the browser to resolve the color name
  const resolved = cssColorToHex(trimmed) ?? cssColorToHex(slugified);
  if (resolved) return resolved;

  return DEFAULT_HEX;
}

// Display compact variant info: count, colors, sizes only
import { useAdminProductVariants } from '@/hooks/queries/useProduct';
import { useMemo } from 'react';
import { Layers } from 'lucide-react';

interface VariantInfoCellProps {
  productId: string;
  variantCount: number;
}

const MAX_DOTS = 2;

const colorMap: Record<string, string> = {
  white: '#f5f5f5',
  pink: '#ffc0cb',
  blue: '#add8e6',
  red: '#ff6b6b',
  green: '#90ee90',
  yellow: '#ffeb3b',
  orange: '#ffa500',
  purple: '#dda0dd',
  black: '#333333',
  gray: '#9e9e9e',
  grey: '#9e9e9e',
  brown: '#a0522d',
  beige: '#f5f5dc',
  mint: '#98ff98',
  default: '#e5e7eb',
};

function getColorHex(colorValue?: string) {
  if (!colorValue) return colorMap.default;
  if (colorValue.startsWith('#')) return colorValue;
  // If it's a 6-digit hex without #
  if (/^[0-9A-Fa-f]{6}$/.test(colorValue)) return `#${colorValue}`;
  return colorMap[colorValue.toLowerCase().trim()] || colorMap.default;
}

export default function VariantInfoCell({ productId, variantCount }: VariantInfoCellProps) {
  const { data } = useAdminProductVariants(productId, variantCount > 0);

  const summary = useMemo(() => {
    if (!data?.colorGroups?.length) return null;

    const colors = data.colorGroups.slice(0, MAX_DOTS).map((g) => ({
      name: g.color,
      hex: g.hexColor || g.color
    }));
    const moreColors = data.colorGroups.length > MAX_DOTS ? data.colorGroups.length - MAX_DOTS : 0;

    const sizeSet = new Set<string>();
    data.colorGroups.forEach((g) =>
      g.variants.forEach((v) => v.size && sizeSet.add(v.size))
    );

    return {
      colors,
      moreColors,
      sizeCount: sizeSet.size,
    };
  }, [data]);

  if (variantCount === 0) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  return (
    <div className="flex flex-col gap-0.5">
      {/* Variant count */}
      <div className="flex items-center gap-1.5">
        <Layers className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-sm font-bold text-slate-900">{variantCount}</span>
        <span className="text-sm text-slate-500 font-normal">variant{variantCount !== 1 ? 's' : ''}</span>
      </div>

      {/* Colors + sizes */}
      {summary && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {summary.colors.map((color, idx) => (
              <div
                key={idx}
                className="h-3.5 w-3.5 rounded-full border border-slate-100 shadow-[0_0_0_1px_rgba(0,0,0,0.05)]"
                style={{ backgroundColor: getColorHex(color.hex) }}
                title={color.name}
              />
            ))}
            {summary.moreColors > 0 && (
              <span className="text-[10px] text-slate-400 font-bold">+{summary.moreColors}</span>
            )}
          </div>

          <span className="text-slate-200 font-light">|</span>

          <span className="text-sm text-slate-500 font-normal">
            {summary.sizeCount} size{summary.sizeCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}

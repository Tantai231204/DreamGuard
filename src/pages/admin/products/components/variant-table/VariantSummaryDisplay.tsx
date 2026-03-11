// src/pages/admin/products/components/VariantSummaryDisplay.tsx
import { useMemo } from 'react';
import { Layers } from 'lucide-react';
import type { AdminVariantsByProductResponse } from '@/api/services/variantService';

interface VariantSummaryDisplayProps {
  variants?: AdminVariantsByProductResponse;
  isLoading?: boolean;
}

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
  unknown: '#e5e7eb',
  default: '#e5e7eb',
};

function getColorHex(colorValue: string | undefined): string {
  if (!colorValue) return '#e5e7eb';
  if (colorValue.startsWith('#')) return colorValue;
  if (/^[0-9A-Fa-f]{6}$/.test(colorValue)) return `#${colorValue}`;
  const normalized = colorValue.toLowerCase().trim();
  return colorMap[normalized] || '#e5e7eb';
}

export default function VariantSummaryDisplay({ variants, isLoading }: VariantSummaryDisplayProps) {
  const summary = useMemo(() => {
    if (!variants || !variants.colorGroups || variants.colorGroups.length === 0) {
      return null;
    }

    const colorGroups = variants.colorGroups;
    const totalVariants = variants.totalVariants || 0;

    // Get unique colors (max 3 to display)
    const colors = colorGroups.slice(0, 3).map((group) => ({
      name: group.color,
      hex: group.hexColor || group.color,
    }));

    // Count unique sizes
    const sizeSet = new Set<string>();
    colorGroups.forEach((group) => {
      group.variants.forEach((variant) => {
        if (variant.size) {
          sizeSet.add(variant.size);
        }
      });
    });

    return {
      totalVariants,
      colors,
      moreColors: colorGroups.length > 3 ? colorGroups.length - 3 : 0,
      sizeCount: sizeSet.size,
    };
  }, [variants]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <div className="h-2 w-2 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="h-2 w-2 rounded-full bg-gray-200 animate-pulse"></div>
        <span className="text-xs">Loading...</span>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Layers className="h-3.5 w-3.5" />
        <span className="text-xs">No variants</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      {/* Variant Count */}
      <div className="flex items-center gap-1.5 text-gray-600">
        <Layers className="h-3.5 w-3.5 text-blue-500" />
        <span className="text-xs font-semibold">{summary.totalVariants}</span>
        <span className="text-xs text-gray-400">variant{summary.totalVariants !== 1 ? 's' : ''}</span>
      </div>

      {/* Color dots */}
      <div className="flex items-center gap-1">
        {summary.colors.map((color, index) => (
          <div
            key={index}
            className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-sm"
            style={{ backgroundColor: getColorHex(color.hex) }}
            title={color.name}
          />
        ))}
        {summary.moreColors > 0 && (
          <span className="text-[10px] font-medium text-gray-500 ml-0.5">
            +{summary.moreColors}
          </span>
        )}
      </div>

      {/* Size count */}
      {summary.sizeCount > 0 && (
        <>
          <span className="text-gray-300">|</span>
          <span className="text-xs text-gray-500 font-medium">
            {summary.sizeCount} size{summary.sizeCount !== 1 ? 's' : ''}
          </span>
        </>
      )}
    </div>
  );
}

// src/pages/admin/products/components/VariantSummaryDisplay.tsx
import { useMemo } from 'react';
import { Layers } from 'lucide-react';
import type { AdminVariantsByProductResponse } from '@/api/services/variantService';
import { transformAdminVariants } from '@/pages/admin/products/utils/variant-utils';

interface VariantSummaryDisplayProps {
  variants?: AdminVariantsByProductResponse;
  isLoading?: boolean;
}

export default function VariantSummaryDisplay({ variants, isLoading }: VariantSummaryDisplayProps) {
  // Leverage centralized mapping logic
  const summary = useMemo(() => {
    if (!variants) return null;
    return transformAdminVariants(variants);
  }, [variants]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <div className="h-2 w-2 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-2 w-2 rounded-full bg-gray-200 animate-pulse" />
        <span className="text-xs">Loading...</span>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Layers className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">No variants found</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-1">
      {/* Variant Count */}
      <div className="flex items-center gap-1.5 text-slate-600">
        <Layers className="h-4 w-4 text-blue-500" />
        <span className="text-sm font-black text-slate-900">{summary.totalVariants}</span>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">variants</span>
      </div>

      <span className="h-3 w-px bg-slate-200" />

      {/* Color dots */}
      <div className="flex items-center gap-1">
        <div className="flex -space-x-1">
          {summary.colorGroups.slice(0, 3).map((group, index) => (
            <div
              key={index}
              className="w-3.5 h-3.5 rounded-full border border-white shadow-sm ring-1 ring-slate-100"
              style={{ backgroundColor: group.colorHex }}
              title={group.color}
            />
          ))}
        </div>
        {summary.colorGroups.length > 3 && (
          <span className="text-[10px] font-black text-slate-400 ml-1">
            +{summary.colorGroups.length - 3}
          </span>
        )}
      </div>

      <span className="h-3 w-px bg-slate-200" />

      {/* Size count */}
      {summary.sizeCount > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-black text-slate-700">
            {summary.sizeCount}
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            size{summary.sizeCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}

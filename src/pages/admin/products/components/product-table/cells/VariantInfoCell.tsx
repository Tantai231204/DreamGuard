// Display compact variant info: count, colors, sizes only
import { useRichAdminVariants } from '@/hooks/queries/useProduct';
import { Layers } from 'lucide-react';

interface VariantInfoCellProps {
  productId: string;
  variantCount: number;
}

const MAX_DOTS = 2;

export default function VariantInfoCell({ productId, variantCount }: VariantInfoCellProps) {
  // Use Senior-optimized hook for pre-transformed data
  const { data } = useRichAdminVariants(productId, variantCount > 0);

  if (variantCount === 0) {
    return <span className="text-xs text-slate-400">—</span>;
  }

  if (!data) return <div className="h-10 w-24 bg-slate-50 animate-pulse rounded-lg" />;

  const { totalVariants, colorGroups, sizeCount } = data;

  return (
    <div className="flex flex-col gap-0.5">
      {/* Variant count */}
      <div className="flex items-center gap-1.5">
        <Layers className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-sm font-bold text-slate-900">{totalVariants}</span>
        <span className="text-sm text-slate-500 font-normal">variant{totalVariants !== 1 ? 's' : ''}</span>
      </div>

      {/* Colors + sizes */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {colorGroups.slice(0, MAX_DOTS).map((g, idx) => (
            <div
              key={idx}
              className="h-3.5 w-3.5 rounded-full border border-slate-100 shadow-[0_0_0_1px_rgba(0,0,0,0.05)]"
              style={{ backgroundColor: g.colorHex }}
              title={g.color}
            />
          ))}
          {colorGroups.length > MAX_DOTS && (
            <span className="text-[10px] text-slate-400 font-bold">+{colorGroups.length - MAX_DOTS}</span>
          )}
        </div>

        <span className="text-slate-200 font-light">|</span>

        <span className="text-sm text-slate-500 font-normal">
          {sizeCount} size{sizeCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
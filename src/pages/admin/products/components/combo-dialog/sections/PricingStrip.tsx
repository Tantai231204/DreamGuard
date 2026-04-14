import { memo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { INPUT_CLS } from '../index';
import type { ComboFormValues } from '../index';
import type { Path, PathValue } from 'react-hook-form';
import type { SetFieldFn } from '../combo-form.types';
import { formatNumber, unformatNumber, formatPrice } from '@/lib/utils';

interface PricingStripProps {
    marketValue?: number;
    salePrice?: number;
    isLoading: boolean;
    setField: SetFieldFn;
    onSync: () => void;
}

const PricingStrip = memo(function PricingStrip({
    marketValue,
    salePrice,
    isLoading,
    setField,
    onSync,
}: PricingStripProps) {
    const isSynced = salePrice === marketValue;
    const hasDiscount = (marketValue ?? 0) > 0 && (salePrice ?? 0) < (marketValue ?? 0);
    const discountPct = hasDiscount
        ? Math.round(((marketValue! - salePrice!) / marketValue!) * 100)
        : 0;

    return (
        <div className="flex items-center gap-0 px-5 py-3 bg-white border-b border-slate-100 shrink-0">
            {/* Market value (auto-calculated) */}
            <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Market value
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-base font-semibold text-slate-900 tabular-nums">
                        {formatPrice(marketValue ?? 0)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Auto</span>
                </div>
            </div>

            <div className="w-px h-8 bg-slate-100 mx-4 shrink-0" />

            {/* Sale price (editable) */}
            <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Sale price <span className="text-red-400">*</span>
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                    <div className="relative">
                        <Input
                            value={formatNumber(salePrice)}
                            onChange={e =>
                                setField(
                                    'salePrice' as Path<ComboFormValues>,
                                    unformatNumber(e.target.value) as PathValue<ComboFormValues, 'salePrice'>,
                                )
                            }
                            disabled={isLoading}
                            className={cn(
                                INPUT_CLS,
                                'h-8 w-36 pr-9 text-sm font-semibold bg-slate-50 focus:bg-white',
                            )}
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">
                            ₫
                        </span>
                    </div>
                    {hasDiscount && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                            -{discountPct}%
                        </span>
                    )}
                </div>
            </div>

            {/* Sync action */}
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onSync}
                disabled={isSynced || isLoading || !marketValue}
                className={cn(
                    'ml-auto h-8 gap-1.5 text-[11px] font-semibold rounded-lg',
                    isSynced
                        ? 'text-slate-300 cursor-default'
                        : 'text-blue-600 hover:bg-blue-50',
                )}
            >
                {isSynced ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                )}
                {isSynced ? 'Synced' : 'Sync from items'}
            </Button>
        </div>
    );
});

export default PricingStrip;

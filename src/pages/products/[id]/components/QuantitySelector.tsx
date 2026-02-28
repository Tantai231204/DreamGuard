import { memo } from 'react';
import { Minus, Plus, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
    value: number;
    onChange: (value: number) => void;
    max?: number;
    stockLeft?: number;
}

export const QuantitySelector = memo(({ 
    value, 
    onChange, 
    max = 99,
    stockLeft 
}: QuantitySelectorProps) => {
    const handleChange = (delta: number) => {
        onChange(Math.max(1, Math.min(max, value + delta)));
    };

    const isLowStock = stockLeft && stockLeft < 10;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900">Quantity</label>
                {stockLeft !== undefined && (
                    <div className={cn(
                        "flex items-center gap-1.5 text-sm",
                        isLowStock ? "text-orange-600" : "text-gray-500"
                    )}>
                        <Package className="h-3.5 w-3.5" />
                        <span className="font-medium">{stockLeft} left</span>
                    </div>
                )}
            </div>
            <div className="inline-flex items-center rounded-lg border-2 border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <button
                    onClick={() => handleChange(-1)}
                    disabled={value <= 1}
                    className="flex h-11 w-11 items-center justify-center text-gray-600 transition-all hover:bg-gray-50 hover:text-[var(--color-primary)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
                    aria-label="Decrease quantity"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <div className="flex h-11 w-16 items-center justify-center border-x-2 border-gray-200">
                    <span className="text-base font-semibold text-gray-900">
                        {value}
                    </span>
                </div>
                <button
                    onClick={() => handleChange(1)}
                    disabled={value >= max || (stockLeft !== undefined && value >= stockLeft)}
                    className="flex h-11 w-11 items-center justify-center text-gray-600 transition-all hover:bg-gray-50 hover:text-[var(--color-primary)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
                    aria-label="Increase quantity"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
});

QuantitySelector.displayName = 'QuantitySelector';

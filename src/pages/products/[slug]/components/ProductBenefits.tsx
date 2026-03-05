import { memo } from 'react';
import type { ProductBenefit } from '../types';

interface ProductBenefitsProps {
    benefits: ProductBenefit[];
}

export const ProductBenefits = memo(({ benefits }: ProductBenefitsProps) => {
    return (
        <div className="grid grid-cols-2 gap-3">
            {benefits.map((benefit, index) => (
                <div
                    key={index}
                    className="group flex items-center gap-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 p-3.5 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                >
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 transition-transform group-hover:scale-110">
                        <benefit.icon className="h-5 w-5 text-[var(--color-primary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{benefit.label}</p>
                        <p className="text-xs text-gray-600">{benefit.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
});

ProductBenefits.displayName = 'ProductBenefits';

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
                    className="group flex items-center gap-3 rounded-xl bg-primary-light/10 p-3.5 transition-all duration-200 hover:shadow-md hover:scale-[1.02] border border-primary-light/40"
                >
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-primary-light/30 transition-transform group-hover:scale-110">
                        <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-primary-dark truncate uppercase tracking-tight">{benefit.label}</p>
                        <p className="text-[10px] text-primary-light font-bold uppercase tracking-widest italic">{benefit.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
});

ProductBenefits.displayName = 'ProductBenefits';

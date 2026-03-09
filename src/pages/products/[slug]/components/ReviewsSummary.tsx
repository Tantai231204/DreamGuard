import { memo } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Review } from '../types';

interface ReviewsSummaryProps {
    reviews: Review[];
    averageRating: number;
}

export const ReviewsSummary = memo(({ reviews, averageRating }: ReviewsSummaryProps) => {
    return (
        <div className="flex flex-col items-center gap-10 rounded-[3rem] bg-primary-light/10 p-10 border border-primary-light/40 sm:flex-row shadow-sm">
            <div className="text-center px-6">
                <div className="text-7xl font-black text-primary-dark tracking-tighter">{averageRating.toFixed(1)}</div>
                <div className="mt-4 flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={cn(
                                "h-5 w-5",
                                i < Math.floor(averageRating)
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-primary-light/50 text-primary-light/50"
                            )}
                        />
                    ))}
                </div>
                <p className="mt-3 text-[10px] font-black uppercase text-primary-light tracking-widest leading-none">{reviews.length} Validated Stories</p>
            </div>

            <div className="hidden sm:block h-24 w-px bg-primary-light/40" />

            <div className="flex-1 w-full space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter(r => Math.floor(r.rating) === star).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                        <div key={star} className="flex items-center gap-4">
                            <span className="w-10 text-[10px] font-black text-primary-dark uppercase tracking-widest">{star} ★</span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-primary-light/40">
                                <div
                                    className="h-full rounded-full bg-amber-400 transition-all duration-1000"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="w-8 text-[10px] font-black text-primary-light text-right">{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

ReviewsSummary.displayName = 'ReviewsSummary';

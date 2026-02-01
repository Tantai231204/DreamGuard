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
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 p-6 sm:flex-row">
            <div className="text-center">
                <div className="text-5xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                <div className="mt-2 flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={cn(
                                "h-5 w-5",
                                i < Math.floor(averageRating)
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-gray-200 text-gray-200"
                            )}
                        />
                    ))}
                </div>
                <p className="mt-1 text-sm text-gray-500">{reviews.length} reviews</p>
            </div>
            <div className="h-px w-full bg-amber-200 sm:h-20 sm:w-px" />
            <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter(r => Math.floor(r.rating) === star).length;
                    const percentage = (count / reviews.length) * 100;
                    return (
                        <div key={star} className="flex items-center gap-3">
                            <span className="w-8 text-sm text-gray-600">{star} ★</span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="h-full rounded-full bg-amber-400 transition-all"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="w-12 text-sm text-gray-500">{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

ReviewsSummary.displayName = 'ReviewsSummary';

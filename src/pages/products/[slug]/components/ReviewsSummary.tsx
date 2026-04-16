import { memo } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { Review } from '../types';

interface ReviewsSummaryProps {
    reviews: Review[];
    averageRating: number;
}

export const ReviewsSummary = memo(({ reviews, averageRating }: ReviewsSummaryProps) => {
    return (
        <div className="flex flex-col items-center gap-10 rounded-[2rem] bg-slate-50/50 p-6 sm:p-8 border border-slate-100 lg:flex-row shadow-sm">
            <div className="flex flex-col items-center justify-center text-center px-4 lg:border-r lg:border-slate-100 lg:pr-10">
                <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{averageRating.toFixed(1)}</span>
                        <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        "h-4 w-4",
                                        i < Math.floor(averageRating)
                                            ? "fill-amber-400 text-amber-400"
                                            : "fill-slate-200 text-slate-200"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="mt-1 text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Based on {reviews.length} Stories</p>
                </div>
            </div>

            <div className="flex-1 w-full space-y-3 flex flex-col justify-center">
                {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter(r => Math.floor(r.rating) === star).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                        <div key={star} className="flex items-center gap-4 group">
                            <span className="w-14 min-w-[3.5rem] whitespace-nowrap text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">{star} Star</span>
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full rounded-full bg-amber-400"
                                />
                            </div>
                            <span className="w-10 text-[10px] font-bold text-slate-400 text-right tabular-nums">{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

ReviewsSummary.displayName = 'ReviewsSummary';

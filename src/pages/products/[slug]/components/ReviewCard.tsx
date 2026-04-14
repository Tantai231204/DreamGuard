import { memo } from 'react';
import { Star, ThumbsUp, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Review } from '../types';

interface ReviewCardProps {
    review: Review;
}

export const ReviewCard = memo(({ review }: ReviewCardProps) => {
    return (
        <Card className="overflow-hidden border-0 border-b border-slate-100 bg-white shadow-none group rounded-none">
            <CardContent className="py-6 px-0">
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="relative shrink-0 flex sm:block items-center gap-3">
                        <div className="relative">
                            <img
                                src={review.avatar}
                                alt={review.name}
                                className="h-11 w-11 rounded-xl object-cover border border-slate-100 shadow-sm transition-transform group-hover:scale-105"
                            />
                            {review.verified && (
                                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-blue-500 rounded-lg flex items-center justify-center text-white border-2 border-white shadow-sm">
                                    <Check className="h-2 w-2 stroke-[4]" />
                                </div>
                            )}
                        </div>
                        <div className="sm:hidden">
                            <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-widest leading-none">{review.name}</h4>
                            <div className="mt-1 flex items-center gap-1.5">
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={cn(
                                                "h-2 w-2",
                                                i < review.rating
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "fill-slate-200 text-slate-200"
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="hidden sm:block">
                                <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.1em]">{review.name}</h4>
                                <div className="mt-1.5 flex items-center gap-3">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={cn(
                                                    "h-2.5 w-2.5",
                                                    i < review.rating
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "fill-slate-200 text-slate-200"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(review.date))}</span>
                                </div>
                            </div>

                            {review.verified && (
                                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50/50 border border-blue-100/50">
                                    <Badge className="bg-transparent hover:bg-transparent text-blue-600 border-0 p-0 text-[8px] font-black uppercase tracking-widest">
                                        Verified Resident
                                    </Badge>
                                </div>
                            )}
                        </div>

                        <p className="text-slate-600 text-[13px] leading-relaxed font-medium">
                            "{review.comment}"
                        </p>

                        <div className="flex items-center gap-6 pt-1">
                            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#4988c4] hover:text-[#3b6fa3] transition-colors group/btn">
                                <ThumbsUp className="h-4 w-4 transition-transform group-hover/btn:-translate-y-0.5" />
                                <span>Helpful ({review.helpful})</span>
                            </button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

ReviewCard.displayName = 'ReviewCard';

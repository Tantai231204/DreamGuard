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
        <Card className="overflow-hidden border-0 bg-white shadow-none group">
            <CardContent className="p-0">
                <div className="flex gap-8">
                    <div className="relative shrink-0">
                        <img
                            src={review.avatar}
                            alt={review.name}
                            className="h-16 w-16 rounded-[1.25rem] object-cover border border-primary-light/40 shadow-sm transition-transform group-hover:scale-105"
                        />
                        {review.verified && (
                            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white border-2 border-white shadow-md">
                                <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h4 className="text-sm font-black text-primary-dark uppercase tracking-widest">{review.name}</h4>
                                <div className="mt-2 flex items-center gap-4">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={cn(
                                                    "h-3 w-3",
                                                    i < review.rating
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "fill-primary-light/50 text-primary-light/50"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-black text-primary-light uppercase tracking-widest leading-none">{review.date}</span>
                                </div>
                            </div>

                            {review.verified && (
                                <Badge className="bg-emerald-50 text-emerald-600 border-0 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg">
                                    Collector Verified
                                </Badge>
                            )}
                        </div>

                        <p className="text-primary-dark/80 text-sm leading-relaxed font-medium">
                            {review.comment}
                        </p>

                        <div className="pt-2">
                            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-light hover:text-amber-500 transition-colors">
                                <ThumbsUp className="h-4 w-4" />
                                <span>Validate Feedback ({review.helpful})</span>
                            </button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

ReviewCard.displayName = 'ReviewCard';

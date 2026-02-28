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
        <Card className="overflow-hidden">
            <CardContent className="p-6">
                <div className="flex gap-4">
                    <img
                        src={review.avatar}
                        alt={review.name}
                        className="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-2 ring-gray-100"
                    />
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{review.name}</h4>
                            {review.verified && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                    <Check className="mr-1 h-3 w-3" />
                                    Verified Purchase
                                </Badge>
                            )}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "h-4 w-4",
                                            i < review.rating
                                                ? "fill-amber-400 text-amber-400"
                                                : "fill-gray-200 text-gray-200"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <p className="mt-3 text-gray-600 leading-relaxed">
                            {review.comment}
                        </p>
                        <div className="mt-4 flex items-center gap-4">
                            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[var(--color-primary)]">
                                <ThumbsUp className="h-4 w-4" />
                                Helpful ({review.helpful})
                            </button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

ReviewCard.displayName = 'ReviewCard';

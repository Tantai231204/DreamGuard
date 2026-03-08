import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const ProductCardSkeleton = memo(() => {
    return (
        <Card className="border-0 bg-transparent shadow-none overflow-hidden group">
            <div className="relative aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden bg-gray-50 border border-gray-100">
                <Skeleton className="h-full w-full" />
            </div>

            <CardContent className="pt-8 px-4 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-full" />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </CardContent>
        </Card>
    );
});

ProductCardSkeleton.displayName = 'ProductCardSkeleton';

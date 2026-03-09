import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const ProductCardSkeleton = memo(() => {
    return (
        <Card className="flex flex-col overflow-hidden rounded-[2rem] border-0 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            {/* Media Section */}
            <div className="relative aspect-[4/5] m-2.5 rounded-[1.6rem] bg-gray-50/50 overflow-hidden">
                <Skeleton className="h-full w-full" />
            </div>

            {/* Content Section */}
            <div className="flex flex-col px-7 pb-8 pt-3 space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-16 rounded-full" />
                    <Skeleton className="h-5 w-full rounded-lg" />
                    <Skeleton className="h-5 w-3/4 rounded-lg" />
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <Skeleton className="h-8 w-24 rounded-xl" />
                    <Skeleton className="h-6 w-12 rounded-full" />
                </div>
            </div>
        </Card>
    );
});

ProductCardSkeleton.displayName = 'ProductCardSkeleton';

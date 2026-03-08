import { Skeleton } from "@/components/ui/skeleton";

export const ProductDetailSkeleton = () => {
    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-12 lg:px-12 xl:max-w-7xl">
                {/* Breadcrumb Skeleton */}
                <Skeleton className="h-4 w-48 mb-8" />

                <div className="grid gap-20 lg:grid-cols-12 lg:items-start">
                    {/* Gallery Skeleton (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        <Skeleton className="aspect-square w-full rounded-[3rem]" />
                        <div className="flex gap-4">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-20 w-20 rounded-2xl" />
                            ))}
                        </div>
                    </div>

                    {/* Info Skeleton (5 cols) */}
                    <div className="lg:col-span-5 space-y-10">
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-24 rounded-lg" />
                                <Skeleton className="h-6 w-32 rounded-lg" />
                            </div>
                            <Skeleton className="h-16 w-full rounded-2xl" />
                            <Skeleton className="h-16 w-3/4 rounded-2xl" />
                        </div>

                        {/* Price Area Skeleton */}
                        <Skeleton className="h-48 w-full rounded-[2.5rem]" />

                        {/* Config Skeleton */}
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-20" />
                                <div className="flex gap-3">
                                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-12 rounded-full" />)}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-20" />
                                <div className="flex gap-3">
                                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-24 rounded-xl" />)}
                                </div>
                            </div>
                        </div>

                        {/* Action Skeleton */}
                        <div className="flex gap-4 pt-8">
                            <Skeleton className="h-20 flex-[2] rounded-[2.25rem]" />
                            <Skeleton className="h-20 flex-1 rounded-[2.25rem]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

import { Skeleton } from '@/components/ui/skeleton';

function DetailSkeleton() {
    return (
        <div className="flex flex-col h-full bg-[#f8f9fb]">
            {/* Header skeleton */}
            <div className="flex-shrink-0 bg-white border-b border-gray-100 px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                    <Skeleton className="h-4 w-24 rounded-lg" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-16 rounded-lg" />
                        <Skeleton className="h-8 w-20 rounded-lg" />
                    </div>
                </div>
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-7 w-56 rounded-lg" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-3.5 w-32 rounded" />
                            <Skeleton className="h-3.5 w-24 rounded" />
                        </div>
                    </div>
                    <div className="hidden xl:flex items-center gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-14 w-28 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab bar skeleton */}
            <div className="px-6 pt-5">
                <Skeleton className="h-10 w-56 rounded-xl mb-5" />
            </div>

            {/* Content skeleton */}
            <div className="flex-1 px-6 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-5">
                        {/* Info card */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                            <Skeleton className="h-4 w-36 rounded mb-5" />
                            <div className="grid grid-cols-2 gap-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-3 w-16 rounded" />
                                        <Skeleton className="h-5 w-full rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Policy card */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                            <Skeleton className="h-4 w-24 rounded mb-5" />
                            <div className="grid grid-cols-2 gap-4">
                                {Array.from({ length: 2 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-xl" />
                                        <div className="space-y-1.5">
                                            <Skeleton className="h-2.5 w-16 rounded" />
                                            <Skeleton className="h-5 w-20 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Description card */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
                            <Skeleton className="h-4 w-28 rounded mb-5" />
                            <Skeleton className="h-16 w-full rounded-xl" />
                            <Skeleton className="h-20 w-full rounded" />
                        </div>
                    </div>
                    <div className="space-y-5">
                        {/* Quick info */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3.5">
                            <Skeleton className="h-4 w-24 rounded mb-4" />
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-16 rounded" />
                                    <Skeleton className="h-4 w-20 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailSkeleton;

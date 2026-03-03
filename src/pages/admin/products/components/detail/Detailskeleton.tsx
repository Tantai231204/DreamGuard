import { Skeleton } from '@/components/ui/skeleton';

function DetailSkeleton() {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 px-6 py-4 bg-white border-b border-gray-100">
                <Skeleton className="h-3.5 w-48 mb-3" />
                <Skeleton className="h-7 w-72" />
            </div>
            <div className="flex-1 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-5">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-48 rounded-2xl" />
                        ))}
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="aspect-square rounded-2xl" />
                        <Skeleton className="h-32 rounded-2xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailSkeleton;
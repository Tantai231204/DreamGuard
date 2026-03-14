import { Skeleton } from '@/components/ui/skeleton';

function DetailSkeleton() {
    return (
        <div className="flex flex-col h-full bg-slate-50/30">
            {/* Header skeleton */}
            <div className="flex-shrink-0 bg-white border-b border-slate-100 px-8 py-4">
                <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-40 rounded-lg" />
                        <Skeleton className="h-9 w-32 rounded-lg" />
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <Skeleton className="h-8 w-64 rounded-lg" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>
            </div>

            <main className="flex-1 p-6">
                <div className="h-full bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    {/* Tabs bar skeleton */}
                    <div className="px-8 py-4 border-b bg-slate-50/50">
                        <Skeleton className="h-10 w-64 rounded-lg" />
                    </div>

                    <div className="flex-1 p-10 overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                            <div className="lg:col-span-2 space-y-16">
                                {/* Core Info skeleton */}
                                <div className="space-y-10">
                                    <Skeleton className="h-4 w-48 rounded" />
                                    <div className="grid grid-cols-2 gap-10">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <div key={i} className="flex gap-4">
                                                <Skeleton className="h-11 w-11 rounded-[1.25rem]" />
                                                <div className="space-y-2 flex-1">
                                                    <Skeleton className="h-2 w-16" />
                                                    <Skeleton className="h-4 w-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Policies skeleton */}
                                <div className="space-y-8">
                                    <Skeleton className="h-4 w-32 rounded" />
                                    <div className="grid grid-cols-2 gap-10">
                                        <Skeleton className="h-32 w-full rounded-3xl" />
                                        <Skeleton className="h-32 w-full rounded-3xl" />
                                    </div>
                                </div>
                            </div>

                            <aside className="space-y-12">
                                <div className="space-y-8">
                                    <Skeleton className="h-4 w-40 rounded" />
                                    <div className="space-y-6">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className="flex justify-between">
                                                <Skeleton className="h-3 w-20" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-6 pt-10 border-t border-slate-50">
                                    <Skeleton className="h-4 w-32 rounded" />
                                    <div className="space-y-4">
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-full" />
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DetailSkeleton;

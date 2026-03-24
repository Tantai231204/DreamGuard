import { Skeleton } from "@/components/ui/skeleton";

export function OrderDetailSkeleton() {
  return (
    <div className="flex flex-col h-full bg-slate-50 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-slate-100 p-6">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-32 rounded-lg" />
             </div>
             <Skeleton className="h-9 w-64 rounded-xl" />
          </div>
          <div className="flex gap-4">
             <Skeleton className="h-12 w-32 rounded-2xl" />
             <Skeleton className="h-12 w-32 rounded-2xl" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-[1600px] mx-auto space-y-8">
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Main Area Skeleton */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
               <div className="bg-white p-8 rounded-3xl border border-slate-100 space-y-8">
                  <div className="flex justify-between">
                     <Skeleton className="h-8 w-48 rounded-lg" />
                     <Skeleton className="h-8 w-24 rounded-full" />
                  </div>
                  <div className="space-y-6">
                     <Skeleton className="h-48 w-full rounded-3xl" />
                     <Skeleton className="h-48 w-full rounded-3xl" />
                  </div>
               </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
               <div className="bg-white p-8 rounded-3xl border border-slate-100 space-y-8">
                  <Skeleton className="h-8 w-32 rounded-lg" />
                  <div className="space-y-4">
                     <div className="flex gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                           <Skeleton className="h-4 w-3/4 rounded" />
                           <Skeleton className="h-4 w-1/2 rounded" />
                        </div>
                     </div>
                  </div>
                  <Skeleton className="h-12 w-full rounded-2xl" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

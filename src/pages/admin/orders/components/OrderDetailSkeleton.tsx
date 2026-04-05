import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function OrderDetailSkeleton() {
  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Skeleton Header */}
      <div className="flex-shrink-0 bg-white border-b border-blue-100/50 px-8 py-6 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="space-y-4 w-1/3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right space-y-2">
              <Skeleton className="h-3 w-20 ml-auto" />
              <Skeleton className="h-8 w-32 ml-auto" />
            </div>
            <Skeleton className="h-12 w-32 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Skeleton Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              <Card className="p-0 border-none shadow-xl rounded-3xl overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-100">
                  <Skeleton className="h-6 w-48" />
                </div>
                <div className="p-6 space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <Skeleton className="h-20 w-20 rounded-2xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-8 border-none shadow-xl rounded-3xl space-y-4">
                 <div className="flex justify-between items-center">
                   <Skeleton className="h-4 w-32" />
                   <Skeleton className="h-4 w-24" />
                 </div>
                 <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                   <Skeleton className="h-6 w-32" />
                   <Skeleton className="h-8 w-40" />
                 </div>
              </Card>
            </div>

            {/* Right Column */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              <Card className="p-6 border-none shadow-xl rounded-3xl space-y-6">
                <Skeleton className="h-12 w-full rounded-xl" />
                <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </Card>

              <Card className="p-6 border-none shadow-xl rounded-3xl space-y-6">
                <Skeleton className="h-6 w-40" />
                <div className="space-y-8 relative pl-4 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="relative flex gap-4">
                      <div className="absolute left-[-2px] h-3 w-3 rounded-full bg-slate-200 ring-4 ring-white" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

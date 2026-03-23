import { Skeleton } from '@/components/ui/skeleton';

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-slate-100 bg-white p-5 space-y-4 shadow-sm animate-pulse">
      <Skeleton className="h-40 w-full rounded-xl bg-slate-100" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4 rounded bg-slate-100" />
        <Skeleton className="h-3 w-1/2 rounded bg-slate-100" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-3 w-1/4 rounded bg-slate-100" />
        <Skeleton className="h-7 w-1/3 rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex gap-4">
        {Array.from({ length: cols }).map((_, idx) => (
          <Skeleton key={idx} className="h-4 flex-1 bg-slate-200/60 rounded" />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="px-4 py-4 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, colIdx) => (
              <Skeleton key={colIdx} className="h-3.5 flex-1 bg-slate-100 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

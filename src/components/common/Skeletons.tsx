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

export function PaymentDetailsSkeleton() {
  return (
    <div className="p-5 sm:p-6 space-y-6 min-h-[198px] sm:min-h-[220px] animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-12 bg-slate-100" />
            <Skeleton className="h-6 w-20 rounded-lg bg-slate-100" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-12 bg-slate-100" />
            <Skeleton className="h-6 w-20 rounded-lg bg-slate-100" />
          </div>
        </div>
        <Skeleton className="h-6 w-24 rounded-lg self-start sm:self-auto bg-slate-100" />
      </div>
      <div className="space-y-2 p-3 rounded-xl bg-slate-50/50 border border-slate-100/50">
        <Skeleton className="h-2.5 w-24 bg-slate-100" />
        <Skeleton className="h-4 w-full bg-slate-100" />
      </div>
      <div className="flex justify-between items-end pt-4 border-t border-slate-100/50">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-28 bg-slate-100" />
          <Skeleton className="h-2.5 w-32 bg-slate-100" />
        </div>
        <Skeleton className="h-8 w-32 rounded-lg bg-slate-100" />
      </div>
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="space-y-4 animate-pulse bg-white p-6">
      {/* Step Flow */}
      <div className="flex justify-between px-8 py-4 bg-slate-50 rounded-xl mb-6">
        {[1, 2, 3, 4].map(idx => (
          <div key={idx} className="flex flex-col items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full bg-slate-200" />
            <Skeleton className="h-2 w-12 rounded bg-slate-100" />
          </div>
        ))}
      </div>
      {/* Sections */}
      {[1, 2, 3].map(idx => (
        <div key={idx} className="space-y-3 p-4 border border-slate-100 rounded-xl">
          <Skeleton className="h-4 w-24 rounded bg-slate-200/60" />
          <Skeleton className="h-12 w-full rounded-lg bg-slate-100/50" />
        </div>
      ))}
      <PaymentDetailsSkeleton />
    </div>
  );
}

export function ServiceOrderDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse bg-white p-6">
      {/* Appointment Info */}
      <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/30">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-5 w-32 rounded bg-slate-200" />
          <Skeleton className="h-8 w-40 rounded-full bg-slate-200" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-12 w-full rounded-xl bg-slate-100" />
          <Skeleton className="h-12 w-full rounded-xl bg-slate-100" />
        </div>
      </div>
      {/* Manifest Highlights */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-28 rounded bg-slate-200" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl bg-slate-100" />)}
        </div>
      </div>
      <PaymentDetailsSkeleton />
    </div>
  );
}

export function TradeInOrderDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse bg-white p-6">
      {/* Header Info */}
      <div className="flex justify-between items-start gap-6 border-b border-slate-100 pb-6">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-8 w-2/3 rounded-lg bg-slate-200" />
          <Skeleton className="h-3 w-1/3 rounded bg-slate-100" />
        </div>
        <Skeleton className="h-10 w-24 rounded-full bg-slate-200" />
      </div>
      {/* Main Details */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4 p-5 rounded-2xl bg-slate-50">
          <Skeleton className="h-4 w-20 rounded bg-slate-200" />
          <Skeleton className="h-32 w-full rounded-xl bg-slate-100" />
        </div>
        <div className="space-y-4 p-5 rounded-2xl bg-slate-50">
          <Skeleton className="h-4 w-20 rounded bg-slate-200" />
          <Skeleton className="h-10 w-full rounded-xl bg-slate-100" />
          <Skeleton className="h-10 w-full rounded-xl bg-slate-100" />
        </div>
      </div>
      <PaymentDetailsSkeleton />
    </div>
  );
}

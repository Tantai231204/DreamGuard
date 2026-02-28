import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 10, columns = 7 }: TableSkeletonProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-xl">
      {/* Search Bar Skeleton */}
      <div className="p-6 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 flex-1 max-w-md rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-b-2 border-gray-200">
              {Array.from({ length: columns }).map((_, idx) => (
                <TableHead key={idx}>
                  <Skeleton className="h-5 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <TableRow key={rowIdx} className="border-b border-gray-100">
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <TableCell key={colIdx} className="py-4">
                    {colIdx === 1 ? (
                      // Customer column with avatar
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    ) : colIdx === columns - 1 ? (
                      // Actions column
                      <Skeleton className="h-9 w-28 rounded-lg" />
                    ) : (
                      <Skeleton className="h-4 w-full" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
        <Skeleton className="h-5 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

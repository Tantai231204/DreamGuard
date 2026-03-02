import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Package,
  ChevronRight,
  ChevronDown,
  Star,
  Layers,
} from 'lucide-react';
import { SortableHeader } from '@/components/admin';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Product } from '../types';
import { AGE_GROUPS } from '../types';

const columnHelper = createColumnHelper<Product>();

const statusStyles: Record<string, string> = {
  Active: 'bg-green-50 text-green-700 border-green-300',
  Inactive: 'bg-gray-50 text-gray-600 border-gray-300',
  Draft: 'bg-yellow-50 text-yellow-700 border-yellow-300',
};

interface UseProductColumnsProps {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function useProductColumns({ onEdit, onDelete }: UseProductColumnsProps) {
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
              aria-label="Select all"
              className="data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onChange={(e) => row.toggleSelected(e.target.checked)}
              aria-label="Select row"
              className="data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
            />
          </div>
        ),
        size: 40,
      }),
      columnHelper.display({
        id: 'expand',
        header: () => null,
        cell: ({ row }) => {
          const hasVariants = (row.original.variants?.length ?? 0) > 0;
          if (!hasVariants) return null;
          return (
            <button
              onClick={() => row.toggleExpanded()}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Toggle variants"
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4 text-[var(--color-primary)]" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </button>
          );
        },
        size: 36,
      }),
      columnHelper.accessor('name', {
        enableSorting: true,
        header: ({ column }) => <SortableHeader column={column} label="Product" />,
        cell: (info) => {
          const product = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200">
                <Package className="h-5 w-5 text-gray-400" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 truncate max-w-[220px]">
                  {info.getValue()}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-gray-500">{product.categoryName || '—'}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-[var(--color-primary)] font-medium">{product.material}</span>
                </div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('slug', {
        enableSorting: true,
        header: ({ column }) => <SortableHeader column={column} label="Slug" />,
        cell: (info) => (
          <span className="font-mono text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('variantCount', {
        id: 'variants_info',
        header: 'Variants',
        cell: (info) => {
          const count = info.getValue() ?? 0;
          if (count === 0) {
            return <span className="text-xs text-gray-400">No variants</span>;
          }
          return (
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-sm font-bold text-gray-900">{count}</span>
              <span className="text-xs text-gray-500">{count === 1 ? 'variant' : 'variants'}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor('ageGroup', {
        header: 'Age Group',
        cell: (info) => {
          const val = info.getValue();
          if (val === null || val === undefined) return <span className="text-xs text-gray-400">—</span>;
          return (
            <span className="text-xs font-medium text-gray-700 bg-blue-50 px-2 py-1 rounded-md">
              {AGE_GROUPS[val] || `Group ${val}`}
            </span>
          );
        },
      }),
      columnHelper.accessor('averageRating', {
        enableSorting: true,
        header: ({ column }) => <SortableHeader column={column} label="Rating" />,
        cell: (info) => {
          const rating = info.getValue();
          return (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-bold text-gray-900">{rating.toFixed(1)}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          return (
            <Badge variant="outline" className={`font-semibold ${statusStyles[status] || ''}`}>
              {status}
            </Badge>
          );
        },
      }),
      columnHelper.accessor('createdAt', {
        enableSorting: true,
        header: ({ column }) => <SortableHeader column={column} label="Created" />,
        cell: (info) => (
          <span className="text-xs text-gray-500">
            {new Date(info.getValue()).toLocaleDateString('vi-VN')}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 shadow-xl border-2 rounded-xl">
                <DropdownMenuItem className="cursor-pointer py-2.5 font-medium">
                  <Eye className="h-4 w-4 mr-3 text-blue-600" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer py-2.5 font-medium"
                  onClick={() => onEdit(row.original)}
                >
                  <Edit className="h-4 w-4 mr-3 text-gray-700" />
                  Edit Product
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  className="cursor-pointer py-2.5 text-red-600 font-semibold focus:bg-red-50 focus:text-red-700"
                  onClick={() => onDelete(row.original)}
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      }),
    ],
    [onEdit, onDelete]
  );

  return columns;
}

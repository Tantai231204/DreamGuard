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
  Plus,
} from 'lucide-react';
import { SortableHeader } from '@/components/admin';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Product } from '../../types';
import { formatAgeGroup, PRODUCT_STATUS_VARIANT } from '../../types';
import { VariantInfoCell, PriceRangeCell, StockCell } from './cells';

const columnHelper = createColumnHelper<Product>();

const statusStyles: Record<string, string> = {
  Draft: 'bg-amber-50 text-amber-700 border-amber-300',
  Published: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  OutOfStock: 'bg-red-50 text-red-700 border-red-300',
  Hidden: 'bg-gray-50 text-gray-600 border-gray-300',
};

const statusLabels: Record<string, string> = {
  Draft: 'Draft',
  Published: 'Published',
  OutOfStock: 'Out of Stock',
  Hidden: 'Hidden',
};

interface UseProductColumnsProps {
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAddVariant: (product: Product) => void;
}

export function useProductColumns({ onView, onEdit, onDelete, onAddVariant }: UseProductColumnsProps) {
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
          // Check both variants array and variantCount (API may return count without full array)
          const hasVariants = (row.original.variants?.length ?? 0) > 0 || (row.original.variantCount ?? 0) > 0;
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
            <div className="flex items-center gap-4 py-1">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200 shadow-sm group-hover:border-purple-200 transition-colors">
                <Package className="h-6 w-6 text-gray-400 group-hover:text-purple-500 transition-colors" />
              </div>
              <div className="min-w-0 flex flex-col gap-0.5">
                <div className="font-bold text-gray-900 truncate max-w-[240px] leading-tight group-hover:text-purple-700 transition-colors">
                  {info.getValue()}
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 italic">
                    {product.slug}
                  </code>
                  <span className="text-gray-300 text-[10px]">•</span>
                  <span className="text-[11px] text-gray-500 font-medium truncate max-w-[100px]">{product.categoryName || 'No Category'}</span>
                </div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('variantCount', {
        id: 'variants_info',
        header: 'Variants',
        cell: (info) => {
          const count = info.getValue() ?? 0;
          const productId = info.row.original.id;
          return <VariantInfoCell productId={productId} variantCount={count} />;
        },
      }),
      columnHelper.display({
        id: 'price_range',
        header: 'Price Range',
        cell: ({ row }) => {
          const variantCount = row.original.variantCount ?? 0;
          return <PriceRangeCell productId={row.original.id} variantCount={variantCount} />;
        },
      }),
      columnHelper.display({
        id: 'stock',
        header: 'Stock',
        cell: ({ row }) => {
          const variantCount = row.original.variantCount ?? 0;
          return <StockCell productId={row.original.id} variantCount={variantCount} />;
        },
      }),
      columnHelper.accessor('ageGroup', {
        header: 'Age Group',
        cell: (info) => {
          const val = info.getValue();
          if (val === null || val === undefined || val === '') return <span className="text-xs text-gray-400">—</span>;
          const formatted = typeof val === 'string' || typeof val === 'number'
            ? (formatAgeGroup(val))
            : String(val);

          return (
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 shadow-sm">
              {formatted}
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
          const variant = PRODUCT_STATUS_VARIANT[status] || 'outline';
          return (
            <Badge variant={variant} className={`font-medium text-xs ${statusStyles[status] || ''}`}>
              {statusLabels[status] || status}
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
                <DropdownMenuItem
                  className="cursor-pointer py-2.5 font-medium"
                  onClick={() => onView(row.original)}
                >
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
                <DropdownMenuItem
                  className="cursor-pointer py-2.5 font-medium"
                  onClick={() => onAddVariant(row.original)}
                >
                  <Plus className="h-4 w-4 mr-3 text-indigo-600" />
                  Add Variant
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
    [onView, onEdit, onDelete, onAddVariant]
  );

  return columns;
}

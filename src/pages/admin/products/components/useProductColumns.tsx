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
  Copy,
  Package,
  ChevronRight,
  ChevronDown,
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

const columnHelper = createColumnHelper<Product>();

const statusStyles = {
  active: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-300 shadow-sm',
  inactive: 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border-gray-300 shadow-sm',
  out_of_stock: 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-300 shadow-sm',
};

const statusLabels = {
  active: 'Active',
  inactive: 'Inactive',
  out_of_stock: 'Out of Stock',
};

export function useProductColumns() {
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
        cell: ({ row }) => (
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
        ),
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
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 truncate">
                  {info.getValue()}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-gray-500">{product.category}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-[var(--color-primary)] font-medium">{product.material}</span>
                </div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('sku', {
        enableSorting: true,
        header: ({ column }) => <SortableHeader column={column} label="SKU" />,
        cell: (info) => (
          <span className="font-mono text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('variants', {
        id: 'variants_info',
        header: 'Variants',
        cell: (info) => {
          const variants = info.getValue();
          const colors = [...new Set(variants.map(v => v.color))];
          const sizes = [...new Set(variants.map(v => v.size))];
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-sm font-bold text-gray-900">{variants.length}</span>
                <span className="text-xs text-gray-500">variants</span>
              </div>
              <div className="flex items-center gap-1">
                {colors.slice(0, 4).map((color, i) => {
                  const hex = variants.find(v => v.color === color)?.colorHex || '#ccc';
                  return (
                    <div
                      key={i}
                      className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: hex }}
                      title={color}
                    />
                  );
                })}
                {colors.length > 4 && (
                  <span className="text-xs text-gray-400 ml-0.5">+{colors.length - 4}</span>
                )}
                <span className="text-gray-300 mx-1">|</span>
                <span className="text-xs text-gray-500">{sizes.length} sizes</span>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('basePrice', {
        enableSorting: true,
        header: ({ column }) => <SortableHeader column={column} label="Price Range" />,
        cell: (info) => {
          const product = info.row.original;
          const prices = product.variants.map(v => v.salePrice || v.price);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          const hasDiscount = product.baseSalePrice || product.variants.some(v => v.salePrice);

          return (
            <div className="text-right space-y-0.5">
              <div className="text-sm font-bold text-gray-900">
                {minPrice === maxPrice
                  ? `${minPrice.toLocaleString('vi-VN')}đ`
                  : `${minPrice.toLocaleString('vi-VN')} - ${maxPrice.toLocaleString('vi-VN')}đ`}
              </div>
              {hasDiscount && (
                <div className="text-[10px] text-red-500 font-semibold">
                  Sale active
                </div>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('totalStock', {
        enableSorting: true,
        header: ({ column }) => <SortableHeader column={column} label="Stock" />,
        cell: (info) => {
          const product = info.row.original;
          const totalStock = info.getValue();
          const outOfStockVariants = product.variants.filter(v => v.status === 'out_of_stock').length;
          const lowStockVariants = product.variants.filter(v => v.status === 'low_stock').length;

          return (
            <div className="text-right space-y-0.5">
              <span
                className={`text-lg font-black px-2 py-0.5 rounded ${
                  totalStock === 0
                    ? 'text-red-600 bg-red-50'
                    : lowStockVariants > 0
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-green-600 bg-green-50'
                }`}
              >
                {totalStock}
              </span>
              {(outOfStockVariants > 0 || lowStockVariants > 0) && totalStock > 0 && (
                <div className="flex items-center justify-end gap-1.5 mt-1">
                  {outOfStockVariants > 0 && (
                    <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                      {outOfStockVariants} OOS
                    </span>
                  )}
                  {lowStockVariants > 0 && (
                    <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                      {lowStockVariants} low
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('sales', {
        enableSorting: true,
        header: ({ column }) => <SortableHeader column={column} label="Sales" />,
        cell: (info) => (
          <div className="text-right text-base font-bold text-gray-900">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          return (
            <Badge variant="outline" className={`font-semibold ${statusStyles[status]}`}>
              {statusLabels[status]}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: () => (
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
                <DropdownMenuItem className="cursor-pointer py-2.5 font-medium">
                  <Edit className="h-4 w-4 mr-3 text-gray-700" />
                  Edit Product
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer py-2.5 font-medium">
                  <Copy className="h-4 w-4 mr-3 text-gray-700" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem className="cursor-pointer py-2.5 text-red-600 font-semibold focus:bg-red-50 focus:text-red-700">
                  <Trash2 className="h-4 w-4 mr-3" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      }),
    ],
    []
  );

  return columns;
}

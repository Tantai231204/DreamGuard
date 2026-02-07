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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
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

const typeLabels = {
  single: 'Single',
  combo: 'Combo',
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
      columnHelper.accessor('sku', {
        enableSorting: true,
        header: ({ column }) => {
          const sorted = column.getIsSorted();
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(sorted === 'desc')}
              className="hover:bg-gray-100 font-semibold -ml-4 gap-1"
            >
              SKU
              {sorted === 'asc' ? (
                <ArrowUp className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              ) : sorted === 'desc' ? (
                <ArrowDown className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              ) : (
                <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
              )}
            </Button>
          );
        },
        cell: (info) => (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-400" />
            <span className="font-mono text-sm font-semibold text-gray-900">
              {info.getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor('name', {
        enableSorting: true,
        header: ({ column }) => {
          const sorted = column.getIsSorted();
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(sorted === 'desc')}
              className="hover:bg-gray-100 font-semibold -ml-4 gap-1"
            >
              Product Name
              {sorted === 'asc' ? (
                <ArrowUp className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              ) : sorted === 'desc' ? (
                <ArrowDown className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              ) : (
                <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
              )}
            </Button>
          );
        },
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              <Package className="h-5 w-5 text-gray-400" />
            </div>
            <div className="min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {info.getValue()}
              </div>
              <div className="text-xs text-gray-500">
                {info.row.original.category}
              </div>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: (info) => {
          const type = info.getValue();
          return (
            <Badge variant="outline" className="font-medium">
              {typeLabels[type]}
            </Badge>
          );
        },
      }),
      columnHelper.accessor('price', {
        enableSorting: true,
        header: ({ column }) => {
          const sorted = column.getIsSorted();
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(sorted === 'desc')}
              className="hover:bg-gray-100 font-semibold -ml-4 gap-1"
            >
              Price
              {sorted === 'asc' ? (
                <ArrowUp className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              ) : sorted === 'desc' ? (
                <ArrowDown className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              ) : (
                <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
              )}
            </Button>
          );
        },
        cell: (info) => {
          const price = info.getValue();
          const salePrice = info.row.original.salePrice;
          return (
            <div className="text-right space-y-0.5">
              {salePrice && salePrice < price ? (
                <>
                  <div className="text-base font-bold text-red-600">
                    {salePrice.toLocaleString('vi-VN')}đ
                  </div>
                  <div className="text-xs text-gray-400 line-through font-medium">
                    {price.toLocaleString('vi-VN')}đ
                  </div>
                </>
              ) : (
                <div className="text-base font-bold text-gray-900">
                  {price.toLocaleString('vi-VN')}đ
                </div>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('stock', {
        enableSorting: true,
        header: ({ column }) => {
          const sorted = column.getIsSorted();
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(sorted === 'desc')}
              className="hover:bg-gray-100 font-semibold -ml-4 gap-1"
            >
              Stock
              {sorted === 'asc' ? (
                <ArrowUp className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              ) : sorted === 'desc' ? (
                <ArrowDown className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              ) : (
                <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
              )}
            </Button>
          );
        },
        cell: (info) => {
          const stock = info.getValue();
          return (
            <div className="text-right">
              <span className={`text-lg font-black px-2 py-0.5 rounded ${
                stock === 0
                  ? 'text-red-600 bg-red-50'
                  : stock < 10
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-green-600 bg-green-50'
              }`}>
                {stock}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor('sales', {
        enableSorting: true,
        header: ({ column }) => {
          const sorted = column.getIsSorted();
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(sorted === 'desc')}
              className="hover:bg-gray-100 font-semibold -ml-4 gap-1"
            >
              Sales
              {sorted === 'asc' ? (
                <ArrowUp className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              ) : sorted === 'desc' ? (
                <ArrowDown className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              ) : (
                <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
              )}
            </Button>
          );
        },
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
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all">
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

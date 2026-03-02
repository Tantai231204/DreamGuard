import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, Eye, Copy } from 'lucide-react';
import { SortableHeader } from '@/components/admin';
import type { Category } from '../types';

const columnHelper = createColumnHelper<Category>();

export function useCategoryColumns(options?: { onEdit?: (category: Category) => void }) {
  return useMemo(
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

      columnHelper.accessor('name', {
        header: ({ column }) => <SortableHeader column={column} label="Name" />,
        cell: (info) => {
          const category = info.row.original;
          const hasChildren = category.childCategoryList.length > 0;
          return (
            <div>
              <p className="font-semibold text-gray-900">{info.getValue()}</p>
              {hasChildren && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {category.childCategoryList.length} subcategories
                </p>
              )}
            </div>
          );
        },
      }),

      columnHelper.accessor('slug', {
        header: 'Slug',
        cell: (info) => (
          <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {info.getValue()}
          </span>
        ),
      }),

      columnHelper.accessor('childCategoryList', {
        header: 'Subcategories',
        cell: (info) => {
          const children = info.getValue();
          return (
            <span className="font-bold text-gray-900">{children.length}</span>
          );
        },
        enableSorting: false,
      }),

      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: (info) => {
          const isActive = info.getValue();
          return (
            <Badge
              variant="outline"
              className={`font-semibold ${
                isActive
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-300 shadow-sm'
                  : 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border-gray-300 shadow-sm'
              }`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          );
        },
      }),

      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const category = row.original;
          return (
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
                    onClick={() => console.log('View', category.cateId)}
                    className="cursor-pointer py-2.5 font-medium"
                  >
                    <Eye className="h-4 w-4 mr-3 text-blue-600" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => options?.onEdit?.(category)}
                    className="cursor-pointer py-2.5 font-medium"
                  >
                    <Pencil className="h-4 w-4 mr-3 text-gray-700" />
                    Edit Category
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => console.log('Duplicate', category.cateId)}
                    className="cursor-pointer py-2.5 font-medium"
                  >
                    <Copy className="h-4 w-4 mr-3 text-gray-700" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem
                    onClick={() => console.log('Delete', category.cateId)}
                    className="cursor-pointer py-2.5 text-red-600 font-semibold focus:bg-red-50 focus:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-3" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 50,
      }),
    ],
    [options]
  );
}

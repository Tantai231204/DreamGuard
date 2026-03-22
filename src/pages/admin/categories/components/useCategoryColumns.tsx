import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { AdminStatusBadge } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Power, Eye, Copy, ChevronRight, ChevronDown } from 'lucide-react';
import { SortableHeader, AdminRowActions } from '@/components/admin';
import type { Category } from '../types';

const columnHelper = createColumnHelper<Category>();

export function useCategoryColumns(options?: {
  onEdit?: (category: Category) => void;
  expandedIds?: Set<number>;
  onToggleExpand?: (id: number) => void;
}) {
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
          const category = info.row.original as Category & { level?: number };
          const hasChildren = (category.childCategoryList?.length ?? 0) > 0;
          const isExpanded = options?.expandedIds?.has(category.cateId);
          const level = category.level ?? 0;

          return (
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    options?.onToggleExpand?.(category.cateId);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-blue-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              ) : (
                <div className="w-6 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {level > 0 && (
                    <span className="text-gray-400 text-xs">└─</span>
                  )}
                  <p className="font-semibold text-gray-900 truncate">{info.getValue()}</p>
                </div>
                {hasChildren && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {category.childCategoryList?.length ?? 0} subcategories
                  </p>
                )}
              </div>
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
            <span className="font-bold text-gray-900">{children?.length ?? 0}</span>
          );
        },
        enableSorting: false,
      }),

      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: (info) => {
          const category = info.row.original as Category & { level?: number };
          const isActive = info.getValue();
          const level = category.level ?? 0;

          return (
            <div className={level > 0 ? 'opacity-90' : ''}>
              <AdminStatusBadge status={isActive ? 'Active' : 'Inactive'} />
            </div>
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
              <AdminRowActions
                actions={[
                  {
                    label: category.isActive ? 'Deactivate' : 'Activate',
                    icon: <Power className="h-4 w-4" />,
                    onClick: () => console.log('Toggle status', category.cateId)
                  },
                  {
                    label: 'Edit Category',
                    icon: <Pencil className="h-4 w-4" />,
                    onClick: () => options?.onEdit?.(category)
                  },
                  {
                    label: 'Duplicate',
                    icon: <Copy className="h-4 w-4" />,
                    onClick: () => console.log('Duplicate', category.cateId)
                  }
                ]}
                sections={[
                  [
                    { label: 'View Details', icon: <Eye className="h-4 w-4" />, onClick: () => console.log('View', category.cateId) },
                    { label: 'Edit Category', icon: <Pencil className="h-4 w-4" />, onClick: () => options?.onEdit?.(category) },
                    { label: 'Duplicate', icon: <Copy className="h-4 w-4" />, onClick: () => console.log('Duplicate', category.cateId) },
                  ],
                  [
                    { label: category.isActive ? 'Deactivate' : 'Activate', icon: <Power className="h-4 w-4" />, variant: category.isActive ? 'warning' : 'success', onClick: () => console.log('Toggle status', category.cateId) }
                  ]
                ]}
              />
            </div>
          );
        },
        size: 50,
      }),
    ],
    [options]
  );
}

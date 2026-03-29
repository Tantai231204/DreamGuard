import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SortableHeader, AdminStatusBadge } from '@/components/admin';
import { formatDate, cn } from '@/lib/utils';
import type { Product } from '../../types';
import { formatAgeGroup, PRODUCT_STATUSES } from '../../types';
import { VariantInfoCell, PriceRangeCell, StockCell } from './cells';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const columnHelper = createColumnHelper<Product>();

interface UseProductColumnsProps {
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAddVariant: (product: Product) => void;
  onUpdateStatus?: (id: string, status: string, name?: string, cur?: string) => void;
}

export function useProductColumns({ onView, onEdit, onDelete, onAddVariant, onUpdateStatus }: UseProductColumnsProps) {
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
              aria-label="Select all"
              className="data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)]"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(checked) => row.toggleSelected(!!checked)}
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
            <div className="flex items-center gap-4 py-1 group/pcell">
              <div className="h-12 w-12 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200 transition-colors group-hover/pcell:border-blue-200">
                <Package className="h-6 w-6 text-slate-400 group-hover/pcell:text-blue-500 transition-colors" />
              </div>
              <div className="min-w-0 flex flex-col gap-1">
                <div className="font-bold text-slate-900 truncate max-w-[280px] leading-tight group-hover:text-blue-700 transition-colors text-[14px]">
                  {info.getValue()}
                </div>
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[12px] text-slate-500 font-medium truncate">{product.categoryName || 'General'}</span>
                    {product.material && (
                      <>
                        <span className="text-blue-200 font-bold text-[10px]">.</span>
                        <span className="text-[12px] text-blue-600 font-semibold truncate">{product.material}</span>
                      </>
                    )}
                  </div>
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
          return (
            <div className="flex flex-col items-start gap-1">
              <VariantInfoCell productId={productId} variantCount={count} />
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'price_range',
        header: 'Price Range',
        cell: ({ row }) => {
          const variantCount = row.original.variantCount ?? 0;
          return (
            <div className="font-bold text-slate-700 py-1 px-3 bg-slate-50 border border-slate-200/60 rounded-lg inline-block text-[13px]">
              <PriceRangeCell productId={row.original.id} variantCount={variantCount} />
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'stock',
        header: 'Health',
        cell: ({ row }) => {
          const variantCount = row.original.variantCount ?? 0;
          return (
            <div className="flex items-center gap-2">
              <StockCell productId={row.original.id} variantCount={variantCount} />
            </div>
          );
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
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded border border-blue-100/80">
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
          const p = info.row.original;

          if (!onUpdateStatus) return <AdminStatusBadge status={status} />;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none group/sbadge">
                <AdminStatusBadge
                  status={status}
                  className="cursor-pointer hover:shadow-md transition-all group-hover/sbadge:ring-2 group-hover/sbadge:ring-blue-100"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40 p-1 rounded-xl shadow-xl border-slate-200">
                <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select status</div>
                {PRODUCT_STATUSES.map((s) => {
                  const hasVariants = (p.variants?.length ?? 0) > 0 || (p.variantCount ?? 0) > 0;
                  const isDisabledOption = s.value === 'Published' && !hasVariants;

                  return (
                    <TooltipProvider key={s.value} delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-full">
                            <DropdownMenuItem
                              key={s.value}
                              disabled={isDisabledOption}
                              className={cn(
                                "rounded-lg px-2 py-2 gap-2 cursor-pointer transition-colors w-full",
                                status === s.value ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-600 hover:bg-slate-50",
                                isDisabledOption && "opacity-50 cursor-not-allowed bg-slate-50/50"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (status !== s.value && !isDisabledOption) {
                                  onUpdateStatus(p.id, s.value, p.name, status as string);
                                }
                              }}
                            >
                              <div className="flex items-center gap-2 w-full justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={cn("h-1.5 w-1.5 rounded-full",
                                    s.value === 'Published' ? 'bg-emerald-500' :
                                      s.value === 'Draft' ? 'bg-amber-500' :
                                        s.value === 'OutOfStock' ? 'bg-rose-500' : 'bg-slate-400'
                                  )} />
                                  <span className="text-[13px]">{s.label}</span>
                                </div>
                                {isDisabledOption && (
                                  <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 italic">
                                    Locked
                                  </span>
                                )}
                              </div>
                            </DropdownMenuItem>
                          </div>
                        </TooltipTrigger>
                        {isDisabledOption && (
                          <TooltipContent
                            side="right"
                            className="bg-slate-900 text-white border-none text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xl z-[100]"
                          >
                            Add at least one variant before publishing.
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
      columnHelper.accessor('createdAt', {
        enableSorting: true,
        header: ({ column }) => <SortableHeader column={column} label="Created" />,
        cell: (info) => (
          <span className="text-xs text-gray-500">
            {formatDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right pr-4 uppercase text-[10px] font-black tracking-widest text-slate-400">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end items-center gap-1 pr-2">
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600"
                onClick={(e) => { e.stopPropagation(); onView(row.original); }}
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600"
                onClick={(e) => { e.stopPropagation(); onEdit(row.original); }}
                title="Edit Product"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded hover:bg-slate-100 dropdown-trigger transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 shadow-xl border border-slate-200/60 rounded-xl p-1 animate-in fade-in zoom-in-95 duration-100">
                <DropdownMenuItem
                  className="rounded-lg cursor-pointer py-2 px-3 font-medium text-slate-600 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-700 transition-colors gap-2.5"
                  onClick={() => onView(row.original)}
                >
                  <Eye className="h-4 w-4 opacity-70" />
                  <span className="text-[13px]">View Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-lg cursor-pointer py-2 px-3 font-medium text-slate-600 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-700 transition-colors gap-2.5"
                  onClick={() => onEdit(row.original)}
                >
                  <Edit className="h-4 w-4 opacity-70" />
                  <span className="text-[13px]">Edit Product</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-lg cursor-pointer py-2 px-3 font-medium text-slate-600 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-700 transition-colors gap-2.5"
                  onClick={() => onAddVariant(row.original)}
                >
                  <Plus className="h-4 w-4 opacity-70" />
                  <span className="text-[13px]">Add Variant</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                <DropdownMenuItem
                  className="rounded-lg cursor-pointer py-2 px-3 font-medium text-red-500 focus:bg-red-50 focus:text-red-600 transition-colors gap-2.5"
                  onClick={() => onDelete(row.original)}
                >
                  <Trash2 className="h-4 w-4 opacity-70" />
                  <span className="text-[13px]">Delete Item</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      }),
    ],
    [onView, onEdit, onDelete, onAddVariant, onUpdateStatus]
  );

  return columns;
}


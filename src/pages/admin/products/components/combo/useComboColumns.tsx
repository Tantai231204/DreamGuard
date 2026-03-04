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
    Layers,
    ChevronRight,
    ChevronDown,
    Package,
    GitBranch,
    Plus,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Combo } from '../../types';

const columnHelper = createColumnHelper<Combo>();

const statusStyles: Record<string, string> = {
    Draft: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-300 shadow-sm',
    Published: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-300 shadow-sm',
    OutOfStock: 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-300 shadow-sm',
    Hidden: 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border-gray-300 shadow-sm',
};

const statusLabels: Record<string, string> = {
    Draft: 'Draft',
    Published: 'Published',
    OutOfStock: 'Out of Stock',
    Hidden: 'Hidden',
};

interface UseComboColumnsOptions {
    onView?: (combo: Combo) => void;
    onEdit?: (combo: Combo) => void;
    onDelete?: (combo: Combo) => void;
    onDuplicate?: (combo: Combo) => void;
    /** Add a variant under a parent combo */
    onAddVariant?: (parent: Combo) => void;
}

export function useComboColumns(options: UseComboColumnsOptions = {}) {
    const { onView, onEdit, onDelete, onDuplicate, onAddVariant } = options;
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
                            className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={row.getIsSelected()}
                            onChange={(e) => row.toggleSelected(e.target.checked)}
                            aria-label="Select row"
                            className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                        />
                    </div>
                ),
                size: 40,
            }),
            columnHelper.display({
                id: 'expand',
                header: () => null,
                cell: ({ row }) => {
                    const combo = row.original;
                    // Properly check for children (subrows) or items (products inside the combo)
                    const hasSubrows = !!row.subRows?.length;
                    const hasItems = !!combo.items?.length || !!combo.productItems?.length;

                    // A row can expand if it's a parent (has variants) or it's a combo with items/productItems
                    const canExpand = hasSubrows || hasItems || true; // Allow all combos to expand to fetch fresh data

                    return (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                row.toggleExpanded();
                            }}
                            className={cn(
                                "p-2 rounded-full transition-all duration-200 hover:bg-slate-100 active:scale-95",
                                row.getIsExpanded() ? "bg-indigo-50" : "bg-transparent"
                            )}
                            aria-label="Toggle combo variants/items"
                        >
                            {row.getIsExpanded() ? (
                                <ChevronDown className="h-4 w-4 text-indigo-700 stroke-[3]" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-slate-400 stroke-[3]" />
                            )}
                        </button>
                    );
                },
                size: 48,
                minSize: 48,
            }),
            columnHelper.accessor('sku', {
                header: 'SKU',
                cell: (info) => (
                    <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-purple-500" />
                        <span className="font-mono text-sm font-semibold text-gray-900">
                            {info.getValue()}
                        </span>
                    </div>
                ),
            }),
            columnHelper.accessor('name', {
                header: 'Combo Name',
                cell: (info) => {
                    const combo = info.row.original;
                    const rowDepth = info.row.depth;
                    // Properly identify variants using depth or parentId
                    const isVariant = rowDepth > 0 || !!combo.comboParentId;
                    const childCount = combo.children?.length ?? 0;

                    return (
                        <div
                            className="flex items-center gap-3"
                            style={{ paddingLeft: `${rowDepth * 2.5}rem` }}
                        >
                            {rowDepth > 0 && (
                                <div className="h-10 w-4 border-l-2 border-b-2 border-gray-100 rounded-bl-xl -mt-5 mb-0.5 ml-1" />
                            )}
                            <div className={cn(
                                "h-10 w-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 transition-all duration-200",
                                !isVariant
                                    ? 'bg-gradient-to-br from-violet-100 to-violet-200 shadow-sm'
                                    : 'bg-gradient-to-br from-indigo-50 to-indigo-100'
                            )}>
                                {!isVariant
                                    ? <Package className="h-5 w-5 text-violet-600" />
                                    : <GitBranch className="h-4 w-4 text-indigo-500" />}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "truncate transition-colors",
                                        !isVariant ? "font-bold text-gray-900 text-[15px]" : "font-medium text-gray-700 text-sm"
                                    )}>
                                        {info.getValue()}
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-[9px] font-black px-1.5 py-0 rounded border-0 uppercase tracking-widest h-4",
                                            !isVariant
                                                ? 'bg-violet-600 text-white shadow-sm'
                                                : 'bg-indigo-100 text-indigo-600'
                                        )}
                                    >
                                        {!isVariant ? 'PARENT' : 'VARIANT'}
                                    </Badge>
                                </div>
                                <div className="text-[11px] text-gray-400 font-medium flex items-center gap-2 mt-0.5">
                                    {!isVariant
                                        ? <span>{childCount} {childCount === 1 ? 'variant' : 'variants'}</span>
                                        : <span>{combo.items?.length ?? 0} {combo.items?.length === 1 ? 'item' : 'items'}</span>
                                    }
                                    {combo.color && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-full border border-gray-100/50">
                                            <div className="h-2 w-2 rounded-full border border-white shadow-sm inline-block" style={{ backgroundColor: combo.color }} />
                                            <span className="text-[10px] text-gray-500 font-bold uppercase">{combo.size || ''}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                },
            }),
            columnHelper.accessor('items', {
                header: 'Products in Combo',
                cell: (info) => {
                    const combo = info.row.original;
                    // Check items OR productItems
                    const items = combo.items?.length ? combo.items : (combo.productItems || []);

                    if (items.length === 0) {
                        return <span className="text-xs text-gray-400 italic">No items synced</span>;
                    }
                    return (
                        <div className="space-y-1">
                            {items.slice(0, 2).map((item: any, idx: number) => (
                                <div key={idx} className="text-[11px] text-gray-600 font-medium">
                                    <span>• {item.productName} (x{item.quantity})</span>
                                    {(item.variantLabel || item.sku) && (
                                        <span className="text-gray-400 ml-1 font-normal">— {item.variantLabel || item.sku}</span>
                                    )}
                                </div>
                            ))}
                            {items.length > 2 && (
                                <div className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">
                                    +{items.length - 2} more products
                                </div>
                            )}
                        </div>
                    );
                },
            }),
            columnHelper.accessor('discount', {
                header: 'Discount',
                cell: (info) => (
                    <div className="text-center">
                        <Badge className="bg-orange-500 text-white font-bold px-3 py-1">
                            -{info.getValue()}%
                        </Badge>
                    </div>
                ),
            }),
            columnHelper.accessor('basePrice', {
                header: 'Price',
                cell: (info) => {
                    const price = info.getValue();
                    const salePrice = info.row.original.baseSalePrice;
                    return (
                        <div className="text-right space-y-0.5">
                            {salePrice && salePrice < price ? (
                                <>
                                    <div className="text-base font-bold text-purple-600">
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
            columnHelper.accessor('totalStock', {
                header: 'Stock',
                cell: (info) => {
                    const stock = info.getValue();
                    return (
                        <div className="text-right">
                            <span className={`text-lg font-black px-2 py-0.5 rounded ${stock === 0
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
                header: 'Sales',
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
                cell: ({ row }) => {
                    const combo = row.original;
                    const isParent = !combo.comboParentId;
                    return (
                        <div className="flex justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all">
                                        <MoreVertical className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 shadow-xl border-2 rounded-xl">
                                    <DropdownMenuItem
                                        className="cursor-pointer py-2.5 font-medium"
                                        onClick={() => onView?.(combo)}
                                    >
                                        <Eye className="h-4 w-4 mr-3 text-purple-600" />
                                        View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer py-2.5 font-medium"
                                        onClick={() => onEdit?.(combo)}
                                    >
                                        <Edit className="h-4 w-4 mr-3 text-gray-700" />
                                        Edit {isParent ? 'Parent' : 'Variant'}
                                    </DropdownMenuItem>
                                    {isParent && onAddVariant && (
                                        <DropdownMenuItem
                                            className="cursor-pointer py-2.5 font-medium"
                                            onClick={() => onAddVariant(combo)}
                                        >
                                            <Plus className="h-4 w-4 mr-3 text-indigo-600" />
                                            Add Variant
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                        className="cursor-pointer py-2.5 font-medium"
                                        onClick={() => onDuplicate?.(combo)}
                                    >
                                        <Copy className="h-4 w-4 mr-3 text-gray-700" />
                                        Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="my-1" />
                                    <DropdownMenuItem
                                        className="cursor-pointer py-2.5 text-red-600 font-semibold focus:bg-red-50 focus:text-red-700"
                                        onClick={() => onDelete?.(combo)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-3" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
            }),
        ],
        [onView, onEdit, onDelete, onDuplicate, onAddVariant]
    );

    return columns;
}

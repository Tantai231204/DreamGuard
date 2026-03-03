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
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Combo } from '../types';

const columnHelper = createColumnHelper<Combo>();

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

export function useComboColumns() {
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
                cell: ({ row }) => (
                    <button
                        onClick={() => row.toggleExpanded()}
                        className="p-1 rounded-md hover:bg-purple-100 transition-colors"
                        aria-label="Toggle combo items"
                    >
                        {row.getIsExpanded() ? (
                            <ChevronDown className="h-4 w-4 text-purple-600" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                    </button>
                ),
                size: 36,
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
                cell: (info) => (
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <Layers className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                                {info.getValue()}
                            </div>
                            <div className="text-xs text-gray-500">
                                {info.row.original.items.length} items
                            </div>
                        </div>
                    </div>
                ),
            }),
            columnHelper.accessor('items', {
                header: 'Products in Combo',
                cell: (info) => {
                    const items = info.getValue();
                    return (
                        <div className="space-y-1">
                            {items.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="text-xs text-gray-600">
                                    <span>• {item.productName} (x{item.quantity})</span>
                                    {item.variantLabel && (
                                        <span className="text-gray-400 ml-1">— {item.variantLabel}</span>
                                    )}
                                </div>
                            ))}
                            {items.length > 2 && (
                                <div className="text-xs text-[var(--color-primary)] font-medium">
                                    +{items.length - 2} more
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
                                    <Eye className="h-4 w-4 mr-3 text-purple-600" />
                                    View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer py-2.5 font-medium">
                                    <Edit className="h-4 w-4 mr-3 text-gray-700" />
                                    Edit Combo
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

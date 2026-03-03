import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Table } from '@tanstack/react-table';
import type { Order } from '../../types';

interface OrderTableFilterProps {
    table: Table<Order>;
}

const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
];

export function OrderTableFilter({ table }: OrderTableFilterProps) {
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    const handleStatusToggle = (status: string) => {
        const newStatuses = selectedStatuses.includes(status)
            ? selectedStatuses.filter((s) => s !== status)
            : [...selectedStatuses, status];

        setSelectedStatuses(newStatuses);

        // Apply filter to table
        if (newStatuses.length === 0) {
            table.getColumn('status')?.setFilterValue(undefined);
        } else {
            // Pass array of statuses to filter
            table.getColumn('status')?.setFilterValue(newStatuses);
        }
    };

    const handleClearFilters = () => {
        setSelectedStatuses([]);
        table.getColumn('status')?.setFilterValue(undefined);
    };

    const activeFilterCount = selectedStatuses.length;

    return (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-2 border-gray-200 hover:border-[var(--color-primary)] hover:bg-blue-50 transition-all"
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                        {activeFilterCount > 0 && (
                            <Badge className="ml-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white px-2 py-0.5 text-xs">
                                {activeFilterCount}
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-56 rounded-xl border-2 border-gray-100 shadow-xl"
                >
                    <DropdownMenuLabel className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Filter by Status</span>
                        {activeFilterCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="h-6 px-2 text-xs hover:bg-red-50 hover:text-red-600"
                            >
                                <X className="h-3 w-3 mr-1" />
                                Clear
                            </Button>
                        )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {statusOptions.map((option) => (
                        <DropdownMenuCheckboxItem
                            key={option.value}
                            checked={selectedStatuses.includes(option.value)}
                            onCheckedChange={() => handleStatusToggle(option.value)}
                            className="cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-2 h-2 rounded-full ${option.value === 'pending'
                                        ? 'bg-amber-500'
                                        : option.value === 'processing'
                                            ? 'bg-blue-500'
                                            : option.value === 'shipped'
                                                ? 'bg-purple-500'
                                                : option.value === 'delivered'
                                                    ? 'bg-green-500'
                                                    : 'bg-red-500'
                                        }`}
                                />
                                {option.label}
                            </div>
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Active Filters Display */}
            {selectedStatuses.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    {selectedStatuses.map((status) => {
                        const option = statusOptions.find((o) => o.value === status);
                        return (
                            <Badge
                                key={status}
                                variant="secondary"
                                className="bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-3 py-1 flex items-center gap-1.5"
                            >
                                <span className="text-xs font-medium">{option?.label}</span>
                                <button
                                    onClick={() => handleStatusToggle(status)}
                                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

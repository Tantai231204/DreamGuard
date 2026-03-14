import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Table } from '@tanstack/react-table';
import type { Order } from '../../types';
import { ADMIN_ORDER_STATUS_THEME } from '../constants';
import { AdminStatusBadge } from '@/components/admin';

interface OrderTableFilterProps {
    table: Table<Order>;
}

// Generate options seamlessly from the canonical admin status registry
const statusOptions = Object.entries(ADMIN_ORDER_STATUS_THEME)
    .filter(([key]) => isNaN(Number(key))) // Keep only string keys like 'Pending'
    .map(([key, theme]) => ({
        value: key,
        label: theme.label
    }));

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
                    className="w-56 shadow-xl border border-slate-200/60 rounded-xl p-1 animate-in fade-in zoom-in-95 duration-100"
                >
                    <DropdownMenuLabel className="px-3 py-2 flex items-center justify-between border-b border-slate-100 mb-1">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Registry Status</span>
                        {activeFilterCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="h-6 px-2 text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-md"
                            >
                                <X className="h-3 w-3 mr-1" />
                                Flush
                            </Button>
                        )}
                    </DropdownMenuLabel>
                    {statusOptions.map((option) => {
                        return (
                            <DropdownMenuCheckboxItem
                                key={option.value}
                                checked={selectedStatuses.includes(option.value)}
                                onCheckedChange={() => handleStatusToggle(option.value)}
                                className="rounded-lg cursor-pointer py-2 px-3 font-medium text-slate-600 focus:bg-blue-50 focus:text-blue-700 transition-colors gap-2.5"
                            >
                                <div className="flex items-center gap-2">
                                    <AdminStatusBadge status={option.label} dot={true} />
                                </div>
                            </DropdownMenuCheckboxItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Active Filters Display */}
            {selectedStatuses.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    {selectedStatuses.map((status) => {
                        const option = statusOptions.find((o) => o.value === status);
                        return (
                            <div key={status} className="relative group/badge flex items-center">
                                <AdminStatusBadge
                                    status={option?.label || status}
                                    className="pr-6" // Space for the close button
                                />
                                <button
                                    onClick={() => handleStatusToggle(status)}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-black/5 transition-all opacity-40 hover:opacity-100"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

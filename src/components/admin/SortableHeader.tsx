import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { Column } from '@tanstack/react-table';

interface SortableHeaderProps<T> {
    column: Column<T, unknown>;
    label: string;
}

export function SortableHeader<T>({ column, label }: SortableHeaderProps<T>) {
    const sorted = column.getIsSorted();
    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(sorted === 'desc')}
            className="hover:bg-gray-100 font-semibold -ml-4 gap-1"
        >
            {label}
            {sorted === 'asc' ? (
                <ArrowUp className="h-3.5 w-3.5 text-[var(--color-primary)]" />
            ) : sorted === 'desc' ? (
                <ArrowDown className="h-3.5 w-3.5 text-[var(--color-primary)]" />
            ) : (
                <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
            )}
        </Button>
    );
}

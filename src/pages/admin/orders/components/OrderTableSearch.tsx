import { memo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Table } from '@tanstack/react-table';
import type { Order } from '../../types';
import { OrderTableFilter } from './OrderTableFilter';

interface OrderTableSearchProps {
    value: string;
    onChange: (value: string) => void;
    table: Table<Order>;
}

export const OrderTableSearch = memo(({ value, onChange, table }: OrderTableSearchProps) => {
    return (
        <div className="p-6 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        placeholder="Search orders by name, email, or order ID..."
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="pl-12 pr-4 py-6 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                    />
                </div>
                <OrderTableFilter table={table} />
            </div>
        </div>
    );
});

OrderTableSearch.displayName = 'OrderTableSearch';

import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Table } from '@tanstack/react-table';

interface AdminTableSearchProps<T> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  table: Table<T>;
  resultCount?: number;
  resultLabel?: string;
  actions?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  hideResultCount?: boolean;
}

export function AdminTableSearch<T>({ 
  value, 
  onChange, 
  placeholder = "Search...",
  table,
  resultCount,
  resultLabel = 'results',
  actions,
  className,
  inputClassName,
  hideResultCount
}: AdminTableSearchProps<T>) {
  return (
    <div className={cn("px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-white", className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative w-full lg:flex-1 lg:max-w-2xl">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <Search className="h-5 w-5 text-[var(--color-primary)]" />
            <div className="h-5 w-px bg-gray-300"></div>
          </div>
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "pl-14 pr-12 h-12 rounded-xl border-2 border-gray-200 bg-white shadow-sm hover:border-gray-300 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all text-base font-medium",
              inputClassName
            )}
          />
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {!hideResultCount && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 shadow-sm">
            <span className="text-2xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-blue-600 bg-clip-text text-transparent">
              {resultCount ?? table.getFilteredRowModel().rows.length}
            </span>
            <span className="text-sm font-medium text-gray-600">{resultLabel}</span>
          </div>
        )}

        {actions && <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:gap-3 lg:ml-auto lg:w-auto lg:gap-4">{actions}</div>}
      </div>
    </div>
  );
}

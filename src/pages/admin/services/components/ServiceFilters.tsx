import { memo, useCallback } from 'react';
import { Search, Calendar, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  statusFilterOptions,
  serviceTypeFilterOptions,
  statusConfig,
  serviceTypeConfig
} from '../constants';
import type { ServiceStatus, ServiceType } from '../types';

interface ServiceFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: ServiceStatus | 'all';
  onStatusFilterChange: (value: ServiceStatus | 'all') => void;
  serviceTypeFilter: ServiceType | 'all';
  onServiceTypeFilterChange: (value: ServiceType | 'all') => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
}

export const ServiceFilters = memo(function ServiceFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  serviceTypeFilter,
  onServiceTypeFilterChange,
  dateFilter,
  onDateFilterChange,
}: ServiceFiltersProps) {
  const handleClearFilters = useCallback(() => {
    onSearchChange('');
    onStatusFilterChange('all');
    onServiceTypeFilterChange('all');
    onDateFilterChange('');
  }, [onSearchChange, onStatusFilterChange, onServiceTypeFilterChange, onDateFilterChange]);

  const hasActiveFilters =
    searchQuery ||
    statusFilter !== 'all' ||
    serviceTypeFilter !== 'all' ||
    dateFilter;

  const activeFiltersCount = [
    searchQuery,
    statusFilter !== 'all',
    serviceTypeFilter !== 'all',
    dateFilter
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 pb-2">

      {/* Row 1: Search + Date */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by Order Code, Customer Name, Phone..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10 rounded-full bg-gray-50/50 border-gray-100 focus:bg-white focus-visible:ring-blue-100 transition-all shadow-none"
          />
        </div>
        <div className="relative sm:w-44">
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className="pl-10 h-10 rounded-full bg-gray-100/30 border-gray-100 focus:bg-white focus-visible:ring-blue-100 transition-all shadow-none cursor-pointer"
          />
        </div>
      </div>

      {/* Row 2: Status Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Status</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {statusFilterOptions.map((option) => {
            const isActive = statusFilter === option.value;
            const config = option.value !== 'all' ? statusConfig[option.value as ServiceStatus] : null;
            const Icon = config?.icon;

            return (
              <Button
                key={option.value}
                variant="ghost"
                size="sm"
                onClick={() => onStatusFilterChange(option.value as ServiceStatus | 'all')}
                className={`h-8 text-xs rounded-full px-3 transition-all duration-200 flex items-center gap-1.5 ${isActive
                  ? config
                    ? `${config.bg} ${config.text} ${config.border} border font-medium shadow-sm hover:${config.bg} hover:${config.text}`
                    : 'bg-blue-50 text-blue-700 border-blue-200 border font-medium shadow-sm hover:bg-blue-50 hover:text-blue-700'
                  : 'bg-gray-50/50 text-gray-600 border border-transparent hover:bg-gray-100/80 hover:text-gray-900 hover:border-gray-200'
                  }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Row 3: Service Type Filter */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-600">Service Type</span>
        <div className="flex flex-wrap gap-1.5">
          {serviceTypeFilterOptions.map((option) => {
            const isActive = serviceTypeFilter === option.value;
            const config = option.value !== 'all' ? serviceTypeConfig[option.value as ServiceType] : null;
            const Icon = config?.icon;

            return (
              <Button
                key={option.value}
                variant="ghost"
                size="sm"
                onClick={() => onServiceTypeFilterChange(option.value as ServiceType | 'all')}
                className={`h-8 text-xs rounded-full px-3 transition-all duration-200 flex items-center gap-1.5 ${isActive
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium shadow-sm hover:bg-indigo-50 hover:text-indigo-700'
                  : 'bg-gray-50/50 text-gray-600 border border-transparent hover:bg-gray-100/80 hover:text-gray-900 hover:border-gray-200'
                  }`}
              >
                {Icon && <Icon className={`h-3.5 w-3.5 ${isActive ? '' : config?.color}`} />}
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 pt-3 border-t">
          <span className="text-xs text-gray-500">
            Filtering ({activeFiltersCount}):
          </span>
          <div className="flex flex-wrap gap-1.5 flex-1">
            {searchQuery && (
              <Badge variant="secondary" className="text-xs gap-1">
                "{searchQuery}"
                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => onSearchChange('')} />
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs gap-1">
                {statusConfig[statusFilter].label}
                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => onStatusFilterChange('all')} />
              </Badge>
            )}
            {serviceTypeFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs gap-1">
                {serviceTypeConfig[serviceTypeFilter].label}
                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => onServiceTypeFilterChange('all')} />
              </Badge>
            )}
            {dateFilter && (
              <Badge variant="secondary" className="text-xs gap-1">
                {new Date(dateFilter).toLocaleDateString('vi-VN')}
                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => onDateFilterChange('')} />
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-7 px-2 text-xs text-gray-500 hover:text-red-500"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>

  );
});

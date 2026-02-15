import { memo, useCallback } from 'react';
import { Search, Calendar, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
    <Card className="border shadow-sm">
      <CardContent className="p-4 space-y-4">
        {/* Row 1: Search + Date */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm theo mã đơn, tên khách, SĐT..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <div className="relative sm:w-44">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => onDateFilterChange(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>

        {/* Row 2: Status Filter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Trạng thái</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {statusFilterOptions.map((option) => {
              const isActive = statusFilter === option.value;
              const config = option.value !== 'all' ? statusConfig[option.value as ServiceStatus] : null;
              const Icon = config?.icon;
              
              return (
                <Button
                  key={option.value}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onStatusFilterChange(option.value as ServiceStatus | 'all')}
                  className={`h-8 text-xs ${isActive ? '' : 'bg-white hover:bg-gray-50'}`}
                >
                  {Icon && <Icon className="h-3 w-3 mr-1" />}
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Service Type Filter */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-600">Loại dịch vụ</span>
          <div className="flex flex-wrap gap-1.5">
            {serviceTypeFilterOptions.map((option) => {
              const isActive = serviceTypeFilter === option.value;
              const config = option.value !== 'all' ? serviceTypeConfig[option.value as ServiceType] : null;
              const Icon = config?.icon;
              
              return (
                <Button
                  key={option.value}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onServiceTypeFilterChange(option.value as ServiceType | 'all')}
                  className={`h-8 text-xs ${isActive ? '' : 'bg-white hover:bg-gray-50'}`}
                >
                  {Icon && <Icon className={`h-3 w-3 mr-1 ${isActive ? '' : config?.color}`} />}
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
              Đang lọc ({activeFiltersCount}):
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
              Xóa tất cả
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
